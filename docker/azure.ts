import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";

export const uploadToBlobStorage = async (
  filePath: string,
  blobName: string,
  blobContentType: "image/jpeg" | "video/x-flv" | "video/mp4"
) => {
  try {
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      console.log("Missing AZURE_STORAGE_CONNECTION_STRING env value");
      return;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("videos");
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const fileStream = fs.createReadStream(filePath);

    await blockBlobClient.uploadStream(fileStream, undefined, undefined, {
      blobHTTPHeaders: { blobContentType },
    });

    console.log(`Upload of ${blobName} to Azure Blob Storage successful!`);
  } catch (error) {
    console.error("Error uploading to Blob Storage:", error);
  }
};
