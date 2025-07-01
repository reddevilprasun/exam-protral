import { create } from 'zustand';

type NewDepartmentState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewCourse = create<NewDepartmentState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));