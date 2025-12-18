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

// ============================================
// Responsive Variants & AI Generation Types
// ============================================

export type VariantResolution = 'mobile' | 'tablet' | 'desktop' | '4k';
export type VariantAspectRatio = '16:9' | '9:16' | '4:3' | '1:1';

/**
 * Responsive image variant configuration
 */
export interface BackgroundVariant {
  resolution: VariantResolution;
  aspectRatio: VariantAspectRatio;
  width: number;
  height: number;
  storagePath: string;
  downloadURL: string;
}

/**
 * AI generation metadata
 */
export interface BackgroundGenerationMeta {
  prompt: string;
  model: string;
  generatedAt: Date;
  provider: 'gemini' | 'openrouter';
  baseImagePath: string;
}

/**
 * Source type for backgrounds
 */
export type BackgroundSourceType = 'uploaded' | 'ai-generated';

/**
 * Extended BackgroundDoc with variants and AI metadata
 */
export interface BackgroundDocWithVariants extends BackgroundDoc {
  variants?: BackgroundVariant[];
  generationMeta?: BackgroundGenerationMeta;
  sourceType: BackgroundSourceType;
}

/**
 * Generation style options
 */
export type BackgroundGenerationStyle =
  | 'photorealistic'
  | 'artistic'
  | 'abstract'
  | 'minimal'
  | 'gradient';

/**
 * Generation request payload
 */
export interface BackgroundGenerationRequest {
  prompt: string;
  style?: BackgroundGenerationStyle;
  colorHint?: string;
}

/**
 * Generation response from API
 */
export interface BackgroundGenerationResponse {
  success: boolean;
  imageData?: string; // Base64 data URL
  error?: string;
  model?: string;
  provider?: string;
}

/**
 * Variant size configurations
 * Key format: `{resolution}-{aspectRatio}` (e.g., 'mobile-16:9')
 */
export const VARIANT_CONFIGS: Record<string, { width: number; height: number }> = {
  // Mobile variants (base width: 640px)
  'mobile-16:9': { width: 640, height: 360 },
  'mobile-9:16': { width: 360, height: 640 },
  'mobile-4:3': { width: 640, height: 480 },
  'mobile-1:1': { width: 640, height: 640 },
  // Tablet variants (base width: 1024px)
  'tablet-16:9': { width: 1024, height: 576 },
  'tablet-9:16': { width: 576, height: 1024 },
  'tablet-4:3': { width: 1024, height: 768 },
  'tablet-1:1': { width: 1024, height: 1024 },
  // Desktop variants (base width: 1920px)
  'desktop-16:9': { width: 1920, height: 1080 },
  'desktop-9:16': { width: 1080, height: 1920 },
  'desktop-4:3': { width: 1920, height: 1440 },
  'desktop-1:1': { width: 1920, height: 1920 },
  // 4K variants (base width: 3840px)
  '4k-16:9': { width: 3840, height: 2160 },
  '4k-9:16': { width: 2160, height: 3840 },
  '4k-4:3': { width: 3840, height: 2880 },
  '4k-1:1': { width: 3840, height: 3840 },
};
