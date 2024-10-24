"use node";

import { ContainerInstanceManagementClient } from "@azure/arm-containerinstance";
import { ClientSecretCredential } from "@azure/identity";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { pick } from "convex-helpers";
import { v } from "convex/values";
import ms from "ms";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
import { Follower } from "./tables/follower";
import { Video } from "./tables/video";

function createClient() {
  if (
    !process.env.CREDENTIAL_TENANT_ID ||
    !process.env.CREDENTIAL_CLIENT_ID ||
    !process.env.CREDENTIAL_CLIENT_SECRET
  ) {
    throw new Error(
      "Missing CREDENTIAL_TENANT_ID or CREDENTIAL_CLIENT_ID or CREDENTIAL_CLIENT_SECRET env values"
    );
  }

  // Authenticate using (az ad sp create-for-rbac --name tiktok-jamalsoueidan --role contributor --scopes /subscriptions/7095268a-d926-4bd8-bc42-1b23d4987983)
  const credential = new ClientSecretCredential(
    process.env.CREDENTIAL_TENANT_ID,
    process.env.CREDENTIAL_CLIENT_ID,
    process.env.CREDENTIAL_CLIENT_SECRET
  );

  if (!process.env.SUBSCRIPTION_ID) {
    throw new Error("Missing SUBSCRIPTION_ID env value");
  }

  // Create a client for Azure Container Instances
  return new ContainerInstanceManagementClient(
    credential,
    process.env.SUBSCRIPTION_ID
  );
}

export const startRecording = internalAction({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    if (!process.env.RESOURCE_GROUP) {
      throw new Error("Missing SUBSCRIPTION_ID env value");
    }

    const client = createClient();
    const containerName = cleanContainerName(args.uniqueId);

    const status = await ctx.runAction(internal.azure.getContainerStatus, args);

    if (status === "Running") {
      console.log(
        "Container is already running. No need to start a new instance."
      );
      return { status: "Container already started" };
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/T/, "-")
      .replace(/:/g, "-")
      .split(".")[0];

    console.log("Starting recording for", args.uniqueId);

    await client.containerGroups.beginCreateOrUpdate(
      process.env.RESOURCE_GROUP,
      containerName, //container-name
      {
        location: process.env.LOCATION,
        containers: [
          {
            name: containerName,
            image: `${process.env.CONTAINER_REGISTRY_NAME}.azurecr.io/${process.env.IMAGE_NAME}:v16`,
            resources: {
              requests: {
                cpu: 1,
                memoryInGB: 1,
              },
            },
            environmentVariables: [
              {
                name: "TIKTOK_CHANNEL",
                value: args.uniqueId,
              },
              {
                name: "FILENAME",
                value: `${args.uniqueId}_${timestamp}`,
              },
              {
                name: "AZURE_STORAGE_CONNECTION_STRING",
                value: process.env.STORAGE_CONNECTION,
              },
              {
                name: "POST_IMAGE_URL",
                value: `${process.env.CONVEX_SITE_URL}/postImage`,
              },
              {
                name: "POST_VIDEO_URL",
                value: `${process.env.CONVEX_SITE_URL}/postVideo`,
              },
              {
                name: "UPDATES_URL",
                value: `${process.env.CONVEX_SITE_URL}/updates`,
              },
            ],
          },
        ],
        osType: "Linux",
        restartPolicy: "Never", // Ensures the container terminates after the task
        imageRegistryCredentials: [
          {
            server: `${process.env.CONTAINER_REGISTRY_NAME}.azurecr.io`,
            username: process.env.CONTAINER_REGISTRY_USERNAME, //Container Registry > Access Keys > Password
            password: process.env.CONTAINER_REGISTRY_PASSWORD, //Container Registry > Access Keys > Password
          },
        ],
      }
    );

    // this would enforce to maximum record for one hour, if still recording, it will just start again.
    await ctx.scheduler.runAfter(ms("1h"), internal.azure.terminateContainer, {
      uniqueId: args.uniqueId,
      force: true,
    });

    return { status: "Container started successfully" };
  },
});

export const terminateContainer = internalAction({
  args: {
    ...pick(Video.withoutSystemFields, ["uniqueId"]),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESOURCE_GROUP) {
      throw new Error("Missing SUBSCRIPTION_ID env value");
    }

    const client = createClient();
    const status = await ctx.runAction(internal.azure.getContainerStatus, args);

    if (status === "Running" && !args.force) {
      console.log("Container is running. Cannot terminate.", args.uniqueId);
      return { status: "Container is running. Cannot terminate" };
    }

    await client.containerGroups.beginDelete(
      process.env.RESOURCE_GROUP,
      cleanContainerName(args.uniqueId)
    );

    console.log("Terminat container", args.uniqueId);
    return { status: "Container is started to getting deleted " };
  },
});

export const getContainerStatus = internalAction({
  args: pick(Video.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    if (!process.env.RESOURCE_GROUP) {
      throw new Error("Missing RESOURCE_GROUP env value");
    }

    const client = createClient();
    const containerName = cleanContainerName(args.uniqueId);

    try {
      const containerGroup = await client.containerGroups.get(
        process.env.RESOURCE_GROUP,
        containerName
      );
      return containerGroup.instanceView?.state as
        | "Running"
        | "Stopped"
        | undefined;
    } catch (error) {
      return undefined;
    }
  },
});

// Function to generate a SAS URL
export const generateURL = action({
  args: {
    id: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video: Video = await ctx.runQuery(internal.video.get, {
      id: args.id,
    });
    if (!video.video) {
      throw new Error("Video not found");
    }

    const containerName = "videos";
    const blobName: string = video.video;

    if (!process.env.STORAGE_ACCOUNT_NAME || !process.env.STORAGE_ACCOUNT_KEY) {
      throw new Error(
        "Missing STORAGE_ACCOUNT_NAME or STORAGE_ACCOUNT_KEY env values"
      );
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.STORAGE_ACCOUNT_NAME,
      process.env.STORAGE_ACCOUNT_KEY
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // Read-only permissions
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 1800 * 1000), // 30min expiry
      },
      sharedKeyCredential
    ).toString();

    const url = `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    return {
      ...video,
      url,
      width: video.width || 720,
      height: video.height || 1280,
    };
  },
});

/* Uncaught RestError: The container name 'chely_carcamo_' in container group 'chely_carcamo_' is invalid.
   The container name must contain no more than 63 characters and must match the regex '[a-z0-9]([-a-z0-9]*[a-z0-9])?' */
function cleanContainerName(name: string) {
  let cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  cleanName = cleanName.replace(/^-+|-+$/g, "");
  if (cleanName.length > 63) {
    cleanName = cleanName.substring(0, 63);
  }
  return cleanName;
}
