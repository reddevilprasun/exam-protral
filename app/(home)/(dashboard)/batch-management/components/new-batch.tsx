import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useNewBatch } from "../hooks/use-new-batch";
import { useCreateBatch } from "../api/use-create-batch";
import { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import { CreateBatchForm } from "./create-batch-form";
import { useGetCourse } from "../../course-management/api/use-get-department";
type formValues = FunctionArgs<typeof api.university.createBatch>
export const NewBatchSheet = () => {
  const { isOpen, onClose } = useNewBatch();
  const { mutated, isPending } = useCreateBatch();
  const courses = useGetCourse();
  const coursesOptions = (courses.data || []).map((course) => ({
    label: course.name,
    value: course._id,
  })); 

  const onSubmit = (values: formValues) => {
    mutated(values, {
      onSuccess: () => {
        toast.success("Batch created successfully");
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
          <SheetTitle>Create New Batch</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new batch.
          </SheetDescription>
        </SheetHeader>
        <CreateBatchForm onSubmit={onSubmit} disable={isPending} coursesOptions={coursesOptions} />
      </SheetContent>
    </Sheet>
  );
};
