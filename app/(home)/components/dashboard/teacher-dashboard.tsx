"use client"

import { useRouter } from "next/navigation"
import { BarChart, Calendar, Check, Clock, GraduationCap, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardStats } from "../dashboard-stats"
import { FunctionReturnType } from "convex/server"
import { api } from "@/convex/_generated/api"

// Mock data for teacher dashboard
const mockTeacherData = {
  assignedStudents: 120,
  upcomingExams: 3,
  pendingGrading: 2,
  completedExams: 5,
  upcomingExamsList: [
    { id: 1, title: "Midterm Examination", date: "2023-06-15T09:00:00Z", batch: "2023-A", subject: "Database Systems" },
    { id: 2, title: "Quiz 3", date: "2023-06-10T14:00:00Z", batch: "2022-B", subject: "Programming Fundamentals" },
    { id: 3, title: "Final Examination", date: "2023-07-20T09:00:00Z", batch: "2023-A", subject: "Database Systems" },
  ],
  recentBatches: [
    { id: 1, name: "2023-A", department: "Computer Science", students: 45 },
    { id: 2, name: "2022-B", department: "Computer Science", students: 38 },
    { id: 3, name: "2021-A", department: "Computer Science", students: 42 },
  ],
}

interface TeacherDashboardProps {
  user: FunctionReturnType<typeof api.user.UserInfo>
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  return (
      <div className="container p-6">
        <DashboardStats
          stats={[
            { title: "Assigned Students", value: mockTeacherData.assignedStudents, icon: GraduationCap },
            { title: "Upcoming Exams", value: mockTeacherData.upcomingExams, icon: Calendar },
            { title: "Pending Grading", value: mockTeacherData.pendingGrading, icon: Clock },
            { title: "Completed Exams", value: mockTeacherData.completedExams, icon: Check },
          ]}
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
              <CardDescription>Examinations scheduled for your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeacherData.upcomingExamsList.map((exam) => (
                  <div key={exam.id} className="flex items-start justify-between gap-4 rounded-md border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{exam.title}</h3>
                        <Badge variant="outline">{exam.subject}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Batch: {exam.batch}</p>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="mr-1 inline-block h-3 w-3" />
                        {formatDate(exam.date)}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => router.push(`/teacher/exams/${exam.id}`)}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/teacher/exams")}>
                View All Exams
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:row-span-2">
            <CardHeader>
              <CardTitle>Your Batches</CardTitle>
              <CardDescription>Student batches assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeacherData.recentBatches.map((batch) => (
                  <div key={batch.id} className="flex items-start gap-4 rounded-md border p-3">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Batch {batch.name}</p>
                        <Badge variant="outline">{batch.students} students</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{batch.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/student-management")}>
                Manage Students
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
                onClick={() => router.push("/student-management")}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Add Student
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/teacher/results")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Enter Results
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/teacher/calendar")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  <p className="text-sm font-medium">2 exams need grading</p>
                  <p className="text-xs">Quiz 2 (2023-A) and Assignment 3 (2022-B) are pending review</p>
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                  <p className="text-sm font-medium">Upcoming deadline</p>
                  <p className="text-xs">Submit midterm questions by June 10, 2023</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/teacher/tasks")}>
                View All Tasks
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
  )
}
