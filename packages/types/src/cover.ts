/**
 * Cover image types for journal card covers
 */

export type CoverAccessLevel = 'free' | 'premium';

export type CoverCategory =
  | 'leather'
  | 'fabric'
  | 'paper'
  | 'wood'
  | 'artistic'
  | 'minimal'
  | 'pattern'
  | 'other';

export type CoverSourceType = 'uploaded' | 'ai-generated';

/**
 * AI generation metadata for covers
 */
export interface CoverGenerationMeta {
  prompt: string;
  style: string;
  model: string;
  generatedAt: Date;
}

/**
 * Cover document stored in Firestore
 */
export interface CoverDoc {
  id: string;
  name: string;
  category: CoverCategory;

  // Storage
  storagePath: string;
  downloadURL: string;
  thumbnailURL: string;

  // Access Control
  accessLevel: CoverAccessLevel;

  // Metadata
  tags: string[];
  sourceType: CoverSourceType;
  generationMeta?: CoverGenerationMeta;

  // Audit
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;

  // Status
  active: boolean;
}

/**
 * Input for creating a new cover
 */
export interface CoverCreateInput {
  name: string;
  category: CoverCategory;
  accessLevel: CoverAccessLevel;
  tags: string[];
  sourceType: CoverSourceType;
  generationMeta?: CoverGenerationMeta;
}

/**
 * Input for updating cover metadata
 */
export interface CoverUpdateInput {
  name?: string;
  category?: CoverCategory;
  accessLevel?: CoverAccessLevel;
  tags?: string[];
  active?: boolean;
}

/**
 * Filters for querying covers
 */
export interface CoverFilters {
  category?: CoverCategory;
  accessLevel?: CoverAccessLevel;
  active?: boolean;
  tags?: string[];
}

/**
 * Client-side cover option (simplified for UI)
 */
export interface CoverOption {
  id: string;
  name: string;
  thumbnail: string;
  fullImage: string;
  category: CoverCategory;
}

/**
 * Cover generation style options
 */
export type CoverGenerationStyle =
  | 'leather-aged'
  | 'leather-new'
  | 'leather-tooled'
  | 'leather-embossed'
  | 'fabric-linen'
  | 'fabric-canvas'
  | 'fabric-velvet'
  | 'fabric-denim'
  | 'paper-parchment'
  | 'paper-kraft'
  | 'paper-watercolor'
  | 'paper-marbled'
  | 'wood-oak'
  | 'wood-walnut'
  | 'wood-bamboo'
  | 'wood-driftwood'
  | 'artistic-watercolor'
  | 'artistic-oil'
  | 'artistic-sketch'
  | 'artistic-abstract'
  | 'minimal-gradient'
  | 'minimal-texture'
  | 'pattern-geometric'
  | 'pattern-floral';

/**
 * Cover generation request payload
 */
export interface CoverGenerationRequest {
  prompt: string;
  style: CoverGenerationStyle;
  category: CoverCategory;
}

/**
 * Cover generation response from API
 */
export interface CoverGenerationResponse {
  success: boolean;
  imageData?: string; // Base64 data URL
  error?: string;
  model?: string;
}

/**
 * Style guides for cover generation prompts
 */
export const COVER_STYLE_GUIDES: Record<CoverGenerationStyle, string> = {
  // Leather styles
  'leather-aged': 'Vintage aged leather with natural patina, subtle cracks, warm brown tones, authentic wear marks',
  'leather-new': 'Premium new leather with smooth grain, rich deep brown color, subtle sheen',
  'leather-tooled': 'Hand-tooled leather with embossed decorative patterns, western style, intricate borders',
  'leather-embossed': 'Embossed leather with raised geometric or floral patterns, elegant texture',
  // Fabric styles
  'fabric-linen': 'Natural linen textile with visible weave, cream or oatmeal color, organic texture',
  'fabric-canvas': 'Heavy canvas fabric with coarse weave, natural beige or gray tones',
  'fabric-velvet': 'Rich velvet fabric with soft pile, deep jewel tones, luxurious texture',
  'fabric-denim': 'Denim fabric with characteristic diagonal weave, indigo blue, authentic textile feel',
  // Paper styles
  'paper-parchment': 'Aged parchment paper with tea-stained edges, subtle wrinkles, antique cream color',
  'paper-kraft': 'Brown kraft paper with natural fibers visible, recycled texture, earthy brown',
  'paper-watercolor': 'Watercolor paper with visible texture, slight buckle, professional artist quality',
  'paper-marbled': 'Traditional marbled paper with swirling ink patterns, elegant book endpaper style',
  // Wood styles
  'wood-oak': 'Natural oak wood grain with cathedral patterns, honey golden brown color',
  'wood-walnut': 'Rich walnut wood with dark chocolate brown grain, premium furniture quality',
  'wood-bamboo': 'Natural bamboo with visible nodes and grain, light tan color, sustainable material feel',
  'wood-driftwood': 'Weathered driftwood texture with silver-gray tones, beach-worn character',
  // Artistic styles
  'artistic-watercolor': 'Abstract watercolor wash, soft blending colors, artistic splashes',
  'artistic-oil': 'Oil painting texture with visible brushstrokes, rich impasto technique',
  'artistic-sketch': 'Pencil sketch texture with graphite shading, artistic hand-drawn feel',
  'artistic-abstract': 'Abstract expressionist texture, bold color fields, modern art inspired',
  // Minimal styles
  'minimal-gradient': 'Subtle gradient background, soft color transition, clean and modern',
  'minimal-texture': 'Very subtle paper or canvas texture, nearly solid color, understated elegance',
  // Pattern styles
  'pattern-geometric': 'Geometric pattern with clean lines, modern shapes, subtle repeat',
  'pattern-floral': 'Elegant floral pattern, botanical elements, muted sophisticated colors',
};

/**
 * Category to style mapping for UI
 */
export const COVER_CATEGORY_STYLES: Record<CoverCategory, CoverGenerationStyle[]> = {
  leather: ['leather-aged', 'leather-new', 'leather-tooled', 'leather-embossed'],
  fabric: ['fabric-linen', 'fabric-canvas', 'fabric-velvet', 'fabric-denim'],
  paper: ['paper-parchment', 'paper-kraft', 'paper-watercolor', 'paper-marbled'],
  wood: ['wood-oak', 'wood-walnut', 'wood-bamboo', 'wood-driftwood'],
  artistic: ['artistic-watercolor', 'artistic-oil', 'artistic-sketch', 'artistic-abstract'],
  minimal: ['minimal-gradient', 'minimal-texture'],
  pattern: ['pattern-geometric', 'pattern-floral'],
  other: [],
};
