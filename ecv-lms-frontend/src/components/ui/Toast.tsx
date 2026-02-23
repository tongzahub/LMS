'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
};

const styles: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
  warning: 'border-yellow-200 bg-yellow-50',
};

function Toast({ message, variant = 'info', isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (!isVisible || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles[variant]}`}
      role="alert"
      aria-live="assertive"
    >
      {icons[variant]}
      <p className="text-sm text-gray-800">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export { Toast };
