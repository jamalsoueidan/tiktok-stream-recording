import { internalMutation } from "./_generated/server";
import { ContainerLog } from "./tables/container_log";

export const insert = internalMutation({
  args: {
    ...ContainerLog.withoutSystemFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("container_log", args);
  },
});
