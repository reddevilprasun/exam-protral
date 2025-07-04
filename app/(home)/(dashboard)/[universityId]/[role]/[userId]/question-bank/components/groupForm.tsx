import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { QuestionType } from "../../lib/types";
import { useEffect, useState } from "react";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QuestionPickerDialog } from "./QuestionPickerDialog";
const groupFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
  targetDifficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "Target difficulty is required" }),
  }),
  tags: z.string().optional(),
  intendedUse: z.string().min(1, "Intended use is required"),
  selectedQuestions: z.array(z.string()).optional(),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;
type SubmitFormValues =
  | FunctionArgs<typeof api.questions.createQuestionGroup>
type SubmitEditFormValues = FunctionArgs<typeof api.questions.editQuestionGroup>;

interface GroupFormProps {
  onSubmit?: (values: SubmitFormValues) => void;
  onEditSubmit?: (values: SubmitEditFormValues) => void;
  onCancel: () => void;
  initialValues?: GroupFormValues;
  questionOptions?: QuestionType[];
  subjectOptions: { label: string; value: Id<"subjects"> }[];
  groupId?: Id<"questionGroups">;
  isEditing?: boolean;
  isPending?: boolean;
}
export function GroupForm({
  onSubmit,
  onEditSubmit,
  onCancel,
  initialValues,
  isEditing,
  questionOptions,
  isPending,
  groupId,
  subjectOptions: assignedSubjects,
}: GroupFormProps) { 
  const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Id<"questions">[]>(
    (initialValues?.selectedQuestions as Id<"questions">[]) || []
  );

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      subjectId: initialValues?.subjectId || "",
      targetDifficulty: initialValues?.targetDifficulty || "easy",
      tags: initialValues?.tags || "",
      intendedUse: initialValues?.intendedUse || "",
      selectedQuestions: initialValues?.selectedQuestions || [],
    },
  });

  useEffect(() => {
    form.setValue("selectedQuestions", selectedQuestions);
  }, [selectedQuestions, form]);

  const handleSubmit = (data: GroupFormValues) => {
    const submitData: SubmitFormValues = {
      ...data,
      selectedQuestions: data.selectedQuestions as
        | Id<"questions">[]
        | undefined,
      subjectId: data.subjectId as Id<"subjects">,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : undefined,
    };
    if (isEditing && groupId) {
      const editData: SubmitEditFormValues = {
        ...submitData,
        groupId
      };
      onEditSubmit?.(editData);
    } else {
      onSubmit?.(submitData);
    }
  };

  const handleQuestionToggle = (questionId: Id<"questions">) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleRemoveQuestion = (questionId: Id<"questions">) => {
    setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
  };

  

  // Get question by ID
  const getQuestion = (questionId: Id<"questions">) => {
    return questionOptions?.find((q) => q._id === questionId);
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Database Fundamentals"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignedSubjects.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the purpose and content of this question group..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="targetDifficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intendedUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intended Use</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Exam, Quiz, Practice"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., database, SQL, normalization"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Selected Questions ({selectedQuestions.length})</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQuestionPickerOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Questions
              </Button>
            </div>
            {selectedQuestions.length > 0 ? (
              <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                {selectedQuestions.map((questionId) => {
                  const question = getQuestion(questionId);
                  return question ? (
                    <div
                      key={questionId}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {question.questionText}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {question.questionType[0].toUpperCase() +
                              question.questionType.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.difficultyLevel.charAt(0).toUpperCase() +
                              question.difficultyLevel.slice(1)}
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            {question.marks} marks
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(questionId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <p>
                  No questions selected. Click &quot;Add Questions&quot; to
                  select questions for this group.
                </p>
              </div>
            )}
            {form.formState.errors.selectedQuestions && (
              <p className="text-sm text-destructive">
                {form.formState.errors.selectedQuestions.message}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}
              disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit"
            
              disabled={isPending}>
              {isEditing ? "Update Group" : "Create Group"}
            </Button>
          </div>
        </form>
      </Form>
      <QuestionPickerDialog
        open={isQuestionPickerOpen}
        onOpenChange={setIsQuestionPickerOpen}
        questions={questionOptions || []}
        selectedQuestions={selectedQuestions}
        onSelect={handleQuestionToggle}
        subjectOptions={assignedSubjects}
      />
    </>
  );
}
