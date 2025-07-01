import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetSubjectById = (id?: Id<"subjects">) => {
  const data = useQuery(api.university.getSubjectById, {
    id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}