import { pick } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import { v } from "convex/values";
import dayjs from "dayjs";
import { internalMutation, internalQuery, query } from "./_generated/server";
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

export const stats = query({
  args: pick(Log.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("log")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .filter((q) => q.eq(q.field("live"), true))
      .collect();

    function roundToNearestHalfHour(time: number) {
      const minutes = dayjs(time).minute();
      const roundedMinutes = minutes >= 30 ? 30 : 0;
      return dayjs(time).minute(roundedMinutes).second(0).millisecond(0);
    }

    const stats = logs.reduce((acc, log) => {
      const roundedTime = roundToNearestHalfHour(log._creationTime).format(
        "HH:mm"
      );

      // Find if the roundedTime already exists in the accumulated data
      const existingEntry = acc.find((entry) => entry.hour === roundedTime);

      if (existingEntry) {
        // If the time already exists, increment the value
        existingEntry.value += 1;
      } else {
        // If not, create a new entry for this time
        acc.push({ hour: roundedTime, value: 1, index: 1 });
      }

      return acc;
    }, [] as Array<{ hour: string; index: number; value: number }>);

    return stats.sort((a, b) => {
      return a.hour.localeCompare(b.hour);
    });
  },
});
