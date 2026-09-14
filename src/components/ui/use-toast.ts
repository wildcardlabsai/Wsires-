'use client';

import * as React from 'react';

/**
 * Small toast store (the shadcn/ui pattern). Feedback for every async action
 * in the dashboards goes through here.
 */

type ToastVariant = 'default' | 'success' | 'destructive' | 'info';

export interface ToastData {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: React.ReactNode;
  duration?: number;
  open: boolean;
}

const TOAST_LIMIT = 4;
const TOAST_REMOVE_DELAY = 6000;

let count = 0;
const nextId = () => {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
};

type Listener = (toasts: ToastData[]) => void;

let memoryState: ToastData[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(memoryState));
}

function addToast(toast: Omit<ToastData, 'id' | 'open'>) {
  const id = nextId();
  memoryState = [{ ...toast, id, open: true }, ...memoryState].slice(0, TOAST_LIMIT);
  emit();

  const timeout = toast.duration ?? TOAST_REMOVE_DELAY;
  if (timeout > 0) {
    setTimeout(() => dismissToast(id), timeout);
  }
  return id;
}

function dismissToast(id?: string) {
  memoryState = memoryState.map((t) => (id === undefined || t.id === id ? { ...t, open: false } : t));
  emit();
  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.open);
    emit();
  }, 250);
}

export function toast(input: Omit<ToastData, 'id' | 'open'>) {
  return addToast(input);
}

/** Convenience helpers so call sites read well. */
toast.success = (title: React.ReactNode, description?: React.ReactNode) =>
  addToast({ title, description, variant: 'success' });
toast.error = (title: React.ReactNode, description?: React.ReactNode) =>
  addToast({ title, description, variant: 'destructive', duration: 8000 });
toast.info = (title: React.ReactNode, description?: React.ReactNode) =>
  addToast({ title, description, variant: 'info' });

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>(memoryState);

  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return { toasts, toast, dismiss: dismissToast };
}
