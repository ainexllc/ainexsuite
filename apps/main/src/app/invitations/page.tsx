'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import {
  Button,
  Card,
  Avatar,
  Spinner,
  Modal,
} from '@ainexsuite/ui/components';
import {
  Users,
  Mail,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Home,
  ArrowLeft,
  Inbox,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { SpaceInvitation, SpaceType } from '@ainexsuite/types';

// Space type display configuration
const SPACE_TYPE_CONFIG: Record<SpaceType, { label: string; icon: React.ElementType; color: string }> = {
  personal: { label: 'Personal', icon: Users, color: 'text-blue-500' },
  family: { label: 'Family', icon: Home, color: 'text-green-500' },
  work: { label: 'Work', icon: Shield, color: 'text-purple-500' },
  couple: { label: 'Couple', icon: Users, color: 'text-pink-500' },
  buddy: { label: 'Buddy', icon: Users, color: 'text-orange-500' },
  squad: { label: 'Squad', icon: Users, color: 'text-cyan-500' },
  project: { label: 'Project', icon: Shield, color: 'text-indigo-500' },
};

// Role display configuration
const ROLE_CONFIG: Record<string, { label: string; description: string }> = {
  admin: { label: 'Admin', description: 'Full access to manage the space' },
  member: { label: 'Member', description: 'Can view and contribute' },
  viewer: { label: 'Viewer', description: 'Read-only access' },
};

type ActionState = { [key: string]: 'accepting' | 'declining' | 'idle' };

interface ReplacementConfirmation {
  invitation: SpaceInvitation;
  existingSpaceId: string;
  existingSpaceName: string;
  spaceType: string;
}

export default function InvitationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [invitations, setInvitations] = useState<SpaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionStates, setActionStates] = useState<ActionState>({});
  const [respondedInvitations, setRespondedInvitations] = useState<Set<string>>(new Set());
  const [replacementConfirmation, setReplacementConfirmation] = useState<ReplacementConfirmation | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError('');

      // Fetch via API route that combines both email and UID queries
      const response = await fetch('/api/spaces/invite/pending');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitations');
      }

      setInvitations(data.invitations || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchInvitations();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchInvitations]);

  // Handle accept invitation
  const handleAccept = async (invitation: SpaceInvitation, confirmReplacement = false) => {
    setActionStates((prev) => ({ ...prev, [invitation.id]: 'accepting' }));

    try {
      const response = await fetch('/api/spaces/invite/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          spaceCollection: 'spaces',
          action: 'accept',
          confirmReplacement,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      // Check if confirmation is required (user has existing space of same type)
      if (data.requiresConfirmation) {
        setReplacementConfirmation({
          invitation,
          existingSpaceId: data.existingSpaceId,
          existingSpaceName: data.existingSpaceName,
          spaceType: data.spaceType,
        });
        setActionStates((prev) => ({ ...prev, [invitation.id]: 'idle' }));
        return;
      }

      setRespondedInvitations((prev) => new Set([...prev, invitation.id]));
      // Remove from list after short delay
      setTimeout(() => {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
      }, 1500);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setActionStates((prev) => ({ ...prev, [invitation.id]: 'idle' }));
    }
  };

  // Handle confirmed replacement acceptance
  const handleConfirmReplacement = async () => {
    if (!replacementConfirmation) return;

    setIsConfirming(true);
    try {
      await handleAccept(replacementConfirmation.invitation, true);
      setReplacementConfirmation(null);
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle decline invitation
  const handleDecline = async (invitation: SpaceInvitation) => {
    setActionStates((prev) => ({ ...prev, [invitation.id]: 'declining' }));

    try {
      const response = await fetch('/api/spaces/invite/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          spaceCollection: 'spaces',
          action: 'decline',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }

      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError('Failed to decline invitation. Please try again.');
    } finally {
      setActionStates((prev) => ({ ...prev, [invitation.id]: 'idle' }));
    }
  };

  // Format expiration date
  const formatExpiration = (timestamp: number): string => {
    const now = Date.now();
    const diffMs = timestamp - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;

    return `Expires ${new Date(timestamp).toLocaleDateString()}`;
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Sign In Required</h1>
            <p className="text-text-muted">
              Please sign in to view your pending invitations.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-text-muted">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border-primary bg-surface-primary sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-text-primary">Invitations</h1>
              <p className="text-sm text-text-muted">
                {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {invitations.length === 0 && !error && (
          <Card className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
              <Inbox className="w-8 h-8 text-text-muted" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text-primary">No Pending Invitations</h2>
              <p className="text-text-muted">
                When someone invites you to join a space, it will appear here.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/workspace')}
            >
              Go to Workspace
            </Button>
          </Card>
        )}

        {/* Invitations list */}
        {invitations.map((invitation) => {
          const spaceConfig = SPACE_TYPE_CONFIG[invitation.spaceType];
          const SpaceIcon = spaceConfig?.icon || Users;
          const roleConfig = ROLE_CONFIG[invitation.role];
          const actionState = actionStates[invitation.id] || 'idle';
          const isResponded = respondedInvitations.has(invitation.id);
          const isExpired = invitation.expiresAt < Date.now();
          const isLoading = actionState === 'accepting' || actionState === 'declining';

          return (
            <Card key={invitation.id} className="p-6 space-y-4">
              {/* Inviter info */}
              <div className="flex items-center gap-4">
                <Avatar
                  src={invitation.invitedByPhoto}
                  name={invitation.invitedByName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {invitation.invitedByName || 'Someone'}
                  </p>
                  <p className="text-sm text-text-muted">
                    invited you {formatRelativeTime(invitation.invitedAt)}
                  </p>
                </div>
              </div>

              {/* Space info */}
              <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl border border-border-secondary">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${spaceConfig?.color || 'text-primary'} bg-current/10`}>
                  <SpaceIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{invitation.spaceName}</h3>
                  <p className="text-sm text-text-muted">
                    {spaceConfig?.label || invitation.spaceType} Space
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {roleConfig?.label || invitation.role}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>{invitation.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className={isExpired ? 'text-red-500' : ''}>
                    {formatExpiration(invitation.expiresAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {!isResponded && !isExpired && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={() => handleAccept(invitation)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {actionState === 'accepting' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDecline(invitation)}
                    disabled={isLoading}
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {actionState === 'declining' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Declining...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Accepted feedback */}
              {isResponded && (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Invitation accepted!</span>
                </div>
              )}

              {/* Expired notice */}
              {isExpired && !isResponded && (
                <div className="flex items-center justify-center gap-2 py-2 text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">This invitation has expired</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Replacement Confirmation Modal */}
      <Modal
        isOpen={!!replacementConfirmation}
        onClose={() => setReplacementConfirmation(null)}
        size="sm"
      >
        {replacementConfirmation && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Replace Existing Space?</h2>

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  You already have a {SPACE_TYPE_CONFIG[replacementConfirmation.spaceType as SpaceType]?.label || replacementConfirmation.spaceType} space
                </p>
                <p className="text-text-muted mt-1">
                  Joining &quot;{replacementConfirmation.invitation.spaceName}&quot; will delete your existing space &quot;{replacementConfirmation.existingSpaceName}&quot; and all its data.
                </p>
              </div>
            </div>

            <p className="text-sm text-text-muted">
              This action cannot be undone. Are you sure you want to continue?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setReplacementConfirmation(null)}
                disabled={isConfirming}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReplacement}
                disabled={isConfirming}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  'Replace & Join'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
