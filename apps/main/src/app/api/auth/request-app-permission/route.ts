import { NextRequest, NextResponse } from 'next/server';
import type { SearchableApp } from '@ainexsuite/types';

/**
 * POST /api/auth/request-app-permission
 * Grant an existing user permission to access a new app via SSO
 */
type RequestAppPermissionRequest = {
  appId: SearchableApp | 'suite';
  userEmail: string;
};

type RequestAppPermissionResponse = {
  success: boolean;
  message?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<RequestAppPermissionResponse>> {
  try {
    const { appId, userEmail } = (await request.json()) as RequestAppPermissionRequest;

    if (!appId || !userEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For development, always succeed
    const isDevelopment = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    if (isDevelopment) {
      return NextResponse.json(
        { success: true, message: 'App permission granted' },
        { status: 200 }
      );
    }

    // Production: Call Cloud Function to update user's appPermissions
    try {
      const response = await fetch(
        `https://us-central1-alnexsuite.cloudfunctions.net/grantAppPermission`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              appId,
              userEmail,
              approvedAt: new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to grant app permission: ${errorText}`);
      }

      return NextResponse.json(
        { success: true, message: 'App permission granted' },
        { status: 200 }
      );
    } catch {
      // For development, still return success
      if (isDevelopment) {
        return NextResponse.json(
          { success: true, message: 'App permission granted (dev)' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Failed to grant app permission' },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
