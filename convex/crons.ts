import { cronJobs } from "convex/server";

const crons = cronJobs();

//crons.interval("check who is online", { minutes: 5 }, internal.tiktok.checkAll);

export default crons;
