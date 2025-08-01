import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Core User Management
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    number: v.optional(v.string()),
    universityId: v.optional(v.id("universities")),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    lastLogin: v.float64(),
  }).index("uniq_email", ["email"]),

  adminUsers: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("superadmin"), v.literal("admin")),
  }).index("uniq_user_role", ["userId", "role"]),
  // University Management
  // This table is used to manage universities and their details.

  universities: defineTable({
    name: v.string(),
    location: v.string(),
    universityCode: v.string(),
    description: v.optional(v.string()),
    contactEmail: v.string(),
    website: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  }).index("uniq_university_code", ["universityCode"]),
  universityCreateRequest: defineTable({
    universityId: v.id("universities"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  })
    .index("uniq_user_university_create_request", ["userId", "universityId"])
    .index("uniq_university_create_request", ["universityId"]),
  // University User Roles (RBAC)
  universityRoles: defineTable({
    userId: v.id("users"),
    universityId: v.id("universities"),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin"),
      v.literal("supervisor"),
      v.literal("examcontroller")
    ),
  })
    .index("uniq_user_university_role", ["universityId", "role"])
    .index("uniq_user_university_role_2", ["userId", "universityId"]),

  userCreateRequest: defineTable({
    userId: v.id("users"),
    email: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin"),
      v.literal("supervisor"),
      v.literal("examcontroller")
    ),
    departmentId: v.optional(v.id("department")),
    courseId: v.optional(v.id("courses")),
    subjectId: v.optional(v.id("subjects")),
    universityId: v.id("universities"),
    batchId: v.optional(v.id("batches")),
    secretToken: v.string(),
    status: v.union(v.literal("active"), v.literal("pending")),
  }).index("uniq_user_create_request", ["universityId", "email"]),

  // Academic Structure
  department: defineTable({
    universityId: v.id("universities"),
    name: v.string(),
    description: v.optional(v.string()),
  }).index("uniq_department", ["universityId"]),
  courses: defineTable({
    universityId: v.id("universities"),
    departmentId: v.id("department"),
    name: v.string(),
    code: v.string(),
    description: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("uniq_course_code", ["universityId", "code"])
    .index("uniq_course_department", ["departmentId"]),
  batches: defineTable({
    courseId: v.id("courses"),
    name: v.string(),
    academicYear: v.string(),
    startDate: v.float64(),
    endDate: v.float64(),
  }).index("uniq_batch_course", ["courseId", "name"]),
  subjects: defineTable({
    courseId: v.id("courses"),
    name: v.string(),
    code: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    creditHours: v.float64(),
    semester: v.float64(),
    description: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  }).index("uniq_subject_code", ["courseId", "code"]),

  // Student Enrollment
  studentEnrollments: defineTable({
    studentId: v.id("users"),
    academicId: v.number(),
    batchId: v.id("batches"),
    courseId: v.id("courses"),
    departmentId: v.id("department"),
    universityId: v.id("universities"),
    enrollmentDate: v.float64(),
  })
    .index("uniq_student_batch", ["batchId", "studentId"])
    .index("uniq_student", ["studentId", "universityId"])
    .index("uniq_student_university", ["universityId", "studentId"]),
  //Teaching Assignments
  teachingAssignments: defineTable({
    teacherId: v.id("users"),
    courseId: v.id("courses"),
    subjectId: v.id("subjects"),
    departmentId: v.id("department"),
    assignmentDate: v.float64(),
  })
    .index("uniq_teacher_batch_subject", ["teacherId", "subjectId"])
    .index("uniq_teacher_university", ["teacherId", "departmentId"]),

  // Question Bank
  questions: defineTable({
    subjectId: v.id("subjects"),
    createdBy: v.id("users"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("mcq"),
      v.literal("saq"),
      v.literal("true_false"),
      v.literal("fill_in_the_blank")
    ),
    tags: v.optional(v.array(v.string())),
    status: v.union(v.literal("active"), v.literal("inactive")),
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
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("uniq_question_subject_teacher", ["subjectId", "createdBy"])
    .index("uniq_question_type", ["questionType", "subjectId"])
    .index("uniq_teacher_question", ["createdBy"]),
  questionGroups: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    subjectId: v.id("subjects"),
    createdBy: v.id("users"),
    targetDifficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    tags: v.optional(v.array(v.string())),
    intendedUse: v.string(), // e.g., "exam", "quiz", "practice"
    selectedQuestions: v.optional(v.array(v.id("questions"))),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("uniq_question_group", ["subjectId", "title"])
    .index("uniq_teacher_question_group", ["createdBy", "subjectId", "title"]),

  // Exam Management
  exams: defineTable({
    subjectId: v.id("subjects"),
    batchId: v.array(v.id("batches")),
    title: v.string(),
    description: v.string(),
    questions: v.array(v.id("questions")),
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
    duration: v.float64(), // in minutes
    scheduleStart: v.float64(),
    scheduleEnd: v.float64(),
    startTime: v.string(), // Optional start time for the exam
    endTime: v.string(), // Optional end time for the exam
    createdBy: v.id("users"),
    allowedAttempts: v.float64(), // Optional field for allowed attempts
    invigilator: v.optional(v.id("users")),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    instructions: v.optional(v.string()), // Optional exam instructions
    status: v.union(
      v.literal("scheduled"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    maxMarks: v.float64(),
    passingMarks: v.float64(),
  })
    .index("uniq_exam", ["subjectId", "title"])
    .index("uniq_exam_teacher", ["createdBy", "subjectId", "title"])
    .index("uniq_exam_teacher_and_invigilator", ["invigilator"])
    .index("uniq_exam_by_subject", ["subjectId"]),

  proctoringSessions: defineTable({
    examId: v.id("exams"),
    studentId: v.id("users"),
    // A unique ID for each connection attempt, generated on the client
    connectionId: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
  }).index("by_student_and_exam", ["studentId", "examId"]),

  proctoringSignals: defineTable({
    examId: v.id("exams"),
    senderId: v.id("users"),
    recipientId: v.id("users"),
    connectionId: v.string(),
    type: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("candidate"),
      v.literal("restart")
    ),
    // The signal data itself, stored as a JSON string
    data: v.string(),
  })
    .index("by_recipient", ["recipientId", "examId"])
    .index("by_sender_and_exam", ["senderId", "examId"])
    .index("by_connectionId", ["connectionId"])
    .index("by_exam_and_type", ["examId", "type"]),

  examRequests: defineTable({
    userId: v.id("users"),
    examId: v.id("exams"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requestDate: v.float64(),
    responseDate: v.optional(v.float64()),
    responseMessage: v.optional(v.string()),
  })
    .index("uniq_exam_request", ["userId", "examId"])
    .index("uniq_exam_request_by_exam_by_status", ["examId", "status"]),

  // Exam Attempts & Results
  studentAnswers: defineTable({
    studentId: v.id("users"),
    examId: v.id("exams"),
    examStartTime: v.optional(v.float64()),
    // We'll store answers as a map of questionId -> answer
    answers: v.any(), // v.any() is flexible for different answer types
    status: v.union(v.literal("in_progress"), v.literal("submitted"),v.literal("not_started")),
  })
    // This index is crucial for quickly finding a student's answer sheet
    .index("by_student_and_exam", ["studentId", "examId"]),

  // To store the final, graded results
  examResults: defineTable({
    studentId: v.id("users"),
    examId: v.id("exams"),
    score: v.number(),
    totalMarks: v.number(),
    submittedAt: v.float64(),
    // We'll store a detailed breakdown of each answer
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
  }).index("by_student_and_exam", ["studentId", "examId"])
  .index("by_student", ["studentId"]),
  examAttempts: defineTable({
    studentId: v.id("users"),
    examId: v.id("exams"),
    startTime: v.float64(),
    endTime: v.float64(),
    status: v.union(
      v.literal("not_attempted"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("graded"),
      v.literal("re-evaluated")
    ),
    score: v.float64(),
    totalMarks: v.float64(),
  }).index("uniq_student_exam", ["studentId", "examId"]),
});
