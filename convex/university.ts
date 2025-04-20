import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";
import {
  checkUserRole,
  getCurrentUser,
  getUserUniversityStatus,
} from "./lib/userInfo";
import { getBatchInfo } from "./lib/batchInfo";

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
    });
    // Create a university create request
    await ctx.db.insert("universityCreateRequest", {
      universityId: universityId,
      userId: userId,
      status: "pending",
    });
    // Assign the user as a university supervisor
    await ctx.db.insert("universityRoles", {
      userId: userId,
      universityId: universityId,
      role: "supervisor",
    });
    // Update the user with the universityId
    await ctx.db.patch(userId, {
      universityId: universityId,
      updatedAt: Date.now(),
    });

    return universityId;
  },
});

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
    const university = await ctx.db.get(user.universityId);
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
    };
  },
});

export const createDepartment = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const departmentId = await ctx.db.insert("department", {
      name: args.name,
      description: args.description,
      universityId: user.universityId,
    });
    return departmentId;
  },
})

export const updateDepartment = mutation({
  args: {
    _id: v.id("department"),
    name: v.string(),
    description: v.optional(v.string()),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.patch(args._id, {
      name: args.name,
      description: args.description,
    });
    return args._id;
  },
});

export const deleteDepartment = mutation({
  args: {
    id: v.id("department"),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getDepartment = query({
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const departments = await ctx.db
      .query("department")
      .withIndex("uniq_department", (q) =>
        q.eq("universityId", universityId)
      )
      .collect();
    return departments;
  },
});

export const getDepartmentById = query({
  args: {
    id: v.optional(v.id("department")),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const department = await ctx.db.get(args.id);
    return department;
  },
});

export const createCourse = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    departmentId: v.id("department"),
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
    const course = await ctx.db
      .query("courses")
      .withIndex("uniq_course_code", (q) =>
        q.eq("universityId", universityId).eq("code", args.code)
      )
      .unique();
    if (course) {
      throw new ConvexError("Department already exists");
    }
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const departmentId = await ctx.db.insert("courses", {
      name: args.name,
      code: args.code,
      departmentId: args.departmentId,
      description: args.description,
      universityId: user.universityId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return departmentId;
  },
});

export const updateCourse = mutation({
  args: {
    _id: v.id("courses"),
    name: v.string(),
    code: v.string(),
    departmentId: v.id("department"),
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
      .withIndex("uniq_course_code", (q) =>
        q.eq("universityId", universityId).eq("code", args.code)
      )
      .unique();
    if (department && department._id !== args._id) {
      throw new ConvexError("Department already exists");
    }
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.patch(args._id, {
      name: args.name,
      code: args.code,
      departmentId: args.departmentId,
      description: args.description,
      updatedAt: Date.now(),
    });
    return args._id;
  },
});

export const deleteCourse = mutation({
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.delete(args.id);
    return args.id;
    //TODO: Delete all subjects and batches associated with the department
  },
});

export const getCourse = query({
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const courses = await ctx.db
    .query("courses")
    .withIndex("uniq_course_code", (q) => q.eq("universityId", universityId))
    .collect();
    const departments = await Promise.all(
      courses.map(async (course) => {
        const department = await ctx.db.get(course.departmentId);
        if (!department) {
          throw new ConvexError("Department does not exist");
        }
        return {
          id: course._id,
          name: course.name,
          code: course.code,
          description: course.description,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          department: {
            id: department._id,
            name: department.name,
            description: department.description,
          },
        };
      })
    );
    return departments;
  },
});

export const getCourseById = query({
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }

    const department = await ctx.db.get(args.id);
    return department;
  },
});

export const createBatch = mutation({
  args: {
    name: v.string(),
    academicYear: v.string(),
    startDate: v.float64(),
    endDate: v.float64(),
    courseId: v.id("courses"),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    const batchId = await ctx.db.insert("batches", {
      name: args.name,
      academicYear: args.academicYear,
      startDate: args.startDate,
      endDate: args.endDate,
      courseId: args.courseId,
    });
    return batchId;
  },
});

export const updateBatch = mutation({
  args: {
    _id: v.id("batches"),
    name: v.string(),
    courseId: v.id("courses"),
    academicYear: v.string(),
    startDate: v.float64(),
    endDate: v.float64(),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.patch(args._id, {
      name: args.name,
      courseId: args.courseId,
      academicYear: args.academicYear,
      startDate: args.startDate,
      endDate: args.endDate,
    });
    return args._id;
  },
});

export const deleteBatch = mutation({
  args: {
    id: v.id("batches"),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getAllBatches = query({
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }

    const courses = await ctx.db
      .query("courses")
      .withIndex("uniq_course_code", (q) => q.eq("universityId", universityId))
      .collect();
    const batches = await Promise.all(
      courses.map(async (course) => {
        const batches = await getBatchInfo(ctx, course._id);
        const noOfStudentsInBatch = await Promise.all(
          batches.map(async (batch) => {
            const students = await ctx.db
              .query("studentEnrollments")
              .withIndex("uniq_student_batch", (q) =>
                q.eq("batchId", batch._id)
              )
              .collect();
              return {
                batchId: batch._id,
                noOfStudents: students.length,
              };
            }
            
          ))
        return {
          courseId: course._id,
          courseName: course.name,
          batches: batches.map((batch) => ({
            id: batch._id,
            name: batch.name,
            academicYear: batch.academicYear,
            startDate: batch.startDate,
            endDate: batch.endDate,
            noOfStudents: noOfStudentsInBatch.find(
              (student) => student.batchId === batch._id
            )?.noOfStudents,
          })),
        };
      })
    );
    return batches;
  },
});

export const getBatchById = query({
  args: {
    id: v.optional(v.id("batches")),
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
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      throw new ConvexError("User is not a university supervisor");
    }

    const batch = await ctx.db.get(args.id);
    return batch;
  },
});


