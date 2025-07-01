"use client";

import { useParams } from "next/navigation";

export function useUserId(): string | null {
  const params = useParams();

  if (!params || typeof params.userId !== "string") {
    return null;
  }

  return params.userId;
}
