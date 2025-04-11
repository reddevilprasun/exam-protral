import { Metadata } from "next";
import { ExamSidebar } from "../components/exam-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Exam Portal",
  description: "Exam Portal",
};

export default function DashboardLayout({
  children,
}:{
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ExamSidebar/>
      <main>
        {children}
      </main>
    </SidebarProvider>
  );
}