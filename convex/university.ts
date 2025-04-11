import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { auth } from "./auth"
import { checkUserRole, getCurrentUser, getUserUniversityStatus } from "./lib/userInfo";

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

export const createDepartment = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User is not authenticated");
    }
    if (!user.universityId) {
      throw new ConvexError("User does not have a university");
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    const universityId = university._id;
    // Check if the department already exists
    const department = await ctx.db
      .query("courses")
      .withIndex("uniq_course_code", (q) => q.eq("universityId", universityId).eq("code", args.code))
      .unique();
    if (department) {
      throw new ConvexError("Department already exists");
    }
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(ctx, user._id, "supervisor", universityId);
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const departmentId = await ctx.db.insert("courses", {
      name: args.name,
      code: args.code,
      description: args.description,
      universityId: user.universityId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return departmentId
  },
})

export const updateDepartment = mutation({
  args: {
    _id: v.id("courses"),
    name: v.string(),
    code: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User is not authenticated");
    }
    if (!user.universityId) {
      throw new ConvexError("User does not have a university");
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    const universityId = university._id;
    // Check if the department already exists
    const department = await ctx.db
      .query("courses")
      .withIndex("uniq_course_code", (q) => q.eq("universityId", universityId).eq("code", args.code))
      .unique();
    if (department && department._id !== args._id) {
      throw new ConvexError("Department already exists");
    }
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(ctx, user._id, "supervisor", universityId);
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.patch(args._id, {
      name: args.name,
      code: args.code,
      description: args.description,
      updatedAt: Date.now(),
    })
    return args._id;
  }
})
export const deleteDepartment = mutation({
  args: {
    id: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User is not authenticated");
    }
    if (!user.universityId) {
      throw new ConvexError("User does not have a university");
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    const universityId = university._id;
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(ctx, user._id, "supervisor", universityId);
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.delete(args.id)
    return args.id;
    //TODO: Delete all subjects and batches associated with the department
  }
})

export const getDepartments = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User is not authenticated");
    }
    if (!user.universityId) {
      throw new ConvexError("User does not have a university");
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    const universityId = university._id;
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(ctx, user._id, "supervisor", universityId);
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const departments = await ctx.db
      .query("courses")
      .withIndex("uniq_course_code", (q) => q.eq("universityId", universityId))
      .collect();
    return departments
  }
})

export const getDepartmentById = query({
  args: {
    id: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    if (!args.id) {
      return null;
    }
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User is not authenticated");
    }
    if (!user.universityId) {
      throw new ConvexError("User does not have a university");
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    const universityId = university._id;
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(ctx, user._id, "supervisor", universityId);
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }

    const department = await ctx.db.get(args.id);
    return department;
  }
})

