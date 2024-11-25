import aggregate from "@convex-dev/aggregate/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(aggregate, { name: "videos" });
export default app;
