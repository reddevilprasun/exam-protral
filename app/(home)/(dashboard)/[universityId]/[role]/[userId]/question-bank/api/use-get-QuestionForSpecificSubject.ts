import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetQuestionForSpecificSubject = (id?: Id<"subjects">) => {
  const data = useQuery(api.questions.getQuestionsForSpecificSubject, {
    subjectId: id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}