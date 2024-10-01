import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Follower = Table("followers", {
  uniqueId: v.string(),
  cronRunAt: v.number(),
  avatarMedium: v.optional(v.string()),
  avatarLarger: v.optional(v.string()),
  nickname: v.optional(v.string()),
  signature: v.optional(v.string()),
  requireLogin: v.optional(v.boolean()),
});
