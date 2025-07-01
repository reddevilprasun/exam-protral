"use client";

import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CreateEditQuestionDialog from "./createEditQuestionDialog";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { useCreateQuestion } from "./api/use-create-question";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useGetTeacherQuestion } from "./api/use-getTeacher-question";
import { useGetSubject } from "../subject-management/api/use-get-subject";
import { useEditQuestion } from "./api/use-edit-question";
import { Id } from "@/convex/_generated/dataModel";
import { useDeleteQuestion } from "./api/use-delete-question";
import { useConfirmModal } from "@/hooks/use-confirm-model";

// Question types
const questionTypes = [
  { id: "mcq", name: "Multiple Choice" },
  { id: "true_false", name: "True/False" },
  { id: "saq", name: "Short Answer" },
  { id: "fill_in_the_blank", name: "Fill in the Blank" },
];

// Difficulty levels
const difficultyLevels = [
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "hard", name: "Hard" },
];

type QuestionFormValues = FunctionArgs<typeof api.questions.createQuestion>;

export default function QuestionBankPage() {
  const { data: questions } = useGetTeacherQuestion();
  const subjects = useGetSubject();
  const subjectOptions =
    subjects.data?.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })) || [];

  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] =
    useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const { mutated: createQuestionMutation, isPending: createQuestionPending } =
    useCreateQuestion();
  const { mutated: editQuestionMutation, isPending: editQuestionPending } =
    useEditQuestion();
  const { mutated: deleteQuestionMutation } = useDeleteQuestion();

  const isPending = createQuestionPending || editQuestionPending;

  const [confirm, ConfirmModel] = useConfirmModal(
    "Are you sure?",
    "This action cannot be undone. Are you sure you want to delete this question?"
  );

  // Handle form submission
  const onSubmit = (data: QuestionFormValues) => {
    createQuestionMutation(data, {
      onSuccess: () => {
        toast.success("Question created successfully");
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

  type QuestionType = NonNullable<
    ReturnType<typeof useGetTeacherQuestion>["data"]
  >[number];

  // Handle question edit
  const handleEditQuestion = (question: QuestionType) => {
    setSelectedQuestion(question);
    setIsEditQuestionDialogOpen(true);
  };

  const onEdit = (id: Id<"questions">, data: QuestionFormValues) => {
    editQuestionMutation(
      { questionId: id, ...data },
      {
        onSuccess: () => {
          toast.success("Question updated successfully");
          setIsAddQuestionDialogOpen(false);
          setSelectedQuestion(undefined);
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle question preview
  const handlePreviewQuestion = (question: QuestionType) => {
    setSelectedQuestion(question);
    setIsPreviewDialogOpen(true);
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: Id<"questions">) => {
    const ok = await confirm();
    if (!ok) return;
    deleteQuestionMutation(
      { questionId },
      {
        onSuccess: () => {
          toast.success("Question deleted successfully");
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Filter questions based on search and filters
  const filteredQuestions = questions?.filter((question) => {
    // Filter by search query
    const matchesSearch = searchQuery
      ? question.questionText
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (question.tags ?? []).some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true;

    // Filter by subject
    const matchesSubject =
      selectedSubject === "all" ? true : question.subjectId === selectedSubject;

    // Filter by type
    const matchesType =
      selectedType === "all" ? true : question.questionType === selectedType;

    // Filter by difficulty
    const matchesDifficulty =
      selectedDifficulty === "all"
        ? true
        : question.difficultyLevel === selectedDifficulty;

    // Filter by tab (status)
    const matchesTab =
      activeTab === "all" ? true : activeTab === question.status;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesType &&
      matchesDifficulty &&
      matchesTab
    );
  });

  // Get question type name by ID
  const getQuestionTypeName = (typeId: string) => {
    const type = questionTypes.find((t) => t.id === typeId);
    return type ? type.name : "Unknown Type";
  };

  // Format date
  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <Button
            className="mt-4 md:mt-0"
            onClick={() => setIsAddQuestionDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions?.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {subjectOptions.length} subjects
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Multiple Choice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {questions?.filter((q) => q.questionType === "mcq").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {questions &&
                  Math.round(
                    (questions.filter((q) => q.questionType === "mcq").length /
                      questions.length) *
                      100
                  )}
                % of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Descriptive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {questions?.filter((q) => q.questionType === "saq").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {questions
                  ? Math.round(
                      (questions.filter((q) => q.questionType === "saq")
                        .length /
                        questions.length) *
                        100
                    )
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Other Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  questions?.filter(
                    (q) => q.questionType !== "mcq" && q.questionType !== "saq"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (questions?.filter(
                    (q) => q.questionType !== "mcq" && q.questionType !== "saq"
                  ).length ?? 0 / (questions?.length ?? 1)) * 100
                )}
                % of total
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>My Questions</CardTitle>
            <CardDescription>
              Browse, search, and manage your question bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {questionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="active">Active Questions</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions?.map((question) => (
                        <TableRow key={question._id}>
                          <TableCell className="max-w-md">
                            <div className="space-y-1">
                              <p className="font-medium line-clamp-2">
                                {question.questionText}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {question.tags?.map(
                                  (tag: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {question.subjectName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getQuestionTypeName(question.questionType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                question.difficultyLevel === "easy"
                                  ? "secondary"
                                  : question.difficultyLevel === "medium"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {question.difficultyLevel
                                .charAt(0)
                                .toUpperCase() +
                                question.difficultyLevel.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.marks}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(question.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePreviewQuestion(question)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditQuestion(question)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteQuestion(question._id)
                                  }
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="active" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions
                        ?.filter((q) => q.status === "active")
                        .map((question) => (
                          <TableRow key={question._id}>
                            <TableCell className="max-w-md">
                              <div className="space-y-1">
                                <p className="font-medium line-clamp-2">
                                  {question.questionText}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {question.tags?.map(
                                    (tag: string, index: number) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {question.subjectName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getQuestionTypeName(question.questionType)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  question.difficultyLevel === "easy"
                                    ? "secondary"
                                    : question.difficultyLevel === "medium"
                                      ? "default"
                                      : "destructive"
                                }
                              >
                                {question.difficultyLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>{question.marks}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(question.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <Filter className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handlePreviewQuestion(question)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEditQuestion(question)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {}}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview Question Dialog */}
        <Dialog
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
              <DialogDescription>
                Preview how this question will appear to students
              </DialogDescription>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {getQuestionTypeName(selectedQuestion.questionType)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedQuestion.difficultyLevel === "easy"
                          ? "secondary"
                          : selectedQuestion.difficultyLevel === "medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {selectedQuestion.difficultyLevel
                        .charAt(0)
                        .toUpperCase() +
                        selectedQuestion.difficultyLevel.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedQuestion.marks} marks
                    </span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium mb-4">
                    {selectedQuestion.questionText}
                  </p>

                  {selectedQuestion.questionType === "mcq" &&
                    selectedQuestion.options && (
                      <div className="space-y-2">
                        {selectedQuestion.options.map(
                          (
                            option: { text: string; isCorrect: boolean },
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <div className="w-4 h-4 border rounded-full flex items-center justify-center">
                                {option.isCorrect && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                )}
                              </div>
                              <span
                                className={
                                  option.isCorrect
                                    ? "text-green-600 font-medium"
                                    : ""
                                }
                              >
                                {option.text}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {selectedQuestion.questionType === "true_false" && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border rounded-full flex items-center justify-center">
                          {selectedQuestion.correctTrueFalseAnswer && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <span
                          className={
                            selectedQuestion.correctTrueFalseAnswer
                              ? "text-green-600 font-medium"
                              : ""
                          }
                        >
                          True
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border rounded-full flex items-center justify-center">
                          {!selectedQuestion.correctTrueFalseAnswer && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <span
                          className={
                            !selectedQuestion.correctTrueFalseAnswer
                              ? "text-green-600 font-medium"
                              : ""
                          }
                        >
                          False
                        </span>
                      </div>
                    </div>
                  )}

                  {(selectedQuestion.questionType === "saq" ||
                    selectedQuestion.questionType === "fill_in_the_blank") && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        {selectedQuestion.questionType === "saq"
                          ? "Sample Answer:"
                          : "Correct Answer:"}
                      </p>
                      <p className="text-green-700">
                        {selectedQuestion.answerText}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedQuestion.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Subject: {selectedQuestion.subjectName}</p>
                  <p>Created: {formatDate(selectedQuestion.createdAt)}</p>
                  <p>Last updated: {formatDate(selectedQuestion.updatedAt)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsPreviewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Delete Confirmation Dialog */}
      <ConfirmModel />
      {/* Add/Edit Question Dialog */}
      <CreateEditQuestionDialog
        mode="edit"
        open={isEditQuestionDialogOpen}
        onOpenChange={setIsEditQuestionDialogOpen}
        subjectsOptions={subjectOptions}
        onEdit={onEdit}
        editId={selectedQuestion?._id}
        disable={isPending}
        defaultValues={
          selectedQuestion
            ? {
                text: selectedQuestion.questionText || "",
                type: selectedQuestion.questionType || "mcq",
                subject: selectedQuestion.subjectId || "",
                difficulty: selectedQuestion.difficultyLevel || "easy",
                marks: selectedQuestion.marks || 0,
                tags: selectedQuestion.tags?.join(", ") || "",
                options:
                  selectedQuestion.options?.map((option) => ({
                    text: option.text,
                    isCorrect: option.isCorrect,
                  })) || [],
                answer: selectedQuestion.answerText || "",
                correctAnswer: selectedQuestion.correctTrueFalseAnswer || false,
                status: selectedQuestion.status || "active",
              }
            : undefined // <- don't pass anything during creation
        }
      />
      <CreateEditQuestionDialog
        mode="create"
        open={isAddQuestionDialogOpen}
        onOpenChange={setIsAddQuestionDialogOpen}
        subjectsOptions={subjectOptions}
        onSubmit={onSubmit}
        disable={isPending}
      />
    </>
  );
}
