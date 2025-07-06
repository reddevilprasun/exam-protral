import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  checkUserRole,
  getCurrentUser,
  getUserUniversityRole,
} from "./lib/userInfo";
import { createAccount } from "@convex-dev/auth/server";

export const UserInfo = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if (!user.universityId) {
      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        universityId: null,
        universityRole: "Normal User",
      };
    }
    const userRole = await getUserUniversityRole(
      ctx,
      user._id,
      user.universityId
    );
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
});

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
  },
});

export const supervisorCreateUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("supervisor"),
      v.literal("examcontroller")
    ),
    password: v.string(),
    sendInvitation: v.optional(v.boolean()),
    departmentId: v.optional(v.id("department")),
    courseId: v.optional(v.id("courses")),
    subjectId: v.optional(v.id("subjects")),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: any, args) => {
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

    const providerId = "password";
    const account = {
      id: args.email,
      secret: args.password,
    };

    const profile = {
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      universityId: universityId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLogin: Date.now(),
    };

    const newUser = await createAccount(ctx, {
      provider: providerId,
      account: account,
      profile: profile,
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });

    if (!newUser) {
      throw new ConvexError("Failed to create user");
    }

    // Create user role
    const userRole = await ctx.db.insert("universityRoles", {
      userId: newUser.user._id,
      universityId: universityId,
      role: args.role,
    });
    if (!userRole) {
      throw new ConvexError("Failed to create user role");
    }

    // Create user Request
    const userRequest = await ctx.db.insert("userCreateRequest", {
      userId: newUser.user._id,
      universityId: universityId,
      role: args.role,
      email: args.email,
      departmentId: args.departmentId,
      courseId: args.courseId,
      subjectId: args.subjectId,
      status: "pending",
      secretToken: newUser.user._id,
    });
    if (!userRequest) {
      throw new ConvexError("Failed to create user request");
    }

    if (args.role === "teacher") {
      if (!args.departmentId || !args.courseId || !args.subjectId) {
        throw new ConvexError(
          "Department, Course, Subject and Batch are required for teacher"
        );
      }
      const createTeachingAssignment = await ctx.db.insert(
        "teachingAssignments",
        {
          teacherId: newUser.user._id,
          departmentId: args.departmentId,
          courseId: args.courseId,
          subjectId: args.subjectId,
          assignmentDate: Date.now(),
        }
      );
      if (!createTeachingAssignment) {
        throw new ConvexError("Failed to create teaching assignment");
      }
    }

    return newUser.user._id;
  },
});

export const getAllUsersOfUniversity = query({
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
    // Check if the user is a university supervisor
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    if (!supervisor) {
      return null;
    }

    const users = await ctx.db
      .query("userCreateRequest")
      .withIndex("uniq_user_create_request", (q) =>
        q.eq("universityId", universityId)
      )
      .collect();

    if (!users) {
      return null;
    }

    const usersWithInfo = await Promise.all(
      users.map(async (user) => {
        const userInfo = await ctx.db.get(user.userId);
        const departmentName = user.departmentId
          ? await ctx.db.get(user.departmentId)
          : null;
        const courseName = user.courseId
          ? await ctx.db.get(user.courseId)
          : null;
        if (!userInfo) {
          throw new ConvexError("User does not exist");
        }
        const userRole = await getUserUniversityRole(
          ctx,
          user.userId,
          universityId
        );
        if (!userRole) {
          throw new ConvexError("User role does not exist");
        }
        return {
          id: user._id,
          email: user.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          universityId: universityId,
          universityRole: userRole.role,
          departmentName: departmentName?.name,
          status: user.status,
          courseName: courseName?.name,
          createdAt: user._creationTime,
          lastLogin: userInfo.lastLogin,
        };
      })
    );
    return usersWithInfo;
  },
});

export const teacherCreateStudent = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
    academicId: v.number(),
    departmentId: v.id("department"),
    courseId: v.id("courses"),
    batchId: v.id("batches"),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: any, args) => {
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
    // Check if the user is a university teacher
    const teacher = await checkUserRole(ctx, user._id, "teacher", universityId);
    if (!teacher) {
      throw new ConvexError("User is not a university teacher");
    }

    const providerId = "password";
    const account = {
      id: args.email,
      secret: args.password,
    };

    const profile = {
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      universityId: universityId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLogin: Date.now(),
    };
    const newUser = await createAccount(ctx, {
      provider: providerId,
      account: account,
      profile: profile,
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });
    if (!newUser) {
      throw new ConvexError("Failed to create user");
    }
    // Create user role
    const userRole = await ctx.db.insert("universityRoles", {
      userId: newUser.user._id,
      universityId: universityId,
      role: "student",
    });
    if (!userRole) {
      throw new ConvexError("Failed to create user role");
    }
    // Add student to student enrollment
    const studentEnrollment = await ctx.db.insert("studentEnrollments", {
      studentId: newUser.user._id,
      academicId: args.academicId,
      universityId: universityId,
      departmentId: args.departmentId,
      courseId: args.courseId,
      batchId: args.batchId,
      enrollmentDate: Date.now(),
    });
    if (!studentEnrollment) {
      throw new ConvexError("Failed to create student enrollment");
    }

    return newUser.user._id;
  },
});

