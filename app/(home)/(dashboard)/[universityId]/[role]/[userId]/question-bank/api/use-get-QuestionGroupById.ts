import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetQuestionGroupById = (id: Id<"questionGroups">) => {
  const data = useQuery(api.questions.getQuestionGroupById, {
    id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}