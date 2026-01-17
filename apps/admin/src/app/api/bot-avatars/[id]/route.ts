import { NextRequest, NextResponse } from 'next/server';
import {
  getBotAvatarById,
  updateBotAvatar,
  deleteBotAvatar,
  setDefaultBotAvatar,
  toggleBotAvatarActive,
} from '@ainexsuite/firebase';
import type {
  BotAvatarUpdateInput,
  SubscriptionTier,
} from '@ainexsuite/types';

/**
 * Single Bot Avatar CRUD API
 */

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single bot avatar
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const avatar = await getBotAvatarById(id);

    if (!avatar) {
      return NextResponse.json(
        { success: false, error: 'Bot avatar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error) {
    console.error('Failed to get bot avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get bot avatar' },
      { status: 500 }
    );
  }
}

// PATCH - Update bot avatar
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, animationStyle, availableTiers, isDefault, active } = body;

    // Verify avatar exists
    const existing = await getBotAvatarById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bot avatar not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: BotAvatarUpdateInput = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (animationStyle !== undefined) {
      const validStyles = ['conversational', 'listening', 'thinking', 'responding'];
      if (validStyles.includes(animationStyle)) {
        updates.animationStyle = animationStyle;
      }
    }

    if (availableTiers !== undefined) {
      const validTiers: SubscriptionTier[] = ['free', 'trial', 'pro', 'premium'];
      updates.availableTiers = Array.isArray(availableTiers)
        ? availableTiers.filter((t: string) => validTiers.includes(t as SubscriptionTier))
        : undefined;
    }

    if (isDefault !== undefined) {
      updates.isDefault = isDefault;
    }

    if (active !== undefined) {
      updates.active = active;
    }

    // Handle special cases
    if (isDefault === true) {
      // Setting as default uses special function
      const success = await setDefaultBotAvatar(id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to set as default' },
          { status: 500 }
        );
      }
      // Remove isDefault from updates as it's already handled
      delete updates.isDefault;
    }

    if (active !== undefined && Object.keys(updates).length === 1 && 'active' in updates) {
      // Only toggling active status
      const success = await toggleBotAvatarActive(id, active);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to toggle active status' },
          { status: 500 }
        );
      }
    } else if (Object.keys(updates).length > 0) {
      // General update
      const success = await updateBotAvatar(id, updates);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update bot avatar' },
          { status: 500 }
        );
      }
    }

    // Fetch updated avatar
    const updatedAvatar = await getBotAvatarById(id);

    return NextResponse.json({
      success: true,
      avatar: updatedAvatar,
    });
  } catch (error) {
    console.error('Failed to update bot avatar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update bot avatar',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete bot avatar
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify avatar exists
    const existing = await getBotAvatarById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bot avatar not found' },
        { status: 404 }
      );
    }

    // Check if it's the default avatar
    if (existing.isDefault) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the default bot avatar. Set another as default first.' },
        { status: 400 }
      );
    }

    const success = await deleteBotAvatar(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete bot avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bot avatar deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete bot avatar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete bot avatar',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
