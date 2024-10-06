# TikTok Stream Recording and Upload Project

This project is designed to automate the process of recording live TikTok streams, storing them in Azure Blob Storage, and managing video access through expiring URLs. Setup the project, and then just follow tiktok users in the web app, and then it will automatically record their stream when they are live.

## Features

- **Automated Stream Recording**: Record TikTok live streams automatically when a streamer goes live.
- **Azure Container Instance Orchestration**: Boot up container instances dynamically to start recording streams, and delete them when the recording is complete.
- **Video Storage in Azure Blob Storage**: Upload recorded streams and thumbnails to Azure Blob Storage for storage.
- **Expiring Access URLs**: Generate expiring SAS (Shared Access Signature) URLs for secure access to recorded videos.
- **Optional Thumbnail Generation**: Generate a video thumbnail for a preview frame from the recorded stream.
- **Cleanup**: Delete unused container instances and clean up old images in the container registry.

## Setup Instructions

### Prerequisites

- **Azure Subscription** with access to **Container Instances**, **Blob Storage**, and **Container Registry**.
- **Convex** backend for logic and scheduling.
- **FFmpeg** installed in the container for stream recording.
- **Azure CLI** for managing resources.
- **Node.js** environment for backend services.

### Environment Variables

To configure the project, you will need to set the following environment variables:

```bash
CREDENTIAL_TENANT_ID=<your-azure-tenant-id>
CREDENTIAL_CLIENT_ID=<your-azure-client-id>
CREDENTIAL_CLIENT_SECRET=<your-azure-client-secret>
SUBSCRIPTION_ID=<your-azure-subscription-id>
RESOURCE_GROUP=<your-azure-resource-group>
STORAGE_ACCOUNT_NAME=<your-storage-account-name>
STORAGE_ACCOUNT_KEY=<your-storage-account-key>
CONTAINER_REGISTRY_NAME=<your-container-registry-name>
CONTAINER_REGISTRY_USERNAME=<your-container-registry-username>
CONTAINER_REGISTRY_PASSWORD=<your-container-registry-password>
IMAGE_NAME=<your-docker-image-name>
LOCATION=<your-azure-region-location>
CONVEX_SITE_URL=<your-convex-site-url>
```
