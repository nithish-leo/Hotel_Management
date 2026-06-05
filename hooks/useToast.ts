'use client';
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;
const listeners = new Set<Listener>();
let toastList: ToastItem[] = [];

export function addToast(message: string, type: ToastType = 'success') {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = { id, message, type };
  toastList = [...toastList, newToast];
  listeners.forEach(listener => listener(toastList));

  setTimeout(() => {
    toastList = toastList.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toastList));
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastList);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => {
      setToasts(newToasts);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts,
    toast: (message: string, type: ToastType = 'success') => addToast(message, type),
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
    warning: (message: string) => addToast(message, 'warning'),
  };
}
