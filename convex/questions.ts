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

export const getQuestionsForSpecificSubject = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    if (!user.universityId) {
      return [];
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return [];
    }
    // Check if the user is university teacher
    const teacher = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      university._id
    )
    if (!teacher) {
      return [];
    }
    if (!args.subjectId) {
      return [];
    }
    // Fetch questions for the specific subject
    const questions = await ctx.db.query("questions")
      .withIndex("uniq_question_subject_teacher", (q) => {
        if (!args.subjectId) {
          throw new ConvexError("Subject ID is required");
        }
        return q.eq("subjectId", args.subjectId).eq("createdBy", user._id);
      })
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

export const getQuestionsByIds = query({
  args: {
    ids: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    if (!args.ids || args.ids.length === 0) {
      return [];
    }
    // Fetch questions by their IDs
    const questions = Promise.all(
      args.ids.map(async (id) => {
        const question = await ctx.db.get(id);
        if (!question) {
          return null;
        }
        // Check if the user is authorized to view the question
        if (question.createdBy !== user._id) {
          return null;  
        }
        return question;
      })
    );
    // Filter out null values
    return (await questions).filter((q) => q !== null);
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

export const createQuestionGroup = mutation({
  args: {
    title: v.string(),
    subjectId: v.id("subjects"),
    description: v.optional(v.string()),
    targetDifficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    tags: v.optional(v.array(v.string())),
    intendedUse: v.string(), // e.g., "exam", "quiz", "practice"
    selectedQuestions: v.optional(v.array(v.id("questions"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User must be logged in to create a question group");
    }
    if (!args.title || args.title.length < 3) {
      throw new ConvexError("Title must be at least 3 characters long");
    }
    if (!args.subjectId) {
      throw new ConvexError("Subject ID is required");
    }
    if (!user.universityId) {
      throw new ConvexError("User does not belong to any university");
    }

    const university = await ctx.db.get(user.universityId);
    if (!university) {
      throw new ConvexError("University does not exist");
    }
    
    // Check if the user is university teacher
    const teacher = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      university._id
    )
    if (!teacher) {
      throw new ConvexError("User is not authorized to create question groups");
    }

    // Validate selected questions
    if (args.selectedQuestions && args.selectedQuestions.length === 0) {
      throw new ConvexError("At least one question must be selected for the group");
    }

    const questionGroup = {
      ...args,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save the question group to the database
    const newGroupId = await ctx.db.insert("questionGroups", questionGroup);
    
    return newGroupId;
  }
})

export const getQuestionGroupsForTeacher = query({
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

    // Fetch all question groups for the university
    const questionGroups = await ctx.db.query("questionGroups")
      .withIndex("uniq_teacher_question_group", (q) => q.eq("createdBy", user._id))
      .collect();

    // Get the subject name and CreatedBy user details for each question group
    const questionGroupsWithDetails = await Promise.all(
      questionGroups.map(async (group) => {
        const subject = await ctx.db.get(group.subjectId);
        const createdByUser = await ctx.db.get(group.createdBy);
        //Get the total marks for the selected questions
        const totalMarks = Promise.all(
          (group.selectedQuestions || []).map(async (questionId) => {
            const question = await ctx.db.get(questionId);
            return question ? question.marks || 0 : 0;
          })
        );
        
        return {
          ...group,
          subjectName: subject ? subject.name : "N/A",
          totalMarks: (await totalMarks).reduce((sum, marks) => sum + marks, 0),
          createdBy: createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : "Unknown",
        };
      }
    ));
    
    return questionGroupsWithDetails;
  }
})

export const getQuestionGroupById = query({
  args: {
    id: v.id("questionGroups"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    if (!args.id) {
      return null;
    }

    const group = await ctx.db.get(args.id);
    if (!group) {
      return null;
    }

    // Check if the user is authorized to view the question group
    if (group.createdBy !== user._id) {
      return null;
    }

    return group;
  }
})

export const getQuestionGroupsBySubject = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    if (!args.subjectId) {
      return [];
    }
    if (!user.universityId) {
      return [];
    }
    const university = await ctx.db.get(user.universityId);
    if (!university) {
      return [];
    }
    // Check if the user is university teacher
    const teacher = await checkUserRole(
      ctx,
      user._id,
      "teacher",
      university._id
    )
    if (!teacher) {
      return [];
    }
    // Fetch question groups for the specific subject
    const questionGroups = await ctx.db.query("questionGroups")
      .withIndex("uniq_teacher_question_group", (q) => {
        if(!args.subjectId){
          throw new ConvexError("Subject ID is required");
        }
        return q.eq("createdBy", user._id).eq("subjectId", args.subjectId)
      })
      .collect();
    // Get the subject name and CreatedBy user details for each question group
    const questionGroupsWithDetails = await Promise.all(
      questionGroups.map(async (group) => {
        const subject = await ctx.db.get(group.subjectId);
        const createdByUser = await ctx.db.get(group.createdBy);
        //Get the total marks for the selected questions
        const totalMarks = Promise.all(
          (group.selectedQuestions || []).map(async (questionId) => {
            const question = await ctx.db.get(questionId);
            return question ? question.marks || 0 : 0;
          })
        );  
        return {
          ...group,
          subjectName: subject ? subject.name : "N/A",
          totalMarks: (await totalMarks).reduce((sum, marks) => sum + marks, 0),
          createdBy: createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : "Unknown",
        };
      }
      ))
    return questionGroupsWithDetails;
  }
})


export const editQuestionGroup = mutation({
  args: {
    groupId: v.id("questionGroups"),
    title: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    description: v.optional(v.string()),
    targetDifficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),
    tags: v.optional(v.array(v.string())),
    intendedUse: v.optional(v.string()), // e.g., "exam", "quiz", "practice"
    selectedQuestions: v.optional(v.array(v.id("questions"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User must be logged in to edit a question group");
    }
    if (!args.groupId) {
      throw new ConvexError("Group ID is required");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new ConvexError("Question group does not exist");
    }

    if (group.createdBy !== user._id) {
      throw new ConvexError("You are not authorized to edit this question group");
    }

    // Validate selected questions
    if (args.selectedQuestions && args.selectedQuestions.length === 0) {
      throw new ConvexError("At least one question must be selected for the group");
    }

    // Remove `groupId` from the updated object
    const { groupId, ...updatedFields } = args;

    // Update the question group fields
    const updatedGroup = {
      ...group,
      ...updatedFields,
      updatedAt: Date.now(),
    };

    // Save the updated question group to the database
    await ctx.db.replace(groupId, updatedGroup);
    
    return groupId;
  }
})

export const deleteQuestionGroup = mutation({
  args: {
    groupId: v.id("questionGroups"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User must be logged in to delete a question group");
    }
    if (!args.groupId) {
      throw new ConvexError("Group ID is required");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new ConvexError("Question group does not exist");
    }

    if (group.createdBy !== user._id) {
      throw new ConvexError("You are not authorized to delete this question group");
    }

    // Delete the question group from the database
    await ctx.db.delete(args.groupId);
    
    return args.groupId;
  }
})