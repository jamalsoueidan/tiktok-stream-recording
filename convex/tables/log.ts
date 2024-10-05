import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Log = Table("log", {
  uniqueId: v.string(),
  live: v.boolean(),
  roomId: v.optional(v.union(v.string(), v.number())),
});
