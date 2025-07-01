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
interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: FormValues;
  onSubmit: (values: SubmitFormValues) => void;
  disable?: boolean;
  coursesOptions?: {
    label: string | undefined;
    value: Id<"courses"> | undefined;
    departmentId: Id<"department"> | undefined;
  }[];
  departmentsOptions?: {
    label: string | undefined;
    value: Id<"department"> | undefined;
  }[];
  subjectsOptions?: {
    label: string | undefined;
    value: Id<"subjects"> | undefined;
    courseId: Id<"courses"> | undefined;
  }[];
}

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  role: z.enum(["teacher", "examcontroller", "supervisor"]),
  departmentId: z.optional(z.string()),
  courseId: z.optional(z.string()),
  subjectId: z.optional(z.string()),
  sendInvitation: z.boolean().optional(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;
type SubmitFormValues = FunctionArgs<typeof api.user.supervisorCreateUser>;

export default function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  disable,
  coursesOptions,
  departmentsOptions,
  subjectsOptions,
}: CreateUserDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = async (data: FormValues) => {
    const transformedValues: SubmitFormValues = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      password: data.password,
      sendInvitation: data.sendInvitation,
      departmentId: data.departmentId as Id<"department">,
      courseId: data.courseId as Id<"courses">,
      subjectId: data.subjectId as Id<"subjects">,
    };
    onSubmit(transformedValues);
    form.reset();
    onOpenChange(false);
  };

  const role = form.watch("role");
  const departmentId = form.watch("departmentId");
  const courseId = form.watch("courseId");

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to your university. They will receive an email
            invitation to complete their registration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
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
                        <Input
                          placeholder="Doe"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
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
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {["teacher", "examcontroller", "supervisor"].map(
                              (role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
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
              </div>
              {role === "teacher" && (
                <>
                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
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
                                  ?.filter(
                                    (option) =>
                                      option.departmentId === departmentId
                                  )
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
                  </div>
                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!courseId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjectsOptions
                                  ?.filter(
                                    (option) => option.courseId === courseId
                                  )
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
                  </div>
                </>
              )}
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="sendInvitation"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Send Invitation</FormLabel>
                    </FormItem>
                  )}
                />
                <FormMessage />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={disable}
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disable}>
                Add User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
