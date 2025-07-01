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
import { useNewStudent } from "../hooks/use-new-student";
import { useCreateStudent } from "../api/use-create-student";
import { useGetDepartment } from "../../department-management/api/use-get-department";
import { useGetBatch } from "../../batch-management/api/use-get-batch";
import { CreateStudentForm } from "./create-student-form";
type formValues = FunctionArgs<typeof api.user.teacherCreateStudent>;
export const NewStudentSheet = () => {
  const { isOpen, onClose } = useNewStudent();
  const { mutated, isPending } = useCreateStudent();
  const courses = useGetCourse();
  const departments = useGetDepartment();
  const batches = useGetBatch();
  const coursesOptions = (courses.data || []).map((course) => ({
    label: course?.name,
    departmentId: course?.department.id,
    value: course?.id,
  }));

  const departmentsOptions = (departments.data || []).map((department) => ({
    label: department?.name,
    value: department?._id,
  }));

  const batchesOptions = (batches.data || []).flatMap((courses) => 
    courses.batches.map((batch) => ({
      label: batch.name,
      value: batch.id,
      courseId: courses.courseId,
    }))
  )

  const onSubmit = (values: formValues) => {
    mutated(values, {
      onSuccess: () => {
        toast.success("Student created successfully");
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
          <SheetTitle>Create New Student</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new student.  
          </SheetDescription>
        </SheetHeader>
        <CreateStudentForm
          onSubmit={onSubmit}
          coursesOptions={coursesOptions}
          departmentsOptions={departmentsOptions}
          batchesOptions={batchesOptions}
          disable={isPending}
        />
      </SheetContent>
    </Sheet>
  );
};
