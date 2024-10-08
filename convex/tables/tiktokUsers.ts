import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const TiktokUsers = Table("tiktok_users", {
  uniqueId: v.string(),
  user: v.id("users"),
});
