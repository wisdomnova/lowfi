'use client';

import React from 'react';
import Toast from './Toast';
import { useToast } from '@/lib/toast';

/**
 * ToastProvider Component
 * 
 * Wraps the application to enable toast notifications globally.
 * Must be placed in a client component within the root layout.
 */
export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </>
  );
}