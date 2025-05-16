import { query } from "./_generated/server";
import { getCurrentUser, getUserUniversityRole } from "./lib/userInfo";

export const UserInfo = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if(!user.universityId) {
      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        universityId: null,
        universityRole: "Normal User",
      }
    }
    const userRole = await getUserUniversityRole(ctx, user._id, user.universityId);
    if (!userRole) {
      return null;
    }
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      universityId: user.universityId,
      universityRole: userRole.role || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
})

export const isAdmin = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return false;
    }
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("uniq_user_role", (q) => q.eq("userId", user._id))
      .unique();
    if (!adminUser) {
      return false;
    }
    return true;
  }
})