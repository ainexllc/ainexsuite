/**
 * AI and ML-related types for content enhancement and analysis
 */

export type ContentEnhancementStyle = 'clarity' | 'concise' | 'warmth' | 'reflection';

export interface ContentEnhancementRequest {
  content: string;
  style: ContentEnhancementStyle;
}

export interface ContentEnhancementResponse {
  content: string;
  style: ContentEnhancementStyle;
  usedAI: boolean;
}
