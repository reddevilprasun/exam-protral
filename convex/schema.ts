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
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
    )
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
  .index("uniq_user_university_create_request", ["userId", "universityId"]),
  // University User Roles (RBAC)
  universityRoles: defineTable({
    userId: v.id("users"),
    universityId: v.id("universities"),
    role : v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin"),
      v.literal("supervisor"),
      v.literal("examcontroller"),
    )
  }).index("uniq_user_university_role", ["userId", "universityId", "role"]),

  userCreateRequest: defineTable({
    name: v.string(),
    email: v.string(),
    role : v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin"),
      v.literal("supervisor"),
      v.literal("examcontroller"),
    ),
    department: v.optional(v.id("courses")),
    subjectId: v.optional(v.id("subjects")),
    universityId: v.id("universities"),
    batchId: v.id("batches"),
    status: v.union(
      v.literal("active"),
      v.literal("pending")
    )
  })
  .index("uniq_user_create_request", ["email", "universityId"]),

  // Academic Structure
  department: defineTable({
    universityId: v.id("universities"),
    name: v.string(),
    description: v.optional(v.string()),
  })
  .index("uniq_department", ["universityId"]),
  courses: defineTable({
    universityId: v.id("universities"),
    departmentId: v.id("department"),
    name: v.string(),
    code: v.string(),
    description: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
  .index("uniq_course_code", ["universityId","code"])
  .index("uniq_course_department",["departmentId"]),
  batches: defineTable({
    courseId: v.id("courses"),
    name: v.string(),
    academicYear: v.string(),
    startDate: v.float64(),
    endDate: v.float64(),
  })
  .index("uniq_batch_course", ["courseId", "name"]),
  subjects: defineTable({
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
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
  .index("uniq_subject_code", ["courseId", "code"]),

  // Student Enrollment
  studentEnrollments: defineTable({
    studentId: v.id("users"),
    batchId: v.id("batches"),
    enrollmentDate: v.float64(),
  })
  .index("uniq_student_batch", ["batchId", "studentId"]),
  //Teaching Assignments
  teachingAssignments: defineTable({
    teacherId: v.id("users"),
    batchId: v.id("batches"),
    subjectId: v.id("subjects"),
    departmentId: v.id("courses"),
    assignmentDate: v.float64(),
  })
  .index("uniq_teacher_batch_subject", ["teacherId", "batchId", "subjectId"]),

  // Question Bank
  questions: defineTable({
    subjectId: v.id("subjects"),
    createdBy: v.id("users"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("mcq"),
      v.literal("saq"),
    ),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.string()),
    explanation: v.optional(v.string()),
    marks: v.float64(),
    difficultyLevel: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard")
    ),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
  .index("uniq_question", ["subjectId", "questionText"]),

  // Exam Management
  exams: defineTable({
    subjectId: v.id("subjects"),
    batchId: v.id("batches"),
    title: v.string(),
    description: v.string(),
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
    createdBy: v.id("users"),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    maxMarks: v.float64(),
    passingMarks: v.float64(),
  })
  .index("uniq_exam", ["subjectId", "batchId", "title"]),
  examQuestions: defineTable({
    examId: v.id("exams"),
    questionId: v.id("questions"),
    marks: v.float64(),
    questionOrder: v.float64(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
  .index("uniq_exam_question", ["examId", "questionId"]),

  // Exam Attempts & Results
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
  })
  .index("uniq_student_exam", ["studentId", "examId"]),
  studentAnswer: defineTable({
    attemptId: v.id("examAttempts"),
    questionId: v.id("questions"),
    selectedAnswer: v.string(),
    answerText: v.optional(v.string()),
    marksAwarded: v.float64(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
  .index("uniq_student_answer", ["attemptId", "questionId"]),
  examResults: defineTable({
    attemptId: v.id("examAttempts"),
    totalMarks: v.float64(),
    obtainedMarks: v.float64(),
    grade: v.string(),
    percentage: v.float64(),
    feedback: v.optional(v.string()),
    publishedAt: v.float64(),
  })
  .index("uniq_exam_result", ["attemptId"]),
});