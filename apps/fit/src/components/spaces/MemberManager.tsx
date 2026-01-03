'use client';

import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent } from '@ainexsuite/ui';
import { Users } from 'lucide-react';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for managing space members.
 * Placeholder - will be expanded when space sharing is implemented.
 */
export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Manage Members</ModalTitle>
        <ModalDescription>
          Invite family members or workout buddies to share your fitness journey.
        </ModalDescription>
      </ModalHeader>
      <ModalContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Member management for shared fitness spaces is coming in a future update.
          </p>
        </div>
      </ModalContent>
    </Modal>
  );
}
