'use client';

import { useState, useEffect } from 'react';
import {
  getDefaultBotAvatar,
  getUserBotAvatarPreference,
} from '@ainexsuite/firebase';
import type { BotAvatar, SubscriptionTier } from '@ainexsuite/types';

interface UseBotAvatarOptions {
  userId?: string;
  tier?: SubscriptionTier;
}

interface UseBotAvatarResult {
  botAvatar: BotAvatar | null;
  botAvatarURL: string | null;
  posterURL: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to get the appropriate bot avatar for a user
 *
 * For pro/premium users with a preference: returns their selected avatar
 * For all others: returns the default bot avatar
 */
export function useBotAvatar({
  userId,
  tier,
}: UseBotAvatarOptions = {}): UseBotAvatarResult {
  const [botAvatar, setBotAvatar] = useState<BotAvatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBotAvatar() {
      setLoading(true);
      setError(null);

      try {
        let avatar: BotAvatar | null = null;

        // Pro/premium users can have custom preferences
        if (userId && (tier === 'pro' || tier === 'premium')) {
          avatar = await getUserBotAvatarPreference(userId);
        }

        // Fallback to default
        if (!avatar) {
          avatar = await getDefaultBotAvatar();
        }

        if (mounted) {
          setBotAvatar(avatar);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load bot avatar'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchBotAvatar();

    return () => {
      mounted = false;
    };
  }, [userId, tier]);

  return {
    botAvatar,
    botAvatarURL: botAvatar?.videoURL || null,
    posterURL: botAvatar?.posterURL || null,
    loading,
    error,
  };
}
