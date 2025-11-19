"use client";

import * as React from "react";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from "./modal";
import { Button } from "./buttons";
import { AlertTriangle } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent className="text-center py-6">
        <div className="flex flex-col items-center gap-4">
          {variant === "danger" && (
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          )}

          <div>
            <ModalTitle className="text-center">{title}</ModalTitle>
            <ModalDescription className="mt-2 text-center">
              {description}
            </ModalDescription>
          </div>
        </div>
      </ModalContent>

      <ModalFooter className="justify-center">
        <Button type="button" variant="ghost" onClick={onClose}>
          {cancelText}
        </Button>
        <Button type="button" variant="danger" onClick={handleConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}