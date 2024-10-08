import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const ContainerLog = Table("container_logs", {
  uniqueId: v.string(),
  filename: v.string(),
  message: v.string(),
});
