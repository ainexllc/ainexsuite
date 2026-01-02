'use client';

import { useState } from 'react';
import { Mail, UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { SpaceRole, SpaceType } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../modal';
import { Button } from '../buttons/button';
import { Input, FormField } from '../forms';

export interface InviteMemberModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Space info */
  space: {
    id: string;
    name: string;
    type: SpaceType;
    memberCount: number;
  };
  /** Maximum members allowed (null for unlimited) */
  memberLimit: number | null;
  /** Number of pending invitations */
  pendingInviteCount?: number;
  /** Callback when invitation is sent */
  onInvite: (email: string, role: SpaceRole) => Promise<{ success: boolean; error?: string }>;
}

const SPACE_MEMBER_LIMITS: Record<SpaceType, number | null> = {
  personal: 1,
  couple: 2,
  family: null,
  work: null,
  buddy: 2,
  squad: null,
  project: null,
};

/**
 * InviteMemberModal - Modal for inviting new members to a space
 */
export function InviteMemberModal({
  isOpen,
  onClose,
  space,
  memberLimit,
  pendingInviteCount = 0,
  onInvite,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SpaceRole>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const limit = memberLimit ?? SPACE_MEMBER_LIMITS[space.type];
  const currentTotal = space.memberCount + pendingInviteCount;
  const canInviteMore = limit === null || currentTotal < limit;
  const remainingSlots = limit !== null ? limit - currentTotal : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!canInviteMore) {
      setError(`This ${space.type} space has reached its member limit`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await onInvite(normalizedEmail, role);

      if (result.success) {
        setSuccess(true);
        setEmail('');
        setRole('member');
        // Close after a brief delay to show success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader onClose={handleClose}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <ModalTitle>Invite Member</ModalTitle>
            <ModalDescription>
              Invite someone to join {space.name}
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="space-y-4">
          {/* Member limit info */}
          {limit !== null && (
            <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {space.type.charAt(0).toUpperCase() + space.type.slice(1)} space
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {currentTotal} / {limit} members
                </span>
              </div>
              {remainingSlots !== null && remainingSlots > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  You can invite {remainingSlots} more {remainingSlots === 1 ? 'person' : 'people'}
                </p>
              )}
            </div>
          )}

          {/* Email input */}
          <FormField label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="Enter email address"
                className="pl-10"
                disabled={isLoading || success || !canInviteMore}
              />
            </div>
          </FormField>

          {/* Role selection */}
          <FormField label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as SpaceRole)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              disabled={isLoading || success || !canInviteMore}
            >
              <option value="admin">Admin - Full control</option>
              <option value="member">Member - Can edit</option>
              <option value="viewer">Viewer - Read only</option>
            </select>
          </FormField>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Invitation sent successfully!</span>
            </div>
          )}

          {/* Info about what happens */}
          {!success && canInviteMore && (
            <p className="text-xs text-zinc-500">
              The person will receive an email invitation. If they already have an account,
              they&apos;ll also see a notification in their app.
            </p>
          )}

          {/* Cannot invite more message */}
          {!canInviteMore && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                This {space.type} space has reached its maximum of {limit} members.
                Remove a member or cancel a pending invitation to invite someone new.
              </span>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || success || !email.trim() || !canInviteMore}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Sent!
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default InviteMemberModal;
