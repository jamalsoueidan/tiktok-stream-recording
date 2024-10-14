import { asyncMap, pick } from "convex-helpers";
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
    if (args.uniqueId.length <= 1) {
      throw new Error("Follower uniqueId is required");
    }

    const uniqueId = args.uniqueId.replace("@", "");

    const follower = await ctx.runQuery(internal.follower.getByUniqueId, {
      uniqueId,
    });

    if (!follower) {
      await ctx.runMutation(internal.follower.insert, {
        uniqueId,
      });

      await ctx.runMutation(internal.tiktokUsers.insert, {
        uniqueId,
        user: ctx.user,
      });
    }

    if (!follower?.avatarLarger) {
      await ctx.scheduler.runAfter(0, api.tiktok.getTiktokMetadata, {
        uniqueId,
      });
    }

    await ctx.scheduler.runAfter(0, api.tiktok.checkUser, {
      uniqueId,
    });
  },
});

export const unfollow = mutationWithUser({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    const tiktokUser = await ctx.db
      .query("tiktokUsers")
      .withIndex("by_user_and_uniqueId", (q) =>
        q.eq("user", ctx.user).eq("uniqueId", args.uniqueId)
      )
      .unique();
    if (!tiktokUser) {
      throw new Error("Follower not found");
    }

    await ctx.db.delete(tiktokUser._id);

    const otherFollowing = await ctx.db
      .query("tiktokUsers")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .collect();

    // no other is following this tiktok user
    if (otherFollowing.length === 0) {
      const follower = await ctx.db
        .query("followers")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
        .unique();

      if (follower) {
        // delete the follower
        await ctx.db.delete(follower?._id);
      }
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
      .query("tiktokUsers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (tiktokUser) => {
        const follower = await getOneFrom(
          ctx.db,
          "followers",
          "by_uniqueId",
          tiktokUser.uniqueId,
          "uniqueId"
        );

        if (!follower) {
          throw new Error("Follower not found");
        }

        const video = await ctx.db
          .query("videos")
          .withIndex("by_uniqueId_and_video", (q) =>
            q.eq("uniqueId", follower.uniqueId).eq("video", undefined)
          )
          .order("desc")
          .first();

        return { ...follower, recording: video ? true : false };
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

    return follower;
  },
});

export const getAllNotUpdated = internalQuery({
  handler: async (ctx) => {
    const followers = await ctx.db
      .query("followers")
      .filter((q) => q.lte(q.field("cronRunAt"), Date.now() - 15 * 60000)) // 60000 stands for one minute in milliseconds
      .take(20);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "jamal@soueidan.com"))
      .first();

    if (!user) {
      return [];
    }

    const newFollowers = await asyncMap(followers, async (follower) => {
      const tiktokUser = await ctx.db
        .query("tiktokUsers")
        .withIndex("by_user_and_uniqueId", (q) =>
          q.eq("user", user._id).eq("uniqueId", follower.uniqueId)
        )
        .first();

      if (!tiktokUser) {
        return null;
      }

      return follower;
    });

    return newFollowers.filter((follower) => follower !== null);
  },
});

export const update = internalMutation({
  args: {
    id: v.id("followers"),
    ...partial(Follower.withoutSystemFields),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});
