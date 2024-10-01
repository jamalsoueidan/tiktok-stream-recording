import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Log = Table("log", {
  uniqueId: v.string(),
  live: v.boolean(),
  user: v.optional(v.any()),
  stats: v.optional(v.any()),
  stream: v.optional(
    v.object({
      flv_pull_url: v.object({
        FULL_HD1: v.optional(v.string()),
        HD1: v.string(),
        SD1: v.string(),
        SD2: v.string(),
      }),
      hls_pull_url: v.string(),
    })
  ),
  stream_url: v.optional(v.any()),
  roomId: v.optional(v.union(v.string(), v.number())),
});
