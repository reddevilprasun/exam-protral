import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { CreateDepartmentForm } from "./create-department-form";
import { useEditCourse } from "../api/use-edit-department";
import { Id } from "@/convex/_generated/dataModel";
import { useOpenCourse } from "../hooks/use-open-department";
import { useDeleteCourse } from "../api/use-delete-department";
import { useGetCourseById } from "../api/use-get-departmentById";
import { useConfirmModal } from "@/hooks/use-confirm-model";
import { useGetDepartment } from "../../department-management/api/use-get-department";
type formValues = {
  _id: Id<"courses">;
  name: string;
  departmentId: Id<"department">;
  code: string;
  description: string;
};
export const EditCourseSheet = () => {
  const { isOpen, onClose, id } = useOpenCourse();
  const { data: course } = useGetCourseById(id);
  const { mutated: editMutation, isPending: editMutationPending } =
    useEditCourse();
  const { mutated: deleteMutation, isPending: deleteMutationPending } =
    useDeleteCourse();

  const departments = useGetDepartment();
    const departmentOptions = (departments.data || []).map((department) => ({
      label: department.name,
      value: department._id,
    }));

  const [confirm, ConfirmationModel] = useConfirmModal(
    "Are you sure?",
    "Are you sure you want to delete this course? This action cannot be undone."
  );
  const isPending = editMutationPending || deleteMutationPending;

  const onSubmit = (values: Omit<formValues, "_id">) => {
    if (!id) {
      toast.error("Course ID is missing.");
      return;
    }
    editMutation(
      { _id: id, ...values },
      {
        onSuccess: () => {
          toast.success("Course edited successfully");
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
    if (!ok) return;
    if (!id) return;
    deleteMutation(
      { id },
      {
        onSuccess: () => {
          toast.success("Course deleted successfully");
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
    name: course?.name || "",
    code: course?.code || "",
    departmentId: course?.departmentId || "",
    description: course?.description || "",
  };
  if (!course) return null;

  return (
    <>
      <ConfirmationModel />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Course</SheetTitle>
            <SheetDescription>
              Update the details of the course.
            </SheetDescription>
          </SheetHeader>
          <CreateDepartmentForm
            _id={course._id}
            onSubmit={onSubmit}
            departmentOptions={departmentOptions}
            defaultValues={defaultValues}
            disable={isPending}
            onDelete={onDelete}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
