import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkUserRole, getCurrentUser } from "./lib/userInfo";
import { Doc } from "./_generated/dataModel";

// For the invigilator : Get all students in a specific exam
export const getStudentsForExamQuery = query({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, { examId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    const exam = await ctx.db.get(examId);
    if (!exam || exam.invigilator !== user._id) {
      return null;
    }

    //Find all students enrollments for the batches in the exam
    const studentEnrollments: Doc<"studentEnrollments">[] = [];
    for (const batchId of exam.batchId) {
      const enrollmentsInBatch = await ctx.db
        .query("studentEnrollments")
        .withIndex("uniq_student_batch", (q) => q.eq("batchId", batchId))
        .collect();
      studentEnrollments.push(...enrollmentsInBatch);
    }

    // Get unique student IDs
    const studentIds = Array.from(
      new Set(studentEnrollments.map((e) => e.studentId))
    );
    // Fetch student details
    const students = Promise.all(studentIds.map((id) => ctx.db.get(id)));

    if (!students) {
      return null;
    }

    // Return the students with their enrollments
    return (await students).map((student) => {
      const enrollment = studentEnrollments.find(
        (e) => e.studentId === student?._id
      );
      return {
        ...student,
        academicId: enrollment?.academicId,
        batchId: enrollment?.batchId,
        courseId: enrollment?.courseId,
        departmentId: enrollment?.departmentId,
        universityId: enrollment?.universityId,
      };
    });
  },
});

export const startProctoringSession = mutation({
  args: { examId: v.id("exams"), connectionId: v.string() },
  handler: async (ctx, { examId, connectionId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const exam = await ctx.db.get(examId);
    if (!exam) {
      throw new ConvexError("Exam not found");
    }
    const isStudent = await checkUserRole(
      ctx,
      user._id,
      "student",
      user.universityId!
    );
    if (!isStudent) {
      throw new ConvexError("You are not a student for this exam");
    }

    if (isStudent) {
      // This part is for students, which we know works.
      const studentEnrollment = await ctx.db
        .query("studentEnrollments")
        .withIndex("uniq_student", (q) => q.eq("studentId", user._id))
        .unique();
      if (
        !studentEnrollment ||
        !exam.batchId.includes(studentEnrollment.batchId)
      ) {
        throw new ConvexError("You are not enrolled in this exam's batch.");
      }
    }

    const oldSessions = await ctx.db
      .query("proctoringSessions")
      .withIndex("by_student_and_exam", (q) =>
        q.eq("studentId", user._id).eq("examId", examId)
      )
      .collect();

    for (const session of oldSessions) {
      // For each old session, delete all of its associated signals
      const oldSignals = await ctx.db
        .query("proctoringSignals")
        .withIndex("by_connectionId", (q) =>
          q.eq("connectionId", session.connectionId)
        )
        .collect();

      await Promise.all(oldSignals.map((s) => ctx.db.delete(s._id)));

      // Delete the old session itself
      await ctx.db.delete(session._id);
    }

    // Create the new active session
    return await ctx.db.insert("proctoringSessions", {
      examId,
      studentId: user._id,
      connectionId,
      status: "active",
    });
  },
});
 
export const endProctoringSession = mutation({
  args: { sessionId: v.id("proctoringSessions") },
  handler: async (ctx, { sessionId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const session = await ctx.db.get(sessionId);
    if (!session) {
      // The session may have already been cleaned up by a new session starting.
      // This is not an error, so we can just return successfully.
      return;
    }

    if (session.studentId !== user._id) {
      throw new ConvexError("You are not authorized to end this session");
    }

    // Find and delete all signals for this session
    const signals = await ctx.db
      .query("proctoringSignals")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", session.connectionId))
      .collect();

    await Promise.all(signals.map((s) => ctx.db.delete(s._id)));

    // Finally, delete the session document itself
    await ctx.db.delete(sessionId);
  },
});

 // For both user : Get all signals send to the current user for an exam
 // In your Convex backend file (e.g., proctoring.ts)

export const getSignalForRecipient = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, { examId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const exam = await ctx.db.get(examId);
    if (!exam) {
      return null;
    }

    const isStudent = await checkUserRole(
      ctx,
      user._id,
      "student",
      user.universityId!
    );

    if (isStudent) {
      // This part is for students, which we know works.
      const studentEnrollment = await ctx.db
        .query("studentEnrollments")
        .withIndex("uniq_student", (q) => q.eq("studentId", user._id))
        .unique();
      if (
        !studentEnrollment ||
        !exam.batchId.includes(studentEnrollment.batchId)
      ) {
        return null;
      }
    }
    // This is the path the invigilator MUST take
    else if (exam.invigilator !== user._id) {
      return null;
    }

    const signals = await ctx.db
      .query("proctoringSignals")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", user._id).eq("examId", examId)
      )
      .collect();

    return signals;
  },
});

 // For both user: Send a signal to another user

