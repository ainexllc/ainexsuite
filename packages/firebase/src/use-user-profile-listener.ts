'use client';

import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { db } from './client';

export interface UserProfileData {
  photoURL?: string | null;
  iconURL?: string | null;
  customPhotoURL?: string | null;
  customIconURL?: string | null;
  animatedAvatarURL?: string | null;
  animatedAvatarAction?: string | null;
  animatedAvatarStyle?: string | null;
  useAnimatedAvatar?: boolean;
  displayName?: string | null;
}

/**
 * Real-time Firestore listener for user profile fields.
 * Enables cross-app sync by listening to profile/avatar changes.
 *
 * @param uid - The user's Firebase UID
 * @returns { profile, loading, error }
 */
export function useUserProfileListener(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // No user = no listener
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to user document for profile fields
    const userRef = doc(db, 'users', uid);

    unsubscribeRef.current = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Prefer custom URLs over Firebase Auth URLs
          const photoURL = data.customPhotoURL || data.photoURL || null;
          const iconURL = data.customIconURL || data.iconURL || null;

          setProfile({
            photoURL,
            iconURL,
            customPhotoURL: data.customPhotoURL || null,
            customIconURL: data.customIconURL || null,
            animatedAvatarURL: data.animatedAvatarURL || null,
            animatedAvatarAction: data.animatedAvatarAction || null,
            animatedAvatarStyle: data.animatedAvatarStyle || null,
            useAnimatedAvatar: data.useAnimatedAvatar || false,
            displayName: data.displayName || null,
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useUserProfileListener] Firestore error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup on unmount or uid change
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [uid]);

  return { profile, loading, error };
}
