import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand"

type OpenBatchState = {
  id?: Id<"batches">
  isOpen: boolean
  onOpen: (id:Id<"batches">) => void
  onClose: () => void
};

export const useOpenBatch = create<OpenBatchState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id:Id<"batches">) => set({ id, isOpen: true }),
  onClose: () => set({ id: undefined, isOpen: false }),
}));