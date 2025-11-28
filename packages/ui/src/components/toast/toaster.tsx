"use client";

import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

export interface ToasterProps {
  /**
   * Maximum number of toasts to show at once
   * @default 3
   */
  maxToasts?: number;
  /**
   * Position of the toast viewport
   * @default "bottom-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function Toaster({ maxToasts = 3, position = "bottom-right" }: ToasterProps = {}) {
  const { toasts } = useToast();

  // Limit the number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts);

  // Position classes
  const positionClasses = {
    "top-left": "top-0 left-0 sm:top-0 sm:left-0",
    "top-right": "top-0 right-0 sm:top-0 sm:right-0",
    "bottom-left": "bottom-0 left-0 sm:bottom-0 sm:left-0",
    "bottom-right": "top-0 sm:bottom-0 sm:right-0 sm:top-auto",
  };

  return (
    <ToastProvider swipeDirection={position.includes("right") ? "right" : "left"}>
      {visibleToasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className={positionClasses[position]} />
    </ToastProvider>
  );
}