export const getCurrentTeacher = query({
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
    const teacherInfo = await ctx.db.get(user._id);

    if (!teacherInfo) {
      throw new ConvexError("Teacher does not exist");
    }
    const teachingAssignment = await ctx.db
      .query("teachingAssignments")
      .withIndex("uniq_teacher_university", (q) => q.eq("teacherId", user._id))
      .unique();
    if (!teachingAssignment) {
      throw new ConvexError("Teacher does not have a teaching assignment");
    }
    const department = await ctx.db.get(teachingAssignment.departmentId);
    if (!department || department.universityId !== university._id) {
      throw new ConvexError("Department does not belong to the university");
    }
    const subject = await ctx.db.get(teachingAssignment.subjectId);
    if (!subject || subject.courseId !== teachingAssignment.courseId) {
      throw new ConvexError("Subject does not belong to the course");
    }
    const course = await ctx.db.get(teachingAssignment.courseId);
    if (!course || course.universityId !== university._id) {
      throw new ConvexError("Course does not belong to the university");
    }

    return {
      id: user._id,
      firstName: teacherInfo.firstName,
      lastName: teacherInfo.lastName,
      email: teacherInfo.email,
      createdAt: teacherInfo.createdAt,
      lastLogin: teacherInfo.lastLogin,
      departmentName: department.name,
      courseName: course.name,
      subjectName: subject.name,
    };
  },
});

export const getCurrentStudentDetails = query({
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

    const studentEnrollment = await ctx.db
      .query("studentEnrollments")
      .withIndex("uniq_student_university", (q) =>
        q.eq("universityId", university._id).eq("studentId", user._id)
      )
      .unique();

    if (!studentEnrollment) {
      return null;
    }

    const course = await ctx.db.get(studentEnrollment.courseId);
    const department = await ctx.db.get(studentEnrollment.departmentId);
    const batch = await ctx.db.get(studentEnrollment.batchId);

    if (!batch || !course || !department) {
      return null;
    }

    const studentDetails = {
      user: {
        ...user
      },
      studentEnrollment: {
        ...studentEnrollment
      },
      courseName: course.name,
      departmentName: department.name,
      batchName: batch.name,
    };

    return studentDetails;
  },
});

export const getAllTeachersOfUniversity = query({
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
    // Check if the user is a university supervisor or teacher
    const supervisor = await checkUserRole(
      ctx,
      user._id,
      "supervisor",
      universityId
    );
    const teacher = await checkUserRole(ctx, user._id, "teacher", universityId);

    // If the user is neither a supervisor nor a teacher, return null
    if (!supervisor && !teacher) {
      return null;
    }

    const teachers = await ctx.db
      .query("universityRoles")
      .withIndex("uniq_user_university_role", (q) =>
        q.eq("universityId", universityId).eq("role", "teacher")
      )
      .collect();

    if (!teachers) {
      return null;
    }

    const teachersWithInfo = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherInfo = await ctx.db.get(teacher.userId);
        const teacherEnrollment = await ctx.db
          .query("teachingAssignments")
          .withIndex("uniq_teacher_university", (q) =>
            q.eq("teacherId", teacher.userId)
          )
          .unique();
        if (!teacherEnrollment) {
          throw new ConvexError("Teacher does not have a teaching assignment");
        }
        const department = await ctx.db.get(teacherEnrollment.departmentId);
        if (!department || department.universityId !== universityId) {
          throw new ConvexError("Department does not belong to the university");
        }
        if (!teacherInfo) {
          throw new ConvexError("Teacher does not exist");
        }
        return {
          id: teacher.userId,
          firstName: teacherInfo.firstName,
          lastName: teacherInfo.lastName,
          email: teacherInfo.email,
          departmentName: department.name,
          createdAt: teacherInfo.createdAt,
          lastLogin: teacherInfo.lastLogin,
        };
      })
    );

    return teachersWithInfo;
  },
});

