import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetStudentById = (id?: Id<"studentEnrollments">) => {
  const data = useQuery(api.user.getStudentById, {
    studentId:id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}