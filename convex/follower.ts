import { pick } from "convex-helpers";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Follower } from "./tables/follower";

export const addFollower = action({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    const id = await ctx.runMutation(api.follower.insert, args);
    await ctx.scheduler.runAfter(0, api.tiktok.checkUser, {
      id,
      ...args,
    });
  },
});

export const insert = mutation({
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
        return { ...follower, log };
      })
    );

    return {
      ...paginate,
      page,
    };
  },
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
      .filter((q) => q.lte(q.field("cronRunAt"), Date.now() - 30 * 60000)) // 60000 stands for one minute in milliseconds
      .take(3),
});

export const update = internalMutation({
  args: {
    id: v.id("follower"),
    ...pick(Follower.withoutSystemFields, [
      "cronRunAt",
      "avatarMedium",
      "avatarLarger",
      "nickname",
      "signature",
      "requireLogin",
    ]),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});
