import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetQuestionGroupsForSpecificSubject = (id?: Id<"subjects">) => {
  const data = useQuery(api.questions.getQuestionGroupsBySubject, {
    subjectId: id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}