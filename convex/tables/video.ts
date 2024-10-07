import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Video = Table("videos", {
  uniqueId: v.string(),
  filename: v.string(),
  image: v.optional(v.id("_storage")),
  video: v.optional(v.string()),
  quality: v.optional(v.string()),
  fileSizeMB: v.optional(v.string()),
  durationSec: v.optional(v.number()),
});
