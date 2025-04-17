"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const getInfoOfHeaderItem = (pathname: string) => {
    switch (pathname) {
      case "/department-management":
        return {
          title: "Department Management",
          description: "Manage departments for your university",
        };
      case "/batch-management":
        return {
          title: "Batch Management",
          description: "Manage batches for your university",
        };
      case "/subject-management":
        return {
          title: "Subject Management",
          description: "Manage subjects for your university",
        };
      case "/user-management":
        return {
          title: "User Management",
          description: "Manage users and roles for your university"
        }
      default:
        return {
          title: "",
          description: "",
        };
    }
  };
  if(getInfoOfHeaderItem(pathname).title === "") {
    return null;
  }
  return (
    <div className="mb-6 mt-4 flex w-full items-start justify-between flex-col gap-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger size="lg" />
        <h1 className="text-3xl font-bold">
          {getInfoOfHeaderItem(pathname).title}
        </h1>
      </div>
      <p className="text-muted-foreground">
        {getInfoOfHeaderItem(pathname).description}
      </p>
    </div>
  );
}
