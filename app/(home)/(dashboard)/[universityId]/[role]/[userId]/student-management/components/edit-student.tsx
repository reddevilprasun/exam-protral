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
import { useGetDepartment } from "../../department-management/api/use-get-department";
import { useGetBatch } from "../../batch-management/api/use-get-batch";
import { useOpenStudent } from "../hooks/use-open-student";
import { useGetStudentById } from "../api/use-get-studentById";
import { useEditStudent } from "../api/use-edit-student";
import { EditStudentForm } from "./student-edit-form";
type formValues = FunctionArgs<typeof api.user.updateStudent>;
export const EditStudentSheet = () => {
  const { isOpen, onClose, id } = useOpenStudent();
  const { data: student } = useGetStudentById(id);
  const { mutated:editMutation, isPending:editMutationPending } = useEditStudent();
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

  const isPending = editMutationPending;

  const onSubmit = (values: formValues) => {
    editMutation(values, {
      onSuccess: () => {
        toast.success("Student updated successfully");
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

  const defaultValues = {
    firstName: student?.firstName,
    lastName: student?.lastName,
    email: student?.email,
    academicId: student?.academicId ?? 0,
    departmentId: student?.departmentId?.toString() ?? "",
    courseId: student?.courseId?.toString() ?? "",
    batchId: student?.batchId?.toString() ?? "",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>
            Edit Student Details
          </SheetTitle>
          <SheetDescription>
            Update the details below to modify the student&apos;s information.
          </SheetDescription>
        </SheetHeader>
        <EditStudentForm
          _id={id}
          defaultValues={defaultValues}
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
