import { Loader } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader className="animate-spin h-8 w-8 text-gray-500" />
      <span className="mt-2 text-gray-500">Loading...</span>
    </div>
  );
}