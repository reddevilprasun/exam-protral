// hooks/useTeacherRouter.ts
import { usePathname, useRouter } from "next/navigation";

export const useTeacherRouter = () => {
  const pathname = usePathname();
  const router = useRouter();

  const parts = pathname.split("/");
  const orgId = parts[1];
  const teacherId = parts[3];

  const push = (subPath: string) => {
    if (!orgId || !teacherId) {
      console.error("Missing orgId or teacherId in path.");
      return;
    }
    router.push(`/${orgId}/teacher/${teacherId}/${subPath}`);
  };

  const buildPath = (subPath: string) => {
    if (!orgId || !teacherId) {
      return "/";
    }
    return `/${orgId}/teacher/${teacherId}/${subPath}`;
  };

  return {
    orgId,
    teacherId,
    push,
    buildPath,
  };
};
