import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetDepartment = () => {
  const data = useQuery(api.university.getDepartments);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}