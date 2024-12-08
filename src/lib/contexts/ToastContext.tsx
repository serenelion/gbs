'use client';

import React, { createContext, useContext, useState } from 'react';
import { Toast } from '@/components/ui/Toast';

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    loading: (message: string) => void;
    close: (id: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'loading' }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'loading') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  };

  const closeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = {
    toast: {
      success: (message: string) => addToast(message, 'success'),
      error: (message: string) => addToast(message, 'error'),
      loading: (message: string) => addToast(message, 'loading'),
      close: closeToast,
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => closeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
} 