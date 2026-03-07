import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;

// Global setter — populated by ToastManager
let addToastGlobal: ((message: string, type: ToastType) => void) | null = null;

export const registerToast = (fn: (message: string, type: ToastType) => void) => {
  addToastGlobal = fn;
};

export const toast = {
  success: (msg: string) => addToastGlobal?.(msg, 'success'),
  error:   (msg: string) => addToastGlobal?.(msg, 'error'),
  info:    (msg: string) => addToastGlobal?.(msg, 'info'),
};

export const useToastManager = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return { toasts, addToast };
};
