/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as azure from "../azure.js";
import type * as containerLog from "../containerLog.js";
import type * as crons from "../crons.js";
import type * as follower from "../follower.js";
import type * as http from "../http.js";
import type * as httpActions from "../httpActions.js";
import type * as log from "../log.js";
import type * as tables_follower from "../tables/follower.js";
import type * as tables_followsUsers from "../tables/followsUsers.js";
import type * as tables_log from "../tables/log.js";
import type * as tables_video from "../tables/video.js";
import type * as tables__containerLog from "../tables/_containerLog.js";
import type * as tiktok from "../tiktok.js";
import type * as video from "../video.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  azure: typeof azure;
  containerLog: typeof containerLog;
  crons: typeof crons;
  follower: typeof follower;
  http: typeof http;
  httpActions: typeof httpActions;
  log: typeof log;
  "tables/follower": typeof tables_follower;
  "tables/followsUsers": typeof tables_followsUsers;
  "tables/log": typeof tables_log;
  "tables/video": typeof tables_video;
  "tables/_containerLog": typeof tables__containerLog;
  tiktok: typeof tiktok;
  video: typeof video;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
