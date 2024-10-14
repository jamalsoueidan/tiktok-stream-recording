import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { queryWithUser } from "./auth";
import { TiktokUsers } from "./tables/tiktokUsers";

export const insert = internalMutation({
  args: TiktokUsers.withoutSystemFields,
  handler: (ctx, args) =>
    ctx.db.insert("tiktokUsers", {
      uniqueId: args.uniqueId,
      user: args.user,
    }),
});

export const uniqueIds = queryWithUser({
  handler: async (ctx) => {
    const tiktokUsers = await ctx.db
      .query("tiktokUsers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user))
      .collect();

    return tiktokUsers.map((tu) => tu.uniqueId);
  },
});

export const checkIfUserPaidUser = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    const tiktokUser = await ctx.db
      .query("tiktokUsers")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .first();

    if (!tiktokUser) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", tiktokUser?.user))
      .unique();

    return user?.isAdmin;
  },
});
