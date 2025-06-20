import { createContext, useContext, ReactNode } from 'react';

export type ModalType = 'addServer' | 'globalSettings' | 'addMods';

export interface ModalPayload {
  serverId?: string;
  [key: string]: any;
}

interface ModalContextType {
  openModal: (modal: ModalType, payload?: ModalPayload) => void;
  closeModal: () => void;
  currentModal: ModalType | null;
  payload: ModalPayload | null;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
} 