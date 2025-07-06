import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetExamRequests = (examId?: Id<"exams">) => {
  const data = useQuery(api.exam.getExamRequestsForTeacher, {
    examId,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}