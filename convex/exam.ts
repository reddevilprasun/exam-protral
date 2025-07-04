import { internalMutation, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { checkUserRole, getCurrentUser } from "./lib/userInfo";

export const createExam = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    subjectId: v.id("subjects"),
    batchId: v.array(v.id("batches")),
    questions: v.array(v.id("questions")),
    invigilator: v.optional(v.id("users")), // Optional invigilator
    questionGroups: v.optional(v.array(v.id("questionGroups"))),
    examType: v.union(
      v.literal("midterm"),
      v.literal("final"),
      v.literal("quiz"),
      v.literal("assignment"),
      v.literal("project"),
      v.literal("practical"),
      v.literal("other")
    ),
    startTime: v.string(),
    endTime: v.string(),
    allowedAttempts: v.float64(), // Optional field for allowed attempts
    maxMarks: v.float64(),
    passingMarks: v.float64(), // Optional passing marks
    duration: v.float64(), // in minutes
    scheduleStart: v.float64(),
    scheduleEnd: v.float64(),
    instructions: v.optional(v.string()), // Optional exam instructions
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    if (!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    //Check if the user has the required role
    const hasPermission = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      user.universityId
    );
    if (!hasPermission) {
      throw new ConvexError("You do not have permission to create exams");
    }

    const {
      title,
      passingMarks,
      invigilator,
      maxMarks,
      description,
      subjectId,
      batchId,
      questions,
      questionGroups,
      examType,
      duration,
      scheduleStart,
      scheduleEnd,
      startTime,
      endTime,
      allowedAttempts,
      instructions,
    } = args;

    const exam = {
      title,
      description: description,
      subjectId,
      batchId,
      questions,
      questionGroups: questionGroups,
      examType,
      maxMarks,
      duration,
      scheduleStart,
      scheduleEnd,
      passingMarks,
      invigilator,
      startTime,
      endTime,
      instructions,
      allowedAttempts,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "scheduled" as const, // Default status
    };

    const examId = await ctx.db.insert("exams", exam);

    return examId;
  },
});

