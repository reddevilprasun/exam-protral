import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetUniversityUser = () => {
  const data = useQuery(api.user.getAllUsersOfUniversity);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}