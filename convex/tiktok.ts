import { v } from "convex/values";
import ms from "ms";
import { api, internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

// Define types
interface LiveRoomInfo {
  status: number;
  title: string;
  ownerInfo: {
    nickname: string;
  };
}

interface StreamData {
  data: {
    [key: string]: {
      main: {
        flv: string;
        sdk_params: {
          vbitrate: number;
        };
      };
    };
  };
}

export interface Stream {
  name: string;
  url: string;
  vbitrate: number;
}
const URL_WEB_LIVE = "https://www.tiktok.com/@{channel}/live";
const URL_API_LIVE_DETAIL =
  "https://www.tiktok.com/api/live/detail/?aid=1988&roomID={room_id}";
const URL_WEBCAST_ROOM_INFO =
  "https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id={room_id}";
const STATUS_OFFLINE = 4;

export const getLiveStatus = internalAction({
  args: {
    roomId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const url = URL_API_LIVE_DETAIL.replace("{room_id}", args.roomId);
      const response = await fetch(url);
      const data = await response.json();

      const liveRoomInfo: LiveRoomInfo = data.LiveRoomInfo;
      if (liveRoomInfo.status === STATUS_OFFLINE) {
        console.log("The channel is currently offline");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error fetching live room details:", error);
      return false;
    }
  },
});

export const getStreamData = action({
  args: {
    roomId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = URL_WEBCAST_ROOM_INFO.replace("{room_id}", args.roomId);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: "sessionid_ss=test; tt-target-idc=useast2a;",
      },
      credentials: "include", // This ensures that cookies are sent in the request
    });
    const data = await response.json();

    const streamUrl =
      data.data?.stream_url?.live_core_sdk_data?.pull_data?.stream_data;

    if (!streamUrl) {
      console.error("The stream is inaccessible");

      return null;
    }

    const streamData: StreamData = JSON.parse(streamUrl);

    const streams: Stream[] = Object.entries(streamData.data).map(
      ([name, data]) => {
        return {
          name,
          url: data.main.flv,
          vbitrate: data.main.sdk_params.vbitrate,
        };
      }
    );

    return streams;
  },
});

export const checkAll = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.follower.getAllNotUpdated);

    console.log(`${users.length} users to check is streaming live`);

    for (const [index, user] of users.entries()) {
      await ctx.scheduler.runAfter(ms(`${index * 15}s`), api.tiktok.checkUser, {
        uniqueId: user.uniqueId,
      });
    }
  },
});

export const checkUser = action({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Checking user ${args.uniqueId}`);
    const follower = await ctx.runQuery(internal.follower.getByUniqueId, {
      uniqueId: args.uniqueId,
    });

    if (!follower) {
      console.log(`User ${args.uniqueId} not found`);
      return;
    }

    const followerId = follower._id;

    await ctx.runMutation(internal.follower.update, {
      id: followerId,
      cronRunAt: Date.now(),
    });

    const roomId = await ctx.runAction(internal.tiktok.getRoomId, {
      uniqueId: args.uniqueId,
    });

    const logId = await ctx.runMutation(internal.log.save, {
      uniqueId: args.uniqueId,
    });

    //user is private or we dont have info about him
    if (!roomId) {
      await ctx.runMutation(internal.follower.update, {
        id: followerId,
        requireLogin: true,
      });

      return;
    }

    const live = await ctx.runAction(internal.tiktok.getLiveStatus, {
      roomId,
    });

    await ctx.runMutation(internal.log.update, {
      id: logId,
      live,
      roomId: roomId,
    });

    let requireLogin = false;
    if (live) {
      console.log(`User ${args.uniqueId}`, "is streaming live");
      const streams = await ctx.runAction(api.tiktok.getStreamData, {
        roomId,
      });

      if (!streams) {
        requireLogin = true;
      } else {
        console.log("Lets trigger start recording for", args.uniqueId);
        await ctx.scheduler.runAfter(0, api.azure.startRecording, args);
      }
    } else {
      console.log(`User ${args.uniqueId}`, "is offline");
    }

    await ctx.runMutation(internal.follower.update, {
      id: followerId,
      cronRunAt: Date.now(),
      requireLogin,
    });
  },
});

export const getTiktokMetadata = action({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    const liveUrl = URL_WEB_LIVE.replace("{channel}", args.uniqueId);
    const response = await fetch(liveUrl, { redirect: "manual" });
    const textData = await response.text();

    const scriptRegex =
      /<script id="SIGI_STATE" type="application\/json">(.+?)<\/script>/;
    const match = textData.match(scriptRegex);
    if (match && match[1]) {
      const metadata = JSON.parse(match[1]) as {
        LiveRoom?: {
          liveRoomUserInfo?: {
            stats: {
              followerCount: number;
              followingCount: number;
            };
            user?: {
              avatarLarger: string;
              roomId: string;
              avatarMedium: string;
              signature: string;
              nickname: string;
            };
          };
        };
      };

      const follower = await ctx.runQuery(internal.follower.getByUniqueId, {
        uniqueId: args.uniqueId,
      });

      if (follower) {
        await ctx.runMutation(internal.follower.update, {
          id: follower._id,
          avatarMedium: metadata.LiveRoom?.liveRoomUserInfo?.user?.avatarMedium,
          avatarLarger: metadata.LiveRoom?.liveRoomUserInfo?.user?.avatarLarger,
          signature: metadata.LiveRoom?.liveRoomUserInfo?.user?.signature,
          nickname: metadata.LiveRoom?.liveRoomUserInfo?.user?.nickname,
        });
      }
    }
  },
});

export const getRoomId = internalAction({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const liveUrl = URL_WEB_LIVE.replace("{channel}", args.uniqueId);
      const response = await fetch(liveUrl, { redirect: "manual" });
      const textData = await response.text();

      // Try to find room_id in the meta tag directly using RegExp
      const roomIdMetaMatch = textData.match(/room_id=(\d+)/);
      if (roomIdMetaMatch && roomIdMetaMatch[1]) {
        return roomIdMetaMatch[1];
      }

      // Fallback to finding room_id in the SIGI_STATE script using RegExp
      const sigiStateMatch = textData.match(/"roomId":"(\d+)"/);
      if (sigiStateMatch && sigiStateMatch[1]) {
        return sigiStateMatch[1];
      }

      return null;
    } catch (error) {
      console.error("Error fetching room ID:", error);
      return null;
    }
  },
});
