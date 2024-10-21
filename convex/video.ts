import { asyncMap, pick } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { queryWithUser } from "./auth";
import { Video } from "./tables/video";

export const get = internalQuery({
  args: {
    id: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.id);
    if (!video) {
      throw new Error("Video not found");
    }
    return video;
  },
});

export const countRecording = queryWithUser({
  args: {},
  handler: async (ctx) => {
    const uniqueIds: string[] = await ctx.runQuery(api.tiktokUsers.uniqueIds);
    const recordings = await ctx.db
      .query("videos")
      .withIndex("by_video", (q) => q.eq("video", undefined))
      .collect();

    return recordings.filter((video) => uniqueIds.includes(video.uniqueId))
      .length;
  },
});

export const countVideos = queryWithUser({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db
      .query("videos")
      .filter((q) => q.neq(q.field("video"), undefined))
      .collect();

    return videos.length;
  },
});

export const paginateRecording = queryWithUser({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const uniqueIds: string[] = await ctx.runQuery(api.tiktokUsers.uniqueIds);

    const paginate = await ctx.db
      .query("videos")
      .withIndex("by_video", (q) => q.eq("video", undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const pageFilters = paginate.page.filter((video) =>
      uniqueIds.includes(video.uniqueId)
    );

    const page = await asyncMap(pageFilters, async (video) => {
      const follower = await ctx.db
        .query("followers")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", video.uniqueId))
        .first();

      if (video.image) {
        return {
          ...video,
          image: await ctx.storage.getUrl(video.image),
          follower,
        };
      }

      return { ...video, follower };
    });

    return {
      ...paginate,
      page,
    };
  },
});

export const paginateVideos = queryWithUser({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("videos")
      .filter((q) => q.neq(q.field("video"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await asyncMap(paginate.page, async (video) => {
      const follower = await ctx.db
        .query("followers")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", video.uniqueId))
        .first();

      if (video.image) {
        return {
          ...video,
          image: await ctx.storage.getUrl(video.image),
          follower,
        };
      }

      return { ...video, follower };
    });

    return {
      ...paginate,
      page,
    };
  },
});

export const paginateUserVideos = query({
  args: {
    paginationOpts: paginationOptsValidator,
    ...pick(Video.withoutSystemFields, ["uniqueId"]),
  },
  handler: async (ctx, args) => {
    const paginate = await ctx.db
      .query("videos")
      .filter((q) =>
        q.and(
          q.eq(q.field("uniqueId"), args.uniqueId),
          q.neq("video", undefined)
        )
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginate.page.map(async (video) => {
        if (video.image) {
          return { ...video, image: await ctx.storage.getUrl(video.image) };
        }
        return video;
      })
    );

    return {
      ...paginate,
      page,
    };
  },
});

export const insert = internalMutation({
  args: {
    ...Video.withoutSystemFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("videos", args);
  },
});

export const getByFilename = internalQuery({
  args: pick(Video.withoutSystemFields, ["filename"]),
  handler: async (ctx, args) => {
    return ctx.db
      .query("videos")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("videos"),
    ...partial(Video.withoutSystemFields),
  },
  handler: async (convexToJson, args) => {
    const { id, ...rest } = args;
    return convexToJson.db.patch(id, rest);
  },
});

export const stats = query({
  args: pick(Video.withoutSystemFields, ["uniqueId"]),
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .collect();

    const intervals = generateTimeIntervals();
    const intervalStats = intervals.map(() => 0);

    videos.forEach((video) => {
      if (video?.durationSec) {
        const startTime = new Date(video._creationTime);
        const endTime = new Date(
          startTime.getTime() + video?.durationSec * 1000
        );

        intervals.forEach((interval, index) => {
          const [hour, minute] = interval.split(":");
          const intervalStart = new Date(startTime);
          intervalStart.setHours(parseInt(hour), parseInt(minute), 0, 0);

          const intervalEnd = new Date(intervalStart);
          intervalEnd.setMinutes(intervalEnd.getMinutes() + 30); // 30-minute intervals

          // Check if the video crosses this interval
          if (
            doesVideoCrossInterval(
              startTime,
              endTime,
              intervalStart,
              intervalEnd
            )
          ) {
            intervalStats[index] += 1;
          }
        });
      }
    });

    const result = intervals.map((interval, index) => ({
      text: interval,
      value: intervalStats[index],
    }));

    return result;
  },
});

const generateTimeIntervals = () => {
  const intervals = [];
  for (let hour = 0; hour < 24; hour++) {
    intervals.push(`${String(hour).padStart(2, "0")}:00`);
    intervals.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return intervals;
};

const doesVideoCrossInterval = (
  startTime: Date,
  endTime: Date,
  intervalStart: Date,
  intervalEnd: Date
) => {
  return startTime < intervalEnd && endTime > intervalStart;
};
