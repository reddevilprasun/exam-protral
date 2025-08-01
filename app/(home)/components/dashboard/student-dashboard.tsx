"use client";

import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { useGetCurrentStudentDetails } from "../../(dashboard)/[universityId]/[role]/[userId]/student-management/api/use-get-currentStudent";
import { useGetExamForSpecificStudent } from "../../(dashboard)/[universityId]/[role]/[userId]/exam-management/api/use-get-examsForStudent";
import { Loading } from "@/components/Loading";
import { ExamStudentType } from "../../(dashboard)/[universityId]/[role]/[userId]/lib/types";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCreateExamRequest } from "../../(dashboard)/[universityId]/[role]/[userId]/exam-management/api/use-create-examRequest";
import { ConvexError } from "convex/values";
import { useQuery } from "convex/react";
import { useMemo } from "react";

interface StudentDashboardProps {
  user: FunctionReturnType<typeof api.user.UserInfo>;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const router = useRouter();

  // Mock current student
  const { data: currentStudent, isLoading: isLoadingCurrentStudent } =
    useGetCurrentStudentDetails();

  const { data: initialExams, isLoading: isLoadingExams } =
    useGetExamForSpecificStudent(currentStudent?.studentEnrollment._id);

  const { mutated: createExamRequest, isPending: isCreatingRequest } =
    useCreateExamRequest();
  
  const attemptedExamResults = useQuery(
    api.exam.getAllResultsForAStudent,
    user?.id ? { studentId: user.id } : "skip"
  );
  const attemptedExamIds = useMemo(() => {
    return new Set(attemptedExamResults?.map(res => res.examId));
  }, [attemptedExamResults]);
  

  const isLoading = isLoadingCurrentStudent || isLoadingExams;
  const isPending = isCreatingRequest;

  const handleRequestJoin = async (examId: Id<"exams">) => {
    const exam = initialExams?.find((e) => e._id === examId);
    if (!exam) {
      return;
    }
    // Check if exam starts within 10 minutes
    const examStart = new Date(exam.scheduleStart);
    const now = new Date();
    const timeDiff = examStart.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 10) {
      toast("Too early to join", {
        description: `You can request to join this exam ${minutesDiff - 10} minutes from now.`,
      });
      return;
    }

    if (!currentStudent || !user) {
      return;
    }
    // Create join request
    const requestData = {
      examId,
      userId: user.id, // Add userId to match the expected type
    };

    createExamRequest(requestData, {
      onSuccess: () => {
        toast("Join request submitted", {
          description:
            "Your request has been sent to the invigilator for approval.",
        });
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
    });
  };

  const canRequestJoin = (exam: ExamStudentType) => {
    const status = exam.studentRequest?.status;

    if (status === "approved") return false;
    if( exam.status === "completed") return false;

    const examStart = new Date(exam.scheduleStart);
    const now = new Date();
    const timeDiff = examStart.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    return minutesDiff <= 10 
    //TODO: Uncomment this line if you want to allow joining after the exam starts
    //&& minutesDiff >= -30; // Can join 10 min before to 30 min after start
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "ongoing":
        return (
          <Badge variant="destructive" className="animate-pulse">
            Live
          </Badge>
        );
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="animate-pulse">
            Pending
          </Badge>
        );
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen">
      <main className="">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium ">
                Total Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialExams?.length}</div>
              <p className="text-xs">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {initialExams?.filter((e) => e.status === "scheduled").length}
              </div>
              <p className="text-xs">Scheduled exams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium ">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {initialExams?.filter((e) => e.status === "completed").length}
              </div>
              <p className="text-xs">Finished exams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium ">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {
                  initialExams?.filter(
                    (e) => e.studentRequest?.status === "pending"
                  ).length
                }
              </div>
              <p className="text-xs">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {initialExams?.some(
          (exam) => exam.studentRequest?.status === "approved"
        ) && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You have approved exam requests! You can now access your exams.
            </AlertDescription>
          </Alert>
        )}

        {/* Exams List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Exams</h3>
            <div className="flex items-center space-x-2 text-sm ">
              <Bell className="h-4 w-4" />
              <span>You can request to join 10 minutes before exam time</span>
            </div>
          </div>

          <div className="grid gap-6">
            {initialExams?.map((exam) => {
              const status = exam.status;
              const request = exam.studentRequest;
              const canJoin = canRequestJoin(exam);
              const isAttempted = attemptedExamIds.has(exam._id);

              return (
                <Card
                  key={exam._id}
                  className={`${status === "ongoing" ? "border-red-200" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-lg">
                            {exam.title}
                          </CardTitle>
                          {getStatusBadge(status)}
                        </div>
                        <CardDescription className="text-base">
                          {exam.description}
                        </CardDescription>
                      </div>
                      {request && (
                        <div className="ml-4">
                          {getRequestStatusBadge(request.status)}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm ">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateTime(exam.scheduleStart, exam.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm ">
                        <Clock className="h-4 w-4" />
                        <span>{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm ">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.maxMarks} marks</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm ">
                        {exam.questions.length} questions •{" "}
                        {exam.instructions
                          ? exam.instructions.slice(0, 50)
                          : "No instructions available"}
                        ...
                      </div>

                      <div className="flex space-x-2">
                        {request?.status === "approved" &&
                          status === "ongoing" && !isAttempted && (
                            <Button
                              onClick={() => router.push(`/take-exam/${exam._id}`)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Start Exam
                            </Button>
                          )}

                        {!request && canJoin && (
                          <Button
                            onClick={() => handleRequestJoin(exam._id)}
                            variant="outline"
                            disabled={isPending}
                          >
                            Request to Join
                          </Button>
                        )}

                        {request?.status === "pending" && (
                          <Button variant="ghost" disabled>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Waiting for Approval
                          </Button>
                        )}

                        {request?.status === "rejected" && (
                          <Button variant="ghost" disabled>
                            <XCircle className="h-4 w-4 mr-2" />
                            Request Rejected
                          </Button>
                        )}

                        {(status === "completed" || isAttempted) &&(
                          <Button variant="outline" onClick={() => {}}>
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {initialExams?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12  mx-auto mb-4" />
                <h3 className="text-lg font-medium  mb-2">
                  No exams scheduled
                </h3>
                <p>You don&apos;t have any exams scheduled at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
