import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateCourse } from "../api/use-create-department";
import { useNewCourse } from "../hooks/use-new-department";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { CreateDepartmentForm } from "./create-department-form";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { useGetDepartment } from "../../department-management/api/use-get-department";
type formValues = FunctionArgs<typeof api.university.createCourse>;
export const NewCourseSheet = () => {
  const { isOpen, onClose } = useNewCourse();
  const { mutated, isPending } = useCreateCourse();
  const departments = useGetDepartment();
  const departmentOptions = (departments.data || []).map((department) => ({
    label: department.name,
    value: department._id,
  }));

  const onSubmit = (values: formValues) => {
    mutated(values, {
      onSuccess: () => {
        toast.success("Course created successfully");
        onClose();
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Create New Course</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new course.
          </SheetDescription>
        </SheetHeader>
        <CreateDepartmentForm onSubmit={onSubmit} disable={isPending} departmentOptions={departmentOptions} />
      </SheetContent>
    </Sheet>
  );
};
