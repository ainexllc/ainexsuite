import { NextRequest, NextResponse } from 'next/server';
import { getBotAvatars } from '@ainexsuite/firebase';
import { uploadBotAvatarAdmin } from '@ainexsuite/firebase/admin';
import type {
  BotAvatarAnimationStyle,
  SubscriptionTier,
} from '@ainexsuite/types';

/**
 * Bot Avatars List and Create API
 */

// GET - List all bot avatars
export async function GET() {
  try {
    const avatars = await getBotAvatars();
    return NextResponse.json({
      success: true,
      avatars,
    });
  } catch (error) {
    console.error('Failed to get bot avatars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get bot avatars' },
      { status: 500 }
    );
  }
}

// POST - Create a new bot avatar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceImageData,
      videoData,
      name,
      description,
      animationStyle,
      availableTiers,
      isDefault,
      generationPrompt,
      uploadedBy,
    } = body;

    // Validate required fields
    if (!sourceImageData) {
      return NextResponse.json(
        { success: false, error: 'Source image data is required' },
        { status: 400 }
      );
    }

    if (!videoData) {
      return NextResponse.json(
        { success: false, error: 'Video data is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!uploadedBy) {
      return NextResponse.json(
        { success: false, error: 'uploadedBy (admin user ID) is required' },
        { status: 400 }
      );
    }

    // Validate animation style
    const validStyles: BotAvatarAnimationStyle[] = [
      'conversational',
      'listening',
      'thinking',
      'responding',
    ];
    const style: BotAvatarAnimationStyle = validStyles.includes(animationStyle)
      ? animationStyle
      : 'conversational';

    // Validate tiers
    const validTiers: SubscriptionTier[] = ['free', 'trial', 'pro', 'premium'];
    const tiers: SubscriptionTier[] = Array.isArray(availableTiers)
      ? availableTiers.filter((t: string) => validTiers.includes(t as SubscriptionTier))
      : ['free', 'trial', 'pro', 'premium'];

    // Upload the avatar using Admin SDK (server-side, bypasses rules)
    const result = await uploadBotAvatarAdmin(
      sourceImageData,
      videoData,
      {
        name,
        description,
        animationStyle: style,
        availableTiers: tiers,
        isDefault: isDefault || false,
        generationPrompt,
      },
      uploadedBy
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar: result.avatar,
    });
  } catch (error) {
    console.error('Failed to create bot avatar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create bot avatar',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
