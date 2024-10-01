import { pick } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Log } from "./tables/log";

export const save = internalMutation({
  args: pick(Log.withoutSystemFields, ["uniqueId", "stats"]),
  handler: (ctx, args) => {
    return ctx.db.insert("log", {
      ...args,
      live: false,
    });
  },
});

export const update = internalMutation({
  args: {
    id: v.id("log"),
    ...partial(Log.withoutSystemFields),
  },
  handler: (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});

export const getLatest = internalQuery({
  args: pick(Log.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    return ctx.db
      .query("log")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .order("desc")
      .first();
  },
});
