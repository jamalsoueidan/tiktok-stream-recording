import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const FollowersUsers = Table("followers_users", {
  follower: v.id("followers"),
  user: v.id("users"),
});
