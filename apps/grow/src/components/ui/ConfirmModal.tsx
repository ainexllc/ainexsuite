'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { Modal, ModalFooter, ModalButton } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    buttonVariant: 'primary' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div
          className={cn(
            'mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4',
            config.iconBg
          )}
        >
          <Icon className={cn('h-7 w-7', config.iconColor)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-white/50 mb-4">{description}</p>
        )}

        {/* Custom content */}
        {children && <div className="mb-4">{children}</div>}

        {/* Actions */}
        <ModalFooter className="justify-center border-t-0 pt-2 mt-2">
          <ModalButton variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </ModalButton>
          <ModalButton
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmText}
          </ModalButton>
        </ModalFooter>
      </div>
    </Modal>
  );
}
