import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
if (process.env.ENV !== "development") {
  crons.interval(
    "check who is online",
    { minutes: 5 },
    internal.tiktok.checkAll
  );
}

export default crons;
