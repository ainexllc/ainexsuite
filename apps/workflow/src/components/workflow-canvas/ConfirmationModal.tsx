'use client';

import { useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmationModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!isOpen) return null;

  const variantColors = {
    danger: {
      icon: '#ef4444',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      confirmBg: 'rgba(239, 68, 68, 0.2)',
      confirmBorder: 'rgba(239, 68, 68, 0.5)',
      confirmText: '#ef4444',
    },
    warning: {
      icon: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.1)',
      confirmBg: 'rgba(245, 158, 11, 0.2)',
      confirmBorder: 'rgba(245, 158, 11, 0.5)',
      confirmText: '#f59e0b',
    },
  };

  const colors = variantColors[variant];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl border shadow-2xl"
        style={{
          backgroundColor: '#0a0a0a',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition-all hover:bg-foreground/10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6">
          {/* Icon */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.iconBg,
            }}
          >
            <AlertTriangle className="h-6 w-6" style={{ color: colors.icon }} />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:bg-foreground/10"
              style={{
                backgroundColor: 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)',
                borderColor: 'rgba(var(--border-rgb, 255, 255, 255), 0.2)',
                color: 'var(--foreground)',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.confirmBg,
                borderColor: colors.confirmBorder,
                color: colors.confirmText,
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
