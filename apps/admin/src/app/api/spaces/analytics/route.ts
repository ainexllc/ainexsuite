import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import type { SpaceType } from '@ainexsuite/types';

interface SpaceAnalytics {
  totalSpaces: number;
  activeSpaces: number;
  byType: Record<SpaceType, number>;
  byApp: Record<string, number>;
  memberStats: {
    totalMembers: number;
    averageMembersPerSpace: number;
    maxMembers: number;
    spacesWithMultipleMembers: number;
  };
  creationTrends: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
  typeDistribution: Array<{ type: SpaceType; count: number; percentage: number }>;
}

/**
 * Get space analytics.
 * GET /api/spaces/analytics
 *
 * Query params:
 * - adminUid: string (required for auth)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Auth check
    const adminUid = searchParams.get('adminUid');
    if (!adminUid) {
      return NextResponse.json({ error: 'Admin UID is required' }, { status: 401 });
    }

    // Verify the requester is an admin
    const adminDoc = await adminDb.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Fetch all spaces
    const spacesSnapshot = await adminDb.collection('spaces').get();
    const spaces = spacesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

    // Initialize counters
    const byType: Record<string, number> = {
      personal: 0,
      family: 0,
      work: 0,
      couple: 0,
      buddy: 0,
      squad: 0,
      project: 0,
    };

    const byApp: Record<string, number> = {};

    let totalMembers = 0;
    let maxMembers = 0;
    let spacesWithMultipleMembers = 0;
    let activeSpaces = 0;
    let last7Days = 0;
    let last30Days = 0;
    let last90Days = 0;

    // Process each space
    for (const space of spaces) {
      const spaceData = space as Record<string, unknown>;

      // Count by type
      const spaceType = spaceData.type as string;
      if (spaceType && byType[spaceType] !== undefined) {
        byType[spaceType]++;
      }

      // Count members
      const members = (spaceData.members as unknown[]) || [];
      const childMembers = (spaceData.childMembers as unknown[]) || [];
      const memberCount = members.length + childMembers.length;
      totalMembers += memberCount;
      maxMembers = Math.max(maxMembers, memberCount);

      if (memberCount > 1) {
        spacesWithMultipleMembers++;
      }

      // Check if space is "active" (updated in last 30 days)
      const updatedAt = spaceData.updatedAt as number;
      if (updatedAt && updatedAt > thirtyDaysAgo) {
        activeSpaces++;
      }

      // Count by creation date
      const createdAt = spaceData.createdAt as number;
      if (createdAt) {
        if (createdAt > sevenDaysAgo) last7Days++;
        if (createdAt > thirtyDaysAgo) last30Days++;
        if (createdAt > ninetyDaysAgo) last90Days++;
      }

      // Count by app (based on hiddenInApps - spaces visible in apps)
      const hiddenInApps = (spaceData.hiddenInApps as string[]) || [];
      const isGlobal = spaceData.isGlobal as boolean;

      // All possible apps
      const allApps = [
        'notes',
        'journal',
        'todo',
        'health',
        'album',
        'habits',
        'fit',
        'projects',
        'flow',
        'calendar',
      ];

      if (isGlobal) {
        // Global spaces are visible in all apps
        for (const app of allApps) {
          byApp[app] = (byApp[app] || 0) + 1;
        }
      } else {
        // Non-global spaces: visible in apps not in hiddenInApps
        for (const app of allApps) {
          if (!hiddenInApps.includes(app)) {
            byApp[app] = (byApp[app] || 0) + 1;
          }
        }
      }
    }

    const totalSpaces = spaces.length;

    // Calculate type distribution with percentages
    const typeDistribution = Object.entries(byType)
      .map(([type, count]) => ({
        type: type as SpaceType,
        count,
        percentage: totalSpaces > 0 ? Math.round((count / totalSpaces) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const analytics: SpaceAnalytics = {
      totalSpaces,
      activeSpaces,
      byType: byType as Record<SpaceType, number>,
      byApp,
      memberStats: {
        totalMembers,
        averageMembersPerSpace: totalSpaces > 0 ? Math.round((totalMembers / totalSpaces) * 10) / 10 : 0,
        maxMembers,
        spacesWithMultipleMembers,
      },
      creationTrends: {
        last7Days,
        last30Days,
        last90Days,
      },
      typeDistribution,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Space analytics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
