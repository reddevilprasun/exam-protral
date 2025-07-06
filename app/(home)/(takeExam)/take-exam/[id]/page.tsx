"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Save,
  School,
  Camera,
  CameraOff,
  Shield,
  Eye,
  Maximize,
  Send,
  Flag,
  CheckCircle,
  XCircle,
  Users,
  Phone,
  UserX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  initialExams,
  initialQuestions,
  students,
  examRequests,
} from "@/lib/mock-data";
import { useWebcamMonitoring } from "@/hooks/use-webcam-monitoring";
import { CheatingAlert, Exam, Question } from "../../../(dashboard)/[universityId]/[role]/[userId]/lib/types";
import { toast } from "sonner";
import { useExamSecurity } from "@/hooks/use-exam-security";
import { useStudentRouter } from "@/hooks/useStudentRouter";

const QUESTIONS_PER_PAGE = 20;

export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();

  // Mock current student
  const currentStudent =
    students.find((s) => s.id === "231001001447") || students[0];

  // State management
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [examPhase, setExamPhase] = useState<
    "waiting" | "setup" | "active" | "submitted"
  >("waiting");
  const [isApproved, setIsApproved] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);
  const [cheatingAlerts, setCheatingAlerts] = useState<CheatingAlert[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const fullScreenRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(Math.floor(Math.random() * 1000000));

  // Load exam data
  useEffect(() => {
    const examId = Number.parseInt(params.id as string);
    const examInfo = initialExams.find((e) => e.id === examId);

    if (examInfo) {
      setExam(examInfo);
      const examQuestions = initialQuestions.filter((q) =>
        examInfo.questions.includes(q.id)
      );
      setQuestions(examQuestions);
      setTimeLeft(examInfo.duration * 60);

      // Check if student has requested and been approved
      const request = examRequests.find(
        (req) => req.examId === examId && req.studentId === currentStudent.id
      );
      if (request) {
        setHasRequested(true);
        setIsApproved(request.status === "approved");
        if (request.status === "approved") {
          setExamPhase("setup");
        }
      }
    }
  }, [params.id, currentStudent.id]);

  // Webcam monitoring with TensorFlow.js integration
  const {
    videoRef,
    canvasRef,
    isWebcamActive,
    webcamError,
    startWebcam,
    stopWebcam,
    detectionStats,
  } = useWebcamMonitoring({
    onCheatingAlert: (alert) => {
      setCheatingAlerts((prev) => [...prev, { ...alert, id: Date.now() }]);
      toast.error("Security Alert", {
        description: alert.description,
      });
    },
    studentId: currentStudent.id,
    examId: exam?.id,
    sessionId: sessionId.current,
  });

  // Exam security
  const {
    isFullscreen,
    violations,
    enterFullscreen,
    exitFullscreen,
    reportViolation,
  } = useExamSecurity({
    onViolation: (violation) => {
      setSecurityViolations((prev) => [...prev, violation.description]);
      toast.error("Security Violation", {
        description: violation.description,
      });

      // Auto-submit after 3 violations
      if (violations.length >= 2) {
        handleAutoSubmit("Multiple security violations detected");
      }
    },
  });

  // Timer countdown
  useEffect(() => {
    if (examPhase !== "active") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit("Time expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examPhase]);

  // Auto-save answers
  useEffect(() => {
    if (examPhase !== "active") return;

    const autoSave = setInterval(() => {
      // Simulate auto-save to server
      console.log("Auto-saving answers:", answers);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [answers, examPhase]);

  useEffect(() => {
    if (examPhase === "active") {
      startWebcam()
    }
  }, [examPhase])
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  const handleRequestJoin = async () => {
    if (!exam) return;

    // Check if exam starts within 10 minutes
    const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
    const now = new Date();
    const timeDiff = examStart.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 10) {
      toast.error("Too early to join", {
        description: `You can request to join this exam ${minutesDiff - 10} minutes from now.`,
      });
      return;
    }

    setHasRequested(true);
    toast("Join request submitted", {
      description:
        "Your request has been sent to the invigilator for approval.",
    });

    // Simulate approval after 30 seconds for demo
    setTimeout(() => {
      setIsApproved(true);
      setExamPhase("setup");
      toast("Request approved", {
        description: "You can now set up your exam environment.",
      });
    }, 30000);
  };

  const handleStartExam = async () => {
    if (!isWebcamActive) {
      toast.error("Webcam required", {
        description: "Please enable your webcam before starting the exam.",
      });
      return;
    }

    await enterFullscreen();
    setExamPhase("active");

    toast("Exam started", {
      description: "Your exam session is now active. Good luck!",
    });
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = () => {
    setIsSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setExamPhase("submitted");
    stopWebcam();
    await exitFullscreen();

    toast("Exam submitted", {
      description: "Your exam has been submitted successfully.",
    });

  };

  const handleAutoSubmit = async (reason: string) => {
    setExamPhase("submitted");
    stopWebcam();
    await exitFullscreen();

    toast.error("Exam auto-submitted", {
      description: `Exam was automatically submitted: ${reason}`,
    });

    
  };

  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 300) return "text-red-400"; // Less than 5 minutes
    if (timeLeft < 900) return "text-yellow-400"; // Less than 15 minutes
    return "text-green-400";
  };

  const getQuestionStatus = (questionId: number) => {
    if (answers[questionId] !== undefined) return "answered";
    if (flaggedQuestions.has(questionId)) return "flagged";
    return "unanswered";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-600 hover:bg-green-700";
      case "flagged":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    return questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  };

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading exam...</h1>
          <Button onClick={() => router.push("/post-login")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Waiting for approval phase
  if (examPhase === "waiting") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <CardDescription>Exam Access Request</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-medium">
                  {exam.duration} minutes
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Marks:</span>
                <span className="ml-2 font-medium">{exam.totalMarks}</span>
              </div>
              <div>
                <span className="text-gray-600">Questions:</span>
                <span className="ml-2 font-medium">{questions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Start Time:</span>
                <span className="ml-2 font-medium">{exam.startTime}</span>
              </div>
            </div>

            {!hasRequested ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You can request to join this exam up to 10 minutes before the
                  scheduled start time.
                </p>
                <Button onClick={handleRequestJoin} size="lg">
                  Request to Join Exam
                </Button>
              </div>
            ) : !isApproved ? (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Request Pending</AlertTitle>
                <AlertDescription>
                  Your request to join the exam has been submitted. Please wait
                  for the invigilator to approve your request.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-exam setup phase
  if (examPhase === "setup") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-2xl">{exam.title}</CardTitle>
                  <CardDescription>
                    Secure Exam Environment Setup
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Webcam Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Webcam Verification</span>
                  </CardTitle>
                  <CardDescription>
                    Your webcam will be monitored throughout the exam using
                    AI-powered cheating detection.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto h-64 bg-black rounded-lg object-cover"
                        autoPlay
                        muted
                        playsInline
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                        width="640"
                        height="480"
                      />

                      {!isWebcamActive && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="text-center text-white">
                            <CameraOff className="h-12 w-12 mx-auto mb-2" />
                            <p>Webcam not active</p>
                          </div>
                        </div>
                      )}

                      {isWebcamActive && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="destructive"
                            className="animate-pulse"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                        </div>
                      )}
                    </div>

                    {!isWebcamActive ? (
                      <Button onClick={startWebcam} className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        {webcamError ? "Retry Webcam" : "Enable Webcam"}
                      </Button>
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Webcam Active</AlertTitle>
                        <AlertDescription>
                          Your webcam is now active and will monitor for
                          cheating behaviours.
                        </AlertDescription>
                      </Alert>
                    )}

                    {webcamError && (
                      <p className="text-red-400 text-sm text-center mt-2">
                        {webcamError}
                      </p>
                    )}

                    {/* Detection Stats */}
                    {isWebcamActive && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="font-medium">Frames Analyzed</div>
                          <div className="text-lg">
                            {detectionStats.totalFramesAnalyzed}
                          </div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="font-medium">Face Detections</div>
                          <div className="text-lg">
                            {detectionStats.faceDetections}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>AI-Powered Security Monitoring</AlertTitle>
                <AlertDescription>
                  This exam uses advanced AI monitoring to detect cheating
                  behaviors:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>📱 Phone detection using object recognition</li>
                    <li>👀 Looking away detection using face tracking</li>
                    <li>👥 Multiple people detection</li>
                    <li>🚫 Tab switching and fullscreen exit detection</li>
                    <li>⚠️ Suspicious movement analysis</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Exam Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>• {exam.instructions}</p>
                    <p>
                      • Keep your webcam on and face visible throughout the exam
                    </p>
                    <p>• Do not use mobile phones or other devices</p>
                    <p>• Remain alone in the room during the exam</p>
                    <p>
                      • Do not switch tabs, minimize browser, or exit fullscreen
                    </p>
                    <p>
                      • Questions are paginated - use navigation to move between
                      pages
                    </p>
                    <p>• Your answers are auto-saved every 30 seconds</p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Violations */}
              {securityViolations.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Security Violations Detected</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                      {securityViolations.slice(-3).map((violation, index) => (
                        <li key={index}>{violation}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push("/post-login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                onClick={handleStartExam}
                disabled={!isWebcamActive}
                className="bg-green-600 hover:bg-green-700"
              >
                <Maximize className="h-4 w-4 mr-2" />
                Start Exam
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Exam submitted phase
  if (examPhase === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Exam Submitted</CardTitle>
            <CardDescription>
              Your exam has been submitted successfully. You will be redirected
              to your dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Exam: {exam.title}</p>
              <p className="text-sm text-gray-600">
                Questions Answered: {answeredCount} / {questions.length}
              </p>
              <p className="text-sm text-gray-600">
                Time Used: {formatTimeLeft()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active exam interface
  return (
    <div ref={fullScreenRef} className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <School className="h-6 w-6" />
            <div>
              <h1 className="font-semibold">{exam.title}</h1>
              <p className="text-sm text-gray-400">
                Page {currentPage + 1} of {totalPages} • Questions{" "}
                {currentPage * QUESTIONS_PER_PAGE + 1}-
                {Math.min(
                  (currentPage + 1) * QUESTIONS_PER_PAGE,
                  questions.length
                )}{" "}
                of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Progress */}
            <div className="text-center">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="font-semibold">
                {answeredCount}/{questions.length} (
                {Math.round(progressPercentage)}%)
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="text-sm text-gray-400">Time Left</div>
              <div className={`font-mono text-lg ${getTimeColor()}`}>
                {formatTimeLeft()}
              </div>
            </div>

            {/* Monitoring Status */}
            <div className="flex items-center space-x-2">
              {isWebcamActive ? (
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                  <span className="text-sm">AI Monitoring</span>
                </div>
              ) : (
                <div className="flex items-center text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                  <span className="text-sm">No Monitoring</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button onClick={handleSubmitExam} variant="destructive">
              <Send className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar - Question Navigator */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Question Navigator</h3>

          {/* Page Navigation */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex-1"
              >
                <ArrowLeft className="h-3 w-3 text-black" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="flex-1"
              >
                <ArrowRight className="h-3 w-3 text-black" />
              </Button>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {questions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              const pageIndex = Math.floor(index / QUESTIONS_PER_PAGE);
              const isCurrentPage = pageIndex === currentPage;

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    if (pageIndex !== currentPage) {
                      setCurrentPage(pageIndex);
                    }
                  }}
                  className={`
                    w-10 h-10 rounded text-sm font-medium transition-colors
                    ${getStatusColor(status)}
                    ${isCurrentPage ? "ring-2 ring-blue-400" : ""}
                    text-white
                  `}
                  title={`Question ${index + 1} - ${status}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-600 rounded" />
              <span>Flagged</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-600 rounded" />
              <span>Not Answered</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="text-green-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Flagged:</span>
                <span className="text-yellow-400">{flaggedQuestions.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="text-gray-400">
                  {questions.length - answeredCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {getCurrentPageQuestions().map((question, index) => {
              const globalIndex = currentPage * QUESTIONS_PER_PAGE + index;
              const isAnswered = answers[question.id] !== undefined;
              const isFlagged = flaggedQuestions.has(question.id);

              return (
                <Card key={question.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">
                          Question {globalIndex + 1}
                          {isFlagged && (
                            <Flag className="inline h-4 w-4 ml-2 text-yellow-400" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-base">
                          {question.text}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="text-white border-white"
                        >
                          {question.marks} marks
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlagQuestion(question.id)}
                          className={
                            isFlagged ? "bg-yellow-600 hover:bg-yellow-700" : ""
                          }
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Question content based on type */}
                    {question.type === "mcq" && question.options && (
                      <RadioGroup
                        value={answers[question.id]?.toString() || ""}
                        onValueChange={(value) =>
                          handleAnswerChange(
                            question.id,
                            Number.parseInt(value)
                          )
                        }
                      >
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`q${question.id}-option-${option.id}`}
                            />
                            <Label
                              htmlFor={`q${question.id}-option-${option.id}`}
                              className="text-white cursor-pointer flex-1"
                            >
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "true_false" && (
                      <RadioGroup
                        value={answers[question.id]?.toString() || ""}
                        onValueChange={(value) =>
                          handleAnswerChange(question.id, value === "true")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="true"
                            id={`q${question.id}-true`}
                          />
                          <Label
                            htmlFor={`q${question.id}-true`}
                            className="text-white cursor-pointer"
                          >
                            True
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="false"
                            id={`q${question.id}-false`}
                          />
                          <Label
                            htmlFor={`q${question.id}-false`}
                            className="text-white cursor-pointer"
                          >
                            False
                          </Label>
                        </div>
                      </RadioGroup>
                    )}

                    {(question.type === "short_answer" ||
                      question.type === "fill_blank") && (
                      <Input
                        value={answers[question.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder="Enter your answer..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    )}

                    {question.type === "descriptive" && (
                      <Textarea
                        value={answers[question.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder="Write your detailed answer here..."
                        rows={6}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    )}

                    {/* Answer status */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        {isAnswered ? (
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Answered</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Not answered</span>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Auto-save current answer
                          toast("Answer saved", {
                            description:
                              "Your answer has been saved automatically.",
                            duration: 2000,
                          });
                        }}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Page Navigation */}
            <div className="flex justify-between items-center py-4">
              <Button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                variant="outline"
                className="text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Page
              </Button>

              <span className="text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </span>

              <Button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="text-black"
              >
                Next Page
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Webcam & Alerts */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Live Monitoring</h3>

          {/* Webcam Feed */}
          <div className="mb-6">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto h-64 bg-black rounded-lg object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="hidden"
                width="640"
                height="480"
              />

              {isWebcamActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <Eye className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              )}
            </div>

            {!isWebcamActive && (
              <Alert variant="destructive" className="mt-2">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Webcam Disconnected</AlertTitle>
                <AlertDescription>
                  Your webcam is not active. This may result in exam
                  termination.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* AI Detection Stats */}
          {isWebcamActive && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">AI Detection Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Frames Analyzed:</span>
                  <span>{detectionStats.totalFramesAnalyzed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Face Detections:</span>
                  <span>{detectionStats.faceDetections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone Detections:</span>
                  <span>{detectionStats.phoneDetections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Looking Away:</span>
                  <span>{detectionStats.lookingAwayCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Alerts */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Security Alerts</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cheatingAlerts.slice(-5).map((alert, index) => (
                <div
                  key={index}
                  className="bg-red-900/50 border border-red-700 rounded p-2 text-xs"
                >
                  <div className="flex items-center space-x-1 mb-1">
                    {alert.type === "phone_detected" && (
                      <Phone className="h-3 w-3" />
                    )}
                    {alert.type === "looking_away" && (
                      <Eye className="h-3 w-3" />
                    )}
                    {alert.type === "multiple_faces" && (
                      <Users className="h-3 w-3" />
                    )}
                    {alert.type === "no_face" && <UserX className="h-3 w-3" />}
                    <span className="font-medium capitalize">
                      {alert.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-300">{alert.description}</p>
                  <p className="text-gray-400 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()} •{" "}
                    {Math.round(alert.confidence * 100)}% confidence
                  </p>
                </div>
              ))}

              {cheatingAlerts.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No security alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Violations */}
          {securityViolations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 text-red-400">
                Security Violations
              </h4>
              <div className="space-y-1 text-xs">
                {securityViolations.slice(-3).map((violation, index) => (
                  <div
                    key={index}
                    className="bg-red-900/30 border border-red-800 rounded p-2"
                  >
                    {violation}
                  </div>
                ))}
              </div>
              {violations.length >= 2 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Multiple violations detected. Exam may be auto-submitted.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Exam Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Session ID:</span>
              <span>{sessionId.current}</span>
            </div>
            <div className="flex justify-between">
              <span>Fullscreen:</span>
              <span
                className={isFullscreen ? "text-green-400" : "text-red-400"}
              >
                {isFullscreen ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auto-save:</span>
              <span className="text-green-400">Every 30s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to submit your exam? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Questions Answered:</span>
                <span className="ml-2 font-medium">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Time Remaining:</span>
                <span className="ml-2 font-medium">{formatTimeLeft()}</span>
              </div>
              <div>
                <span className="text-gray-400">Flagged Questions:</span>
                <span className="ml-2 font-medium">
                  {flaggedQuestions.size}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Security Alerts:</span>
                <span className="ml-2 font-medium">
                  {cheatingAlerts.length}
                </span>
              </div>
            </div>

            {answeredCount < questions.length && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Incomplete Exam</AlertTitle>
                <AlertDescription>
                  You have {questions.length - answeredCount} unanswered
                  questions. Are you sure you want to submit?
                </AlertDescription>
              </Alert>
            )}

            {cheatingAlerts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Alerts Detected</AlertTitle>
                <AlertDescription>
                  {cheatingAlerts.length} security alerts were recorded during
                  your exam session.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Continue Exam
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Final Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
