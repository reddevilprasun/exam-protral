import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetCurrentTeacher = () => {
  const data = useQuery(api.user.getCurrentTeacher);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}