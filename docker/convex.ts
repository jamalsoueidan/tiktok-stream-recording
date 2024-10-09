import fs from "fs";

export const sendImage = async (imagePath: string) => {
  if (!process.env.POST_IMAGE_URL) {
    console.log("POST_IMAGE_URL is not defined");
    return;
  }

  if (!process.env.TIKTOK_CHANNEL) {
    console.log("TIKTOK_CHANNEL is not defined");
    return;
  }

  if (!process.env.FILENAME) {
    console.log("FILENAME is not defined");
    return;
  }

  const fileBuffer = fs.readFileSync(imagePath);

  const response = await fetch(process.env.POST_IMAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uniqueId: process.env.TIKTOK_CHANNEL,
      filename: process.env.FILENAME,
      image: fileBuffer.toString("base64"),
    }),
  });

  if (!response.ok) {
    console.log(`Failed to send data: ${response.statusText}`);
  }
};

export const sendVideo = async (
  videoPath: string,
  metadata: {
    duration: number;
    quality: string;
    fileSizeMB: string;
    width?: number;
    height?: number;
  }
) => {
  if (!process.env.POST_VIDEO_URL) {
    console.log("POST_VIDEO_URL is not defined");
    return;
  }

  if (!process.env.TIKTOK_CHANNEL) {
    console.log("TIKTOK_CHANNEL is not defined");
    return;
  }

  if (!process.env.FILENAME) {
    console.log("FILENAME is not defined");
    return;
  }

  const response = await fetch(process.env.POST_VIDEO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uniqueId: process.env.TIKTOK_CHANNEL,
      video: videoPath,
      metadata,
      filename: process.env.FILENAME,
    }),
  });

  if (!response.ok) {
    console.log(`Failed to send data: ${response.statusText}`);
  }
};

export const sendUpdate = async (message: string) => {
  if (!process.env.UPDATES_URL) {
    console.log("UPDATES_URL is not defined");
    return;
  }

  if (!process.env.TIKTOK_CHANNEL) {
    console.log("TIKTOK_CHANNEL is not defined");
    return;
  }

  if (!process.env.FILENAME) {
    console.log("FILENAME is not defined");
    return;
  }

  const response = await fetch(process.env.UPDATES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uniqueId: process.env.TIKTOK_CHANNEL,
      filename: process.env.FILENAME,
      message,
    }),
  });

  if (!response.ok) {
    console.log(`Failed to send data: ${response.statusText}`);
  }
};
