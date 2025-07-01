import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";
import {
  checkUserRole,
  getCurrentUser,
  getUserUniversityStatus,
} from "./lib/userInfo";
import { getBatchInfo } from "./lib/batchInfo";

// University Management
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
      console.error("User not found in getUniversityInfo");
      return null;
    }
    if (!user.universityId) {
      console.error("User does not have a university in getUniversityInfo");
      return null;
    }

    const universityStatus = await getUserUniversityStatus(ctx);
    if (!universityStatus) {
      console.error("University status not found in getUniversityInfo");
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      console.error("University not found in getUniversityInfo");
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

// Department Management
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
});

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
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }
    const universityId = university._id;
    const departments = await ctx.db
      .query("department")
      .withIndex("uniq_department", (q) => q.eq("universityId", universityId))
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
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }
    const department = await ctx.db.get(args.id);
    return department;
  },
});

// Course Management
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
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }
    const universityId = university._id;
    const courses = await ctx.db
      .query("courses")
      .withIndex("uniq_course_code", (q) => q.eq("universityId", universityId))
      .collect();
    const departments = await Promise.all(
      courses.map(async (course) => {
        const department = await ctx.db.get(course.departmentId);
        if (!department) {
          return null;
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
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }

    const department = await ctx.db.get(args.id);
    return department;
  },
});

// Batch Management
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
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }
    const universityId = university._id;

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
          })
        );
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
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }

    const batch = await ctx.db.get(args.id);
    return batch;
  },
});

// Subject Management
export const createSubject = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.string(),
    code: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
    ),
    creditHours: v.float64(),
    semester: v.float64(),
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
    // Check if the subject already exists
    const subject = await ctx.db
      .query("subjects")
      .withIndex("uniq_subject_code", (q) =>
        q.eq("courseId", args.courseId).eq("code", args.code)
      )
      .unique();
    if (subject) {
      throw new ConvexError("Subject already exists");
    }
    const subjectId = await ctx.db.insert("subjects", {
      courseId: args.courseId,
      name: args.name,
      code: args.code,
      creditHours: args.creditHours,
      semester: args.semester,
      status: args.status,
      description: args.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return subjectId;
  },
});

export const editSubject = mutation({
  args: {
    _id: v.id("subjects"),
    courseId: v.id("courses"),
    name: v.string(),
    code: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
    ),
    creditHours: v.float64(),
    semester: v.float64(),
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
    // // Check if the subject already exists
    // const subject = await ctx.db
    //   .query("subjects")
    //   .withIndex("uniq_subject_code", (q) =>
    //     q.eq("courseId", args.courseId).eq("code", args.code)
    //   )
    //   .unique();
    // if (subject) {
    //   throw new ConvexError("Subject already exists");
    // }

    await ctx.db.patch(args._id, {
      courseId: args.courseId,
      name: args.name,
      code: args.code,
      status: args.status,
      creditHours: args.creditHours,
      semester: args.semester,
      description: args.description,
      updatedAt: Date.now(),
    });

    return args._id;
  },
});

export const deleteSubject = mutation({
  args: {
    id: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    if (!args.id) {
      throw new ConvexError("Subject ID is required");
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

    // Check if the subject exists
    const subject = await ctx.db.get(args.id);
    if (!subject) {
      throw new ConvexError("Subject does not exist");
    }
    await ctx.db.delete(args.id);
    return subject._id;
  },
});

export const getAllSubject = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user?.universityId) return null;

    const university = await ctx.db.get(user.universityId);
    if (!university) return null;

    const [courses, departments] = await Promise.all([
      ctx.db
        .query("courses")
        .withIndex("uniq_course_code", (q) =>
          q.eq("universityId", university._id)
        )
        .collect(),

      ctx.db
        .query("department")
        .withIndex("uniq_department", (q) =>
          q.eq("universityId", university._id)
        )
        .collect(),
    ]);

    // Build a department map for quick lookup
    const departmentMap = new Map(departments.map((d) => [d._id, d]));

    const allSubjects = [];

    for (const course of courses) {
      const subjects = await ctx.db
        .query("subjects")
        .withIndex("uniq_subject_code", (q) => q.eq("courseId", course._id))
        .collect();

      for (const subject of subjects) {
        const department = departmentMap.get(course.departmentId);
        if (!department) {
          // If this happens, it indicates database inconsistency
          throw new Error(`Department not found for course ${course._id}`);
        }
        allSubjects.push({
          id: subject._id,
          name: subject.name,
          code: subject.code,
          creditHours: subject.creditHours,
          semester: subject.semester,
          status: subject.status,
          description: subject.description,
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
          department: {
            id: department._id,
            name: department.name,
          },

          course: {
            id: course._id,
            name: course.name,
            code: course.code,
          },
        });
      }
    }

    return allSubjects;
  },
});

export const getSubjectById = query({
  args: {
    id: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    if (!args.id) {
      return null;
    }
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if (!user.universityId) {
      return null;
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return null;
    }

    const subject = await ctx.db.get(args.id);
    if (!subject) {
      return null;
    }
    const course = await ctx.db.get(subject.courseId);
    if (!course) {
      return null;
    }
    const department = await ctx.db.get(course.departmentId);
    if (!department) {
      throw new ConvexError("Department does not exist");
    }
    return {
      id: subject._id,
      name: subject.name,
      code: subject.code,
      creditHours: subject.creditHours,
      semester: subject.semester,
      status: subject.status,
      description: subject.description,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      course: {
        id: course._id,
        name: course.name,
        code: course.code,
      },
      department: {
        id: department._id,
        name: department.name,
      },
    };
  },
});

