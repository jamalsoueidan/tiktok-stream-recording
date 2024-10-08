import { pick } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { queryWithUser } from "./auth";
import { Video } from "./tables/video";

export const get = internalQuery({
  args: {
    id: v.id("videos"),
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
        .query("videos")
        .withIndex("by_video", (q) => q.eq("video", undefined))
        .collect()
    ).length;
  },
});

export const paginateRecording = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("videos")
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

export const paginateVideos = queryWithUser({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("videos")
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

export const paginate = queryWithUser({
  args: {
    paginationOpts: paginationOptsValidator,
    ...pick(Video.withoutSystemFields, ["uniqueId"]),
  },
  handler: async (ctx, args) => {
    const isFollowing = await ctx.db
      .query("tiktokUsers")
      .withIndex("by_user_and_uniqueId", (q) =>
        q.eq("user", ctx.user).eq("uniqueId", args.uniqueId)
      )
      .unique();
    if (!isFollowing) {
      throw new Error("not access");
    }

    const paginate = await ctx.db
      .query("videos")
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
    return ctx.db.insert("videos", args);
  },
});

export const getByFilename = internalQuery({
  args: pick(Video.withoutSystemFields, ["filename"]),
  handler: async (ctx, args) => {
    return ctx.db
      .query("videos")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("videos"),
    ...partial(Video.withoutSystemFields),
  },
  handler: async (convexToJson, args) => {
    const { id, ...rest } = args;
    return convexToJson.db.patch(id, rest);
  },
});
