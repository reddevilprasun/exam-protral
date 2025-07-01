import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { FunctionArgs } from "convex/server";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.enum(["mcq", "saq", "true_false", "fill_in_the_blank"]),
  subject: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number().min(1, "Marks must be at least 1"),
  tags: z.string().optional(),
  answer: z.string().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean(),
      })
    )
    .optional(),
  correctAnswer: z.boolean().optional(),
  status: z.enum(["active", "inactive"]),
});

type QuestionFormValues = z.infer<typeof questionSchema>;
type SubmitFormValues = FunctionArgs<typeof api.questions.createQuestion>;

interface CreateEditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: QuestionFormValues;
  onSubmit?: (data: SubmitFormValues) => void;
  onEdit?: (id: Id<"questions">, data: SubmitFormValues) => void;
  editId?: Id<"questions">;
  disable?: boolean;
  subjectsOptions?: {
    label: string | undefined;
    value: Id<"subjects"> | undefined;
  }[];
  mode: "create" | "edit";
}

export default function CreateEditQuestionDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  onEdit,
  editId,
  disable,
  subjectsOptions,
  mode
}: CreateEditQuestionDialogProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    } else {
      form.reset()
    }
  }, [defaultValues, form]);

  const handleSubmit = (data: QuestionFormValues) => {
    const submitData: SubmitFormValues = {
      questionText: data.text,
      subjectId: data.subject as Id<"subjects">,
      questionType: data.type,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      status: data.status,
      marks: data.marks,
      difficultyLevel: data.difficulty,
      options: data.options?.length ? data.options : undefined,
      correctTrueFalseAnswer: data.correctAnswer,
      answerText: data.answer,
    };

    if(mode == "edit" && onEdit && editId) {
      onEdit(editId, submitData);
    } else {
      onSubmit?.(submitData);
    }
    form.reset();
    onOpenChange(false);
  };

  const type = form.watch("type");

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Question" : "Add Question"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues
              ? "Edit the details of the question."
              : "Fill in the details to create a new question."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectsOptions?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value?.toString() || ""}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="pl-10">
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        {["mcq", "saq", "true_false", "fill_in_the_blank"].map(
                          (type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/_/g, " ").toUpperCase()}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {["easy", "medium", "hard"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter question" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "mcq" && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Options</FormLabel>
                    {(field.value || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...(field.value || [])];
                            newOptions[index].text = e.target.value;
                            field.onChange(newOptions);
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Switch
                          checked={option.isCorrect}
                          onCheckedChange={(checked) => {
                            const newOptions = [...(field.value || [])];
                            newOptions[index].isCorrect = checked;
                            field.onChange(newOptions);
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={() =>
                            field.onChange(
                              (field.value || []).filter((_, i) => i !== index)
                            )
                          }
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() =>
                        field.onChange([
                          ...(field.value || []),
                          { text: "", isCorrect: false },
                        ])
                      }
                    >
                      Add Option
                    </Button>
                  </FormItem>
                )}
              />
            )}

            {(type === "saq" || type === "fill_in_the_blank") && (
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Input placeholder="Answer" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {type === "true_false" && (
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === "true")}
                      value={field.value ? "true" : "false"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select true or false" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Comma separated tags" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={disable}>
                {defaultValues ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
