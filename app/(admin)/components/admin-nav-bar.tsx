"use client";
import { ModeToggle } from "@/app/(home)/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, School, Shield } from "lucide-react";

export const AdminNavBar = () => {
  const { signOut } = useAuthActions();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between m-auto">
        <div className="flex items-center gap-2 font-bold">
          <School className="h-5 w-5" />
          <span>ExamPortal</span>
          <Badge variant="outline" className="ml-2">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
