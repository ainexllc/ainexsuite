'use client';

import { createContext, useContext } from 'react';
import type { SettingsTab } from '@ainexsuite/ui';

interface SettingsContextValue {
  openSettings: (tab?: SettingsTab) => void;
  openInviteModal: () => void;
}

export const SettingsContext = createContext<SettingsContextValue>({
  openSettings: () => {},
  openInviteModal: () => {},
});

export const useSettings = () => useContext(SettingsContext);
