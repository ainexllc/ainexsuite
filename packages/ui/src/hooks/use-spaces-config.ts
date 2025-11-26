'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import type { SpaceType } from '@ainexsuite/types';

/**
 * Configuration for a single space type from admin settings
 */
export interface SpaceTypeConfig {
  id: SpaceType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  enabled: boolean;
}

/**
 * UI configuration for the SpaceSwitcher component
 */
export interface SpacesUIConfig {
  dropdownStyle: 'minimal' | 'detailed' | 'compact';
  showTypeIcons: boolean;
  showMemberCount: boolean;
  showCreateButton: boolean;
  animateTransitions: boolean;
  defaultSpaceLabel: string;
}

/**
 * Complete spaces configuration from Firestore
 */
export interface SpacesConfig {
  spaceTypes: SpaceTypeConfig[];
  uiConfig: SpacesUIConfig;
  loading: boolean;
  error: string | null;
}

const DEFAULT_SPACE_TYPES: SpaceTypeConfig[] = [
  { id: 'personal', label: 'Personal', description: 'Your private space', icon: 'user', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.2)', borderColor: 'rgba(6,182,212,0.3)', enabled: true },
  { id: 'family', label: 'Family', description: 'Share with family members', icon: 'users', color: '#a855f7', bgColor: 'rgba(168,85,247,0.2)', borderColor: 'rgba(168,85,247,0.3)', enabled: true },
  { id: 'work', label: 'Work', description: 'Team collaboration', icon: 'briefcase', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.3)', enabled: true },
  { id: 'couple', label: 'Couple', description: 'Share with your partner', icon: 'heart', color: '#ec4899', bgColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.3)', enabled: true },
  { id: 'buddy', label: 'Buddy', description: 'Partner up with a friend', icon: 'dumbbell', color: '#f97316', bgColor: 'rgba(249,115,22,0.2)', borderColor: 'rgba(249,115,22,0.3)', enabled: true },
  { id: 'squad', label: 'Squad', description: 'Team accountability', icon: 'users', color: '#10b981', bgColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.3)', enabled: true },
  { id: 'project', label: 'Project', description: 'Dedicated project space', icon: 'folder', color: '#6366f1', bgColor: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.3)', enabled: true },
];

const DEFAULT_UI_CONFIG: SpacesUIConfig = {
  dropdownStyle: 'detailed',
  showTypeIcons: true,
  showMemberCount: true,
  showCreateButton: true,
  animateTransitions: true,
  defaultSpaceLabel: 'My Space',
};

export interface UseSpacesConfigOptions {
  /** Whether to use real-time updates (default: true) */
  realtime?: boolean;
}

/**
 * Hook to fetch spaces configuration from Firestore.
 * This allows admin to configure the SpaceSwitcher appearance for all apps.
 *
 * @example
 * ```tsx
 * const { spaceTypes, uiConfig, loading } = useSpacesConfig();
 * ```
 */
export function useSpacesConfig(options: UseSpacesConfigOptions = {}): SpacesConfig {
  const { realtime = true } = options;

  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeConfig[]>(DEFAULT_SPACE_TYPES);
  const [uiConfig, setUiConfig] = useState<SpacesUIConfig>(DEFAULT_UI_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (realtime) {
      // Real-time listeners
      const unsubTypes = onSnapshot(
        doc(db, 'config', 'space_types'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.types && Array.isArray(data.types)) {
              setSpaceTypes(data.types);
            }
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching space types:', err);
          setError('Failed to load space types');
          setLoading(false);
        }
      );

      const unsubUI = onSnapshot(
        doc(db, 'config', 'spaces_ui'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUiConfig({ ...DEFAULT_UI_CONFIG, ...data });
          }
        },
        (err) => {
          console.error('Error fetching UI config:', err);
        }
      );

      return () => {
        unsubTypes();
        unsubUI();
      };
    } else {
      // One-time fetch
      const fetchConfig = async () => {
        try {
          const [typesDoc, uiDoc] = await Promise.all([
            getDoc(doc(db, 'config', 'space_types')),
            getDoc(doc(db, 'config', 'spaces_ui')),
          ]);

          if (typesDoc.exists()) {
            const data = typesDoc.data();
            if (data.types && Array.isArray(data.types)) {
              setSpaceTypes(data.types);
            }
          }

          if (uiDoc.exists()) {
            const data = uiDoc.data();
            setUiConfig({ ...DEFAULT_UI_CONFIG, ...data });
          }
        } catch (err) {
          console.error('Error fetching spaces config:', err);
          setError('Failed to load spaces configuration');
        } finally {
          setLoading(false);
        }
      };

      fetchConfig();
    }
  }, [realtime]);

  return { spaceTypes, uiConfig, loading, error };
}

/**
 * Get a specific space type configuration by ID
 */
export function getSpaceTypeConfig(
  spaceTypes: SpaceTypeConfig[],
  typeId: SpaceType
): SpaceTypeConfig | undefined {
  return spaceTypes.find((t) => t.id === typeId);
}

/**
 * Get only enabled space types
 */
export function getEnabledSpaceTypes(spaceTypes: SpaceTypeConfig[]): SpaceTypeConfig[] {
  return spaceTypes.filter((t) => t.enabled);
}

export default useSpacesConfig;
