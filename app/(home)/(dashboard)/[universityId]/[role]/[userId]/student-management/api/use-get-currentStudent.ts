import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetCurrentStudentDetails = () => {
  const data = useQuery(api.user.getCurrentStudentDetails);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}