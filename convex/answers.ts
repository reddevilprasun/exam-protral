// in convex/answers.ts (or your proctoring.ts file)
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./lib/userInfo";

export const getStudentAnswersForGrading = internalQuery({
  args: { answerSheetId: v.id("studentAnswers") },
  handler: (ctx, { answerSheetId }) => {
    return ctx.db.get(answerSheetId);
  },
});

export const saveFinalResult = internalMutation({
  args: {
    studentId: v.id("users"),
    examId: v.id("exams"),
    score: v.number(),
    totalMarks: v.number(),
    submittedAt: v.float64(),
    gradedAnswers: v.array(
      v.object({
        questionId: v.id("questions"),
        questionText: v.string(),
        studentAnswer: v.any(),
        correctAnswer: v.any(),
        isCorrect: v.boolean(),
        marksAwarded: v.number(),
      })
    ),
  },
  handler: (ctx, args) => {
    return ctx.db.insert("examResults", args);
  },
});

export const calculateExamResult = internalAction({
  args: {
    studentId: v.id("users"),
    examId: v.id("exams"),
    answerSheetId: v.id("studentAnswers"),
  },
  handler: async (ctx, { studentId, examId, answerSheetId }) => {
    // 1. Get the student's final submitted answers
    const answerSheet = await ctx.runQuery(
      internal.answers.getStudentAnswersForGrading,
      { answerSheetId }
    );
    if (!answerSheet) {
      console.error(
        `Could not find answer sheet for grading: ${answerSheetId}`
      );
      return;
    }

    // 2. Get the full exam with all question data
    const exam = await ctx.runQuery(internal.exam.getExamForGrading, {
      examId: answerSheet.examId,
    });
    if (!exam || !exam.questionsDoc) {
      console.error(`Could not find exam or questions for grading: ${examId}`);
      return;
    }

    let score = 0;
    const gradedAnswers: any[] = [];

    // 3. Loop through each question and grade it based on its type
    for (const question of exam.questionsDoc) {
      if (!question) continue;
      const studentAnswerRaw = answerSheet.answers[question._id];
      let isCorrect = false;
      let correctAnswer: any = null;
      let marksAwarded = 0;

      // Use a switch statement for clean, type-specific logic
      switch (question.questionType) {
        case "mcq":
          correctAnswer = question.options?.findIndex((opt) => opt.isCorrect);
          isCorrect = studentAnswerRaw === correctAnswer;
          break;

        case "true_false":
          correctAnswer = question.correctTrueFalseAnswer;
          isCorrect = studentAnswerRaw === correctAnswer;
          break;

        case "saq":
        case "fill_in_the_blank":
          correctAnswer = question.answerText;
          // For production, text comparison should be case-insensitive and ignore whitespace
          isCorrect =
            typeof studentAnswerRaw === "string" &&
            studentAnswerRaw.trim().toLowerCase() ===
              correctAnswer?.trim().toLowerCase();
          break;
      }

      if (isCorrect) {
        marksAwarded = question.marks;
        score += question.marks;
      }

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        studentAnswer: studentAnswerRaw,
        correctAnswer,
        isCorrect,
        marksAwarded,
      });
    }

    // 4. Save the final, calculated result to the database
    await ctx.runMutation(internal.answers.saveFinalResult, {
      studentId,
      examId,
      score,
      totalMarks: exam.maxMarks,
      submittedAt: answerSheet._creationTime, // Or a dedicated submission time
      gradedAnswers,
    });
  },
});

export const submitExam = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, { examId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const answerSheet = await ctx.db
      .query("studentAnswers")
      .withIndex("by_student_and_exam", (q) =>
        q.eq("studentId", user._id).eq("examId", examId)
      )
      .first();

    if (!answerSheet) throw new ConvexError("No answers found to submit.");

    // Mark the answers as submitted
    await ctx.db.patch(answerSheet._id, { status: "submitted" });

    // Schedule the background action to do the heavy lifting
    await ctx.scheduler.runAfter(0, internal.answers.calculateExamResult, {
      studentId: user._id,
      examId: examId,
      answerSheetId: answerSheet._id,
    });

    return { success: true };
  },
});

export const saveStudentAnswers = mutation({
  args: {
    examId: v.id("exams"),
    // We only send the answers that have changed to be efficient
    changedAnswers: v.any(),
    status: v.optional(
      v.union(
        v.literal("in_progress"),
        v.literal("submitted"),
        v.literal("not_started")
      )
    ),
  },
  handler: async (ctx, { examId, changedAnswers, status }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // Find the student's existing answer sheet for this exam
    const existingSheet = await ctx.db
      .query("studentAnswers")
      .withIndex("by_student_and_exam", (q) =>
        q.eq("studentId", user._id).eq("examId", examId)
      )
      .first();

    if (existingSheet) {
      // If a sheet exists, merge the old answers with the new changes
      const updatedAnswers = { ...existingSheet.answers, ...changedAnswers };
      await ctx.db.patch(existingSheet._id, { answers: updatedAnswers });
    } else {
      // If this is the first save, create a new answer sheet
      if (status) {
        await ctx.db.insert("studentAnswers", {
          studentId: user._id,
          examId,
          answers: changedAnswers,
          status,
        });
      } else {
        await ctx.db.insert("studentAnswers", {
          studentId: user._id,
          examId,
          answers: changedAnswers,
          status: "in_progress",
        });
      }
    }
  },
});

export const startExam = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, { examId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // Find the student's answer sheet for this exam
    const answerSheet = await ctx.db
      .query("studentAnswers")
      .withIndex("by_student_and_exam", (q) =>
        q.eq("studentId", user._id).eq("examId", examId)
      )
      .first();

    // Check if the timer has already started
    if (answerSheet && answerSheet.examStartTime) {
      console.log("Timer already started for this user and exam.");
      return answerSheet.examStartTime; // Return the existing start time
    }

    const startTime = Date.now();

    if (answerSheet) {
      // If sheet exists but timer hasn't started, patch it
      await ctx.db.patch(answerSheet._id, {
        examStartTime: startTime,
        status: "in_progress",
      });
    } else {
      // If no sheet exists at all, create it
      await ctx.db.insert("studentAnswers", {
        studentId: user._id,
        examId,
        answers: {},
        examStartTime: startTime,
        status: "in_progress",
      });
    }

    return startTime;
  },
});

export const getAnswerSheet = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, { examId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // Fetch the student's answer sheet for this exam
    const answerSheet = await ctx.db
      .query("studentAnswers")
      .withIndex("by_student_and_exam", (q) =>
        q.eq("studentId", user._id).eq("examId", examId)
      )
      .first();

    if (!answerSheet) {
      return null;
    }

    return answerSheet;
  },
});
