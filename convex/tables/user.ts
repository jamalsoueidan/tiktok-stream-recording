import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const User = Table("users", {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  loggedInDate: v.optional(v.number()),
  isAdmin: v.optional(v.boolean()),
});
