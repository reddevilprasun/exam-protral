import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { FunctionArgs } from "convex/server";
import { useCallback, useMemo, useState } from "react";

type ReturnType = Id<"questionGroups"> | null;
type RequestType = FunctionArgs<typeof api.questions.deleteQuestionGroup>;

type Options = {
  onSuccess?: (data: string) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useDeleteQuestionGroups = () => {
  const [data, setData] = useState<ReturnType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    "success" | "error" | "settled" | "pending" | null
  >(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const mutation = useMutation(api.questions.deleteQuestionGroup);

  const mutated = useCallback(
    async (values:RequestType, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");
        const response = await mutation(values);
        options?.onSuccess?.(response);
        setData(response);
        return response;
      } catch (error) {
        setStatus("error");
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
        setError(error as Error);
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return {
    mutated,
    data,
    error,
    isPending,
    isSuccess,
    isError,
    isSettled,
  };
};