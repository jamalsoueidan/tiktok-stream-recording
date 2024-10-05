import { pick } from "convex-helpers";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
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

  return new Response(null, {
    status: 200,
  });
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
