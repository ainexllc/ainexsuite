import { useState } from 'react';
import type { JournalEntry } from '@ainexsuite/types';

interface UsePersonalizedWelcomeOptions {
  userName: string | null;
  recentEntries: JournalEntry[];
  enabled?: boolean;
}

export function usePersonalizedWelcome({
  enabled: _enabled = true,
}: UsePersonalizedWelcomeOptions) {
  // Simplified stub - returns null message and loading false
  // TODO: Implement full AI-powered personalized welcome
  const [welcomeMessage] = useState<string | null>(null);
  const [isLoading] = useState(false);

  return { welcomeMessage, isLoading };
}
