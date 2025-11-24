'use client';

import { Settings, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface ProfileSectionProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
  onClose?: () => void;
}

export function ProfileSection({ user, onClose }: ProfileSectionProps) {
  return (
    <div className="p-4 border-b border-white/10">
      {/* Profile Photo & Info */}
      <div className="flex items-start gap-3">
        {/* Profile Photo */}
        <div className="relative group">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? user.email ?? 'Profile'}
              width={56}
              height={56}
              className="rounded-full object-cover ring-2 ring-white/10"
              sizes="56px"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white ring-2 ring-white/10">
              {user.displayName
                ? user.displayName
                    .split(' ')
                    .map((part) => part.charAt(0))
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : (user.email?.charAt(0).toUpperCase() ?? 'U')}
            </div>
          )}

          {/* Edit overlay on hover */}
          <button
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit profile photo"
          >
            <User className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">
            {user.displayName || 'User'}
          </h3>
          <p className="text-sm text-white/60 truncate">{user.email}</p>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <Link
              href="/profile/edit"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/5 rounded-lg hover:bg-white/10 transition"
            >
              <User className="h-3 w-3" />
              Edit Profile
            </Link>
            <Link
              href="/settings"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/5 rounded-lg hover:bg-white/10 transition"
            >
              <Settings className="h-3 w-3" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
