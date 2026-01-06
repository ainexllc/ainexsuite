/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import sharp from 'sharp';

/**
 * Animated Avatar Generation API using fal.ai Kling 1.0
 * Uses image-to-video generation with first+last frame for smooth looping
 */

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || ''
});

const FAL_MODEL = 'fal-ai/kling-video/v1.6/pro/image-to-video';

// Avatar action type
type AvatarAction =
  | 'wave'
  | 'wink'
  | 'thumbsup'
  | 'peace'
  | 'dance'
  | 'laugh'
  | 'nod'
  | 'blowkiss'
  | 'shrug'
  | 'clap'
  | 'salute'
  | 'flex';

// Action-specific animation prompts - optimized for Kling 1.0 with first+last frame
const ACTION_PROMPTS: Record<AvatarAction, string> = {
  wave: 'A person energetically waves their hand side to side with a warm smile, moving smoothly from neutral to waving and back.',
  wink: 'A person playfully winks with their right eye while maintaining a friendly smile.',
  thumbsup: 'A person raises their hand showing an enthusiastic thumbs up gesture.',
  peace: 'A person displays a V peace sign with a cool, confident smile.',
  dance: 'A person bobs their head and sways their body rhythmically to music.',
  laugh: 'A person laughs joyfully with natural facial expressions and shoulder movement.',
  nod: 'A person nods their head up and down in agreement with a friendly expression.',
  blowkiss: 'A person brings their hand to their lips and blows a sweet kiss forward.',
  shrug: 'A person performs a casual shrug with raised shoulders and open palms.',
  clap: 'A person claps their hands together enthusiastically with joy.',
  salute: 'A person performs a crisp military salute with confidence.',
  flex: 'A person flexes both arms proudly showing strength.',
};

// Negative prompt for quality control
const NEGATIVE_PROMPT = "blur, distortion, low quality, artifacts, watermark, static image, no movement, frozen";

const VALID_ACTIONS: AvatarAction[] = [
  'wave', 'wink', 'thumbsup', 'peace', 'dance', 'laugh',
  'nod', 'blowkiss', 'shrug', 'clap', 'salute', 'flex'
];

/**
 * Fetch an image URL and convert to base64
 */
async function urlToBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return { base64, mimeType: contentType };
}

/**
 * Extract base64 data from various image formats
 */
async function getImageBase64(sourceImage: string): Promise<{ base64: string; mimeType: string }> {
  if (sourceImage.startsWith('data:')) {
    const matches = sourceImage.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      return { mimeType: matches[1], base64: matches[2] };
    }
    throw new Error('Invalid data URL format');
  }

  if (sourceImage.startsWith('http://') || sourceImage.startsWith('https://')) {
    return urlToBase64(sourceImage);
  }

  return { base64: sourceImage, mimeType: 'image/jpeg' };
}

/**
 * Correct image aspect ratio to meet Runway requirements (max 2:1)
 * If image is wider than 2:1, it will be center-cropped
 */
async function correctAspectRatio(base64: string, mimeType: string): Promise<{ base64: string; mimeType: string }> {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      // Can't determine dimensions, return as-is
      return { base64, mimeType };
    }

    const aspectRatio = metadata.width / metadata.height;
    const maxAspectRatio = 2.0;

    if (aspectRatio <= maxAspectRatio) {
      // Aspect ratio is fine, return original
      return { base64, mimeType };
    }

    // Image is too wide - crop to 2:1 (center crop)
    const targetWidth = metadata.height * maxAspectRatio;
    const cropX = Math.floor((metadata.width - targetWidth) / 2);

    const croppedBuffer = await image
      .extract({
        left: cropX,
        top: 0,
        width: Math.floor(targetWidth),
        height: metadata.height
      })
      .toBuffer();

    const croppedBase64 = croppedBuffer.toString('base64');
    return { base64: croppedBase64, mimeType };
  } catch (error) {
    console.error('Failed to correct aspect ratio:', error);
    // Return original on error
    return { base64, mimeType };
  }
}

/**
 * Build animation prompt for the action
 */
function buildAnimationPrompt(action: AvatarAction): string {
  const actionGuide = ACTION_PROMPTS[action] || ACTION_PROMPTS.wave;

  // Kling 1.0 prompting: focus on smooth motion with first+last frame
  return `Same person, same face, same appearance. ${actionGuide} The person stays in place. Smooth motion. Locked camera angle.`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { success: false, error: 'FAL_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sourceImage, action, style } = body;

    if (!sourceImage) {
      return NextResponse.json(
        { success: false, error: 'Source image is required' },
        { status: 400 }
      );
    }

    // Support both 'action' (new) and 'style' (legacy) parameters
    const requestedAction = action || style || 'wave';
    const avatarAction = VALID_ACTIONS.includes(requestedAction)
      ? requestedAction as AvatarAction
      : 'wave';

    // Get image as base64 data URI
    let imageData: { base64: string; mimeType: string };
    try {
      imageData = await getImageBase64(sourceImage);
      // Correct aspect ratio if needed (Runway requires max 2:1)
      imageData = await correctAspectRatio(imageData.base64, imageData.mimeType);
    } catch (error) {
      console.error('Failed to process source image:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process source image' },
        { status: 400 }
      );
    }

    const promptText = buildAnimationPrompt(avatarAction);
    const promptImageUri = `data:${imageData.mimeType};base64,${imageData.base64}`;

    // Queue job with fal.ai (non-blocking - returns immediately)
    console.log('[fal.ai] Queuing video generation with Kling 1.6...');

    const { request_id } = await fal.queue.submit(FAL_MODEL, {
      input: {
        prompt: promptText,
        image_url: promptImageUri,          // First frame
        tail_image_url: promptImageUri,     // Last frame (same image for loop effect)
        duration: "5",                      // 5 seconds
        negative_prompt: NEGATIVE_PROMPT,
        cfg_scale: 0.6,                     // Slightly higher adherence to prompt
      },
    });

    console.log('[fal.ai] Job queued with ID:', request_id);

    // Return immediately with operation ID for polling
    return NextResponse.json({
      success: true,
      pending: true,
      operationId: request_id,
      model: 'kling-1.6',
      provider: 'fal.ai',
      action: avatarAction,
    });

  } catch (error) {
    console.error('Animate avatar error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('operationId') || searchParams.get('taskId');

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'operationId is required' },
        { status: 400 }
      );
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { success: false, error: 'FAL_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    console.log('[fal.ai] Checking status for request:', requestId);

    // Check job status with fal.ai
    const status = await fal.queue.status(FAL_MODEL, {
      requestId,
      logs: true,
    });

    console.log('[fal.ai] Job status:', status.status);

    // Check if job is complete
    if (status.status === 'COMPLETED') {
      const result = await fal.queue.result(FAL_MODEL, {
        requestId,
      });

      const videoUrl = result.data?.video?.url;

      if (videoUrl) {
        console.log('[fal.ai] Video ready:', videoUrl);
        return NextResponse.json({
          success: true,
          done: true,
          videoUrl: videoUrl,
        });
      }

      return NextResponse.json({
        success: false,
        done: true,
        error: 'No video URL in completed job',
      });
    }

    // Check if job failed
    if (status.status === 'FAILED') {
      return NextResponse.json({
        success: false,
        done: true,
        error: status.error || 'Video generation failed',
      });
    }

    // Still processing
    return NextResponse.json({
      success: true,
      done: false,
      status: status.status,
      progress: status.logs?.length || 0,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status', details: String(error) },
      { status: 500 }
    );
  }
}
