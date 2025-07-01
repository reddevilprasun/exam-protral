import { create } from 'zustand';

type NewStudentState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewStudent = create<NewStudentState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));