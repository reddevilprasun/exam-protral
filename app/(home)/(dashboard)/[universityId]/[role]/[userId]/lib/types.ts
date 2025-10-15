import { FunctionReturnType } from "convex/server";
import { useGetBatch } from "../batch-management/api/use-get-batch";
import { useGetTeacherQuestion } from "../question-bank/api/use-getTeacher-question";
import { useGetTeacherQuestionGroups } from "../question-bank/api/use-getTeacher-questionGroup";
import { api } from "@/convex/_generated/api";

export type QuestionType = NonNullable<
  ReturnType<typeof useGetTeacherQuestion>["data"]
>[number];

export type QuestionGroupType = NonNullable<
  ReturnType<typeof useGetTeacherQuestionGroups>["data"]
>[number];

export type BatchItem = NonNullable<
  NonNullable<Awaited<ReturnType<typeof useGetBatch>>>["data"]
>[number]["batches"][number];

export type BatchesArray = NonNullable<
NonNullable<Awaited<ReturnType<typeof useGetBatch>>>["data"]
>[number]["batches"];

export type ExamType = FunctionReturnType<typeof api.exam.getExamForSpecificTeacher>[number];
export type ExamStudentType = NonNullable<FunctionReturnType<typeof api.exam.getExamForSpecificStudent>>[number];
export type ExamRequest = NonNullable<FunctionReturnType<typeof api.exam.getExamRequestsForTeacher>>[number];

// TODO: Remove this when the API is ready
// Exam Mock Security Types

export type CheatingAlert = NonNullable<
  FunctionReturnType<typeof api.alerts.getUnresolvedAlertsForExam>
>[number];

export interface StudentSession {
  id: number
  examId: number
  studentId: string
  studentName: string
  batch: string
  startTime: string
  endTime?: string
  status: "active" | "completed" | "flagged" | "terminated"
  webcamStream?: MediaStream
  cheatingAlerts: CheatingAlert[]
  lastActivity: string
  answers: Record<number, string | number>
  submittedAt?: string
}

//Mocks Types
export type Question  = FunctionReturnType<typeof api.questions.getQuestionById>

export interface QuestionGroup {
  id: number
  title: string
  description: string
  tags: string[]
  subject: number
  difficulty?: "easy" | "medium" | "hard"
  intendedUsage: string
  questions: number[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type Exam = FunctionReturnType<typeof api.exam.getExamById> 

export interface Teacher {
  id: number
  name: string
  email: string
  subjects: number[]
  department: string
}

export interface Student {
  id: string
  name: string
  email: string
  batch: string
  course: string
  department: string
  year: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "teacher" | "student" | "admin"
  department?: string
  batch?: string
}

export interface AuditLog {
  id: number
  action: string
  entityType: "question" | "exam" | "group" | "session" | "alert"
  entityId: number
  userId: string
  userName: string
  changes: Record<string, any>
  timestamp: string
}

export interface ExamRequestMocks {
  id: number
  examId: number
  studentId: string
  studentName: string
  batch: string
  requestTime: string
  status: "pending" | "approved" | "rejected"
  verificationNotes?: string
  approvedBy?: number
  approvedAt?: string
}

export interface StudentSession {
  id: number
  examId: number
  studentId: string
  studentName: string
  batch: string
  startTime: string
  endTime?: string
  status: "active" | "completed" | "flagged" | "terminated"
  webcamStream?: MediaStream
  cheatingAlerts: CheatingAlert[]
  lastActivity: string
  answers: Record<number, string | number>
  submittedAt?: string
}


export interface WebcamMonitoringData {
  faceCount: number
  lookingAway: boolean
  phoneDetected: boolean
  suspiciousMovement: boolean
  audioLevel: number
  confidence: number
}

export interface ExamAnswer {
  questionId: number
  answer: string | number | boolean
  timeSpent: number
  flagged: boolean
}
