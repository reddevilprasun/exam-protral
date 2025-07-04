import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetQuestionByIds = (ids: Array<Id<"questions">>) => {
  const data = useQuery(api.questions.getQuestionsByIds, {
    ids,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}