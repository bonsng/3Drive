import { create } from 'zustand';
import type { ModalType, ModalPropsMap } from '@/types/modal';

type ModalOpenArgs<T extends ModalType> =
  ModalPropsMap[T] extends Record<string, never> ? [type: T] : [type: T, props: ModalPropsMap[T]];

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  props: ModalPropsMap[ModalType] | null;
}

interface ModalActions {
  open: <T extends ModalType>(...args: ModalOpenArgs<T>) => void;
  close: () => void;
  reset: () => void;
}

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  isOpen: false,
  modalType: null,
  props: null,
  open: (...args) => set({ isOpen: true, modalType: args[0], props: args[1] ?? null }),
  close: () => set({ isOpen: false }),
  reset: () => set({ modalType: null, props: null }),
}));
