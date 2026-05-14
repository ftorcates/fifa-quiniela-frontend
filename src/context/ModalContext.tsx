import React, { createContext, useContext, useState, useCallback } from 'react';

export type ModalType = 'success' | 'error';

interface ModalContextType {
  show: (message: string, type: ModalType) => void;
  hide: () => void;
  message: string;
  type: ModalType | null;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ModalType | null>(null);

  const show = useCallback((msg: string, modalType: ModalType) => {
    setMessage(msg);
    setType(modalType);
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setMessage('');
      setType(null);
    }, 300);
  }, []);

  return (
    <ModalContext.Provider value={{ show, hide, message, type, isOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
