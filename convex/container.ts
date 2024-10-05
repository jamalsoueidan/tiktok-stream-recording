import { pick } from "convex-helpers";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Container } from "./tables/container";

export const get = internalQuery({
  args: pick(Container.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    return ctx.db
      .query("container")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .filter((q) => q.eq(q.field("status"), "STARTED"))
      .first();
  },
});

export const insert = internalMutation({
  args: {
    ...Container.withoutSystemFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("container", args);
  },
});

export const destroy = internalMutation({
  args: {
    id: v.id("container"),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.id, {
      status: "DELETED",
      deleted_at: Date.now(),
    });
  },
});
