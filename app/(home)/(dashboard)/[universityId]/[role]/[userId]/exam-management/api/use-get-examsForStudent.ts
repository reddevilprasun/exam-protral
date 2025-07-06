import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetExamForSpecificStudent = (studentEnrollmentID?: Id<"studentEnrollments">) => {
  const data = useQuery(api.exam.getExamForSpecificStudent, {
    studentEnrollmentID,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}