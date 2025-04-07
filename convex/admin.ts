import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { checkAdminUser } from "./lib/userInfo";

export const getUniversityCreateRequests = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError("User is not authenticated");
    }
    const isAdmin = await checkAdminUser(ctx, userId);
    if (!isAdmin) {
      throw new ConvexError("User is not an admin");
    }
    const universities = await ctx.db
      .query("universityCreateRequest")
      .collect();

    const universitiesWithInfo = await Promise.all(
      universities.map(async (university) => {
        const universityInfo = await ctx.db.get(university.universityId);
        if (!universityInfo) {
          return null;
        }
        const userInfo = await ctx.db.get(university.userId);
        if (!userInfo) {
          return null;
        }
        return {
          id: university._id,
          universityId: university.universityId,
          userId: university.userId,
          userFullName: `${userInfo.firstName} ${userInfo.lastName}`,
          status: university.status,
          universityName: universityInfo.name,
          userEmail: userInfo.email,
          universityCode: universityInfo.universityCode,
          universityLocation: universityInfo.location,
          universityDescription: universityInfo.description,
          universityContactEmail: universityInfo.contactEmail,
          universityWebsite: universityInfo.website,
          universityCreatedAt: universityInfo._creationTime,
          createdAt: university._creationTime,
        };
      }
    ));
    return universitiesWithInfo.filter((university) => university !== null);
  },
})

export const approveOrRejectUniversityCreateRequest = mutation({
  args: {
    requestId: v.id("universityCreateRequest"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, { requestId, status }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError("User is not authenticated");
    }
    const isAdmin = await checkAdminUser(ctx, userId);
    if (!isAdmin) {
      throw new ConvexError("User is not an admin");
    }
    const request = await ctx.db.get(requestId);
    if (!request) {
      throw new Error("Request not found");
    }
    await ctx.db.patch(requestId, {
      status: status,
    });
    if (status === "approved") {
      await ctx.db.patch(request.universityId, {
        updatedAt: Date.now(),
      });
    }
    return requestId;
  },
})