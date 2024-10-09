import { mutationWithUser } from "./auth";

export const updateLoggedInDate = mutationWithUser({
  args: {},
  handler: async (ctx) => {
    return ctx.db.patch(ctx.user, { loggedInDate: Date.now() });
  },
});
