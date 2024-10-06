import { pick } from "convex-helpers";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import ms from "ms";
import { api, internal } from "./_generated/api";
import {
  httpAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { Video } from "./tables/video";

export const get = internalQuery({
  args: {
    id: v.id("video"),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const save = httpAction(async (ctx, request) => {
  const { uniqueId, video, thumbnail } = await request.json();

  const base64Data = thumbnail.replace(/^data:image\/jpeg;base64,/, "");

  console.log("Saving video...", uniqueId);
  const binaryData = Uint8Array.from(atob(base64Data), (char) =>
    char.charCodeAt(0)
  );

  const storageId = await ctx.storage.store(
    new Blob([binaryData], { type: "image/jpeg" })
  );

  await ctx.runMutation(internal.video.insert, {
    uniqueId,
    video,
    thumbnail: storageId,
  });

  //terminate container after 10min
  await ctx.scheduler.runAfter(ms("10m"), api.azure.deleteContainerInstance, {
    uniqueId,
  });

  const container = await ctx.runQuery(internal.container.get, { uniqueId });
  if (container) {
    //update the container instance that its deleted
    await ctx.runMutation(internal.container.destroy, { id: container._id });

    //check user if he came back after 2m, sometime disconnection happens in tiktok live
    await ctx.scheduler.runAfter(ms("2m"), api.tiktok.checkUser, {
      uniqueId,
    });
  }

  return new Response(null, {
    status: 200,
  });
});

export const paginateAll = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("video")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (video) => {
        const thumbnail_url = await ctx.storage.getUrl(video.thumbnail);
        return { ...video, thumbnail_url };
      })
    );

    return {
      ...paginate,
      page,
    };
  },
});

export const paginate = query({
  args: {
    paginationOpts: paginationOptsValidator,
    ...pick(Video.withoutSystemFields, ["uniqueId"]),
  },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("video")
      .filter((q) => q.eq(q.field("uniqueId"), args.uniqueId))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (video) => {
        const thumbnail_url = await ctx.storage.getUrl(video.thumbnail);
        return { ...video, thumbnail_url };
      })
    );

    return {
      ...paginate,
      page,
    };
  },
});

export const insert = internalMutation({
  args: {
    ...Video.withoutSystemFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("video", args);
  },
});
