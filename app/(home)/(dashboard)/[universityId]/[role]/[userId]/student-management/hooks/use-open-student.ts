import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand"

type OpenStudentState = {
  id?: Id<"studentEnrollments">
  isOpen: boolean
  onOpen: (id:Id<"studentEnrollments">) => void
  onClose: () => void
};

export const useOpenStudent = create<OpenStudentState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id:Id<"studentEnrollments">) => set({ id, isOpen: true }),
  onClose: () => set({ id: undefined, isOpen: false }),
}));