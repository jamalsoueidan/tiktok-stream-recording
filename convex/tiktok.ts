import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

export const check = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.follower.getAllNotUpdated);

    console.log(`${users.length} users to check is streaming live`);
    try {
      const updatePromises = users.map((user) =>
        ctx.runAction(api.tiktok.checkUser, {
          id: user._id,
          uniqueId: user.uniqueId,
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating users:", error);
    }
  },
});

export const checkUser = action({
  args: {
    id: v.id("follower"),
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    const http = await ctx.runAction(internal.tiktok.getRoomId, {
      uniqueId: args.uniqueId,
    });

    const id = await ctx.runMutation(internal.log.save, {
      uniqueId: args.uniqueId,
      stats: http.LiveRoom?.liveRoomUserInfo?.stats,
    });

    const roomId = http.LiveRoom?.liveRoomUserInfo?.user?.roomId;
    //user is private or we dont have info about him
    if (!roomId) {
      await ctx.runMutation(internal.follower.update, {
        id: args.id,
        cronRunAt: Date.now(),
      });

      return;
    }

    const { live } = await ctx.runAction(internal.tiktok.getIsLive, {
      roomId,
    });

    await ctx.runMutation(internal.log.update, {
      id,
      live,
      roomId: roomId,
    });

    let requireLogin = false;
    if (live) {
      const stream = await ctx.runAction(internal.tiktok.getStream, {
        roomId,
      });

      requireLogin = true;
      if (stream.data.stream_url) {
        requireLogin = false;
        await ctx.runMutation(internal.log.update, {
          id,
          stream: {
            flv_pull_url: stream.data.stream_url.flv_pull_url,
            hls_pull_url: stream.data.stream_url.hls_pull_url,
          },
          stream_url: stream.data.stream_url,
        });
      }
    }

    await ctx.runMutation(internal.follower.update, {
      id: args.id,
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
    const options = {
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
    };

    const response = await fetch("https://api.wintr.com/fetch", options);

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

export const getIsLive = internalAction({
  args: {
    roomId: v.union(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const response = await fetch(
      `https://webcast.tiktok.com:443/webcast/room/check_alive/?aid=1988&region=CH&room_ids=${args.roomId}&user_is_login=true`
    );

    const data = (await response.json()) as {
      data: Array<{ alive: boolean; room_id: number } | { mesage: string }>;
      extra: {
        now: number;
      };
      status_code: number;
    };

    const dataAlive = data.data[0];

    if ("alive" in dataAlive) {
      const live = dataAlive.alive;
      const roomId = dataAlive.room_id; //this is NOT the same roomId as from http.LiveRoom?.liveRoomUserInfo.user?.roomId
      return { live, roomId };
    } else {
      throw new Error(`Error in isAlive ${JSON.stringify(dataAlive)}`);
    }
  },
});

export const getStream = internalAction({
  args: {
    roomId: v.union(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const data = await fetch(
      `https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=${args.roomId}`
      /*{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //Cookie: "sessionid=bee2512041b5b4b561cb88b8eec98a70; sessionid_ss=bee2512041b5b4b561cb88b8eec98a70; tt-target-idc=alisg;",
        },
        credentials: "include", // This ensures that cookies are sent in the request
      }*/
    );

    const response = (await data.json()) as {
      data: {
        prompts?: string;
        stream_url?: {
          flv_pull_url: {
            FULL_HD1?: string;
            HD1: string;
            SD1: string;
            SD2: string;
          };
          hls_pull_url: string;
        };
      };
    };

    return response;
  },
});
