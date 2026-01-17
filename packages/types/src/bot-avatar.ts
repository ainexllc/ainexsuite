import type { Timestamp } from './common';
import type { SubscriptionTier } from './user';

/**
 * Animation styles for bot avatars
 * These create subtle, conversational presence animations
 */
export type BotAvatarAnimationStyle =
  | 'conversational'  // Default: gentle presence, warm attentive expression
  | 'listening'       // Attentive with subtle nods, engaged eyes
  | 'thinking'        // Thoughtful contemplation, processing expression
  | 'responding';     // Natural speaking with friendly demeanor

/**
 * Bot Avatar document - stored in bot-avatars collection
 * Used for AI assistant avatars in chat interfaces
 */
export interface BotAvatar {
  id: string;
  name: string;
  description?: string;

  // Source image (used for regeneration)
  sourceImageURL: string;
  sourceImagePath: string;

  // Animated video (200x200, optimized for chat)
  videoURL: string;
  videoPath: string;
  posterURL?: string;
  posterPath?: string;

  // Video metadata
  fileSize: number;
  duration?: number;

  // Animation configuration
  animationStyle: BotAvatarAnimationStyle;
  generationPrompt?: string;

  // Access control
  isDefault: boolean;
  availableTiers: SubscriptionTier[];

  // Admin metadata
  uploadedBy: string;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
  active: boolean;

  // Generation metadata
  provider: 'fal.ai';
  model: string;
}

/**
 * Input for creating a new bot avatar
 */
export type BotAvatarCreateInput = Omit<
  BotAvatar,
  'id' | 'uploadedAt' | 'updatedAt'
>;

/**
 * Input for updating an existing bot avatar
 */
export type BotAvatarUpdateInput = Partial<
  Pick<
    BotAvatar,
    | 'name'
    | 'description'
    | 'animationStyle'
    | 'isDefault'
    | 'availableTiers'
    | 'active'
  >
>;

/**
 * Conversational animation prompts for bot avatars
 * These create subtle, ambient presence rather than explicit actions
 */
export const BOT_AVATAR_PROMPTS: Record<BotAvatarAnimationStyle, string> = {
  conversational:
    'The person maintains gentle eye contact with a soft, pleasant expression. Subtle natural movements like gentle breathing. Warm and attentive, as if listening to someone speak. Minimal movement, calm presence. Same person, same appearance, locked camera angle.',
  listening:
    'The person listens attentively with occasional subtle nods. Warm engaged eyes. Slight head tilt showing interest. Natural breathing movement. Calm, focused expression. Same person, same appearance, locked camera angle.',
  thinking:
    'The person appears thoughtfully engaged. Eyes showing gentle contemplation. Subtle eye movements as if processing information. Slight natural shifts. Warm, intelligent expression. Same person, same appearance, locked camera angle.',
  responding:
    'The person speaks gently with natural expressions. Subtle head movements that accompany natural speech. Engaged, friendly demeanor. Warm presence. Same person, same appearance, locked camera angle.',
};

/**
 * Negative prompt for quality control
 */
export const BOT_AVATAR_NEGATIVE_PROMPT =
  'excessive movement, jerky motion, dramatic gestures, hand movements, looking away, dramatic expressions, blur, distortion, low quality, artifacts, watermark';

/**
 * Animation style labels for UI
 */
export const BOT_AVATAR_STYLE_LABELS: Record<BotAvatarAnimationStyle, string> = {
  conversational: 'Conversational',
  listening: 'Listening',
  thinking: 'Thinking',
  responding: 'Responding',
};

/**
 * Animation style descriptions for UI
 */
export const BOT_AVATAR_STYLE_DESCRIPTIONS: Record<BotAvatarAnimationStyle, string> = {
  conversational: 'Gentle presence with warm, attentive expression',
  listening: 'Attentive with subtle nods, engaged eyes',
  thinking: 'Thoughtful contemplation, processing expression',
  responding: 'Natural speaking with friendly demeanor',
};
