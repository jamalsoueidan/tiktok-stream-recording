import { defineSchema } from "convex/server";
import { Container } from "./tables/container";
import { Follower } from "./tables/follower";
import { Log } from "./tables/log";
import { Video } from "./tables/video";

export default defineSchema({
  log: Log.table.index("by_uniqueId", ["uniqueId"]),
  follower: Follower.table.index("by_uniqueId", ["uniqueId"]),
  video: Video.table.index("by_uniqueId", ["uniqueId"]),
  container: Container.table.index("by_uniqueId", ["uniqueId"]),
});
