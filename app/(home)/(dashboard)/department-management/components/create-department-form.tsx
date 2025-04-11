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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Department name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Department code must be at least 2 characters.",
  }),
  description: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateDepartmentFormProps {
  _id?: Id<"courses">;
  onSubmit: (values: FormValues) => void;
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
}: CreateDepartmentFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
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
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disable}
                  {...field}
                  placeholder="e.g. Computer Science"
                />
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
              <FormLabel>Department Code</FormLabel>
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
          {_id ? "Save Changes" : "Create Department"}
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
            Delete Department
          </Button>
        )}
      </form>
    </Form>
  );
};
