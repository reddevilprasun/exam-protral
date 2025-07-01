import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetDepartment = () => {
  const data = useQuery(api.university.getDepartment);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}