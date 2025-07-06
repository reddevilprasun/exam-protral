import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetExamById = (examId: Id<"exams">) => {
  const data = useQuery(api.exam.getExamById, {
    examId,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}