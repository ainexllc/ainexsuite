"use client";

import { type AIInsightsPulldownSection } from "../components/ai/ai-insights-pulldown";

/**
 * Configuration for the shared workspace insights hook.
 * Each app provides its own config to customize behavior.
 */
export interface WorkspaceInsightsConfig<TData, TInsights> {
  /** Unique app identifier (e.g., 'notes', 'calendar', 'todo') */
  appName: string;

  /** Storage key for expanded state (e.g., 'notes-ai-insights-expanded') */
  expandedStorageKey: string;

  /** Optional space ID for space-aware caching */
  spaceId?: string | null;

  /** API endpoint for generating insights (e.g., '/api/ai/workspace-insights') */
  apiEndpoint: string;

  /** Transform raw app data into API payload */
  preparePayload: (data: TData[]) => unknown;

  /**
   * Transform API response into app-specific insight sections.
   * @param insights - The parsed API response
   * @param primaryColor - The app's primary accent color
   * @param localStats - Optional client-side calculated stats
   */
  buildSections: (
    insights: TInsights,
    primaryColor: string,
    localStats?: object
  ) => AIInsightsPulldownSection[];

  /** Title for the insights panel (or function returning title) */
  title: string | ((spaceName?: string) => string);

  /** Loading message shown during generation */
  loadingMessage: string;

  /** Minimum items required before insights can be generated */
  minimumDataCount: number;

  /** Empty state message when not enough data */
  emptyStateMessage?: string;

  /**
   * Optional: Generate a hash of current data for smart refresh.
   * If provided, insights will regenerate when hash changes significantly.
   */
  generateDataHash?: (data: TData[]) => string;

  /**
   * Optional: Client-side calculated stats (like streak data).
   * These are passed to buildSections without needing an API call.
   */
  calculateLocalStats?: (data: TData[]) => object;

  /**
   * Optional: Threshold for item count change to trigger refresh.
   * Default is 5 items.
   */
  itemCountThreshold?: number;
}

/**
 * Result returned by useWorkspaceInsights hook.
 * Compatible with WorkspaceLayout insights props.
 */
export interface WorkspaceInsightsResult<TInsights = unknown> {
  /** Sections to display in AIInsightsPulldown */
  sections: AIInsightsPulldownSection[];

  /** Title for the insights panel */
  title: string;

  /** Whether insights are currently being generated */
  isLoading: boolean;

  /** Message shown while loading */
  loadingMessage: string;

  /** Error message if generation failed */
  error: string | null;

  /** Timestamp of last successful generation/cache load */
  lastUpdated: Date | null;

  /** Callback to force refresh insights */
  onRefresh: () => void;

  /** Whether refresh button should be disabled */
  refreshDisabled: boolean;

  /** Storage key for expanded state persistence */
  storageKey: string;

  /** Whether there's enough data to generate insights */
  hasEnoughData: boolean;

  /** Raw insights data from the API (for modal display) */
  rawData: TInsights | null;

  /** Client-side calculated stats (e.g., streak data) */
  localStats?: object;

  /** Message to show when there's not enough data */
  emptyStateMessage?: string;
}

/**
 * Cache data structure stored in localStorage
 */
export interface InsightsCacheData<TInsights> {
  /** The cached insights data */
  insights: TInsights;

  /** Timestamp when cache was created */
  timestamp: number;

  /** Optional hash of data at time of generation */
  dataHash?: string;

  /** Optional count of items at time of generation */
  itemCount?: number;
}
