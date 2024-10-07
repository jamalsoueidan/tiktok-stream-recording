import ffmpeg from "fluent-ffmpeg";
import { uploadToBlobStorage } from "./azure";
import { sendImage, sendUpdate, sendVideo } from "./convex";

export const captureScreenshotFromStream = async (
  streamUrl: string,
  imageOutput: string
) => {
  await sendUpdate("Capture IMAGE...");
  ffmpeg(streamUrl)
    .on("start", async () => {
      await sendUpdate(
        `Started processing stream from ${streamUrl} to compare image`
      );
    })
    .on("end", async () => {
      await sendUpdate("End capture image");
      await uploadToBlobStorage(imageOutput, imageOutput, "image/jpeg");
      await sendImage(imageOutput);
    })
    .screenshots({
      count: 1,
      timestamps: ["00:00:01"],
      filename: imageOutput,
    });
};

export const captureVideoFromStream = async (
  streamUrl: string,
  videoOutput: string,
  videoQuality: string
) => {
  await sendUpdate("Capture Video...");
  const ffmpegCommand = ffmpeg(streamUrl)
    .output(videoOutput)
    .videoCodec("copy")
    .audioCodec("copy")
    .outputOptions("-movflags", "faststart");
  if (process.env.FFMPEG_DURATION) {
    ffmpegCommand.duration(process.env.FFMPEG_DURATION);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let intervalId: any;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minute(s) and ${secs} second(s)`;
  };

  ffmpegCommand
    .on("start", async () => {
      await sendUpdate(`FFmpeg started recording live stream`);

      let recordingTime = 0;
      intervalId = setInterval(async () => {
        recordingTime += 30;
        const formattedTime = formatTime(recordingTime);
        await sendUpdate(`Recording... ${formattedTime} elapsed`);
      }, 30000);
    })
    .on("end", async () => {
      clearInterval(intervalId);
      await sendUpdate("Start uploading VIDEO");

      await uploadToBlobStorage(videoOutput, videoOutput, "video/mp4");

      await sendVideo(videoOutput, videoQuality);

      await sendUpdate("Finished streaming");
    })
    .run();
};
