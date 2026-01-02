'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import {
  Button,
  Card,
  Avatar,
  Spinner,
} from '@ainexsuite/ui/components';
import {
  Users,
  Mail,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogIn,
  UserPlus,
  Home,
  ArrowRight,
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
  admin: { label: 'Admin', description: 'Full access to manage the space and its members' },
  member: { label: 'Member', description: 'Can view and contribute to the space' },
  viewer: { label: 'Viewer', description: 'Read-only access to the space' },
};

type PageState =
  | 'loading'
  | 'error'
  | 'not-logged-in'
  | 'email-mismatch'
  | 'ready'
  | 'success'
  | 'declined';

type ActionState = 'idle' | 'accepting' | 'declining';

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<SpaceInvitation | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successSpaceName, setSuccessSpaceName] = useState<string>('');

  const token = searchParams.get('token');

  // Fetch invitation details
  const fetchInvitation = useCallback(async () => {
    if (!token) {
      setErrorMessage('No invitation token provided');
      setPageState('error');
      return;
    }

    try {
      const response = await fetch(`/api/spaces/invite/token?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to fetch invitation');
        setPageState('error');
        return;
      }

      setInvitation(data.invitation);

      // Check auth state after we have the invitation
      if (authLoading) {
        setPageState('loading');
      } else if (!user) {
        setPageState('not-logged-in');
      } else if (user.email?.toLowerCase() !== data.invitation.email) {
        setPageState('email-mismatch');
      } else {
        setPageState('ready');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setErrorMessage('Failed to load invitation. Please try again.');
      setPageState('error');
    }
  }, [token, authLoading, user]);

  // Initial fetch
  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  // Update state when auth changes
  useEffect(() => {
    if (invitation && !authLoading) {
      if (!user) {
        setPageState('not-logged-in');
      } else if (user.email?.toLowerCase() !== invitation.email) {
        setPageState('email-mismatch');
      } else {
        setPageState('ready');
      }
    }
  }, [user, authLoading, invitation]);

  // Handle accept invitation
  const handleAccept = async () => {
    if (!invitation) return;

    setActionState('accepting');

    try {
      // Determine spaceCollection based on invitation data
      // For now, we'll use a generic 'spaces' collection
      // In a real scenario, this might be passed in the invitation or determined by spaceType
      const spaceCollection = 'spaces';

      const response = await fetch('/api/spaces/invite/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          spaceCollection,
          action: 'accept',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to accept invitation');
        setActionState('idle');
        setPageState('error');
        return;
      }

      setSuccessSpaceName(data.spaceName || invitation.spaceName);
      setActionState('idle');
      setPageState('success');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setErrorMessage('Failed to accept invitation. Please try again.');
      setActionState('idle');
      setPageState('error');
    }
  };

  // Handle decline invitation
  const handleDecline = async () => {
    if (!invitation) return;

    setActionState('declining');

    try {
      const spaceCollection = 'spaces';

      const response = await fetch('/api/spaces/invite/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          spaceCollection,
          action: 'decline',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to decline invitation');
        setActionState('idle');
        setPageState('error');
        return;
      }

      setActionState('idle');
      setPageState('declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
      setErrorMessage('Failed to decline invitation. Please try again.');
      setActionState('idle');
      setPageState('error');
    }
  };

  // Format expiration date
  const formatExpiration = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = timestamp - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;

    return `Expires ${date.toLocaleDateString()}`;
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-text-muted">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Invitation Error</h1>
            <p className="text-text-muted">{errorMessage}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Welcome to {successSpaceName}!</h1>
            <p className="text-text-muted">
              You have successfully joined the space. You can now access all shared content and collaborate with other members.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => router.push('/workspace')}
              className="w-full"
            >
              Go to Workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Declined state
  if (pageState === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-gray-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Invitation Declined</h1>
            <p className="text-text-muted">
              You have declined the invitation to join {invitation?.spaceName}.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Not logged in state
  if (pageState === 'not-logged-in' && invitation) {
    const spaceConfig = SPACE_TYPE_CONFIG[invitation.spaceType];
    const SpaceIcon = spaceConfig?.icon || Users;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg w-full p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">You&apos;re Invited!</h1>
              <p className="text-text-muted">
                Sign in to accept your invitation to <span className="font-semibold text-text-primary">{invitation.spaceName}</span>
              </p>
            </div>
          </div>

          {/* Invitation Preview */}
          <div className="bg-surface-elevated rounded-xl p-6 space-y-4 border border-border-secondary">
            <div className="flex items-center gap-4">
              <Avatar
                src={invitation.invitedByPhoto}
                name={invitation.invitedByName}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {invitation.invitedByName || 'Someone'}
                </p>
                <p className="text-sm text-text-muted">invited you to join</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border-secondary">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${spaceConfig?.color || 'text-primary'} bg-current/10`}>
                <SpaceIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{invitation.spaceName}</p>
                <p className="text-sm text-text-muted">
                  {spaceConfig?.label || invitation.spaceType} Space
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-muted pt-2">
              <Clock className="w-4 h-4" />
              <span>{formatExpiration(invitation.expiresAt)}</span>
            </div>
          </div>

          {/* Email Notice */}
          <div className="bg-blue-500/10 rounded-lg p-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-text-primary">Sign in with {invitation.email}</p>
              <p className="text-text-muted">This invitation was sent to this email address.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => router.push(`/?from=invite&redirect=${encodeURIComponent(`/invite/accept?token=${token}`)}`)}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Accept
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push(`/?signup=true&from=invite&redirect=${encodeURIComponent(`/invite/accept?token=${token}`)}`)}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Email mismatch state
  if (pageState === 'email-mismatch' && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Wrong Account</h1>
              <p className="text-text-muted">
                This invitation was sent to <span className="font-semibold text-text-primary">{invitation.email}</span>,
                but you&apos;re signed in as <span className="font-semibold text-text-primary">{user?.email}</span>.
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 text-sm text-text-muted">
            <p>Please sign out and sign in with the correct email address to accept this invitation.</p>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => router.push('/api/auth/logout')}
              className="w-full"
            >
              Sign Out
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Ready state - show full invitation details
  if (pageState === 'ready' && invitation) {
    const spaceConfig = SPACE_TYPE_CONFIG[invitation.spaceType];
    const SpaceIcon = spaceConfig?.icon || Users;
    const roleConfig = ROLE_CONFIG[invitation.role];

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg w-full p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Space Invitation</h1>
              <p className="text-text-muted">
                You&apos;ve been invited to join a space
              </p>
            </div>
          </div>

          {/* Inviter Info */}
          <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl border border-border-secondary">
            <Avatar
              src={invitation.invitedByPhoto}
              name={invitation.invitedByName}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">
                {invitation.invitedByName || 'Someone'}
              </p>
              <p className="text-sm text-text-muted">invited you to join</p>
            </div>
          </div>

          {/* Space Info */}
          <div className="bg-surface-elevated rounded-xl p-6 space-y-4 border border-border-secondary">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${spaceConfig?.color || 'text-primary'} bg-current/10`}>
                <SpaceIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-text-primary truncate">{invitation.spaceName}</h2>
                <p className="text-sm text-text-muted">
                  {spaceConfig?.label || invitation.spaceType} Space
                </p>
              </div>
            </div>

            <div className="grid gap-3 pt-4 border-t border-border-secondary">
              {/* Role */}
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">{roleConfig?.label || invitation.role}</p>
                  <p className="text-sm text-text-muted">{roleConfig?.description}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-text-muted" />
                <p className="text-text-primary">{invitation.email}</p>
              </div>

              {/* Expiration */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-text-muted" />
                <p className="text-text-muted">{formatExpiration(invitation.expiresAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleAccept}
              disabled={actionState === 'accepting' || actionState === 'declining'}
              className="w-full"
            >
              {actionState === 'accepting' ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDecline}
              disabled={actionState === 'accepting' || actionState === 'declining'}
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              {actionState === 'declining' ? (
                <>
                  <Spinner size="sm" className="mr-2" />
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

          {/* Logged in as */}
          <div className="text-center text-sm text-text-muted">
            Logged in as <span className="font-medium text-text-primary">{user?.email}</span>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback
  return null;
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-text-muted">Loading...</p>
          </div>
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}
