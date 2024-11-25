/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as azure from "../azure.js";
import type * as containerLog from "../containerLog.js";
import type * as crons from "../crons.js";
import type * as follower from "../follower.js";
import type * as http from "../http.js";
import type * as httpActions from "../httpActions.js";
import type * as tables_follower from "../tables/follower.js";
import type * as tables_tiktokUsers from "../tables/tiktokUsers.js";
import type * as tables_user from "../tables/user.js";
import type * as tables_video from "../tables/video.js";
import type * as tables__containerLog from "../tables/_containerLog.js";
import type * as tiktok from "../tiktok.js";
import type * as tiktokUsers from "../tiktokUsers.js";
import type * as user from "../user.js";
import type * as video from "../video.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
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
  "tables/follower": typeof tables_follower;
  "tables/tiktokUsers": typeof tables_tiktokUsers;
  "tables/user": typeof tables_user;
  "tables/video": typeof tables_video;
  "tables/_containerLog": typeof tables__containerLog;
  tiktok: typeof tiktok;
  tiktokUsers: typeof tiktokUsers;
  user: typeof user;
  video: typeof video;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  videos: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any },
        { count: number; sum: number }
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      count: FunctionReference<"query", "internal", {}, any>;
      get: FunctionReference<
        "query",
        "internal",
        { key: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      sum: FunctionReference<"query", "internal", {}, number>;
      validate: FunctionReference<"query", "internal", {}, any>;
    };
    inspect: {
      display: FunctionReference<"query", "internal", {}, any>;
      dump: FunctionReference<"query", "internal", {}, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { node?: string },
        null
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; rootLazy?: boolean },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any },
        any
      >;
      delete_: FunctionReference<"mutation", "internal", { key: any }, null>;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<"mutation", "internal", {}, null>;
      replace: FunctionReference<
        "mutation",
        "internal",
        { currentKey: any; newKey: any; summand?: number; value: any },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        { currentKey: any; newKey: any; summand?: number; value: any },
        any
      >;
    };
  };
};
