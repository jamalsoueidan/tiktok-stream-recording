import ffmpeg from "fluent-ffmpeg";
import { sendVideoAndThumbnail, uploadToBlobStorage } from "./azure";
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
    console.log("No channel provided");
    return;
  }
  const streams = await getTikTokStreams(channel);

  if (streams.length > 0) {
    const priority = ["uhd", "hd", "sd", "ld", "origin", "ao"];
    const bestStream = findBestStream(streams, priority);

    if (bestStream) {
      console.log(
        `Downloading ${bestStream.name.toUpperCase()} stream: ${bestStream.url}`
      );

      const timestamp = new Date()
        .toISOString()
        .replace(/T/, "-")
        .replace(/:/g, "-")
        .split(".")[0];

      const filename = `${channel}_${bestStream.name}_${timestamp}`;
      const videoOutput = `${filename}.flv`;
      const thumbnailOutput = `${filename}.jpg`;

      const ffmpegCommand = ffmpeg(bestStream.url)
        .output(videoOutput)
        .videoCodec("copy")
        .audioCodec("copy");

      if (FFMPEG_DURATION) {
        ffmpegCommand.duration(FFMPEG_DURATION);
      }

      ffmpegCommand
        .on("start", () => {
          console.log("FFmpeg start");
        })

        .on("end", async () => {
          console.log("Video created successfully!");

          await uploadToBlobStorage(videoOutput, videoOutput, "video/x-flv");

          ffmpeg(videoOutput)
            .screenshots({
              count: 1,
              timestamps: ["50%"],
              filename: thumbnailOutput,
            })
            .on("end", async () => {
              console.log("Thumbnail created successfully!");

              await uploadToBlobStorage(
                thumbnailOutput,
                thumbnailOutput,
                "image/jpeg"
              );

              await sendVideoAndThumbnail(
                channel,
                videoOutput,
                thumbnailOutput
              );
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
