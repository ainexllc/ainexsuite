'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import {
  subscribeToBotAvatars,
  setDefaultBotAvatar,
  toggleBotAvatarActive,
  deleteBotAvatar,
  updateBotAvatar,
} from '@ainexsuite/firebase';
import type {
  BotAvatar,
  BotAvatarAnimationStyle,
  SubscriptionTier,
} from '@ainexsuite/types';
import { AvatarCard } from './_components/avatar-card';
import { CreateModal } from './_components/create-modal';
import { EditModal } from './_components/edit-modal';

export default function AIAvatarsPage() {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState<BotAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<BotAvatar | null>(null);
  const [deletingAvatar, setDeletingAvatar] = useState<BotAvatar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscribe to avatars
  useEffect(() => {
    const unsubscribe = subscribeToBotAvatars((updatedAvatars) => {
      setAvatars(updatedAvatars);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCreate = useCallback(
    async (data: {
      sourceImageData: string;
      videoData: string;
      name: string;
      description?: string;
      animationStyle: BotAvatarAnimationStyle;
      availableTiers: SubscriptionTier[];
      isDefault: boolean;
      generationPrompt?: string;
    }) => {
      if (!user?.uid) throw new Error('Not authenticated');

      const response = await fetch('/api/bot-avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          uploadedBy: user.uid,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create avatar');
      }

      setSuccess('Bot avatar created successfully!');
    },
    [user?.uid]
  );

  const handleEdit = useCallback(
    async (
      avatarId: string,
      updates: {
        name?: string;
        description?: string;
        animationStyle?: BotAvatarAnimationStyle;
        availableTiers?: SubscriptionTier[];
        isDefault?: boolean;
        active?: boolean;
      }
    ) => {
      const success = await updateBotAvatar(avatarId, updates);
      if (!success) {
        throw new Error('Failed to update avatar');
      }
      setSuccess('Bot avatar updated successfully!');
    },
    []
  );

  const handleToggleActive = useCallback(async (avatar: BotAvatar) => {
    const newActive = !avatar.active;
    const success = await toggleBotAvatarActive(avatar.id, newActive);
    if (success) {
      setSuccess(`Avatar ${newActive ? 'activated' : 'deactivated'}`);
    } else {
      setError('Failed to toggle avatar status');
    }
  }, []);

  const handleSetDefault = useCallback(async (avatar: BotAvatar) => {
    const success = await setDefaultBotAvatar(avatar.id);
    if (success) {
      setSuccess('Default avatar updated!');
    } else {
      setError('Failed to set default avatar');
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingAvatar) return;

    setIsDeleting(true);
    const success = await deleteBotAvatar(deletingAvatar.id);
    setIsDeleting(false);

    if (success) {
      setSuccess('Avatar deleted successfully');
      setDeletingAvatar(null);
    } else {
      setError('Failed to delete avatar');
    }
  }, [deletingAvatar]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-violet-400" />
            AI Avatars
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage animated AI assistant avatars for the chatbot.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Avatar
        </button>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && avatars.length === 0 && (
        <div className="glass-card rounded-xl p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400 mb-4">
              <Bot className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Bot Avatars Yet</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Create your first animated bot avatar to personalize the AI assistant experience.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Avatar
            </button>
          </div>
        </div>
      )}

      {/* Avatar Grid */}
      {!loading && avatars.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {avatars.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              onEdit={setEditingAvatar}
              onDelete={setDeletingAvatar}
              onToggleActive={handleToggleActive}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
      />

      {/* Edit Modal */}
      <EditModal
        avatar={editingAvatar}
        onClose={() => setEditingAvatar(null)}
        onSave={handleEdit}
      />

      {/* Delete Confirmation Modal */}
      {deletingAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/50">
                <video
                  src={deletingAvatar.videoURL}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-white">{deletingAvatar.name}</p>
                <p className="text-xs text-muted-foreground">
                  {deletingAvatar.animationStyle}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingAvatar(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-medium transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
