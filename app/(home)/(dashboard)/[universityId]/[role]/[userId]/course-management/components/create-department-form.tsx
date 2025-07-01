import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Department name must be at least 2 characters.",
  }),
  departmentId: z.string().min(1, {
    message: "Select a Department.",
  }),
  code: z.string().min(2, {
    message: "Department code must be at least 2 characters.",
  }),
  description: z.string(),
});

type FormValues = z.infer<typeof formSchema>;
type SubmitFormValues = FunctionArgs<typeof api.university.createCourse>;

interface CreateDepartmentFormProps {
  _id?: Id<"courses">;
  onSubmit: (values: SubmitFormValues) => void;
  departmentOptions: { label: string; value: Id<"department"> }[];
  defaultValues?: FormValues;
  disable?: boolean;
  onDelete?: () => void;
}

export const CreateDepartmentForm = ({
  _id,
  onSubmit,
  defaultValues,
  disable,
  onDelete,
  departmentOptions,
}: CreateDepartmentFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
      const transformedValues: SubmitFormValues = {
        ...values,
        departmentId: values.departmentId as Id<"department">,
      };
      onSubmit(transformedValues);
    };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disable}
                  {...field}
                  placeholder="e.g. B-Tech Computer Science"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Select
                  disabled={disable}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Code</FormLabel>
              <FormControl>
                <Input
                  disabled={disable}
                  {...field}
                  placeholder="e.g. CS"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={disable}
                  {...field}
                  placeholder="Provide a brief description of the department"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className=" w-full" disabled={disable}>
          {_id ? "Save Changes" : "Create Course"}
        </Button>
        {!!_id && (
          <Button
            type="button"
            disabled={disable}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className=" size-4 mr-2" />
            Delete Course
          </Button>
        )}
      </form>
    </Form>
  );
};
