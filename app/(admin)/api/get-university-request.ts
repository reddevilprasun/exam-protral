import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetUniversityCreateRequest = () => {
  const data = useQuery(api.admin.getUniversityCreateRequests);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}