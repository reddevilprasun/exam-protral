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
