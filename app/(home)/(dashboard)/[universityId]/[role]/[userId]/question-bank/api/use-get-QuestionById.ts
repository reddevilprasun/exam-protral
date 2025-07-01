import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetQuestionById = (id: Id<"questions">) => {
  const data = useQuery(api.questions.getQuestionById, {
    id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}