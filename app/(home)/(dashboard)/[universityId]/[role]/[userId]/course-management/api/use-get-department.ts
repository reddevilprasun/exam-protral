import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api";

export const useGetCourse = () => {
  const data = useQuery(api.university.getCourse);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}