import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetTeacherQuestion = () => {
  const data = useQuery(api.questions.getQuestionForSpecificTeacher)
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}