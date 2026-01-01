'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Check, X, Loader2, Users, Home, Heart, UserPlus, Briefcase, FolderKanban } from 'lucide-react';
import { SpaceInvite, SpaceType } from '@/types/models';

const spaceTypeIcons: Record<SpaceType, typeof Users> = {
  personal: Users,
  couple: Heart,
  family: Home,
  squad: Users,
  work: Briefcase,
  buddy: UserPlus,
  project: FolderKanban,
};

const spaceTypeLabels: Record<SpaceType, string> = {
  personal: 'Personal Space',
  couple: 'Couple Space',
  family: 'Family Space',
  squad: 'Squad Space',
  work: 'Work Space',
  buddy: 'Buddy Space',
  project: 'Project Space',
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = params.token as string;

  const [invite, setInvite] = useState<SpaceInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  // Fetch invite details
  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/invites/${token}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Invite not found');
        }
        const data = await response.json();
        setInvite(data.invite);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invite');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvite();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    setAccepting(true);
    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept invite');
      }

      // Redirect to the workspace
      router.push('/workspace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await fetch(`/api/invites/${token}/decline`, {
        method: 'POST',
      });
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {error || 'Invite Not Found'}
          </h1>
          <p className="text-white/50 text-sm mb-6">
            This invite may have expired or already been used.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (invite.status !== 'pending') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Invite Already {invite.status === 'accepted' ? 'Accepted' : invite.status === 'declined' ? 'Declined' : 'Expired'}
          </h1>
          <button
            onClick={() => router.push('/workspace')}
            className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    );
  }

  const Icon = spaceTypeIcons[invite.spaceType];

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            You&apos;re Invited!
          </h1>
          <p className="text-white/50 text-sm">
            {invite.inviterName} invited you to join
          </p>
        </div>

        {/* Space Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-1">
            {invite.spaceName}
          </h2>
          <p className="text-xs text-white/50">
            {spaceTypeLabels[invite.spaceType]}
          </p>
          {invite.ageGroup && (
            <p className="text-xs text-white/40 mt-2">
              You&apos;ll join as: <span className="text-white/60 capitalize">{invite.ageGroup}</span>
            </p>
          )}
        </div>

        {/* Auth Status */}
        {!user && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-300">
              You&apos;ll need to sign in or create an account to join this space.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={declining}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {declining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {accepting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {user ? 'Accept & Join' : 'Sign In to Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
