import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetExamForSpecificTeacher = () => {
  const data = useQuery(api.exam.getExamForSpecificTeacher);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}