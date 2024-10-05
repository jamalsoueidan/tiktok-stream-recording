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
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { Follower } from "./tables/follower";

export const azure = action({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
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
    const client = new ContainerInstanceManagementClient(
      credential,
      process.env.SUBSCRIPTION_ID
    );

    if (!process.env.RESOURCE_GROUP) {
      throw new Error("Missing SUBSCRIPTION_ID env value");
    }

    const containerName = cleanContainerName(args.uniqueId);

    const response = await client.containerGroups.beginCreateOrUpdate(
      process.env.RESOURCE_GROUP,
      containerName, //container-name
      {
        location: process.env.LOCATION,
        containers: [
          {
            name: containerName,
            image: `${process.env.CONTAINER_REGISTRY_NAME}.azurecr.io/${process.env.IMAGE_NAME}:v7`,
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
                name: "AZURE_STORAGE_CONNECTION_STRING",
                value: process.env.STORAGE_CONNECTION,
              },
              {
                name: "REQUEST_URL",
                value: `${process.env.CONVEX_SITE_URL}/postVideo`,
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

    console.log(response);
    return { status: "Container started successfully" };
  },
});

// Function to generate a SAS URL
export const generateURL = action({
  args: {
    id: v.id("video"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.runQuery(internal.video.get, { id: args.id });
    if (!video) {
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
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1-hour expiry
      },
      sharedKeyCredential
    ).toString();

    const sasUrl = `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    return sasUrl;
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
