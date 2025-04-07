 "use client"

import { useRouter } from "next/navigation"
import { BarChart, BookOpen, GraduationCap, Settings, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// Add import for the ExamSidebar component
import { DashboardStats } from "../dashboard-stats"
import { FunctionReturnType } from "convex/server"
import { api } from "@/convex/_generated/api"
import { useCurrentUniversity } from "../../api/use-current-university"
import { Loading } from "@/components/Loading"

// Mock data for stats
const mockStats = {
  totalStudents: 1250,
  totalTeachers: 85,
  totalExams: 24,
  activeBatches: 8,
  pendingApprovals: 5,
  recentActivity: [
    { id: 1, action: "New teacher added", user: "Jane Smith", timestamp: "2023-05-16T14:45:00Z" },
    { id: 2, action: "Exam schedule updated", user: "Robert Johnson", timestamp: "2023-05-15T10:30:00Z" },
    { id: 3, action: "New batch created", user: "John Doe", timestamp: "2023-05-14T09:15:00Z" },
  ],
}

interface SupervisorDashboardProps {
  user: FunctionReturnType<typeof api.user.UserInfo>
}

// Update the SupervisorDashboard component to use the sidebar
export function SupervisorDashboard({ user }: SupervisorDashboardProps) {
  const router = useRouter();
  const { data:university, isLoading} = useCurrentUniversity();

  if (isLoading) {
    return <Loading />
  }

  return (
      <div className="container p-6">
        <DashboardStats
          stats={[
            { title: "Total Students", value: mockStats.totalStudents, icon: GraduationCap },
            { title: "Total Teachers", value: mockStats.totalTeachers, icon: Users },
            { title: "Active Batches", value: mockStats.activeBatches, icon: Users },
            { title: "Total Exams", value: mockStats.totalExams, icon: BookOpen },
          ]}
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>University Overview</CardTitle>
              <CardDescription>Key metrics and performance indicators for {university?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">University performance chart</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:row-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in your university</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 rounded-md border p-3">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                      <BarChart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        By {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/activity-log")}>
                View All Activity
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/user-management")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/batch-management")}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Manage Batches
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/exam-management")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Exams
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/university-management")}
              >
                <Settings className="mr-2 h-4 w-4" />
                University Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-amber-50 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <p className="text-sm font-medium">You have {mockStats.pendingApprovals} pending approvals</p>
                <p className="text-xs">Teacher registrations and exam schedules need your review</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/approvals")}>
                Review Approvals
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
  )
}

