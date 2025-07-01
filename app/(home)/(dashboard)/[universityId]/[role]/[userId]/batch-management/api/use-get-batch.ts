import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetBatch = () => {
  const data = useQuery(api.university.getAllBatches);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}