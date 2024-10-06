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
    const response = await fetch(url);
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
      await ctx.scheduler.runAfter(ms(`${index * 3}s`), api.tiktok.checkUser, {
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
    const followerId = await ctx.runQuery(internal.follower.getByUniqueId, {
      uniqueId: args.uniqueId,
    });

    await ctx.runMutation(internal.follower.update, {
      id: followerId,
      cronRunAt: Date.now(),
    });

    const http = await ctx.runAction(internal.tiktok.getRoomId, {
      uniqueId: args.uniqueId,
    });

    const logId = await ctx.runMutation(internal.log.save, {
      uniqueId: args.uniqueId,
    });

    const roomId = http.LiveRoom?.liveRoomUserInfo?.user?.roomId;
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
      const streams = await ctx.runAction(api.tiktok.getStreamData, {
        roomId,
      });

      if (!streams) {
        requireLogin = true;
      } else {
        await ctx.scheduler.runAfter(0, api.azure.startRecording, args);
      }
    }

    await ctx.runMutation(internal.follower.update, {
      id: followerId,
      cronRunAt: Date.now(),
      avatarMedium: http.LiveRoom?.liveRoomUserInfo?.user?.avatarMedium,
      avatarLarger: http.LiveRoom?.liveRoomUserInfo?.user?.avatarLarger,
      signature: http.LiveRoom?.liveRoomUserInfo?.user?.signature,
      nickname: http.LiveRoom?.liveRoomUserInfo?.user?.nickname,
      requireLogin,
    });
  },
});

export const getRoomId = internalAction({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.wintr.com/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: process.env.WINTR_KEY,
        method: "GET",
        url: `https://www.tiktok.com/@${args.uniqueId}/live`,
        outputschema: {
          scripts: {
            group: "script",
            data: {
              script_content: {
                selector: "script#SIGI_STATE",
                attr: "*html*",
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as {
      content: {
        scripts: Array<{ script_content: string }>;
      };
    };

    const script = json.content.scripts.filter((t) => t.script_content);

    return JSON.parse(script[0].script_content) as {
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
  },
});
