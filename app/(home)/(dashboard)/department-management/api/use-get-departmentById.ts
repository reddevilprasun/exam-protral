import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetDepartmentById = (id?: Id<"courses">) => {
  const data = useQuery(api.university.getDepartmentById, {
    id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}