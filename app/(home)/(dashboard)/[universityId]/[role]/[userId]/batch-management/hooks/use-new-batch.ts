import { create } from 'zustand';

type NewBatchState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewBatch = create<NewBatchState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));