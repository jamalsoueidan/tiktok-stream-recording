import { defineSchema } from "convex/server";
import { ContainerLog } from "./tables/container_log";
import { Follower } from "./tables/follower";
import { Log } from "./tables/log";
import { Video } from "./tables/video";

export default defineSchema({
  log: Log.table
    .index("by_uniqueId", ["uniqueId"])
    .index("by_uniqueId_and_live", ["uniqueId", "live"]),
  follower: Follower.table.index("by_uniqueId", ["uniqueId"]),
  video: Video.table
    .index("by_uniqueId", ["uniqueId"])
    .index("by_filename", ["filename"])
    .index("by_video", ["video"])
    .index("by_uniqueId_and_video", ["uniqueId", "video"]),
  container_log: ContainerLog.table
    .index("by_uniqueId_and_filename", ["uniqueId", "filename"])
    .index("by_filename", ["filename"]),
});
