import { defineSchema } from "convex/server";
import { Follower } from "./tables/follower";
import { Log } from "./tables/log";

export default defineSchema({
  log: Log.table.index("by_uniqueId", ["uniqueId"]),
  follower: Follower.table.index("by_uniqueId", ["uniqueId"]),
});
