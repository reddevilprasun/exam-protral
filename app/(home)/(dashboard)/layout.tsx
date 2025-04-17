import { Metadata } from "next";
import { ExamSidebar } from "../components/exam-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "../components/Header";

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
      <main className="flex-1 items-start p-6">
        <Header/>
        {children}
      </main>
    </SidebarProvider>
  );
}