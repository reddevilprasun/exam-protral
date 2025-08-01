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
import type * as admin from "../admin.js";
import type * as answers from "../answers.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as customProfile from "../customProfile.js";
import type * as exam from "../exam.js";
import type * as http from "../http.js";
import type * as lib_batchInfo from "../lib/batchInfo.js";
import type * as lib_userInfo from "../lib/userInfo.js";
import type * as proctoring from "../proctoring.js";
import type * as questions from "../questions.js";
import type * as university from "../university.js";
import type * as user from "../user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  answers: typeof answers;
  auth: typeof auth;
  crons: typeof crons;
  customProfile: typeof customProfile;
  exam: typeof exam;
  http: typeof http;
  "lib/batchInfo": typeof lib_batchInfo;
  "lib/userInfo": typeof lib_userInfo;
  proctoring: typeof proctoring;
  questions: typeof questions;
  university: typeof university;
  user: typeof user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
