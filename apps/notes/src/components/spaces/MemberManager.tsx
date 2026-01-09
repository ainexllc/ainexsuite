'use client';

import { MemberManager as SharedMemberManager } from '@ainexsuite/ui';
import { useSpaces } from '../providers/spaces-provider';
import { useAuth } from '@ainexsuite/auth';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Notes app MemberManager - wraps the shared component
 */
export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { user } = useAuth();
  const { currentSpace, updateSpace } = useSpaces();

  return (
    <SharedMemberManager
      isOpen={isOpen}
      onClose={onClose}
      currentSpace={currentSpace}
      user={user}
      updateSpace={updateSpace}
      appId="notes"
      appName="Notes"
      appColor="bg-amber-500"
    />
  );
}
