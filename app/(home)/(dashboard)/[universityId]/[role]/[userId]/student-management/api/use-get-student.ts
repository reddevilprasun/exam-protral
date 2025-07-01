import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetUniversityStudent = () => {
  const data = useQuery(api.user.getAllStudents);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}