// FILE: frontend/src/hooks/useToast.ts
import { create } from 'zustand';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 5000) => {
    const id = uuidv4();
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    if (duration && duration > 0) {
      const timeout = setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);

      // Clean up timeout if toast is removed manually before time
      return () => clearTimeout(timeout);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// ------------------
// ToastContainer Component
// ------------------

import React from 'react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Optional: Auto-cleanup for unmounted component
  useEffect(() => {
    return () => {
      toasts.forEach((toast) => removeToast(toast.id));
    };
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const baseClasses =
          'px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm border-l-4 animate-slide-up max-w-md transition-all duration-300';
        const typeClasses =
          toast.type === 'success'
            ? 'bg-green-900/90 border-green-500'
            : toast.type === 'error'
            ? 'bg-red-900/90 border-red-500'
            : toast.type === 'warning'
            ? 'bg-yellow-900/90 border-yellow-500'
            : 'bg-blue-900/90 border-blue-500';

        return (
          <div key={toast.id} className={`${baseClasses} ${typeClasses}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-white text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
