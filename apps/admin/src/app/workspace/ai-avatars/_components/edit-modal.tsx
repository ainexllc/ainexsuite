'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import {
  BOT_AVATAR_STYLE_LABELS,
  type BotAvatar,
  type BotAvatarAnimationStyle,
  type SubscriptionTier,
} from '@ainexsuite/types';

interface EditModalProps {
  avatar: BotAvatar | null;
  onClose: () => void;
  onSave: (
    avatarId: string,
    updates: {
      name?: string;
      description?: string;
      animationStyle?: BotAvatarAnimationStyle;
      availableTiers?: SubscriptionTier[];
      isDefault?: boolean;
      active?: boolean;
    }
  ) => Promise<void>;
}

const ALL_TIERS: SubscriptionTier[] = ['free', 'trial', 'pro', 'premium'];
const ANIMATION_STYLES: BotAvatarAnimationStyle[] = [
  'conversational',
  'listening',
  'thinking',
  'responding',
];

export function EditModal({ avatar, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [animationStyle, setAnimationStyle] = useState<BotAvatarAnimationStyle>('conversational');
  const [selectedTiers, setSelectedTiers] = useState<SubscriptionTier[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when avatar changes
  useEffect(() => {
    if (avatar) {
      setName(avatar.name);
      setDescription(avatar.description || '');
      setAnimationStyle(avatar.animationStyle);
      setSelectedTiers(avatar.availableTiers);
      setIsDefault(avatar.isDefault);
      setActive(avatar.active);
      setError(null);
    }
  }, [avatar]);

  const handleSave = async () => {
    if (!avatar) return;

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(avatar.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        animationStyle,
        availableTiers: selectedTiers,
        isDefault,
        active,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTier = (tier: SubscriptionTier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  if (!avatar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Edit Bot Avatar</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/50">
              <video
                src={avatar.videoURL}
                loop
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {(avatar.fileSize / 1024).toFixed(0)}KB • 200×200
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Created by {avatar.provider} • {avatar.model}
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Animation Style (read-only info) */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Animation Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATION_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setAnimationStyle(style)}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    animationStyle === style
                      ? 'bg-violet-500/20 border-violet-500/50 border text-violet-300'
                      : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {BOT_AVATAR_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Changing style only updates metadata. To change animation, create a new avatar.
            </p>
          </div>

          {/* Available Tiers */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Available to Tiers
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                    selectedTiers.includes(tier)
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {selectedTiers.includes(tier) && (
                    <Check className="inline h-3 w-3 mr-1" />
                  )}
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={avatar.isDefault}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 disabled:opacity-50"
              />
              <span className="text-sm text-white">
                Set as default bot avatar
                {avatar.isDefault && (
                  <span className="text-muted-foreground ml-1">(currently default)</span>
                )}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
              />
              <span className="text-sm text-white">Active (visible to users)</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-medium transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
