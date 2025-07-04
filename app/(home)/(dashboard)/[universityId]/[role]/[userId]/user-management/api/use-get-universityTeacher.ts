import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetUniversityTeacher = () => {
  const data = useQuery(api.user.getAllTeachersOfUniversity);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}