export const getAllStudents = query({
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
    // Check if the user is a university teacher
    const teacher = await checkUserRole(ctx, user._id, "teacher", universityId);
    if (!teacher) {
      return null;
    }

    const students = await ctx.db
      .query("studentEnrollments")
      .withIndex("uniq_student_university", (q) =>
        q.eq("universityId", universityId)
      )
      .collect();

    if (!students) {
      return null;
    }

    const studentsWithInfo = await Promise.all(
      students.map(async (student) => {
        const studentInfo = await ctx.db.get(student.studentId);
        if (!studentInfo) {
          throw new ConvexError("Student does not exist");
        }
        const department = await ctx.db.get(student.departmentId);
        const course = await ctx.db.get(student.courseId);
        const batch = await ctx.db.get(student.batchId);
        if (!department || !course || !batch) {
          throw new ConvexError("Department, Course or Batch does not exist");
        }
        if (department.universityId !== universityId) {
          throw new ConvexError("Department does not belong to the university");
        }
        if (course.universityId !== universityId) {
          throw new ConvexError("Course does not belong to the university");
        }
        if (batch.courseId !== course._id) {
          throw new ConvexError("Batch does not belong to the course");
        }
        return {
          id: student._id,
          firstName: studentInfo.firstName,
          lastName: studentInfo.lastName,
          email: studentInfo.email,
          academicId: student.academicId,
          departmentName: department.name,
          departmentId: department._id,
          courseName: course.name,
          courseId: course._id,
          batchName: batch.name,
          batchId: batch._id,
          batchAcademicYear: batch.academicYear,
          batchStartDate: batch.startDate,
          batchEndDate: batch.endDate,
          enrollmentDate: student.enrollmentDate,
        };
      })
    );

    return studentsWithInfo;
  },
});

export const getStudentById = query({
  args: { studentId: v.optional(v.id("studentEnrollments")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if (!args.studentId) {
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

    const student = await ctx.db.get(args.studentId);
    if (!student || student.universityId !== universityId) {
      return null;
    }

    const studentInfo = await ctx.db.get(student.studentId);
    if (!studentInfo) {
      throw new ConvexError("Student does not exist");
    }

    const department = await ctx.db.get(student.departmentId);
    const course = await ctx.db.get(student.courseId);
    const batch = await ctx.db.get(student.batchId);

    if (!department || !course || !batch) {
      throw new ConvexError("Department, Course or Batch does not exist");
    }

    if (department.universityId !== universityId) {
      throw new ConvexError("Department does not belong to the university");
    }

    if (course.universityId !== universityId) {
      throw new ConvexError("Course does not belong to the university");
    }

    if (batch.courseId !== course._id) {
      throw new ConvexError("Batch does not belong to the course");
    }

    return {
      id: student._id,
      firstName: studentInfo.firstName,
      lastName: studentInfo.lastName,
      email: studentInfo.email,
      academicId: student.academicId,
      departmentName: department.name,
      departmentId: department._id,
      courseName: course.name,
      courseId: course._id,
      batchName: batch.name,
      batchId: batch._id,
      batchAcademicYear: batch.academicYear,
      batchStartDate: batch.startDate,
      batchEndDate: batch.endDate,
      enrollmentDate: student.enrollmentDate,
    };
  },
});

export const deleteStudent = mutation({
  args: { studentId: v.id("studentEnrollments") },
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

    const student = await ctx.db.get(args.studentId);
    if (!student || student.universityId !== universityId) {
      throw new ConvexError(
        "Student does not exist or does not belong to the university"
      );
    }

    // Check if the user is a university teacher
    const teacher = await checkUserRole(ctx, user._id, "teacher", universityId);
    if (!teacher) {
      throw new ConvexError("User is not a university teacher");
    }

    await ctx.db.delete(args.studentId);

    return args.studentId;
  },
});

export const updateStudent = mutation({
  args: {
    studentId: v.id("studentEnrollments"),
    academicId: v.number(),
    departmentId: v.id("department"),
    courseId: v.id("courses"),
    batchId: v.id("batches"),
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

    const student = await ctx.db.get(args.studentId);
    if (!student || student.universityId !== universityId) {
      throw new ConvexError(
        "Student does not exist or does not belong to the university"
      );
    }

    // Check if the user is a university teacher
    const teacher = await checkUserRole(ctx, user._id, "teacher", universityId);
    if (!teacher) {
      throw new ConvexError("User is not a university teacher");
    }

    const updatedStudent = {
      academicId: args.academicId,
      departmentId: args.departmentId,
      courseId: args.courseId,
      batchId: args.batchId,
    };

    await ctx.db.patch(args.studentId, updatedStudent);

    return args.studentId;
  },
});
