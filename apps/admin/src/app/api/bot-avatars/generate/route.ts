/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import sharp from 'sharp';
import {
  BOT_AVATAR_PROMPTS,
  BOT_AVATAR_NEGATIVE_PROMPT,
  type BotAvatarAnimationStyle,
} from '@ainexsuite/types';

/**
 * Bot Avatar Animation Generation API using fal.ai Kling 1.6
 * Creates subtle, conversational presence animations for AI assistant avatars
 */

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

const FAL_MODEL = 'fal-ai/kling-video/v1.6/pro/image-to-video';

const VALID_STYLES: BotAvatarAnimationStyle[] = [
  'conversational',
  'listening',
  'thinking',
  'responding',
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
 * Correct image aspect ratio to meet Kling requirements (max 2:1)
 * If image is wider than 2:1, it will be center-cropped
 */
async function correctAspectRatio(
  base64: string,
  mimeType: string
): Promise<{ base64: string; mimeType: string }> {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return { base64, mimeType };
    }

    const aspectRatio = metadata.width / metadata.height;
    const maxAspectRatio = 2.0;

    if (aspectRatio <= maxAspectRatio) {
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
        height: metadata.height,
      })
      .toBuffer();

    const croppedBase64 = croppedBuffer.toString('base64');
    return { base64: croppedBase64, mimeType };
  } catch (error) {
    console.error('Failed to correct aspect ratio:', error);
    return { base64, mimeType };
  }
}

/**
 * Build animation prompt for the style
 */
function buildAnimationPrompt(style: BotAvatarAnimationStyle): string {
  return BOT_AVATAR_PROMPTS[style] || BOT_AVATAR_PROMPTS.conversational;
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
    const { sourceImage, style } = body;

    if (!sourceImage) {
      return NextResponse.json(
        { success: false, error: 'Source image is required' },
        { status: 400 }
      );
    }

    // Validate style
    const animationStyle: BotAvatarAnimationStyle = VALID_STYLES.includes(style)
      ? style
      : 'conversational';

    // Get image as base64 data URI
    let imageData: { base64: string; mimeType: string };
    try {
      imageData = await getImageBase64(sourceImage);
      // Correct aspect ratio if needed
      imageData = await correctAspectRatio(imageData.base64, imageData.mimeType);
    } catch (error) {
      console.error('Failed to process source image:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process source image' },
        { status: 400 }
      );
    }

    const promptText = buildAnimationPrompt(animationStyle);
    const promptImageUri = `data:${imageData.mimeType};base64,${imageData.base64}`;

    // Queue job with fal.ai (non-blocking - returns immediately)
    console.log('[fal.ai] Queuing bot avatar generation with Kling 1.6...');
    console.log('[fal.ai] Style:', animationStyle);

    const { request_id } = await fal.queue.submit(FAL_MODEL, {
      input: {
        prompt: promptText,
        image_url: promptImageUri, // First frame
        tail_image_url: promptImageUri, // Last frame (same for loop effect)
        duration: '5', // 5 seconds
        negative_prompt: BOT_AVATAR_NEGATIVE_PROMPT,
        cfg_scale: 0.5, // Lower for more natural, less prompt adherence
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
      style: animationStyle,
    });
  } catch (error) {
    console.error('Bot avatar generation error:', error);
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
    const requestId = searchParams.get('operationId');

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

    // Still processing (IN_QUEUE or IN_PROGRESS)
    return NextResponse.json({
      success: true,
      done: false,
      status: status.status,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status', details: String(error) },
      { status: 500 }
    );
  }
}
