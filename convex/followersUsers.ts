import { internalMutation } from "./_generated/server";
import { FollowersUsers } from "./tables/followsUsers";

export const insert = internalMutation({
  args: FollowersUsers.withoutSystemFields,
  handler: (ctx, args) =>
    ctx.db.insert("followersUsers", {
      follower: args.follower,
      user: args.user,
    }),
});
