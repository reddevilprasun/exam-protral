"use client";

import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash, Eye, Package } from "lucide-react";

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
import { QuestionGroupType, QuestionType } from "../lib/types";
import { formatDate } from "../lib/utils";
import PreviewQuestionDialog from "./components/previewQuestionDialog";
import { useGetTeacherQuestionGroups } from "./api/use-getTeacher-questionGroup";
import { useCreateQuestionGroups } from "./api/use-create-questionGroup";
import { useEditQuestionGroups } from "./api/use-edit-questionGroup";
import { useDeleteQuestionGroups } from "./api/use-delete-questionGroup";
import { GroupForm } from "./components/groupForm";

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
  // Data form convex backend
  const { data: questionGroups } = useGetTeacherQuestionGroups();
  const { data: questions } = useGetTeacherQuestion();
  const subjects = useGetSubject();
  const subjectOptions =
    subjects.data?.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })) || [];

  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] =
    useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>();
  const [selectedQuestionGroup, setSelectedQuestionGroup] =
    useState<QuestionGroupType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("questions");

  // Question Mutations
  const { mutated: createQuestionMutation, isPending: createQuestionPending } =
    useCreateQuestion();
  const { mutated: editQuestionMutation, isPending: editQuestionPending } =
    useEditQuestion();
  const { mutated: deleteQuestionMutation } = useDeleteQuestion();

  // Question group Mutations
  const {
    mutated: createQuestionGroupMutation,
    isPending: createQuestionGroupPending,
  } = useCreateQuestionGroups();
  const {
    mutated: editQuestionGroupMutation,
    isPending: editQuestionGroupPending,
  } = useEditQuestionGroups();
  const {
    mutated: deleteQuestionGroupMutation,
    isPending: deleteQuestionGroupPending,
  } = useDeleteQuestionGroups();

  const isQuestionPending = createQuestionPending || editQuestionPending;
  const isGroupPending =
    createQuestionGroupPending ||
    editQuestionGroupPending ||
    deleteQuestionGroupPending;

  const [questionDeleteConfirm, ConfirmQuestionDeleteModel] = useConfirmModal(
    "Are you sure?",
    "This action cannot be undone. Are you sure you want to delete this question?"
  );

  const [groupDeleteConfirm, ConfirmGroupDeleteModel] = useConfirmModal(
    "Are you sure?",
    "This action cannot be undone. Are you sure you want to delete this question group?"
  );

  // Handle question creation
  const onSubmit = (data: QuestionFormValues) => {
    createQuestionMutation(data, {
      onSuccess: () => {
        toast.success("Question created successfully");
        setIsAddQuestionDialogOpen(false);
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

  // Handle question group creation
  const onGroupSubmit = (
    data: FunctionArgs<typeof api.questions.createQuestionGroup>
  ) => {
    createQuestionGroupMutation(data, {
      onSuccess: () => {
        toast.success("Question group created successfully");
        setIsAddGroupDialogOpen(false);
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

  // Handle question edit
  const handleEditQuestion = (question: QuestionType) => {
    setSelectedQuestion(question);
    setIsEditQuestionDialogOpen(true);
  };

  // Handle question group edit
  const handleEditGroup = (group: QuestionGroupType) => {
    setSelectedQuestionGroup(group);
    setIsEditGroupDialogOpen(true);
  };

  // Handle question edit submission
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

  // Handle question group edit submission
  const onEditGroup = (
    id: Id<"questionGroups">,
    data: Omit<FunctionArgs<typeof api.questions.editQuestionGroup>, "groupId">
  ) => {
    editQuestionGroupMutation(
      { groupId: id, ...data },
      {
        onSuccess: () => {
          toast.success("Question group updated successfully");
          setIsEditGroupDialogOpen(false);
          setSelectedQuestionGroup(undefined);
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
    const ok = await questionDeleteConfirm();
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

  // Handle question group deletion
  const handleDeleteGroup = async (groupId: Id<"questionGroups">) => {
    const ok = await groupDeleteConfirm();
    if (!ok) return;
    deleteQuestionGroupMutation(
      { groupId },
      {
        onSuccess: () => {
          toast.success("Question group deleted successfully");
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
      activeTab === "questions" ? true : activeTab === question.status;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesType &&
      matchesDifficulty &&
      matchesTab
    );
  });

  // Filter groups based on search and filters
  const filteredGroups = questionGroups?.filter((group) => {
    // Filter by search query
    const matchesSearch = searchQuery
      ? group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.tags ?? []).some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true;

    // Filter by subject
    const matchesSubject =
      selectedSubject === "all" ? true : group.subjectId === selectedSubject;

    // Filter by difficulty
    const matchesDifficulty =
      selectedDifficulty === "all"
        ? true
        : group.targetDifficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  // Get question type name by ID
  const getQuestionTypeName = (typeId: string) => {
    const type = questionTypes.find((t) => t.id === typeId);
    return type ? type.name : "Unknown Type";
  };

  //Calculate group total marks
  const calculateGroupMarks = (group: QuestionGroupType) => {
    return (
      group.selectedQuestions?.reduce((total, questionId) => {
        const question = questions?.find((q) => q._id === questionId);
        return total + (question?.marks || 0);
      }, 0) || 0
    );
  };

  return (
    <>
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant={"outline"}
              onClick={() => setIsAddGroupDialogOpen(true)}
            >
              <Package className="mr-2 h-4 w-4" />
              Add Group
            </Button>
            <Button
              className="mt-4 md:mt-0"
              onClick={() => setIsAddQuestionDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
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
                Question Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questionGroups?.length}</div>
              <p className="text-xs text-muted-foreground">
                Organized collections
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
            <CardTitle>Question Bank Management</CardTitle>
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
                {(activeTab === "questions" || activeTab === "active") && (
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
                )}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="questions">
                  All Questions ({questions?.length})
                </TabsTrigger>
                <TabsTrigger value="active">Active Questions</TabsTrigger>
                <TabsTrigger value="groups">
                  Groups ({questionGroups?.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="questions" className="mt-6">
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
              <TabsContent value="groups" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups?.map((group) => (
                    <Card
                      key={group._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {group.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {group.subjectName}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditGroup(group)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Group
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteGroup(group._id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {group.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Package className="h-4 w-4" />
                            <span>
                              {group.selectedQuestions?.length} questions
                            </span>
                            <span>•</span>
                            <span>{calculateGroupMarks(group)} marks</span>
                          </div>
                          {group.targetDifficulty && (
                            <Badge variant="secondary" className="text-xs">
                              {group.targetDifficulty.charAt(0).toUpperCase() +
                                group.targetDifficulty.slice(1)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {(group.tags ?? []).slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(group.tags ?? []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(group.tags?.length ?? 0) - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <p>Usage: {group.intendedUse}</p>
                          <p>Created: {formatDate(group.createdAt)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredGroups?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No question groups found. Create your first group to
                      organize questions.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview Question Dialog */}
        <PreviewQuestionDialog
          question={selectedQuestion || null}
          isOpen={isPreviewDialogOpen}
          onClose={() => {
            setIsPreviewDialogOpen(false);
            setSelectedQuestion(undefined);
          }}
        />
      </div>
      {/* Delete Confirmation Dialog */}
      <ConfirmQuestionDeleteModel />
      <ConfirmGroupDeleteModel />

      {/* Add/Edit Question Group Dialog */}
      <Dialog
        open={isAddGroupDialogOpen}
        onOpenChange={setIsAddGroupDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Question Group</DialogTitle>
            <DialogDescription>
              Create a new question group to organize related questions.
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            onSubmit={onGroupSubmit}
            subjectOptions={subjectOptions}
            questionOptions={questions ?? []}
            isPending={isGroupPending}
            onCancel={() => setIsAddGroupDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={isEditGroupDialogOpen}
        onOpenChange={setIsEditGroupDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question Group</DialogTitle>
            <DialogDescription>
              Update the details of the selected question group.
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            isEditing={true}
            onEditSubmit={(values) =>
              onEditGroup(values.groupId, {
                title: values.title,
                description: values.description,
                subjectId: values.subjectId,
                tags: values.tags,
                targetDifficulty: values.targetDifficulty,
                intendedUse: values.intendedUse,
                selectedQuestions: values.selectedQuestions,
              })
            }
            groupId={selectedQuestionGroup?._id}
            subjectOptions={subjectOptions}
            isPending={isGroupPending}
            onCancel={() => setIsEditGroupDialogOpen(false)}
            questionOptions={questions ?? []}
            initialValues={
              selectedQuestionGroup
                ? {
                    title: selectedQuestionGroup.title || "",
                    description: selectedQuestionGroup.description || "",
                    selectedQuestions:
                      selectedQuestionGroup.selectedQuestions || [],
                    subjectId: selectedQuestionGroup.subjectId || "",
                    targetDifficulty:
                      selectedQuestionGroup.targetDifficulty || "easy",
                    tags: selectedQuestionGroup.tags?.join(", ") || "",
                    intendedUse: selectedQuestionGroup.intendedUse || "",
                  }
                : undefined // <- don't pass anything during creation
            }
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Question Dialog */}
      <CreateEditQuestionDialog
        mode="edit"
        open={isEditQuestionDialogOpen}
        onOpenChange={setIsEditQuestionDialogOpen}
        subjectsOptions={subjectOptions}
        onEdit={onEdit}
        editId={selectedQuestion?._id}
        disable={isQuestionPending}
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
        disable={isQuestionPending}
      />
    </>
  );
}
