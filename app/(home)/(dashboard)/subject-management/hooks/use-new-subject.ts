import { create } from 'zustand';

type NewSubjectState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewSubject = create<NewSubjectState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));