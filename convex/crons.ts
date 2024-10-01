import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("check who is online", { minutes: 5 }, internal.tiktok.check);

export default crons;
