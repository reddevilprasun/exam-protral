import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { auth } from "./auth"
import { getCurrentUser, getUserUniversityStatus } from "./lib/userInfo";

export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    universityCode: v.string(),
    description: v.optional(v.string()),
    contactEmail: v.string(),
    website: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError("User is not authenticated");
    }
    // Check if the user already has a university
    const user = await ctx.db.get(userId);

    if (user?.universityId) {
      throw new ConvexError("User already has a university");
    }
    const universityId = await ctx.db.insert("universities", {
      name: args.name,
      location: args.location,
      universityCode: args.universityCode,
      description: args.description,
      contactEmail: args.contactEmail,
      website: args.website,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    // Create a university create request
    await ctx.db.insert("universityCreateRequest", {
      universityId: universityId,
      userId: userId,
      status: "pending",
    })
    // Assign the user as a university supervisor
    await ctx.db.insert("universityRoles", {
      userId: userId,
      universityId: universityId,
      role: "supervisor",
    })
    // Update the user with the universityId
    await ctx.db.patch(userId, {
      universityId: universityId,
      updatedAt: Date.now(),
    })

    return universityId
  },
})


export const getUniversityInfo = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if (!user.universityId) {
      return null;
    }

    const universityStatus = await getUserUniversityStatus(ctx);
    if (!universityStatus) {
      return null;
    }
    const university =  await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }
    return {
      id: university._id,
      name: university.name,
      location: university.location,
      universityCode: university.universityCode,
      description: university.description,
      contactEmail: university.contactEmail,
      website: university.website,
      createdAt: university.createdAt,
      updatedAt: university.updatedAt,
      status: universityStatus.status,      
    }
  }
})

