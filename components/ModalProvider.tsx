import React, { useState, useCallback } from 'react';
import { ModalContext, ModalType, ModalPayload } from '../context/ModalContext';

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
  const [payload, setPayload] = useState<ModalPayload | null>(null);

  const openModal = useCallback((modal: ModalType, modalPayload: ModalPayload = {}) => {
    setCurrentModal(modal);
    setPayload(modalPayload);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentModal(null);
    setPayload(null);
  }, []);

  const value = { openModal, closeModal, currentModal, payload };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
} 