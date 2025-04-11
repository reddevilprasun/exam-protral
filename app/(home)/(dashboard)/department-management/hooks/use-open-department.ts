import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand"

type OpenDepartmentState = {
  id?: Id<"courses">
  isOpen: boolean
  onOpen: (id:Id<"courses">) => void
  onClose: () => void
};

export const useOpenDepartment = create<OpenDepartmentState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id:Id<"courses">) => set({ id, isOpen: true }),
  onClose: () => set({ id: undefined, isOpen: false }),
}));