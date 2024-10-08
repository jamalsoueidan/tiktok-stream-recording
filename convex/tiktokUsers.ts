import { internalMutation } from "./_generated/server";
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
