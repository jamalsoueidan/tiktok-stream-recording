import { pick } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Follower } from "./tables/follower";

export const follow = action({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    if (args.uniqueId.length === 0) {
      throw new Error("Follower uniqueId is required");
    }

    const follower = await ctx.runQuery(internal.follower.getByUniqueId, args);
    if (follower) {
      throw new Error("Follower already exists");
    }

    await ctx.runMutation(internal.follower.insert, args);
    await ctx.scheduler.runAfter(0, api.tiktok.checkUser, args);
  },
});

export const unfollow = mutation({
  args: {
    id: v.id("follower"),
  },
  handler: (ctx, args) => ctx.db.delete(args.id),
});

export const insert = internalMutation({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: (ctx, args) =>
    ctx.db.insert("follower", {
      cronRunAt: 0,
      uniqueId: args.uniqueId,
    }),
});

export const paginate = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("follower")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (follower) => {
        const log = await ctx.db
          .query("log")
          .withIndex("by_uniqueId", (q) => q.eq("uniqueId", follower.uniqueId))
          .order("desc")
          .first();

        const container = await ctx.db
          .query("container")
          .withIndex("by_uniqueId_and_status", (q) =>
            q.eq("uniqueId", follower.uniqueId).eq("status", "STARTED")
          )
          .order("desc")
          .first();

        return { ...follower, log, recording: container ? true : false };
      })
    );

    return {
      ...paginate,
      page,
    };
  },
});

export const getByUniqueId = internalQuery({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) =>
    ctx.db
      .query("follower")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique(),
});

export const get = query({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    const follower = await ctx.db
      .query("follower")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .first();

    if (!follower) {
      throw new Error("Follower not found");
    }

    const log = await ctx.db
      .query("log")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", follower.uniqueId))
      .order("desc")
      .first();

    return {
      ...follower,
      log,
    };
  },
});

export const getAllNotUpdated = internalQuery({
  handler: async (ctx) =>
    ctx.db
      .query("follower")
      .filter((q) => q.lte(q.field("cronRunAt"), Date.now() - 15 * 60000)) // 60000 stands for one minute in milliseconds
      .take(15),
});

export const update = internalMutation({
  args: {
    id: v.id("follower"),
    ...partial(
      pick(Follower.withoutSystemFields, [
        "cronRunAt",
        "avatarMedium",
        "avatarLarger",
        "nickname",
        "signature",
        "requireLogin",
      ])
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});
