import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGetBatchById = (id?: Id<"batches">) => {
  const data = useQuery(api.university.getBatchById, {
    id,
  });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}