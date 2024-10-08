import { pick } from "convex-helpers";
import { getOneFrom } from "convex-helpers/server/relationships";
import { partial } from "convex-helpers/validators";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { actionWithUser, mutationWithUser, queryWithUser } from "./auth";
import { Follower } from "./tables/follower";

export const follow = actionWithUser({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    if (args.uniqueId.length === 0) {
      throw new Error("Follower uniqueId is required");
    }

    const follower = await ctx.runQuery(internal.follower.getByUniqueId, args);
    let follower_id;
    if (follower) {
      follower_id = follower?._id;
    } else {
      follower_id = await ctx.runMutation(internal.follower.insert, args);
    }

    await ctx.runMutation(internal.followersUsers.insert, {
      follower: follower_id,
      user: ctx.user,
    });

    await ctx.scheduler.runAfter(0, api.tiktok.checkUser, args);
  },
});

export const unfollow = mutationWithUser({
  args: {
    id: v.id("followers"),
  },
  handler: async (ctx, args) => {
    const followerUser = await ctx.db
      .query("followersUsers")
      .withIndex("follower_user", (q) =>
        q.eq("follower", args.id).eq("user", ctx.user)
      )
      .unique();
    if (!followerUser) {
      throw new Error("Follower not found");
    }

    await ctx.db.delete(followerUser._id);

    const otherFollowers = await ctx.db
      .query("followersUsers")
      .withIndex("follower", (q) => q.eq("follower", args.id))
      .collect();

    // no other is following this tiktok user
    if (otherFollowers.length === 0) {
      // delete the follower
      await ctx.db.delete(args.id);
    }
  },
});

export const insert = internalMutation({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: (ctx, args) =>
    ctx.db.insert("followers", {
      cronRunAt: 0,
      uniqueId: args.uniqueId,
      disabled: false,
    }),
});

export const paginate = queryWithUser({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("followersUsers")
      .withIndex("user", (q) => q.eq("user", ctx.user))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (follower_user) => {
        const follower = await getOneFrom(
          ctx.db,
          "followers",
          "by_id",
          follower_user.follower,
          "_id"
        );

        if (!follower) {
          throw new Error("Follower not found");
        }

        const log = await ctx.db
          .query("logs")
          .withIndex("by_uniqueId", (q) => q.eq("uniqueId", follower.uniqueId))
          .order("desc")
          .first();

        const video = await ctx.db
          .query("videos")
          .withIndex("by_uniqueId_and_video", (q) =>
            q.eq("uniqueId", follower.uniqueId).eq("video", undefined)
          )
          .order("desc")
          .first();

        return { ...follower, log, recording: video ? true : false };
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
      .query("followers")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique(),
});

export const get = query({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    const follower = await ctx.db
      .query("followers")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .first();

    if (!follower) {
      throw new Error("Follower not found");
    }

    const log = await ctx.db
      .query("logs")
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
      .query("followers")
      .filter((q) => q.lte(q.field("cronRunAt"), Date.now() - 15 * 60000)) // 60000 stands for one minute in milliseconds
      .take(15),
});

export const update = internalMutation({
  args: {
    id: v.id("followers"),
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
