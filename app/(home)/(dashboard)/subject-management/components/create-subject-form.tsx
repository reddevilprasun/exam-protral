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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Id } from "@/convex/_generated/dataModel";
import { Trash } from "lucide-react";

const formSchema = z.object({
  subjectCode: z.string().min(2, {
    message: "Subject code must be at least 2 characters.",
  }),
  creditHours: z.string().min(1, {
    message: "Credit hours must be at least 1 character.",
  }),
  subjectName: z.string().min(2, {
    message: "Subject name must be at least 2 characters.",
  }),
  departmentId: z.string().min(1, {
    message: "Select a Department.",
  }),
  status: z.enum(["active", "inactive"]).optional(),
  courseId: z.string().min(1, {
    message: "Select a Course.",
  }),
  semester: z.string().min(1, {
    message: "Select a Semester.",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type SubmitFormValues = FunctionArgs<typeof api.university.createSubject>;

interface CreateSubjectFormProps {
  _id?: Id<"subjects">;
  onSubmit: (values: SubmitFormValues) => void;
  defaultValues?: FormValues;
  coursesOptions?: {
    label: string | undefined;
    value: Id<"courses"> | undefined;
    departmentId: Id<"department"> | undefined;
  }[];
  departmentsOptions: { label: string; value: Id<"department"> }[];
  disable?: boolean;
  onDelete?: () => void;
}

export const CreateSubjectForm = ({
  _id,
  onSubmit,
  defaultValues,
  coursesOptions,
  departmentsOptions,
  disable,
  onDelete,
}: CreateSubjectFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleDelete = () => {
    onDelete?.();
  };
  const handleSubmit = (values: FormValues) => {
    const transformedValues: SubmitFormValues = {
      code: values.subjectCode,
      name: values.subjectName,
      creditHours: parseInt(values.creditHours, 10),
      semester: parseInt(values.semester, 10),
      courseId: values.courseId as Id<"courses">,
      description: values.description,
      status: values.status || "active",
    };
    onSubmit(transformedValues);
  };

  const departmentId = form.watch("departmentId");

  // // Reset courseId when department changes
  // useEffect(() => {
  //   form.setValue("courseId", ""); // reset course selection
  // }, [departmentId]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4 w-full"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subjectCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Code</FormLabel>
                <FormControl>
                  <Input placeholder="Subject Code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="creditHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Hours</FormLabel>
                <FormControl>
                  <Input placeholder="Credit Hours" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subjectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="Subject Name" {...field} />
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
                    {departmentsOptions.map(
                      (option) =>
                        option.value && (
                          <SelectItem key={option.value} value={option.value ?? ""}>
                            {option.label}
                          </SelectItem>
                        )
                    )}
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
          render={({ field }) => {
            const filteredCourses = coursesOptions?.filter(
              (course) => course.departmentId === departmentId
            );

            return (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <FormControl>
                  <Select
                    disabled={!departmentId || disable}
                    onValueChange={field.onChange}
                    value={field.value}
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
                      {filteredCourses?.length === 0 ? (
                        <SelectItem disabled value="__no_courses__">
                          No courses available
                        </SelectItem>
                      ) : (
                        filteredCourses?.map((option) => (
                          <SelectItem key={option.value} value={option.value ?? ""}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <FormControl>
                  <Select
                    disabled={disable}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          Semester {sem}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    disabled={disable}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["active", "inactive"].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
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
                <Textarea placeholder="Description" {...field} />
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
