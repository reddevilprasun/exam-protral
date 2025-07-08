"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Plus,
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  Package,
  Search,
  Eye,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuestionType } from "../lib/types";
import { Id } from "@/convex/_generated/dataModel";
import { useGetSubject } from "../subject-management/api/use-get-subject";
import { useGetBatch } from "../batch-management/api/use-get-batch";
import { useGetUniversityTeacher } from "../user-management/api/use-get-universityTeacher";
import { GroupPicker } from "../question-bank/components/questionGroupPicker";
import PreviewQuestionDialog from "../question-bank/components/previewQuestionDialog";
import { useCreateExam } from "./api/use-create-exam";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useGetTeacherQuestion } from "../question-bank/api/use-getTeacher-question";
import { useGetTeacherQuestionGroups } from "../question-bank/api/use-getTeacher-questionGroup";
import { useTeacherRouter } from "@/hooks/useTeacherRouter";

export default function CreateExamPage() {
  const router = useRouter();
  const { push } = useTeacherRouter();
  const searchParams = useSearchParams();

  // State management
  const [selectedQuestions, setSelectedQuestions] = useState<Id<"questions">[]>(
    []
  );
  const [selectedGroups, setSelectedGroups] = useState<Id<"questionGroups">[]>(
    []
  );
  const [selectedBatches, setSelectedBatches] = useState<Id<"batches">[]>([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [scheduleConflicts, setScheduleConflicts] = useState<string[]>([]);
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [isQuestionPreviewOpen, setIsQuestionPreviewOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType | null>(
    null
  );
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<string>("all");
  const [questionDifficultyFilter, setQuestionDifficultyFilter] =
    useState<string>("all");

  const isEditMode = searchParams.get("edit") !== null;
  const editExamId = searchParams.get("edit");

  const subjects = useGetSubject();
  const assignedSubjects =
    subjects.data?.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })) || [];

  const examFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    subjectId: z.string().min(1, "Subject is required"),
    batchId: z.array(z.string()).min(1, "At least one batch must be selected"),
    questions: z
      .array(z.string())
      .min(1, "At least one question must be selected"),
    questionGroups: z.array(z.string()).optional(),
    invigilator: z.string().optional(),
    examType: z.enum([
      "midterm",
      "final",
      "quiz",
      "assignment",
      "project",
      "practical",
      "other",
    ]),
    duration: z
      .number()
      .min(15, "Duration must be at least 15 minutes")
      .max(300, "Duration cannot exceed 5 hours"),
    scheduleStart: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date/time"),
    scheduleEnd: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end date/time"),
    maxMarks: z.number().min(1, "Max marks must be at least 1"),
    passingMarks: z
      .number()
      .min(0, "Passing marks cannot be negative")
      .optional(),
    startTime: z.string(), // Optional start time for the exam
    endTime: z.string(), // Optional end time for the exam
    allowedAttempts: z
      .number()
      .min(1, "Allowed attempts must be at least 1")
      .optional(),
    instructions: z.string().optional(),
  });

  type ExamFormValues = z.infer<typeof examFormSchema>;

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: "",
      description: "",
      batchId: [],
      questions: [],
      questionGroups: [],
      invigilator: "",
      examType: "midterm",
      duration: 60, // Default to 1 hour
      scheduleStart: "",
      scheduleEnd: "",
      maxMarks: 0,
      startTime: "",
      endTime: "",
      instructions: "",
      allowedAttempts: 1, // Default to 1 attempt
    },
  });

  const watchedSubject = form.watch("subjectId");
  const watchedStartDate = form.watch("scheduleStart");
  const watchedStartTime = form.watch("startTime");
  const watchedEndDate = form.watch("scheduleEnd");
  const watchedEndTime = form.watch("endTime");

  // Fetches the questions when specific subject is selected
  const { data: initialQuestions = [] } = useGetTeacherQuestion();
  const { data: initialQuestionGroups = [] } = useGetTeacherQuestionGroups();

  const batches = useGetBatch();
  const { data: teachers } = useGetUniversityTeacher();
  const allBatches = batches.data?.flatMap((item) => item.batches) ?? [];

  //Exam Mutation
  const { mutated: createExam, isPending: isCreatingExamPending } =
    useCreateExam();

  // Calculate total marks when questions change
  useEffect(() => {
    const total = selectedQuestions.reduce((sum, questionId) => {
      const question = initialQuestions?.find((q) => q._id === questionId);
      return sum + (question?.marks || 0);
    }, 0);
    form.setValue("maxMarks", total);
    setTotalMarks(total);
  }, [selectedQuestions]);

  // Check for schedule conflicts
  useEffect(() => {
    if (
      watchedStartDate &&
      watchedStartTime &&
      watchedEndDate &&
      watchedEndTime &&
      selectedBatches.length > 0
    ) {
      const conflicts: string[] = [];

      // Simulate checking for conflicts
      if (watchedStartDate === "2024-02-15" && watchedStartTime === "09:00") {
        conflicts.push("BSCS-2021 has another exam scheduled at this time");
      }

      setScheduleConflicts(conflicts);
    } else {
      setScheduleConflicts([]);
    }
  }, [
    watchedStartDate,
    watchedStartTime,
    watchedEndDate,
    watchedEndTime,
    selectedBatches,
  ]);

  const handleQuestionToggle = (questionId: Id<"questions">) => {
    setSelectedQuestions((prev) => {
      const newSelection = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      form.setValue("questions", newSelection);
      return newSelection;
    });
  };

  const handleBatchToggle = (batchId: Id<"batches">) => {
    setSelectedBatches((prev) => {
      const newSelection = prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId];
      form.setValue("batchId", newSelection);
      return newSelection;
    });
  };

  const handleGroupSelection = (
    groupIds: Id<"questionGroups">[],
    questionIds: Id<"questions">[]
  ) => {
    setSelectedGroups(groupIds);

    // Add questions from groups to selected questions (avoiding duplicates)
    const newQuestions = [...new Set([...selectedQuestions, ...questionIds])];
    setSelectedQuestions(newQuestions);
    form.setValue("questions", newQuestions);
    form.setValue("questionGroups", groupIds);

    toast("Question groups imported", {
      description: `Added ${questionIds.length} questions from ${groupIds.length} group(s)`,
    });
  };

  const handleRemoveQuestion = (questionId: Id<"questions">) => {
    const newQuestions = selectedQuestions.filter((id) => id !== questionId);
    setSelectedQuestions(newQuestions);
    form.setValue("questions", newQuestions);
  };

  const handlePreviewQuestion = (question: QuestionType) => {
    setSelectedQuestion(question);
    setIsQuestionPreviewOpen(true);
  };

  const onSubmit = async (data: ExamFormValues, isDraft = false) => {
    const combineDateTimeToUTC = (dateStr: string, timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date(dateStr); // This is local midnight
      date.setHours(hours, minutes, 0, 0); // ✅ set local time
      return date.getTime(); // store as UTC timestamp timestamp in UTC
    };
    const start = combineDateTimeToUTC(data.scheduleStart, data.startTime);
    const end = combineDateTimeToUTC(data.scheduleEnd, data.endTime);

    if (end <= start) {
      toast.error("End time must be after start time.");
      return;
    }
    const examData = {
      ...data,
      subjectId: data.subjectId as Id<"subjects">,
      batchId: data.batchId as Id<"batches">[],
      questions: data.questions as Id<"questions">[],
      questionGroups: (data.questionGroups as Id<"questionGroups">[]) || [],
      invigilator: data.invigilator
        ? (data.invigilator as Id<"users">)
        : undefined,
      scheduleStart: start,
      scheduleEnd: end,
      passingMarks: data.passingMarks ?? 0, // Default to 0 if passingMarks is undefined
      allowedAttempts: data.allowedAttempts ?? 1, // Ensure allowedAttempts is always defined
    };
    createExam(examData, {
      onSuccess: () => {
        toast("Exam Created", {
          description: isDraft
            ? "Exam saved as draft successfully."
            : "Exam created successfully.",
        });
        push("exam-management");
      },
      onError: (error) => {
        const errorMessage =
          error instanceof ConvexError
            ? (error.data as string)
            : "An error occurred";
        toast.error(errorMessage);
      },
    });
  };

  // Filter questions based on search and filters
  const filteredQuestions = initialQuestions?.filter((question) => {
    const matchesSubject =
      !watchedSubject || question.subjectId === watchedSubject;
    const matchesSearch = questionSearchQuery
      ? question.questionText
          .toLowerCase()
          .includes(questionSearchQuery.toLowerCase()) ||
        question.tags?.some((tag) =>
          tag.toLowerCase().includes(questionSearchQuery.toLowerCase())
        )
      : true;
    const matchesType =
      questionTypeFilter === "all" ||
      question.questionType === questionTypeFilter;
    const matchesDifficulty =
      questionDifficultyFilter === "all" ||
      question.difficultyLevel === questionDifficultyFilter;

    return matchesSubject && matchesSearch && matchesType && matchesDifficulty;
  });

  const getSelectedGroupsInfo = () => {
    return selectedGroups
      .map((groupId) => {
        const group = initialQuestionGroups?.find((g) => g._id === groupId);
        return group
          ? {
              ...group,
              questionCount: group.selectedQuestions?.length,
              totalMarks: group.totalMarks,
            }
          : null;
      })
      .filter(Boolean);
  };

  return (
    <>
      <div className="flex-1 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/teacher/exams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit Exam" : "Create New Exam"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Modify exam details and settings"
                : "Set up a new exam for your students"}
            </p>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data, false))}
          className="space-y-8"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="questions">
                Questions ({selectedQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Information</CardTitle>
                  <CardDescription>
                    Basic details about the exam
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Exam Title *</Label>
                      <Controller
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="title"
                            placeholder="e.g., Database Systems Midterm"
                            {...field}
                          />
                        )}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Controller
                        name="subjectId"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {assignedSubjects.map((subject) => (
                                <SelectItem
                                  key={subject.value}
                                  value={subject.value}
                                >
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.subjectId && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.subjectId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Controller
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          id="description"
                          placeholder="Brief description of the exam content and objectives"
                          {...field}
                        />
                      )}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Controller
                        name="course"
                        control={form.control}
                        render={({ field }) => <Input id="course" placeholder="e.g., BSCS" {...field} />}
                      />
                    </div> */}
                    <div className="space-y-2">
                      <Label htmlFor="examType">Exam Type *</Label>
                      <Controller
                        name="examType"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="midterm">Midterm</SelectItem>
                              <SelectItem value="final">Final</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="assignment">
                                Assignment
                              </SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="practical">
                                Practical
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.examType && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.examType.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Controller
                        name="duration"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="duration"
                            type="number"
                            min="15"
                            max="300"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseInt(e.target.value))
                            }
                          />
                        )}
                      />
                      {form.formState.errors.duration && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.duration.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Batches *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {allBatches.map((batch) => (
                        <div
                          key={batch.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`batch-${batch.id}`}
                            checked={selectedBatches.includes(batch.id)}
                            onCheckedChange={() => handleBatchToggle(batch.id)}
                          />
                          <Label
                            htmlFor={`batch-${batch.id}`}
                            className="text-sm"
                          >
                            {batch.name} ({batch.noOfStudents} students)
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.batchId && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.batchId.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Schedule</CardTitle>
                  <CardDescription>
                    Set the date and time for the exam
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Controller
                        name="scheduleStart"
                        control={form.control}
                        render={({ field }) => (
                          <Input id="scheduleStart" type="date" {...field} />
                        )}
                      />
                      {form.formState.errors.scheduleStart && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.scheduleStart.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Controller
                        name="startTime"
                        control={form.control}
                        render={({ field }) => (
                          <Input id="startTime" type="time" {...field} />
                        )}
                      />
                      {form.formState.errors.startTime && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.startTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Controller
                        name="scheduleEnd"
                        control={form.control}
                        render={({ field }) => (
                          <Input id="scheduleEnd" type="date" {...field} />
                        )}
                      />
                      {form.formState.errors.scheduleEnd && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.scheduleEnd.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Controller
                        name="endTime"
                        control={form.control}
                        render={({ field }) => (
                          <Input id="endTime" type="time" {...field} />
                        )}
                      />
                      {form.formState.errors.endTime && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {scheduleConflicts.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Schedule Conflicts Detected:</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {scheduleConflicts.map((conflict, index) => (
                            <li key={index}>{conflict}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="invigilator">Assign Invigilator</Label>
                    <Controller
                      name="invigilator"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select invigilator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Invigilator</SelectItem>
                            {teachers?.map((teacher) => (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id.toString()}
                              >
                                {teacher.firstName + " " + teacher.lastName} -{" "}
                                {teacher.departmentName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              {/* Question Groups Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Question Groups</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsGroupPickerOpen(true)}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Import Groups
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Import pre-organized question groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedGroups.length > 0 ? (
                    <div className="space-y-3">
                      {getSelectedGroupsInfo().map((group) => (
                        <div
                          key={group?._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{group?.title}</h4>
                              <Badge variant="secondary">
                                {group?.subjectName}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {group?.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span>{group?.questionCount} questions</span>
                              <span>•</span>
                              <span>{group?.totalMarks} marks</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newGroups = selectedGroups.filter(
                                (id) => id !== group?._id
                              );
                              setSelectedGroups(newGroups);
                              form.setValue("questionGroups", newGroups);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No question groups selected</p>
                      <p className="text-sm">
                        Import groups to quickly add organized sets of questions
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Individual Questions Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Individual Questions</span>
                  </CardTitle>
                  <CardDescription>
                    Select individual questions for this exam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {watchedSubject === "" ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please select a subject first to view available
                        questions.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {/* Search and Filters */}
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search questions..."
                            className="pl-8"
                            value={questionSearchQuery}
                            onChange={(e) =>
                              setQuestionSearchQuery(e.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select
                            value={questionTypeFilter}
                            onValueChange={setQuestionTypeFilter}
                          >
                            <SelectTrigger className="w-full sm:w-[150px]">
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="mcq">MCQ</SelectItem>
                              <SelectItem value="saq">Short Answer</SelectItem>
                              <SelectItem value="true_false">
                                True/False
                              </SelectItem>
                              <SelectItem value="fill_in_the_blank">
                                Fill in the Blank
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={questionDifficultyFilter}
                            onValueChange={setQuestionDifficultyFilter}
                          >
                            <SelectTrigger className="w-full sm:w-[150px]">
                              <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Questions Table */}
                      {filteredQuestions?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No questions available</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4 bg-transparent"
                            onClick={() =>
                              router.push("/teacher/question-bank")
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Questions
                          </Button>
                        </div>
                      ) : (
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Select</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredQuestions?.map((question) => (
                                <TableRow key={question._id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedQuestions.includes(
                                        question._id
                                      )}
                                      onCheckedChange={() =>
                                        handleQuestionToggle(question._id)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="max-w-md">
                                    <div className="space-y-1">
                                      <p className="font-medium line-clamp-2">
                                        {question.questionText}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {question.tags?.map((tag, index) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {question.questionType[0].toUpperCase() +
                                        question.questionType.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        question.difficultyLevel === "easy"
                                          ? "secondary"
                                          : question.difficultyLevel ===
                                              "medium"
                                            ? "default"
                                            : "destructive"
                                      }
                                    >
                                      {question.difficultyLevel[0].toUpperCase() +
                                        question.difficultyLevel.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{question.marks}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handlePreviewQuestion(question)
                                      }
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                  {form.formState.errors.questions && (
                    <p className="text-sm text-red-600 mt-2">
                      {form.formState.errors.questions.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Selected Questions Summary */}
              {selectedQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Selected Questions Summary</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Selected: {selectedQuestions.length}</span>
                        <span>Total Marks: {totalMarks}</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Review your selected questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {selectedQuestions.map((questionId, index) => {
                        const question = initialQuestions?.find(
                          (q) => q._id === questionId
                        );
                        return question ? (
                          <div
                            key={questionId}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium">
                                  Q{index + 1}.
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {question.questionType[0].toUpperCase() +
                                    question.questionType.slice(1)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {question.difficultyLevel[0].toUpperCase() +
                                    question.difficultyLevel.slice(1)}
                                </Badge>
                                <Badge variant="default" className="text-xs">
                                  {question.marks} marks
                                </Badge>
                              </div>
                              <p className="text-sm line-clamp-1">
                                {question.questionText}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveQuestion(questionId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Settings</CardTitle>
                  <CardDescription>
                    Additional configuration options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions *</Label>
                    <Controller
                      name="instructions"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          id="instructions"
                          rows={4}
                          placeholder="Instructions for students taking the exam"
                          {...field}
                        />
                      )}
                    />
                    {form.formState.errors.instructions && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.instructions.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="allowedAttempts">
                        Allowed Attempts *
                      </Label>
                      <Controller
                        name="allowedAttempts"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || "1"}
                            onValueChange={(value) =>
                              field.onChange(Number.parseInt(value))
                            }
                          >
                            <SelectTrigger className="w-full md:w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 attempt</SelectItem>
                              <SelectItem value="2">2 attempts</SelectItem>
                              <SelectItem value="3">3 attempts</SelectItem>
                              <SelectItem value="4">4 attempts</SelectItem>
                              <SelectItem value="5">5 attempts</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.allowedAttempts && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.allowedAttempts.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingMarks">Passing Marks *</Label>
                      <Controller
                        name="passingMarks"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="passingMarks"
                            type="number"
                            min="0"
                            placeholder="Enter passing marks"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseInt(e.target.value))
                            }
                          />
                        )}
                      />
                      {form.formState.errors.passingMarks && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.passingMarks.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Exam Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Questions</p>
                        <p className="font-medium">
                          {selectedQuestions.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Marks</p>
                        <p className="font-medium">{totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {form.watch("duration")} min
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Students</p>
                        <p className="font-medium">
                          {selectedBatches.reduce((sum, batchId) => {
                            const batch = allBatches.find(
                              (b) => b.id === batchId
                            );
                            return sum + (batch?.noOfStudents || 0);
                          }, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teacher/exams")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit((data) => onSubmit(data, true))}
              disabled
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft(No support)
            </Button>
            <Button type="submit" disabled={isCreatingExamPending}>
              <Send className="mr-2 h-4 w-4" />
              {isCreatingExamPending ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>

        {/* Group Picker Dialog */}
        <GroupPicker
          isOpen={isGroupPickerOpen}
          onClose={() => setIsGroupPickerOpen(false)}
          onSelectGroups={handleGroupSelection}
          assignedSubjects={assignedSubjects}
          selectedGroups={selectedGroups}
        />

        {/* Question Preview Modal */}
        <PreviewQuestionDialog
          question={selectedQuestion}
          isOpen={isQuestionPreviewOpen}
          onClose={() => {
            setIsQuestionPreviewOpen(false);
            setSelectedQuestion(null);
          }}
        />
      </div>
    </>
  );
}
