import { pick } from "convex-helpers";
import { query } from "./_generated/server";
import { Follower } from "./tables/follower";

export const stats = query({
  args: pick(Follower.withoutSystemFields, ["uniqueId"]),
  handler: async () => {
    /*const logs = await ctx.db
      .query("logs")
      .withIndex("by_uniqueId_and_live", (q) =>
        q.eq("uniqueId", args.uniqueId).eq("live", true)
      )
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
    });*/
  },
});
