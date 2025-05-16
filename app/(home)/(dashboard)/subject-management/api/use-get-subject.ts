import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetSubject = () => {
  const data = useQuery(api.university.getAllSubject);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}