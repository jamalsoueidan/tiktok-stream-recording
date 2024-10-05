import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Container = Table("containers", {
  uniqueId: v.string(),
  containerName: v.string(),
  status: v.union(v.literal("STARTED"), v.literal("DELETED")),
  deleted_at: v.optional(v.number()),
});
