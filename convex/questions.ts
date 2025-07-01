import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { checkUserRole, getCurrentUser } from "./lib/userInfo";

// Create a new question
export const createQuestion = mutation({
  args: {
    questionText: v.string(),
    subjectId: v.id("subjects"),
    questionType: v.union(
      v.literal("mcq"),
      v.literal("saq"),
      v.literal("true_false"),
      v.literal("fill_in_the_blank"),
    ),
    tags: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
    ),
    // For MCQs
    options: v.optional(
      v.array(
        v.object({
          text: v.string(),
          isCorrect: v.boolean(),
        })
      )
    ),
    // for True/False
    correctTrueFalseAnswer: v.optional(v.boolean()),
    // For descriptive questions or fill-in-the-blank
    answerText: v.optional(v.string()),
    marks: v.float64(),
    difficultyLevel: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User must be logged in to create a question");
    }
    if (!args.questionText || args.questionText.length < 5) {
      throw new ConvexError("Question text must be at least 5 characters long");
    }
    if(!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    const universityId = university._id;

    // Check if the user is university teacher
    const teacher = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      universityId
    )
    if (!teacher) {
      throw new ConvexError("User is not authorized to create questions");
    }

    // Question validation
    if(args.questionType === "mcq" && (!args.options || args.options.length < 4)) {
      throw new ConvexError("MCQ questions must have at least 4 options");
    }
    if(args.questionType === "mcq" && !(args.options ?? []).some(option => option.isCorrect)) {
      throw new ConvexError("At least one option must be marked as correct for MCQ questions");
    }
    if(args.questionType === "saq" && !args.answerText) {
      throw new ConvexError("Answer text is required for SAQ type questions");
    }
    if(args.questionType === "fill_in_the_blank" && !args.answerText) {
      throw new ConvexError("Answer text is required for Fill-in-the-Blank type questions");
    }
    if(args.questionType === "true_false" && args.correctTrueFalseAnswer === undefined)
    {
      throw new ConvexError("Correct answer is required for True/False type questions");
    }

    const question = {
      ...args,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt : Date.now(),
    };

    // Save the question to the database
    const newQuestionId = await ctx.db.insert("questions", question);
    if (!newQuestionId) {
      throw new ConvexError("Failed to create question");
    }
    return newQuestionId;
  },
})

export const getQuestionForSpecificTeacher = query({
  handler: async(ctx) => {
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

    // Check if the user is university teacher
    const teacher = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      university._id
    )
    if (!teacher) {
      return null;
    }

    // Fetch all questions for the university
    const questions = await ctx.db.query("questions")
      .withIndex("uniq_teacher_question", (q) => q.eq("createdBy", user._id))
      .collect();

    // Get the subject name and CreatedBy user details for each question
    const questionsWithDetails = await Promise.all(
      questions.map(async (question) => {
        const subject = await ctx.db.get(question.subjectId);
        const createdByUser = await ctx.db.get(question.createdBy);
        
        return {
          ...question,
          subjectName: subject ? subject.name : "N/A",
          createdBy: createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : "Unknown",
        };
      }
    ));
    return questionsWithDetails;
  }
})

export const editQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    questionText: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    questionType: v.optional(v.union(
      v.literal("mcq"),
      v.literal("saq"),
      v.literal("true_false"),
      v.literal("fill_in_the_blank"),
    )),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
    )),
    // For MCQs
    options: v.optional(
      v.array(
        v.object({
          text: v.string(),
          isCorrect: v.boolean(),
        })
      )
    ),
    // for True/False
    correctTrueFalseAnswer: v.optional(v.boolean()),
    // For descriptive questions or fill-in-the-blank
    answerText: v.optional(v.string()),
    marks: v.optional(v.float64()),
    difficultyLevel: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User must be logged in to edit a question");
    }
    if (!args.questionId) {
      throw new ConvexError("Question ID is required");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question does not exist");
    }

    if (question.createdBy !== user._id) {
      throw new ConvexError("You are not authorized to edit this question");
    }

    // Question validation
    if(args.questionType === "mcq" && (!args.options || args.options.length < 4)) {
      throw new ConvexError("MCQ questions must have at least 4 options");
    }
    if(args.questionType === "mcq" && !(args.options ?? []).some(option => option.isCorrect)) {
      throw new ConvexError("At least one option must be marked as correct for MCQ questions");
    }
    if(args.questionType === "saq" && !args.answerText) {
      throw new ConvexError("Answer text is required for SAQ type questions");
    }
    if(args.questionType === "fill_in_the_blank" && !args.answerText) {
      throw new ConvexError("Answer text is required for Fill-in-the-Blank type questions");
    }
    if(args.questionType === "true_false" && args.correctTrueFalseAnswer === undefined)
    {
      throw new ConvexError("Correct answer is required for True/False type questions");
    }

    // Remove `questionId` from the updated object
    const { questionId, ...updatedFields } = args;

    // Update the question fields
    const updatedQuestion = {
      ...question,
      ...updatedFields,
      updatedAt: Date.now(),
    };

    // Save the updated question to the database
    await ctx.db.replace(questionId, updatedQuestion);
    
    return questionId;
  }
})

export const getQuestionById = query({
  args: {
    id: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if (!args.id) {
      return null;
    }

    const question = await ctx.db.get(args.id);
    if (!question) {
      return null;
    }

    // Check if the user is authorized to view the question
    if (question.createdBy !== user._id) {
      return null;
    }

    return question;
  }
})

export const deleteQuestion = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User must be logged in to delete a question");
    }
    if (!args.questionId) {
      throw new ConvexError("Question ID is required");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question does not exist");
    }

    if (question.createdBy !== user._id) {
      throw new ConvexError("You are not authorized to delete this question");
    }

    // Delete the question from the database
    await ctx.db.delete(args.questionId);
    
    return args.questionId;
  }
})