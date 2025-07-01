import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { useGetCourse } from "../../course-management/api/use-get-department";
import { useNewSubject } from "../hooks/use-new-subject";
import { useCreateSubject } from "../api/use-create-subject";
import { CreateSubjectForm } from "./create-subject-form";
import { useGetDepartment } from "../../department-management/api/use-get-department";
type formValues = FunctionArgs<typeof api.university.createSubject>;
export const NewSubjectSheet = () => {
  const { isOpen, onClose } = useNewSubject();
  const { mutated, isPending } = useCreateSubject();
  const courses = useGetCourse();
  const departments = useGetDepartment();
  const departmentsOptions = (departments.data || []).map((department) => ({
    label: department.name,
    value: department._id,
  }));
  const coursesOptions = (courses.data || []).map((course) => ({
    label: course?.name,
    value: course?.id,
    departmentId: course?.department.id,
  }));

  const onSubmit = (values: formValues) => {
    mutated(values, {
      onSuccess: () => {
        toast.success("Subject created successfully");
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
      <SheetContent className="space-y-4 w-[500px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Create New Subject</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new subject.
          </SheetDescription>
        </SheetHeader>
        <CreateSubjectForm
          onSubmit={onSubmit}
          disable={isPending}
          coursesOptions={coursesOptions}
          departmentsOptions={departmentsOptions}
        />
      </SheetContent>
    </Sheet>
  );
};
