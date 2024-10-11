import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { ContainerLog } from "./tables/_containerLog";
import { Follower } from "./tables/follower";
import { TiktokUsers } from "./tables/tiktokUsers";
import { User } from "./tables/user";
import { Video } from "./tables/video";

export default defineSchema({
  ...authTables,
  users: User.table,
  followers: Follower.table.index("by_uniqueId", ["uniqueId"]),
  videos: Video.table
    .index("by_uniqueId", ["uniqueId"])
    .index("by_filename", ["filename"])
    .index("by_video", ["video"])
    .index("by_uniqueId_and_video", ["uniqueId", "video"]),
  containerLogs: ContainerLog.table
    .index("by_uniqueId_and_filename", ["uniqueId", "filename"])
    .index("by_filename", ["filename"]),
  tiktokUsers: TiktokUsers.table
    .index("by_user", ["user"])
    .index("by_user_and_uniqueId", ["user", "uniqueId"])
    .index("by_uniqueId", ["uniqueId"]),
});
