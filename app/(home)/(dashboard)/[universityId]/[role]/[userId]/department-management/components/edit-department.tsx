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
import { useEditDepartment } from "../api/use-edit-department";
import { Id } from "@/convex/_generated/dataModel";
import { useOpenDepartment } from "../hooks/use-open-department";
import { useDeleteDepartment } from "../api/use-delete-department";
import { useGetDepartmentById } from "../api/use-get-departmentById";
import { useConfirmModal } from "@/hooks/use-confirm-model";
type formValues = {
  _id: Id<"department">;
  name: string;
  description: string;
};
export const EditDepartmentSheet = () => {
  const { isOpen, onClose, id } = useOpenDepartment();
  const { data: department } = useGetDepartmentById(id);
  const { mutated: editMutation, isPending: editMutationPending } =
    useEditDepartment();
  const { mutated: deleteMutation, isPending: deleteMutationPending } =
    useDeleteDepartment();

  const [confirm, ConfirmationModel] = useConfirmModal(
    "Are you sure?",
    "Are you sure you want to delete this department? This action cannot be undone."
  );
  const isPending = editMutationPending || deleteMutationPending;

  const onSubmit = (values: Omit<formValues, "_id">) => {
    if (!id) {
      toast.error("Department ID is missing.");
      return;
    }
    editMutation(
      { _id: id, ...values },
      {
        onSuccess: () => {
          toast.success("Department edited successfully");
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
          toast.success("Department deleted successfully");
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
    name: department?.name || "",
    description: department?.description || "",
  };
  if (!department) return null;

  return (
    <>
      <ConfirmationModel />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Department</SheetTitle>
            <SheetDescription>
              Update the details of the department.
            </SheetDescription>
          </SheetHeader>
          <CreateDepartmentForm
            _id={department._id}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            disable={isPending}
            onDelete={onDelete}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
