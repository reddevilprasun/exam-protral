import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand"

type OpenDepartmentState = {
  id?: Id<"department">
  isOpen: boolean
  onOpen: (id:Id<"department">) => void
  onClose: () => void
};

export const useOpenDepartment = create<OpenDepartmentState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id:Id<"department">) => set({ id, isOpen: true }),
  onClose: () => set({ id: undefined, isOpen: false }),
}));