import { internalMutation } from "./_generated/server";
import { TiktokUsers } from "./tables/tiktokUsers";

export const insert = internalMutation({
  args: TiktokUsers.withoutSystemFields,
  handler: (ctx, args) =>
    ctx.db.insert("tiktokUsers", {
      uniqueId: args.uniqueId,
      user: args.user,
    }),
});
