import { sendUpdate } from "./convex";

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

// Constants
const URL_WEB_LIVE = "https://www.tiktok.com/@{channel}/live";
const URL_API_LIVE_DETAIL =
  "https://www.tiktok.com/api/live/detail/?aid=1988&roomID={room_id}";
const URL_WEBCAST_ROOM_INFO =
  "https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id={room_id}";
const STATUS_OFFLINE = 4;

// Function to get room ID based on TikTok channel
async function getRoomId(channel: string): Promise<string | null> {
  try {
    const liveUrl = URL_WEB_LIVE.replace("{channel}", channel);
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

    console.error("room_id not found");
    return null;
  } catch (error) {
    console.error("Error fetching room ID:", error);
    return null;
  }
}

// Function to get live room details based on room ID
async function getLiveRoomDetails(
  roomId: string
): Promise<LiveRoomInfo | null> {
  try {
    const url = URL_API_LIVE_DETAIL.replace("{room_id}", roomId);
    const response = await fetch(url);
    const data = await response.json();

    const liveRoomInfo: LiveRoomInfo = data.LiveRoomInfo;
    if (liveRoomInfo.status === STATUS_OFFLINE) {
      console.log("The channel is currently offline");
      return null;
    }

    return liveRoomInfo;
  } catch (error) {
    console.error("Error fetching live room details:", error);
    return null;
  }
}

// Function to get stream data from TikTok
async function getStreamData(roomId: string): Promise<Stream[] | null> {
  try {
    const url = URL_WEBCAST_ROOM_INFO.replace("{room_id}", roomId);
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
  } catch (error) {
    console.error("Error fetching stream data:", error);
    return null;
  }
}

export async function getTikTokStreams(channel: string): Promise<Stream[]> {
  await sendUpdate(channel, "Container Instance started");

  const roomId = await getRoomId(channel);
  if (!roomId) {
    await sendUpdate(channel, "Could not find room ID");
    return [];
  }

  await sendUpdate(channel, "RoomId found for");

  const liveRoomDetails = await getLiveRoomDetails(roomId);
  if (!liveRoomDetails) {
    await sendUpdate(channel, "Could not find liveRoom details");
    return [];
  }

  await sendUpdate(channel, `Live stream details found for`);

  const streams = await getStreamData(roomId);
  return streams || [];
}
