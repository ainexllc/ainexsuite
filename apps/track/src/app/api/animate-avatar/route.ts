import { NextRequest, NextResponse } from 'next/server';

/**
 * Animated Avatar Generation API using Runway Gen-4 Turbo
 * Uses image-to-video generation to animate profile avatars
 */

// Runway API configuration
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || '';
const RUNWAY_BASE_URL = 'https://api.dev.runwayml.com/v1';
const RUNWAY_API_VERSION = '2024-11-06';

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

// Action-specific animation prompts - detailed descriptions
const ACTION_PROMPTS: Record<AvatarAction, string> = {
  wave: 'The person raises their right hand and waves it side to side in a friendly hello gesture, then lowers hand back to starting position.',
  wink: 'The person slowly closes their right eye in a deliberate wink with a playful smile, then opens eye returning to neutral expression.',
  thumbsup: 'The person raises their right hand with thumb up in a thumbs up gesture, holds briefly, then lowers hand back down.',
  peace: 'The person raises their right hand making a V peace sign with a cool smile, holds it, then lowers hand back to start.',
  dance: 'The person bobs their head and sways shoulders rhythmically in a fun dance, then smoothly returns to original still pose.',
  laugh: 'The person laughs joyfully with shoulders shaking, then gradually calms down returning to a gentle smile.',
  nod: 'The person nods their head up and down several times in agreement, then returns head to center looking forward.',
  blowkiss: 'The person brings hand to lips, blows a kiss outward, then lowers hand gracefully back to starting position.',
  shrug: 'The person raises shoulders and palms up in a shrug gesture, then relaxes shoulders back down to normal.',
  clap: 'The person claps hands together enthusiastically several times, then lowers hands back to resting position.',
  salute: 'The person raises right hand to forehead in a crisp salute, holds briefly, then lowers hand back down.',
  flex: 'The person raises arms and flexes biceps proudly, holds the pose, then relaxes arms back to sides.',
};

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
 * Build animation prompt for the action
 */
function buildAnimationPrompt(action: AvatarAction): string {
  const actionGuide = ACTION_PROMPTS[action] || ACTION_PROMPTS.wave;

  // Gen-4 prompting: focus on subject action, avoid negative commands
  return `Same person, same face, same appearance. ${actionGuide} The person stays in place. Locked camera angle.`;
}

export async function POST(request: NextRequest) {
  try {
    if (!RUNWAY_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'RUNWAY_API_KEY environment variable is not set' },
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
    } catch (error) {
      console.error('Failed to process source image:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process source image' },
        { status: 400 }
      );
    }

    const promptText = buildAnimationPrompt(avatarAction);
    const promptImageUri = `data:${imageData.mimeType};base64,${imageData.base64}`;

    // Call Runway Veo 3.1 API (Google's video generation model via Runway)
    const response = await fetch(`${RUNWAY_BASE_URL}/image_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': RUNWAY_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'veo3.1',
        promptImage: [
          {
            uri: promptImageUri,
            position: 'first',
          },
        ],
        promptText: promptText,
        ratio: '1280:720',
        duration: 6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runway API error:', response.status, errorText);

      let errorMessage = 'Runway API request failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        // Use default
      }

      return NextResponse.json(
        { success: false, error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Runway returns a task ID for async generation
    if (data.id) {
      return NextResponse.json({
        success: true,
        pending: true,
        operationId: data.id,
        model: 'veo3.1',
        provider: 'runway',
        action: avatarAction,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unexpected response format', details: data },
      { status: 422 }
    );

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

// GET endpoint to check task status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('operationId') || searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: 'taskId is required' },
      { status: 400 }
    );
  }

  if (!RUNWAY_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'RUNWAY_API_KEY environment variable is not set' },
      { status: 500 }
    );
  }

  try {
    // Query task status
    const response = await fetch(`${RUNWAY_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': RUNWAY_API_VERSION,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: 'Failed to check task status', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check status - Runway uses: PENDING, RUNNING, SUCCEEDED, FAILED, CANCELLED
    const status = data.status;

    if (status === 'SUCCEEDED') {
      // Get the video URL from output
      const videoUrl = data.output?.[0] || data.outputUrl;

      if (videoUrl) {
        return NextResponse.json({
          success: true,
          done: true,
          videoUrl: videoUrl,
        });
      }
      return NextResponse.json({
        success: false,
        error: 'No video in completed task',
        done: true,
        details: data,
      });
    }

    if (status === 'FAILED' || status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: data.failure || data.error || 'Video generation failed',
        done: true,
      });
    }

    // Still processing (PENDING, RUNNING)
    return NextResponse.json({
      success: true,
      done: false,
      status: status,
      progress: data.progress,
    });

  } catch (error) {
    console.error('Check task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check task status', details: String(error) },
      { status: 500 }
    );
  }
}
