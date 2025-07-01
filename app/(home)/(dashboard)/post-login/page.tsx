"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "../../api/use-current-user";

export default function PostLoginRedirect() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (user) {
      const { universityId, universityRole, id } = user;
      router.push(`/${universityId}/${universityRole}/${id}/dashboard`);
    }
  }, [user]);

  if (userLoading) {
    return <div>Loading...</div>;
  }
  return <div>Redirecting...</div>;
}