export const editExam = mutation({
  args: {
    examId: v.id("exams"),
    title: v.string(),
    description: v.string(),
    subjectId: v.id("subjects"),
    batchId: v.array(v.id("batches")),
    questions: v.array(v.id("questions")),
    invigilator: v.optional(v.id("users")), // Optional invigilator
    questionGroups: v.optional(v.array(v.id("questionGroups"))),
    examType: v.union(
      v.literal("midterm"),
      v.literal("final"),
      v.literal("quiz"),
      v.literal("assignment"),
      v.literal("project"),
      v.literal("practical"),
      v.literal("other")
    ),
    maxMarks: v.float64(),
    passingMarks: v.float64(), // Optional passing marks
    duration: v.float64(), // in minutes
    scheduleStart: v.float64(),
    scheduleEnd: v.float64(),
    startTime: v.string(),
    endTime: v.string(),
    allowedAttempts: v.float64(),
    instructions: v.optional(v.string()), // Optional exam instructions
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    if (!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    //Check if the user has the required role
    const hasPermission = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      user.universityId
    );
    if (!hasPermission) {
      throw new ConvexError("You do not have permission to edit exams");
    }

    // Check if exam exists
    const examExits = await ctx.db.get(args.examId);
    if (!examExits) {
      throw new ConvexError("Exam not found");
    }

    // Check if the user is the creator of the exam
    if (examExits.createdBy !== user._id) {
      throw new ConvexError("You do not have permission to edit this exam");
    }

    const {
      examId,
      title,
      invigilator,
      passingMarks,
      maxMarks,
      description,
      subjectId,
      batchId,
      questions,
      questionGroups,
      examType,
      duration,
      scheduleStart,
      scheduleEnd,
      startTime,
      endTime,
      allowedAttempts,
      instructions,
    } = args;

    const exam = {
      title,
      description: description,
      subjectId,
      batchId,
      questions,
      questionGroups: questionGroups,
      examType,
      maxMarks,
      duration,
      scheduleStart,
      scheduleEnd,
      passingMarks,
      invigilator,
      startTime,
      endTime,
      instructions,
      allowedAttempts,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(examId, exam);

    return examId;
  },
});

export const deleteExam = mutation({
  args: {
    examId: v.id("exams"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    if (!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    //Check if the user has the required role
    const hasPermission = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      user.universityId
    );
    if (!hasPermission) {
      throw new ConvexError("You do not have permission to delete exams");
    }

    const { examId } = args;

    // Check if exam exists
    const exam = await ctx.db.get(examId);
    if (!exam) {
      throw new ConvexError("Exam not found");
    }

    // Delete exam
    await ctx.db.delete(examId);

    return examId;
  },
});

export const getExamById = query({
  args: {
    examId: v.id("exams"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    if (!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    //Check if the user has the required role
    const hasPermission = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      user.universityId
    );
    if (!hasPermission) {
      throw new ConvexError("You do not have permission to view exams");
    }

    const { examId } = args;

    // Fetch exam details
    const exam = await ctx.db.get(examId);
    if (!exam) {
      throw new ConvexError("Exam not found");
    }

    return exam;
  },
});

export const getExamForSpecificTeacher = query({
  async handler(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    if (!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    //Check if the user has the required role
    const hasPermission = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      user.universityId
    );
    if (!hasPermission) {
      throw new ConvexError("You do not have permission to view exams");
    }

    // Fetch exams for the specific teacher
    const examsCreatedByTeacher = await ctx.db
      .query("exams")
      .withIndex("uniq_exam_teacher", (q) => q.eq("createdBy", user._id))

      .collect();
    const examsInvigilatedByTeacher = await ctx.db
      .query("exams")
      .withIndex("uniq_exam_teacher_and_invigilator", (q) =>
        q.eq("invigilator", user._id)
      )
      .collect();
    const exams = [...examsCreatedByTeacher, ...examsInvigilatedByTeacher];
    const uniqueExams = Object.values(
      exams.reduce(
        (acc, exam) => {
          acc[exam._id] = exam;
          return acc;
        },
        {} as Record<string, (typeof exams)[0]>
      )
    );

    const examsWithDetails = await Promise.all(
      uniqueExams.map(async (exam) => {
        const subject = await ctx.db.get(exam.subjectId);
        const batches = Promise.all(
          exam.batchId.map(async (batchId) => {
            const batch = await ctx.db.get(batchId);
            return batch ? { ...batch, id: batch._id } : null;
          })
        );
        const invigilatorDetails = exam.invigilator
          ? await ctx.db.get(exam.invigilator)
          : null;
        const creatorDetails = await ctx.db.get(exam.createdBy);

        return {
          ...exam,
          subjectName: subject ? subject.name : "Unknown Subject",
          batches: await batches,
          invigilator: invigilatorDetails ? { ...invigilatorDetails } : null,
          createdBy: creatorDetails ? { ...creatorDetails } : null,
        };
      })
    );
    return examsWithDetails;
  },
});

// This mutation updates the status of all exams based on the current time
export const updatedExamStatus = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    const allExams = await ctx.db.query("exams").collect();

    if (allExams.length === 0) return;

    for (const exam of allExams) {
      const startTime = exam.scheduleStart;
      const endTime = exam.scheduleEnd;

      let newStatus: "scheduled" | "ongoing" | "completed" | "cancelled" =
        exam.status;

      if (now < startTime) {
        newStatus = "scheduled";
      } else if (now >= startTime && now <= endTime) {
        newStatus = "ongoing";
      } else if (now > endTime) {
        newStatus = "completed";
      }

      if (newStatus !== exam.status) {
        await ctx.db.patch(exam._id, { status: newStatus });
      }
    }
  },
});
