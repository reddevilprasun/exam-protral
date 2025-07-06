"use client";

import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "../api/use-current-user";

export default function NavBar() {
  const user = useCurrentUser();
  const isLoggedIn = user.data !== null;
  const router = useRouter();
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between m-auto">
        <div className="flex items-center gap-2 font-bold text-primary">
          <img src="/logo.svg" alt="logo" />
          <span>Examix</span>
        </div>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Badge>
                {user.data?.universityRole?.toUpperCase()}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/signIn">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signUp">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
