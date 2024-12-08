'use client';

import { Toast, useToast } from './Toast';

export default function ToastContainer() {
  const { toasts, close } = useToast();

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => close(toast.id)}
        />
      ))}
    </>
  );
} 