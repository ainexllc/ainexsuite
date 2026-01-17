'use client';

import { useState, useRef } from 'react';
import {
  Star,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import type { BotAvatar, SubscriptionTier } from '@ainexsuite/types';

interface AvatarCardProps {
  avatar: BotAvatar;
  onEdit: (avatar: BotAvatar) => void;
  onDelete: (avatar: BotAvatar) => void;
  onToggleActive: (avatar: BotAvatar) => void;
  onSetDefault: (avatar: BotAvatar) => void;
}

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'bg-zinc-500/20 text-zinc-400',
  trial: 'bg-blue-500/20 text-blue-400',
  pro: 'bg-violet-500/20 text-violet-400',
  premium: 'bg-amber-500/20 text-amber-400',
};

export function AvatarCard({
  avatar,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
}: AvatarCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowMenu(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`group relative bg-white/5 border rounded-xl overflow-hidden transition-all duration-200 ${
        avatar.active
          ? 'border-white/10 hover:border-white/20'
          : 'border-white/5 opacity-60'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Preview */}
      <div className="relative aspect-square bg-black/50">
        <video
          ref={videoRef}
          src={avatar.videoURL}
          poster={avatar.posterURL}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Default Badge */}
        {avatar.isDefault && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-black text-xs font-medium">
            <Star className="h-3 w-3" />
            Default
          </div>
        )}

        {/* Inactive Overlay */}
        {!avatar.active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <EyeOff className="h-8 w-8 text-white/50" />
          </div>
        )}

        {/* Hover Actions */}
        <div
          className={`absolute top-2 right-2 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 w-40 py-1 rounded-lg bg-zinc-900 border border-white/10 shadow-xl z-10">
                <button
                  onClick={() => {
                    onEdit(avatar);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onToggleActive(avatar);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  {avatar.active ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Activate
                    </>
                  )}
                </button>
                {!avatar.isDefault && (
                  <button
                    onClick={() => {
                      onSetDefault(avatar);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    Set as Default
                  </button>
                )}
                {!avatar.isDefault && (
                  <button
                    onClick={() => {
                      onDelete(avatar);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{avatar.name}</h3>
        {avatar.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {avatar.description}
          </p>
        )}

        {/* Style & Tiers */}
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground capitalize">
            {avatar.animationStyle}
          </span>
          {avatar.availableTiers.map((tier) => (
            <span
              key={tier}
              className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${TIER_COLORS[tier]}`}
            >
              {tier}
            </span>
          ))}
        </div>

        {/* File Info */}
        <div className="text-[10px] text-muted-foreground mt-2">
          {(avatar.fileSize / 1024).toFixed(0)}KB • 200×200
        </div>
      </div>
    </div>
  );
}
