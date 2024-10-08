import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { ContainerLog } from "./tables/_containerLog";
import { Follower } from "./tables/follower";
import { FollowersUsers } from "./tables/followsUsers";
import { Log } from "./tables/log";
import { Video } from "./tables/video";

export default defineSchema({
  ...authTables,
  logs: Log.table
    .index("by_uniqueId", ["uniqueId"])
    .index("by_uniqueId_and_live", ["uniqueId", "live"]),
  followers: Follower.table.index("by_uniqueId", ["uniqueId"]),
  videos: Video.table
    .index("by_uniqueId", ["uniqueId"])
    .index("by_filename", ["filename"])
    .index("by_video", ["video"])
    .index("by_uniqueId_and_video", ["uniqueId", "video"]),
  containerLogs: ContainerLog.table
    .index("by_uniqueId_and_filename", ["uniqueId", "filename"])
    .index("by_filename", ["filename"]),
  followersUsers: FollowersUsers.table.index("by_follower_and_user", [
    "follower",
    "user",
  ]),
});
