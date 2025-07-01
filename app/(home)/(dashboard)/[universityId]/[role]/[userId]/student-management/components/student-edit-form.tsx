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
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  academicId: z
    .number()
    .int()
    .positive("Academic ID must be a positive integer"),
  departmentId: z.string().min(1, "Select a Department."),
  
  courseId: z.string().min(1, "Select a Course."),
  batchId: z.string().min(1, "Select a Batch."),
});

type FormValues = z.infer<typeof formSchema>;
type SubmitFormValues = FunctionArgs<typeof api.user.updateStudent>;

interface CreateStudentFormProps {
  _id?: Id<"studentEnrollments">;
  onSubmit: (values: SubmitFormValues) => void;
  defaultValues: FormValues;
  coursesOptions: {
    label: string | undefined;
    value: Id<"courses"> | undefined;
    departmentId?: Id<"department"> | undefined;
  }[];
  batchesOptions?: {
    label: string | undefined;
    value: Id<"batches"> | undefined;
    courseId?: Id<"courses"> | undefined;
  }[];
  departmentsOptions?: {
    label: string | undefined;
    value: Id<"department"> | undefined;
  }[];
  disable?: boolean;
  onDelete?: () => void;
}

export const EditStudentForm = ({
  _id,
  onSubmit,
  defaultValues,
  disable,
  onDelete,
  coursesOptions,
  departmentsOptions,
  batchesOptions,
}: CreateStudentFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: FormValues) => {
    const transformedValues: SubmitFormValues = {
      courseId: values.courseId as Id<"courses">,
      departmentId: values.departmentId as Id<"department">,
      batchId: values.batchId as Id<"batches">,
      studentId: _id as Id<"studentEnrollments">,
      academicId: values.academicId,
    };
    onSubmit(transformedValues);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  console.log("defaultValues", defaultValues);

  const departmentId = form.watch("departmentId");
  const courseId = form.watch("courseId");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4"
      >
        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly placeholder="e.g. Joe" disabled={disable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly placeholder="e.g. Roy" disabled={disable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@mail.com"
                    {...field}
                    readOnly
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="academicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic ID</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 231001001447"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsOptions?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value as string}
                      >
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
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!departmentId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        departmentId
                          ? "Select Courses"
                          : "Select Department First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesOptions
                      ?.filter((option) => option.departmentId === departmentId)
                      .map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value as string}
                        >
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
          name="batchId"
          render={({field}) => (
            <FormItem>
              <FormLabel>Batch</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!courseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Batch"/>
                  </SelectTrigger>
                  <SelectContent>
                    {batchesOptions?.filter(
                      (option) => option.courseId == courseId
                    ).map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value as string}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button className=" w-full" disabled={disable}>
          {_id ? "Save Changes" : "Create Student"}
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
            Delete Student
          </Button>
        )}
      </form>
    </Form>
  );
};
