import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetTeacherQuestionGroups = () => {
  const data = useQuery(api.questions.getQuestionGroupsForTeacher)
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}