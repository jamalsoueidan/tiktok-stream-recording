import { pick } from "convex-helpers";
import { internalMutation, query } from "./_generated/server";
import { ContainerLog } from "./tables/container_log";

export const insert = internalMutation({
  args: {
    ...ContainerLog.withoutSystemFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("container_log", args);
  },
});

export const get = query({
  args: pick(ContainerLog.withoutSystemFields, ["filename"]),
  handler: async (ctx, args) => {
    return ctx.db
      .query("container_log")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .order("asc")
      .collect();
  },
});
