import { Table } from "convex-helpers/server";
import { Infer, v } from "convex/values";

const videoTable = {
  uniqueId: v.string(),
  filename: v.string(),
  image: v.optional(v.id("_storage")),
  video: v.optional(v.string()),
  quality: v.optional(v.string()),
  fileSizeMB: v.optional(v.string()),
  durationSec: v.optional(v.number()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
};

const videoObect = v.object(videoTable);

export type Video = Infer<typeof videoObect>;
export const Video = Table("videos", videoTable);
