/**
 * Background image types for shared background management across apps
 */

export type BackgroundBrightness = 'light' | 'dark';

export type BackgroundAccessLevel = 'free' | 'premium' | 'restricted';

export type BackgroundCategory =
  | 'seasonal'
  | 'abstract'
  | 'nature'
  | 'minimal'
  | 'gradient'
  | 'festive'
  | 'other';

export interface BackgroundSeasonal {
  active: boolean;
  startMonth?: number; // 1-12
  endMonth?: number;   // 1-12
}

/**
 * Background document stored in Firestore
 */
export interface BackgroundDoc {
  id: string;
  name: string;
  brightness: BackgroundBrightness;

  // Storage
  storagePath: string;
  downloadURL: string;
  thumbnailURL?: string;

  // Access Control
  accessLevel: BackgroundAccessLevel;

  // Extended Metadata
  tags: string[];
  category: BackgroundCategory;
  seasonal?: BackgroundSeasonal;

  // Audit
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;

  // Status
  active: boolean;
}

/**
 * Input for creating a new background
 */
export interface BackgroundCreateInput {
  name: string;
  brightness: BackgroundBrightness;
  accessLevel: BackgroundAccessLevel;
  tags: string[];
  category: BackgroundCategory;
  seasonal?: BackgroundSeasonal;
}

/**
 * Input for updating background metadata
 */
export interface BackgroundUpdateInput {
  name?: string;
  brightness?: BackgroundBrightness;
  accessLevel?: BackgroundAccessLevel;
  tags?: string[];
  category?: BackgroundCategory;
  seasonal?: BackgroundSeasonal;
  active?: boolean;
}

/**
 * Filters for querying backgrounds
 */
export interface BackgroundFilters {
  category?: BackgroundCategory;
  accessLevel?: BackgroundAccessLevel;
  brightness?: BackgroundBrightness;
  active?: boolean;
  tags?: string[];
}

/**
 * Client-side background option (simplified for UI)
 */
export interface BackgroundOption {
  id: string;
  name: string;
  thumbnail: string;
  fullImage: string;
  brightness: BackgroundBrightness;
  category: BackgroundCategory;
  tags: string[];
}
