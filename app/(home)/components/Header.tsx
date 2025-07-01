"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const getInfoOfHeaderItem = (path: string) => {
    if (path.includes("department-management")) {
      return {
        title: "Department Management",
        description: "Manage departments for your university",
      };
    }
    if (path.includes("course-management")) {
      return {
        title: "Course Management",
        description: "Manage courses for your university",
      };
    }
    if (path.includes("batch-management")) {
      return {
        title: "Batch Management",
        description: "Manage batches for your university",
      };
    }
    if (path.includes("subject-management")) {
      return {
        title: "Subject Management",
        description: "Manage subjects for your university",
      };
    }
    if (path.includes("user-management")) {
      return {
        title: "User Management",
        description: "Manage users and roles for your university",
      };
    }
    if (path.includes("student-management")) {
      return {
        title: "Student Management",
        description: "Manage students for your university",
      };
    }
    if (path.includes("exam-management")) {
      return {
        title: "Exam Management",
        description: "Manage exams and schedules for your university",
      };
    }
    if(path.includes("question-bank")) {
      return {
        title: "Question Bank",
        description: "Manage questions for your university",
      };
    }

    return { title: "", description: "" };
  };

  const { title, description } = getInfoOfHeaderItem(pathname);

  if (!title) return null;

  return (
    <div className="mb-6 mt-4 flex w-full items-start justify-between flex-col gap-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger size="lg" />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
