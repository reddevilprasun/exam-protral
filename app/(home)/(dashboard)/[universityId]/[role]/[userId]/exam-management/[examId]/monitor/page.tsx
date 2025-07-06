"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Shield,
  Camera,
  Phone,
  UserX,
  Volume2,
  Activity,
  Ban,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Id } from "@/convex/_generated/dataModel"
import { useGetExamById } from "../../api/use-get-examById"
import { useGetCurrentTeacher } from "../../../user-management/api/use-get-currentTeacher"
import { useGetExamRequests } from "../../api/use-get-examsRequests"
import { toast } from "sonner"
import { useTeacherRouter } from "@/hooks/useTeacherRouter"
import { useChangeExamRequest } from "../../api/use-change-examRequest"
import { ConvexError } from "convex/values"
import { CheatingAlert, ExamRequest, StudentSession } from "../../../lib/types"
import { Loading } from "@/components/Loading"
import { currentTeacherMock, initialExams, studentSessions } from "@/lib/mock-data";

export default function ExamMonitorPage() {

  const { push, buildPath } = useTeacherRouter();
  const params = useParams();
  const examId = params.examId as Id<"exams">
  //TODO: Mock Data Implement later
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [selectedSession, setSelectedSession] = useState<StudentSession | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ExamRequest>(null)
  const [selectedAlert, setSelectedAlert] = useState<CheatingAlert | null>(null)

  const {
    data: exam,
    isLoading: examLoading
  } = useGetExamById(examId)

  const {
    data: currentTeacher,
    isLoading: teacherLoading,
  } = useGetCurrentTeacher();

  const {
    data: examRequests,
    isLoading: requestsLoading,
  } = useGetExamRequests(examId);

  console.log(
    "Exam request", examRequests
  )

  const isLoading = examLoading || teacherLoading || requestsLoading;



  //Mutations
  const {
    mutated: changeExamRequestStatus,
    isPending: isChangingRequest,
  } = useChangeExamRequest();

  useEffect(() => {
    if (exam && exam.invigilator !== currentTeacher?.id) {
      toast(
        "Access Denied",
        {
        description: "You are not authorized to monitor this exam.",
      })
      push("exam-management")
    }

    // MOCK: Setup mock data only if it's not set
  if (sessions.length === 0) {
    const examInfo = initialExams.find((e) => e.id === 1)
    if (examInfo && examInfo.invigilator === currentTeacherMock.id) {
      const examSessions = studentSessions.filter((s) => s.examId === 1)
      setSessions(examSessions)
    }
  }
  }, [exam, currentTeacher, push])

  const handleApproveRequest = async (requestId: Id<"examRequests">) => {
    const request = examRequests?.find((req) => req?._id === requestId)
    changeExamRequestStatus({
      examRequestId: requestId,
      status: "approved",
    }, {
      onSuccess:() => {
        toast("Request Approved", {
          description: `The ${request?.user.firstName} has been approved to join the exam.`,
        })
      },
      onError: (error) => {
        const errorMessage =
          error instanceof ConvexError
            ? (error.data as string)
            : "An error occurred";
        toast.error("Error approving request", {
          description: errorMessage,
        });
      },
      onSettled: () => {
        setIsRequestDialogOpen(false)
      }
    })
  }

  const handleRejectRequest = async (requestId: Id<"examRequests">) => {
    const request = examRequests?.find((req) => req?._id === requestId)
    changeExamRequestStatus({
      examRequestId: requestId,
      status: "rejected",
    }, {
      onSuccess:() => {
        toast("Request Rejected", {
          description: `The ${request?.user.firstName} has been rejected from joining the exam.`,
        })
      },
      onError: (error) => {
        const errorMessage =
          error instanceof ConvexError
            ? (error.data as string)
            : "An error occurred";
        toast.error("Error rejecting request", {
          description: errorMessage,
        });
      },
      onSettled: () => {
        setIsRequestDialogOpen(false)
      }
    })
  }

  const handleResolveAlert = (alert: any) => {
   //TODO: Implement alert resolution logic
  }

  const getAlertIcon = (type: CheatingAlert["type"]) => {
    switch (type) {
      case "phone_detected":
        return <Phone className="h-4 w-4" />
      case "looking_away":
        return <EyeOff className="h-4 w-4" />
      case "multiple_faces":
        return <Users className="h-4 w-4" />
      case "no_face":
        return <UserX className="h-4 w-4" />
      case "suspicious_movement":
        return <Activity className="h-4 w-4" />
      case "audio_detected":
        return <Volume2 className="h-4 w-4" />
      case "tab_switch":
        return <Ban className="h-4 w-4" />
      case "fullscreen_exit":
        return <Ban className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityBadge = (severity: CheatingAlert["severity"]) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getSessionStatusBadge = (status: StudentSession["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-600">
            Active
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="destructive" className="animate-pulse">
            Flagged
          </Badge>
        )
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "terminated":
        return <Badge variant="destructive">Terminated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if(isLoading) return <Loading/>

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Exam...</h1>
          <Button onClick={() => push("exam-management")}>Back to Exams</Button>
        </div>
      </div>
    )
  }

  // const pendingRequests = requests.filter((req) => req.status === "pending")
  // const activeAlerts = sessions.flatMap((session) => session.cheatingAlerts.filter((alert) => !alert.resolved))
  // const flaggedSessions = sessions.filter((session) => session.status === "flagged")

  return (
    <div className="min-h-screen">
      <header className="shadow-sm border-b">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-start justify-end space-x-4">
              <Button variant="ghost" onClick={() => push("exam-management")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exams
              </Button>
              <div>
                <h1 className="text-xl font-semibold ">{exam.title}</h1>
                <p className="text-sm text-gray-500">Live Monitoring Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="destructive" className="animate-pulse">
                <Shield className="h-3 w-3 mr-1" />
                Live Monitoring
              </Badge>
            </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{
                examRequests?.length || 0
                }</div>
              <p className="text-xs text-gray-500">Need approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                4
                {/* //TODO: Hard Coded */}
                {/* {sessions.filter((s) => s.status === "active").length} */}
              </div>
              <p className="text-xs text-gray-500">Students taking exam</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                2
                {/* //TODO: Hard Code */}
              </div>
              <p className="text-xs text-gray-500">Unresolved alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Flagged Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                1
                {/* //TODO: Hard code */}
              </div>
              <p className="text-xs text-gray-500">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts Banner */}
        {/* {activeAlerts.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Active Security Alerts</AlertTitle>
            <AlertDescription className="text-red-700">
              {activeAlerts.length} unresolved cheating alerts require your immediate attention.
            </AlertDescription>
          </Alert>
        )} */}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Join Requests ({examRequests?.length})</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring (3)</TabsTrigger>
            <TabsTrigger value="alerts">Security Alerts (3)</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Student Join Requests</h3>
              <div className="text-sm text-gray-500">Students requesting to join the exam</div>
            </div>

            <div className="grid gap-4">
              {examRequests?.map((request) => (
                <Card key={request?._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium ">{request?.user.firstName + " " + request?.user.lastName}</h4>
                          <p className="text-sm">{request?.batchName}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p>Requested at</p>
                          <p>{request?.requestDate ? formatTime(request.requestDate) : "N/A"}</p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setIsRequestDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {examRequests?.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                    <p className="text-gray-500">All join requests have been processed.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold ">Live Student Monitoring</h3>
              <div className="text-sm text-gray-500">Real-time webcam feeds and session status</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className={`${session.status === "flagged" ? "border-red-200 bg-red-50/30" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{session.studentName}</CardTitle>
                        <CardDescription>{session.batch}</CardDescription>
                      </div>
                      {getSessionStatusBadge(session.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Mock webcam feed */}
                    <div className="relative">
                      <div className="w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Live Webcam Feed</p>
                          <p className="text-xs text-gray-400">{session.studentName}</p>
                        </div>
                      </div>

                      {session.status === "active" && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span>LIVE</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Started:</span>
                        <span className="ml-2 font-medium">{formatTime(Number(session.startTime))}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Activity:</span>
                        <span className="ml-2 font-medium">{formatTime(Number(session.lastActivity))}</span>
                      </div>
                    </div>

                    {session.cheatingAlerts.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-red-600">Recent Alerts:</h5>
                        {session.cheatingAlerts.slice(-2).map((alert) => (
                          <div key={alert.id} className="flex items-center space-x-2 text-xs">
                            {getAlertIcon(alert.type)}
                            <span className="text-gray-600">{alert.description}</span>
                            {getSeverityBadge(alert.severity)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSession(session)
                          // Open detailed monitoring view
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>

                      {session.status === "active" && (
                        <Button size="sm" variant="destructive" onClick={() => {}}>
                          <Ban className="h-4 w-4 mr-2" />
                          Terminate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {sessions.length === 0 && (
                <div className="col-span-2">
                  <Card>
                    <CardContent className="text-center py-12">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
                      <p className="text-gray-500">No students are currently taking the exam.</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
              <div className="text-sm text-gray-500">AI-detected cheating behaviors</div>
            </div>

            <div className="grid gap-4">
              {activeAlerts.map((alert) => {
                const session = sessions.find((s) => s.id === alert.sessionId)
                return (
                  <Card key={alert.id} className="border-red-200 bg-red-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{session?.studentName}</h4>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Time: {formatTime(alert.timestamp)}</span>
                              <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setIsAlertDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {activeAlerts.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active alerts</h3>
                    <p className="text-gray-500">All security alerts have been resolved.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent> */}
        </Tabs>
      </main>

      {/* Request Review Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Join Request</DialogTitle>
            <DialogDescription>
              Verify the student&apos;s presence and approve or reject their request to join the exam.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium ">Student Name</label>
                  <p className="text-sm ">{selectedRequest.user.firstName + " " + selectedRequest.user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium ">Batch</label>
                  <p className="text-sm ">{selectedRequest.batchName}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium ">Request Time</label>
                <p className="text-sm ">{formatTime(selectedRequest.requestDate)}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => selectedRequest && handleRejectRequest(selectedRequest._id)}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => selectedRequest && handleApproveRequest(selectedRequest._id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Resolution Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Security Alert</DialogTitle>
            <DialogDescription>Review and resolve this cheating detection alert.</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getAlertIcon(selectedAlert.type)}
                <span className="font-medium">{selectedAlert.description}</span>
                {getSeverityBadge(selectedAlert.severity)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="ml-2">{formatTime(Number(selectedAlert.timestamp))}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className="ml-2">{Math.round(selectedAlert.confidence * 100)}%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Resolution Notes</label>
                <Textarea
                  placeholder="Describe the action taken or reason for resolution..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAlertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAlert && handleResolveAlert(selectedAlert)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
