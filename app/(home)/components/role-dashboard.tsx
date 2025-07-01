"use client"

//import { useRouter } from "next/navigation"
import { SupervisorDashboard } from "./dashboard/supervisor-dashboard"
import { FunctionReturnType } from "convex/server"
import { api } from "@/convex/_generated/api"
import { TeacherDashboard } from "./dashboard/teacher-dashboard"

// import { StudentDashboard } from "@/components/dashboards/student-dashboard"
// import { ExamControllerDashboard } from "@/components/dashboards/exam-controller-dashboard"

interface RoleDashboardProps {
  role: string
  user: FunctionReturnType<typeof api.user.UserInfo>
}

export function RoleDashboard({ role, user }: RoleDashboardProps) {
  //const router = useRouter()

  // Render the appropriate dashboard based on role
  switch (role) {
    case "supervisor":
      return <SupervisorDashboard user={user} />
    case "teacher":
      return <TeacherDashboard user={user} />
    // case "student":
    //   return <StudentDashboard user={user} navItems={getNavItems()} />
    // case "exam_controller":
    //   return <ExamControllerDashboard user={user} navItems={getNavItems()} />
    default:
      return <div>Unknown role</div>
  }
}

