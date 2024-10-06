import { httpRouter } from "convex/server";
import { save, update } from "./video";

const http = httpRouter();

http.route({
  path: "/postVideo",
  method: "POST",
  handler: save,
});

http.route({
  path: "/updateVideo",
  method: "POST",
  handler: update,
});

export default http;
