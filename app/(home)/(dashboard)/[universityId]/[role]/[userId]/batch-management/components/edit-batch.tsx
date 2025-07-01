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
import { CreateBatchForm } from "./create-batch-form";
import { useOpenBatch } from "../hooks/use-open-batch";
import { useGetBatchById } from "../api/use-get-batchById";
import { useEditBatch } from "../api/use-edit-batch";
import { useDeleteBatch } from "../api/use-delete-batch";
import { useConfirmModal } from "@/hooks/use-confirm-model";
import { useGetCourse } from "../../course-management/api/use-get-department";
type formValues = FunctionArgs<typeof api.university.createBatch>;
export const EditBatchSheet = () => {
  const { isOpen, onClose, id } = useOpenBatch();
  const { data: batch } = useGetBatchById(id);
  const { mutated: editMutation, isPending: editMutationPending } =
    useEditBatch();
  const { mutated: deleteMutation, isPending: deleteMutationPending } =
    useDeleteBatch();
  const isPending = editMutationPending || deleteMutationPending;

  const courses = useGetCourse();
  const coursesOptions = (courses.data || []).map((course) => ({
    label: course?.name,
    value: course?.id,
  }));

  const [confirm, ConfirmationModel] = useConfirmModal(
    "Are you sure?",
    "Are you sure you want to delete this batch? This action cannot be undone.",
  );

  const onSubmit = (values: formValues) => {
    if (!id) {
      toast.error("Batch ID is missing.");
      return;
    }
    editMutation(
      { _id: id, ...values },
      {
        onSuccess: () => {
          toast.success("Batch edited successfully");
          onClose();
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error(errorMessage);
        },
      },
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }
    if (!id) {
      toast.error("Batch ID is missing.");
      return;
    }
    deleteMutation(
      { id },
      {
        onSuccess: () => {
          toast.success("Batch deleted successfully");
          onClose();
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error(errorMessage);
        },
      },
    );
  };

  const defaultValues = {
    courseId: batch?.courseId || "",
    name: batch?.name || "",
    academicYear: batch?.academicYear || "",
    startDate: batch?.startDate ? new Date(batch.startDate) : new Date(),
    endDate: batch?.endDate ? new Date(batch.endDate) : new Date(),
  };
  if (!batch) return null;

  return (
    <>
      <ConfirmationModel />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Batch</SheetTitle>
            <SheetDescription>
              Update the details of the batch.
            </SheetDescription>
          </SheetHeader>
          <CreateBatchForm
            _id={batch._id}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            disable={isPending}
            onDelete={onDelete}
            coursesOptions={coursesOptions}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