export const sendProctoringSignal = mutation({
  args: {
    examId: v.id("exams"),
    recipientId: v.id("users"),
    connectionId: v.string(),
    type: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("candidate"),
      v.literal("restart")
    ),
    data: v.string(),
  },
  handler: async (ctx, { examId, recipientId, connectionId, type, data }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    if (!user.universityId) {
      throw new ConvexError("User does not belong to a university");
    }

    const exam = await ctx.db.get(examId);
    if (!exam) {
      throw new ConvexError("Exam not found");
    }

    const isStudent = await checkUserRole(
      ctx,
      user._id,
      "student",
      user.universityId
    );

    if (isStudent) {
      const studentEnrollment = await ctx.db
        .query("studentEnrollments")
        .withIndex("uniq_student", (q) =>
          q.eq("studentId", user._id).eq("universityId", user.universityId!)
        )
        .unique();

      if (
        !studentEnrollment ||
        !exam.batchId.includes(studentEnrollment.batchId)
      ) {
        throw new ConvexError(
          "You are not enrolled in this exam's batch or your university ID is missing."
        );
      }
      console.log("[sendProctoringSignal] Student security check PASSED.");
    }
    // This is the path the invigilator should take
    else if (exam.invigilator !== user._id) {
      throw new ConvexError(
        `You are not the designated invigilator for this exam. Required: ${exam.invigilator}, but got: ${user._id}`
      );
    }

    await ctx.db.insert("proctoringSignals", {
      examId,
      senderId: user._id,
      recipientId,
      connectionId,
      type,
      data,
    });
  },
});

export const getActiveProctoringData = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, { examId }) => {
    const invigilator = await getCurrentUser(ctx);
    if (!invigilator) {
      throw new ConvexError("Not authenticated");
    }

    const exam = await ctx.db.get(examId);
    if (!exam) {
      throw new ConvexError("Exam not found");
    }
    if (exam.invigilator !== invigilator._id) {
      throw new ConvexError("You are not the invigilator for this exam");
    }

    // 1. Find all "offer" signals for this exam. This is our starting point.
    const offers = await ctx.db
      .query("proctoringSignals")
      .withIndex("by_exam_and_type", (q) =>
        q.eq("examId", examId).eq("type", "offer")
      )
      .collect();

    if (offers.length === 0) {
      return []; // No one is trying to connect.
    }

    // 2. Get all active proctoring sessions for this exam
    const activeSessions = await ctx.db
      .query("proctoringSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("examId"), examId),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    const fullSessionData = await Promise.all(
      activeSessions.map(async (session) => {
        // ✅ Get the student's user document for this specific session
        const student = await ctx.db.get(session.studentId);

        // Get all signals for this specific connection attempt
        const signals = await ctx.db
          .query("proctoringSignals")
          .withIndex("by_connectionId", (q) =>
            q.eq("connectionId", session.connectionId)
          )
          .collect();

        // ✅ Return a single object with all related data
        return {
          session,
          student,
          signals,
        };
      })
    );

    // ✅ Return a clean array of these fully populated session objects
    return fullSessionData;
  },
});
