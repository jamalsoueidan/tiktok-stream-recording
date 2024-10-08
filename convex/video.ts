import { pick } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { Video } from "./tables/video";

export const get = internalQuery({
  args: {
    id: v.id("video"),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const countRecording = query({
  args: {},
  handler: async (ctx) => {
    return (
      await ctx.db
        .query("video")
        .withIndex("by_video", (q) => q.eq("video", undefined))
        .collect()
    ).length;
  },
});

export const paginateRecording = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("video")
      .withIndex("by_video", (q) => q.eq("video", undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (video) => {
        if (video.image) {
          return { ...video, image: await ctx.storage.getUrl(video.image) };
        }
        return video;
      })
    );

    return {
      ...paginate,
      page,
    };
  },
});

export const paginateVideos = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("video")
      .filter((q) => q.neq(q.field("video"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (video) => {
        if (video.image) {
          return { ...video, image: await ctx.storage.getUrl(video.image) };
        }
        return video;
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
        if (video.image) {
          return { ...video, image: await ctx.storage.getUrl(video.image) };
        }
        return video;
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

export const getByFilename = internalQuery({
  args: pick(Video.withoutSystemFields, ["filename"]),
  handler: async (ctx, args) => {
    return ctx.db
      .query("video")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("video"),
    ...partial(Video.withoutSystemFields),
  },
  handler: async (convexToJson, args) => {
    const { id, ...rest } = args;
    return convexToJson.db.patch(id, rest);
  },
});
