import { sendUpdate } from "./convex";
import { getTikTokStreams, Stream } from "./tiktok";
import { captureScreenshotFromStream, captureVideoFromStream } from "./video";

const TIKTOK_CHANNEL = process.env.TIKTOK_CHANNEL;
const FILENAME = process.env.FILENAME;

const findBestStream = (
  streams: Stream[],
  priority: string[]
): Stream | null => {
  for (const quality of priority) {
    const stream = streams.find((s) => s.name === quality);
    if (stream) {
      return stream;
    }
  }
  return null;
};

(async () => {
  const channel = TIKTOK_CHANNEL;
  if (!channel) {
    return;
  }
  await sendUpdate("Container Instance started");

  const videoOutput = `${FILENAME}.mp4`;
  const thumbnailOutput = `${FILENAME}.jpg`;
  const streams = await getTikTokStreams(channel);

  if (streams.length > 0) {
    const priority = ["uhd", "hd", "sd", "ld", "origin", "ao"];
    const bestStream = findBestStream(streams, priority);

    if (bestStream) {
      await sendUpdate(
        `Downloading ${bestStream.name.toUpperCase()} stream: ${bestStream.url}`
      );

      await captureScreenshotFromStream(bestStream.url, thumbnailOutput);
      await captureVideoFromStream(
        bestStream.url,
        videoOutput,
        bestStream.name
      );
    } else {
      await sendUpdate("No suitable stream available");
    }
  } else {
    await sendUpdate("No streams available");
  }
})();
