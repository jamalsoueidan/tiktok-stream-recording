import ms from "ms";
import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

export const updates = httpAction(async (ctx, request) => {
  const { uniqueId, message, filename } = await request.json();

  await ctx.runMutation(internal.containerLog.insert, {
    uniqueId,
    message,
    filename,
  });

  return new Response(null, {
    status: 200,
  });
});

export const saveImage = httpAction(async (ctx, request) => {
  const { uniqueId, filename, image } = await request.json();

  const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");

  console.log("Saving image for", uniqueId);
  const binaryData = Uint8Array.from(atob(base64Data), (char) =>
    char.charCodeAt(0)
  );

  const storageId = await ctx.storage.store(
    new Blob([binaryData], { type: "image/jpeg" })
  );

  await ctx.runMutation(internal.video.insert, {
    uniqueId,
    filename,
    image: storageId,
  });

  return new Response(null, {
    status: 200,
  });
});

export const saveVideo = httpAction(async (ctx, request) => {
  const { uniqueId, filename, metadata, video } = await request.json();

  const doc = await ctx.runQuery(internal.video.getByFilename, { filename });
  if (!doc) {
    throw new Error("Not found video reference");
  }

  console.log({
    id: doc?._id,
    uniqueId,
    video,
    quality: metadata.quality,
    duration: metadata.duration,
    fileSizeMB: metadata.fileSizeMB,
    width: metadata.width,
    height: metadata.height,
  });

  await ctx.runMutation(internal.video.update, {
    id: doc?._id,
    uniqueId,
    video,
    quality: metadata.quality,
    durationSec: metadata.duration,
    fileSizeMB: metadata.fileSizeMB,
    width: metadata.width,
    height: metadata.height,
  });

  //terminate container after 10min
  await ctx.scheduler.runAfter(ms("10m"), api.azure.terminateContainer, {
    uniqueId,
  });

  //check user if he came back after 1m, sometime disconnection happens in tiktok live
  await ctx.scheduler.runAfter(ms("1m"), api.tiktok.checkUser, {
    uniqueId,
  });

  return new Response(null, {
    status: 200,
  });
});
