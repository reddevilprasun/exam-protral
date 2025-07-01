"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Plus,
  FileText,
  Building,
  BookText,
} from "lucide-react";
import { useCurrentUser } from "../api/use-current-user";

export function ExamSidebar() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const role = user?.universityRole;

  const basePath = user
  ? `/${user.universityId}/${user.universityRole}/${user.id}`
  : "";

  const getNavItems = () => {
    switch (role) {
      case "supervisor":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: `${basePath}/dashboard` },
          { name: "Users", icon: Users, href: `${basePath}/user-management` },
          { name: "Courses", icon: BookText, href: `${basePath}/course-management` },
          { name: "Departments", icon: Building, href: `${basePath}/department-management` },
          { name: "Subjects", icon: BookText, href: `${basePath}/subject-management` },
          { name: "Batches", icon: GraduationCap, href: `${basePath}/batch-management` },
          { name: "Exams", icon: BookOpen, href: `${basePath}/exam-management` },
          { name: "Reports", icon: BarChart3, href: `${basePath}/reports` },
          { name: "Settings", icon: Settings, href: `${basePath}/settings` },
        ];
      case "teacher":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: `${basePath}/dashboard` },
          {
            name: "Students",
            icon: GraduationCap,
            href: `${basePath}/student-management`,
          },
          {
            name: "Question Bank",
            icon: BookOpen,
            href: `${basePath}/question-bank`,
          },
          { name: "Create Exam", icon: Plus, href: `${basePath}/create-exam` },
          { name: "My Exams", icon: FileText, href: `${basePath}/my-exams` },
          { name: "Results", icon: BarChart3, href: `${basePath}/results` },
          { name: "Calendar", icon: Calendar, href: `${basePath}/calendar` },
        ];
      case "student":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: `${basePath}/dashboard` },
          { name: "My Exams", icon: BookOpen, href: `${basePath}/my-exams` },
          { name: "Take Exam", icon: FileText, href: `${basePath}/take-exam` },
          { name: "Results", icon: BarChart3, href: `${basePath}/results` },
          { name: "Calendar", icon: Calendar, href: `${basePath}/calendar` },
          { name: "Settings", icon: Settings, href: `${basePath}/settings` },
        ];
      // case "exam_controller":
      //   return [
      //     { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      //     { name: "Exam Management", icon: BookOpen, href: "/exam-controller/management" },
      //     { name: "Exam Schedule", icon: Calendar, href: "/exam-controller/schedule" },
      //     { name: "Results", icon: BarChart3, href: "/exam-controller/results" },
      //     { name: "Reports", icon: BarChart3, href: "/exam-controller/reports" },
      //   ]
      default:
        return [];
    }
  };
  const navItems = getNavItems();
  if (isLoading) return null;

  return (
    <Sidebar collapsible="icon" className="h-[calc(100vh-4rem)] top-16 fixed left-0 z-40">
      {/* <SidebarHeader className="flex items-center border-b px-4 text-lg font-semibold truncate">
        <School className="mr-2 h-6 w-6" />
      </SidebarHeader> */}
      <SidebarContent className="overflow-y-auto py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    }
                    tooltip={item.name}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 truncate">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ExamPortal
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
