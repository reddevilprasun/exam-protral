"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCurrentUser } from "../../api/use-current-user";
import { Clock } from "lucide-react";
import { useCurrentUniversity } from "../../api/use-current-university";
import { Loading } from "@/components/Loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleDashboard } from "../../components/role-dashboard";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: university, isLoading: universityLoading } =
    useCurrentUniversity();
  if (!university && !universityLoading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3">
        <h1 className="text-3xl font-bold">No University Found</h1>
        <p className="text-muted-foreground">
          You are not part of any university. Please contact your
          administrator.
        </p>
        <Alert>
          <AlertTitle>University Not Found</AlertTitle>
          <AlertDescription>
            You are not part of any university. Please contact your
            administrator.
          </AlertDescription>
        </Alert>
        <Link href="/create-university">
          <Button>Create University</Button>
        </Link>
      </div>
    );
  }
  const isLoading = userLoading || universityLoading;

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to access the dashboard.</div>;
  return (
    <main className="flex-1 items-start p-6">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <SidebarTrigger size="lg" />
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName} {user.lastName}
            </p>
          </div>
        </div>

        {university?.status === "pending" && (
          <div className="mb-8">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>University Pending Approval</AlertTitle>
              <AlertDescription>
                Your university creation request for {university.name} is
                pending approval from administrators. You&apos;ll be notified
                once it&apos;s approved.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {university?.status === "rejected" && (
          <div className="mb-8">
            <Alert>
              <AlertTitle>University Creation Rejected</AlertTitle>
              <AlertDescription>
                Your university creation request for {university.name} has been
                rejected. Please contact your administrator for more details.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Render the appropriate dashboard based on user role */}
        <RoleDashboard role={user.universityRole} user={user} />
      </div>
    </main>
  );
}
