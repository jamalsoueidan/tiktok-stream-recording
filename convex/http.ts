import { httpRouter } from "convex/server";
import { save } from "./video";

const http = httpRouter();

http.route({
  path: "/postVideo",
  method: "POST",
  handler: save,
});

export default http;
