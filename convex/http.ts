import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { saveImage, saveVideo, updates } from "./httpActions";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/postImage",
  method: "POST",
  handler: saveImage,
});

http.route({
  path: "/postVideo",
  method: "POST",
  handler: saveVideo,
});

http.route({
  path: "/updates",
  method: "POST",
  handler: updates,
});

export default http;
