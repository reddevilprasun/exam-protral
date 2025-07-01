import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand"

type OpenSubjectState = {
  id?: Id<"subjects">
  isOpen: boolean
  onOpen: (id:Id<"subjects">) => void
  onClose: () => void
};

export const useOpenSubject = create<OpenSubjectState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id:Id<"subjects">) => set({ id, isOpen: true }),
  onClose: () => set({ id: undefined, isOpen: false }),
}));