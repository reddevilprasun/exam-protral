import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateDepartment } from "../api/use-create-department";
import { useNewDepartment } from "../hooks/use-new-department";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { CreateDepartmentForm } from "./create-department-form";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
type formValues = FunctionArgs<typeof api.university.createDepartment>;
export const NewDepartmentSheet = () => {
  const { isOpen, onClose } = useNewDepartment();
  const { mutated, isPending } = useCreateDepartment();

  const onSubmit = (values: formValues) => {
    mutated(values, {
      onSuccess: () => {
        toast.success("Department created successfully");
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
          <SheetTitle>Create New Department</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new department.
          </SheetDescription>
        </SheetHeader>
        <CreateDepartmentForm onSubmit={onSubmit} disable={isPending} />
      </SheetContent>
    </Sheet>
  );
};
