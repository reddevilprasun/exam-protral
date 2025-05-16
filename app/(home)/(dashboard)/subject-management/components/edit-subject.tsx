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
import { CreateSubjectForm } from "./create-subject-form";
import { useGetDepartment } from "../../department-management/api/use-get-department";
import { useOpenSubject } from "../hooks/use-open-subject";
import { useGetSubjectById } from "../api/use-get-subjectById";
import { useEditSubject } from "../api/use-edit-subject";
import { useDeleteSubjects } from "../api/use-delete-subject";
import { useConfirmModal } from "@/hooks/use-confirm-model";
type formValues = FunctionArgs<typeof api.university.createSubject>;
export const EditSubjectSheet = () => {
  const { isOpen, onClose, id } = useOpenSubject();
  const { data: subject } = useGetSubjectById(id);
  const departments = useGetDepartment();
  const courses = useGetCourse();
  const { mutated: editMutation, isPending: editMutationPending } =
    useEditSubject();
  const { mutated: deleteMutation, isPending: deleteMutationPending } =
    useDeleteSubjects();
  const isPending = editMutationPending || deleteMutationPending;
  const departmentsOptions = (departments.data || []).map((department) => ({
    label: department.name,
    value: department._id,
  }));
  const coursesOptions = (courses.data || []).map((course) => ({
    label: course?.name,
    value: course?.id,
    departmentId: course?.department.id,
  }));

  const [confirm, ConfirmationModel] = useConfirmModal(
    "Are you sure?",
    "Are you sure you want to delete this subject? This action cannot be undone."
  );

  const onSubmit = (values: formValues) => {
    if (!id) {
      toast.error("Subject ID is missing.");
      return;
    }
    editMutation(
      { _id: id, ...values },
      {
        onSuccess: () => {
          toast.success("Subject edited successfully");
          onClose();
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error(errorMessage);
        },
      }
    );
  };
  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }
    if (!id) {
      toast.error("Subject ID is missing.");
      return;
    }
    deleteMutation(
      { id },
      {
        onSuccess: () => {
          toast.success("Subject deleted successfully");
          onClose();
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error(errorMessage);
        },
      }
    );
  };

  const defaultValues = {
    subjectName: subject?.name || "",
    subjectCode: subject?.code || "",
    courseId: subject?.course.id || "",
    departmentId: subject?.department.id || "",
    creditHours: subject?.creditHours?.toString() || "",
    semester: subject?.semester?.toString() || "",
    status: subject?.status || "active",
    description: subject?.description || "",
  };

  if (!subject) return null;

  return (
    <>
      <ConfirmationModel />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 w-[500px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Edit Subject</SheetTitle>
            <SheetDescription>
              Fill in the details to edit the subject.
            </SheetDescription>
          </SheetHeader>
          <CreateSubjectForm
            _id={subject.id}
            onSubmit={onSubmit}
            disable={isPending}
            coursesOptions={coursesOptions}
            departmentsOptions={departmentsOptions}
            onDelete={onDelete}
            defaultValues={defaultValues}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
