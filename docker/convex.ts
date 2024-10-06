import fs from "fs";

export const sendVideoAndThumbnail = async (
  uniqueId: string,
  video: string,
  thumbnail: string
) => {
  if (!process.env.POST_VIDEO_URL) {
    console.log("POST_VIDEO_URL is not defined");
    return;
  }

  const fileBuffer = fs.readFileSync(thumbnail);

  const response = await fetch(process.env.POST_VIDEO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uniqueId,
      video,
      thumbnail: fileBuffer.toString("base64"),
    }),
  });

  if (!response.ok) {
    console.log(`Failed to send data: ${response.statusText}`);
  }
};

export const sendUpdate = async (uniqueId: string, message: string) => {
  if (!process.env.UPDATE_VIDEO_URL) {
    console.log("UPDATE_VIDEO_URL is not defined");
    return;
  }

  const response = await fetch(process.env.UPDATE_VIDEO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uniqueId,
      message,
    }),
  });

  if (!response.ok) {
    console.log(`Failed to send data: ${response.statusText}`);
  }
};
