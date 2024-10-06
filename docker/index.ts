import ffmpeg from "fluent-ffmpeg";
import { uploadToBlobStorage } from "./azure";
import { sendUpdate, sendVideoAndThumbnail } from "./convex";
import { getTikTokStreams, Stream } from "./tiktok";

const TIKTOK_CHANNEL = process.env.TIKTOK_CHANNEL;
const FFMPEG_DURATION = process.env.FFMPEG_DURATION;

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
    await sendUpdate("", "No channel provided");
    return;
  }
  const streams = await getTikTokStreams(channel);

  if (streams.length > 0) {
    const priority = ["uhd", "hd", "sd", "ld", "origin", "ao"];
    const bestStream = findBestStream(streams, priority);

    if (bestStream) {
      await sendUpdate(
        channel,
        `Downloading ${bestStream.name.toUpperCase()} stream: ${bestStream.url}`
      );

      const timestamp = new Date()
        .toISOString()
        .replace(/T/, "-")
        .replace(/:/g, "-")
        .split(".")[0];

      const filename = `${channel}_${bestStream.name}_${timestamp}`;
      const videoOutput = `${filename}.mp4`;
      const thumbnailOutput = `${filename}.jpg`;

      const ffmpegCommand = ffmpeg(bestStream.url)
        .output(videoOutput)
        .videoCodec("copy")
        .audioCodec("copy")
        .outputOptions("-movflags", "faststart");
      if (FFMPEG_DURATION) {
        ffmpegCommand.duration(FFMPEG_DURATION);
      }

      ffmpegCommand
        .on("start", async () => {
          await sendUpdate(channel, `FFmpeg started recording live stream`);
        })

        .on("end", async () => {
          await sendUpdate(channel, "Start uploading VIDEO");

          await uploadToBlobStorage(videoOutput, videoOutput, "video/mp4");

          ffmpeg(videoOutput)
            .screenshots({
              count: 1,
              timestamps: ["50%"],
              filename: thumbnailOutput,
            })
            .on("end", async () => {
              await sendUpdate(channel, "Start uploading IMAGE...");

              await uploadToBlobStorage(
                thumbnailOutput,
                thumbnailOutput,
                "image/jpeg"
              );

              await sendUpdate(channel, "Send video & image to Convex");

              await sendVideoAndThumbnail(
                channel,
                videoOutput,
                thumbnailOutput
              );

              await sendUpdate(channel, "Finished streaming");
            })
            .on("error", (err) => {
              console.error("Error creating thumbnail:", err);
            });
        })
        .run();
    } else {
      console.error("No suitable stream available");
    }
  } else {
    console.error("No streams available");
  }
})();
