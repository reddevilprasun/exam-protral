import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useCurrentUniversity = () => {
  const data = useQuery(api.university.getUniversityInfo);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}