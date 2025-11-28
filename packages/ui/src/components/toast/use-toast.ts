"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps, ToastVariant } from "./toast";

// Generate unique IDs for toasts
const generateToastId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastInput {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastVariant;
  duration?: number;
}

// Global toast state management
const toastState = {
  toasts: [] as ToastData[],
  listeners: [] as Array<(toasts: ToastData[]) => void>,

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },

  emit() {
    this.listeners.forEach((listener) => listener(this.toasts));
  },

  add(toast: Omit<ToastData, "id">) {
    const id = generateToastId();
    this.toasts = [...this.toasts, { ...toast, id }];
    this.emit();

    // Auto-dismiss after duration (default: 5000ms)
    const duration = typeof toast.duration === "number" ? toast.duration : 5000;
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  },

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.emit();
  },

  clear() {
    this.toasts = [];
    this.emit();
  },
};

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    return toastState.subscribe(setToasts);
  }, []);

  return {
    toasts,
    toast: (data: ToastInput) => {
      return toastState.add(data);
    },
    dismiss: (id: string) => toastState.remove(id),
    clear: () => toastState.clear(),
  };
}

// Convenience methods for common toast variants
export const toast = {
  default: (data: Omit<ToastInput, "variant">) =>
    toastState.add({ ...data, variant: "default" }),
  success: (data: Omit<ToastInput, "variant">) =>
    toastState.add({ ...data, variant: "success" }),
  error: (data: Omit<ToastInput, "variant">) =>
    toastState.add({ ...data, variant: "error" }),
  warning: (data: Omit<ToastInput, "variant">) =>
    toastState.add({ ...data, variant: "warning" }),
  info: (data: Omit<ToastInput, "variant">) =>
    toastState.add({ ...data, variant: "info" }),
  dismiss: (id: string) => toastState.remove(id),
  clear: () => toastState.clear(),
};
