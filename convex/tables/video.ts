import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Video = Table("videos", {
  uniqueId: v.string(),
  video: v.string(),
  thumbnail: v.id("_storage"),
});
