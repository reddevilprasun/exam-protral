"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
//import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExamType } from "../lib/types"
import { useGetExamForSpecificTeacher } from "./api/use-get-examsForTeacher"
import { useGetCurrentTeacher } from "../user-management/api/use-get-currentTeacher"
import { Loading } from "@/components/Loading"
import { useTeacherRouter } from "@/hooks/useTeacherRouter"

export default function TeacherExamsPage() {
  const { push } = useTeacherRouter()

  const [myExams, setMyExams] = useState<ExamType[]>([])
  const [invigilationDuties, setInvigilationDuties] = useState<ExamType[]>([])
  // const [pendingRequests, setPendingRequests] = useState<ExamRequest[]>([])
  // const [activeSessions, setActiveSessions] = useState<StudentSession[]>([])

  const {
    data: initialExams,
    isLoading: examsLoading,
  } = useGetExamForSpecificTeacher();

  const { data: currentTeacher, isLoading: teacherLoading } = useGetCurrentTeacher()

  const isLoading = examsLoading || teacherLoading

  useEffect(() => {
    if (!initialExams || !currentTeacher) return;
    // Filter exams created by current teacher
    const createdExams = initialExams?.filter((exam) => exam.createdBy?._id === currentTeacher?.id)
    setMyExams(createdExams || [])

    // Filter exams where current teacher is assigned as invigilator (but not creator)
    const invigilatorExams = initialExams?.filter(
      (exam) => exam.invigilator?._id === currentTeacher?.id ,
    )
    setInvigilationDuties(invigilatorExams || [])

    // Get pending exam requests for exams where teacher is invigilator
    //const allInvigilatorExams = initialExams?.filter((exam) => exam.invigilator === currentTeacher?.id)
    // TODO: Implement examRequests fetching logic (Student Request)
    // const requests = examRequests?.filter(
    //   (req) => allInvigilatorExams.some((exam) => exam.id === req.examId) && req.status === "pending",
    // )
    // setPendingRequests(requests)

    // Get active student sessions for monitoring
    //TODO: Implement studentSessions fetching logic (Student Session)
    // const sessions = studentSessions.filter(
    //   (session) => allInvigilatorExams.some((exam) => exam.id === session.examId) && session.status === "active",
    // )
    // setActiveSessions(sessions)
  }, [initialExams, currentTeacher])
  
  

  const getStatusBadge = (status: "scheduled" | "ongoing" | "completed" | "cancelled") => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Upcoming</Badge>
      case "ongoing":
        return (
          <Badge variant="destructive" className="animate-pulse">
            Live
          </Badge>
        )
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (timestamp: number, time: string) => {
    const date = new Date(timestamp);
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  

  //const handleDeleteExam = (examId: number) => {
    //TODO: Implement delete exam logic
  //}

  const canMonitorExam = (exam: ExamType) => {
    const status = exam.status
    return status === "ongoing" && exam.invigilator?._id === currentTeacher?.id
  }

  if(isLoading) return <Loading />

  return (
    <div className="min-h-screen">

      <main className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Alert for pending requests */}
        {/* {pendingRequests.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Bell className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You have {pendingRequests.length} pending exam join requests that need your approval.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert for active monitoring */}
        {/* {activeSessions.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {activeSessions.length} students are currently taking exams under your supervision.
            </AlertDescription>
          </Alert>
        )}  */}

        <Tabs defaultValue="my-exams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-exams">My Exams ({myExams.length})</TabsTrigger>
            <TabsTrigger value="invigilation-duties">Invigilation Duties ({invigilationDuties.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="my-exams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Exams Created by You</h3>
              <Button onClick={() => push("create-exam")}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Exam
              </Button>
            </div>

            <div className="grid gap-6">
              {myExams.map((exam) => {
                const status = exam.status
                const canEdit = status === "scheduled"
                const canMonitor = canMonitorExam(exam)

                return (
                  <Card key={exam._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg">{exam.title}</CardTitle>
                            {getStatusBadge(status)}
                          </div>
                          <CardDescription className="text-base">{exam.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm ">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(exam.scheduleStart, exam.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm ">
                          <Clock className="h-4 w-4" />
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm ">
                          <Users className="h-4 w-4" />
                          {/* Show the Batches name are enrolled */}
                          {
                            exam.batches.length > 0
                              ? exam.batches.map((batch) => batch?.name).join(", ")
                              : "No Batches Enrolled"

                          }
                        </div>
                        <div className="flex items-center space-x-2 text-sm ">
                          <BookOpen className="h-4 w-4" />
                          <span>{exam.maxMarks} marks</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">{exam.questions.length} questions • Created by you</div>

                        <div className="flex space-x-2">
                          {canMonitor && (
                            <Button
                              onClick={() => push(`exam-management/${exam._id}/monitor`)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Monitor Live
                            </Button>
                          )}

                          <Button variant="outline" onClick={() => {}}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>

                          {canEdit && (
                            <>
                              <Button variant="outline" onClick={() => {}}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => {}}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {myExams.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No exams created yet</h3>
                    <p className="text-gray-500 mb-4">Create your first exam to get started.</p>
                    <Button onClick={() => push("create-exam")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invigilation-duties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold ">Your Invigilation Duties</h3>
              <div className="text-sm">Exams where you are assigned as invigilator</div>
            </div>

            <div className="grid gap-6">
              {invigilationDuties.map((exam) => {
                const status = exam.status
                const canMonitor = canMonitorExam(exam)
                // const examRequests = pendingRequests.filter((req) => req.examId === exam.id)
                // const examSessions = activeSessions.filter((session) => session.examId === exam.id)

                return (
                  <Card key={exam._id} className={`${status === "ongoing" ? "border-red-200" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg">{exam.title}</CardTitle>
                            {getStatusBadge(status)}
                            <Badge variant="outline">Invigilator</Badge>
                          </div>
                          <CardDescription className="text-base">{exam.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm ">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(exam.scheduleStart, exam.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm ">
                          <Clock className="h-4 w-4" />
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm ">
                          <Users className="h-4 w-4" />
                          {/* Show the Batches name are enrolled */}
                          {
                            exam.batches.length > 0
                              ? exam.batches.map((batch) => batch?.name).join(", ")
                              : "No Batches Enrolled"
                          }
                        </div>
                        <div className="flex items-center space-x-2 text-sm ">
                          <BookOpen className="h-4 w-4" />
                          <span>{exam.maxMarks} marks</span>
                        </div>
                      </div>

                      {/* Show pending requests and active sessions */}
                      {/* {(examRequests.length > 0 || examSessions.length > 0) && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          {examRequests.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-orange-600 mb-2">
                              <Bell className="h-4 w-4" />
                              <span>{examRequests.length} pending join requests</span>
                            </div>
                          )}
                          {examSessions.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-red-600">
                              <Eye className="h-4 w-4" />
                              <span>{examSessions.length} students currently taking exam</span>
                            </div>
                          )}
                        </div>
                      )} */}

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          Created by {exam.createdBy?.firstName + " " + exam.createdBy?.lastName} • {exam.questions.length} questions
                        </div>

                        <div className="flex space-x-2">
                          {canMonitor && (
                            <Button
                              onClick={() => push(`exam-management/${exam._id}/monitor`)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Monitor Live
                            </Button>
                          )}

                          <Button variant="outline" onClick={() => {}}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {invigilationDuties.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No invigilation duties</h3>
                    <p className="text-gray-500">You haven&apos;t been assigned as an invigilator for any exams yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
