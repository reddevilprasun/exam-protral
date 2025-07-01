import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { auth } from "../auth";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    return null;
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    return null;
  }
  
  return user;
}

export async function getUserUniversityRole(ctx: QueryCtx | MutationCtx, userId: Id<"users">, universityId: Id<"universities">) {
  return await ctx.db
    .query("universityRoles")
    .withIndex("uniq_user_university_role", (q) => q.eq("userId", userId).eq("universityId", universityId))
    .unique();
}

export async function getUserUniversity(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    return null;
  }
  if (!user.universityId) {
    return null;
  }
  return await ctx.db
    .query("universities")
    .withIndex("uniq_university_code", (q) => user.universityId ? q.eq("universityCode", user.universityId) : q)
    .unique();
}

export async function getUserUniversityStatus(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    return null;
  }
  if (!user.universityId) {
    return null;
  }
  return await ctx.db
    .query("universityCreateRequest")
    .withIndex("uniq_university_create_request", (q) => user.universityId ? q.eq("universityId", user.universityId) : q)
    .unique();
}

export async function checkAdminUser(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db
    .query("adminUsers")
    .withIndex("uniq_user_role", (q) => q.eq("userId", userId))
    .unique();
  if (!user) {
    return null;
  }
  return user;
}

export async function checkUserRole(ctx: QueryCtx, userId: Id<"users">, role: string, universityId: Id<"universities">) {
  const user = await ctx.db
    .query("universityRoles")
    .withIndex("uniq_user_university_role", (q) => q.eq("userId", userId).eq("universityId",universityId))
    .unique();
  if (!user) {
    return false;
  }
  if (user.universityId !== universityId) {
    return false;
  }
  if (user.role !== role) {
    return false;
  }
  return true;
}

