"use client";

import { useParams } from "next/navigation";

export function useUniversityId(): string | null {
  const params = useParams();

  if (!params || typeof params.universityId !== "string") {
    return null;
  }

  return params.universityId;
}
export function useUniversityRole(): string | null {
  const params = useParams();

  if (!params || typeof params.universityRole !== "string") {
    return null;
  }

  return params.universityRole;
}