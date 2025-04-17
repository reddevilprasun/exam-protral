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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/app/(home)/components/date.picker";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  courseId: z.string().min(1, {
    message: "Select a Department."
  }),
  name: z.string().min(2, {
    message: "Batch name must be at least 2 characters.",
  }),
  academicYear: z.string().min(4, {
    message: "Academic year must be at least 4 characters.",
  }),
  startDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Start date must be in the future.",
  }),
  endDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "End date must be in the future.",
  }),
});

type FormValues = z.infer<typeof formSchema>;
type SubmitFormValues = FunctionArgs<typeof api.university.createBatch>;

interface CreateBatchFormProps {
  _id?: Id<"batches">;
  onSubmit: (values: SubmitFormValues) => void;
  defaultValues?: FormValues;
  departmentOptions: { label: string; value: Id<"courses"> }[];
  disable?: boolean;
  onDelete?: () => void;
}

export const CreateBatchForm = ({
  _id,
  onSubmit,
  defaultValues,
  disable,
  onDelete,
  departmentOptions,
}: CreateBatchFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    const transformedValues: SubmitFormValues = {
      ...values,
      courseId: values.courseId as Id<"courses">,
      startDate: values.startDate.getTime(),
      endDate: values.endDate.getTime(),
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
              <FormLabel>Batch Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. BCS 2023"
                  disabled={disable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="courseId"
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
          name="academicYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year</FormLabel>
              <FormControl>
                <Input
                  disabled={disable}
                  {...field}
                  placeholder="e.g. 2023-2024"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className=" w-full" disabled={disable}>
          {_id ? "Save Changes" : "Create Batch"}
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
            Delete Batch
          </Button>
        )}
      </form>
    </Form>
  );
};
