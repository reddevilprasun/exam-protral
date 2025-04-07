import { Metadata } from "next";
import { AdminNavBar } from "../components/admin-nav-bar";

export const metadata: Metadata = {
  title: "Exam Portal",
  description: "Exam Portal",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavBar />
      {children}
    </div>
  );
}
