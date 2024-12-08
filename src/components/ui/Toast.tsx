'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'loading';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  const Icon = type === 'success' ? CheckCircle :
              type === 'error' ? AlertCircle :
              Loader2;

  const bgColor = type === 'success' ? 'bg-green-600' : 
                 type === 'error' ? 'bg-red-600' : 
                 'bg-blue-600';

  return createPortal(
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-white ${bgColor} shadow-lg transition-all duration-200 ease-in-out`}>
      <Icon className={`w-5 h-5 ${type === 'loading' ? 'animate-spin' : ''}`} />
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
        <X className="w-4 h-4" />
      </button>
    </div>,
    document.body
  );
} 