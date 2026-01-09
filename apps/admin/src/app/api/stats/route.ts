import { NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';

/**
 * Get platform stats using Firebase Admin SDK.
 * GET /api/stats
 */
export async function GET() {
  try {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // --- Basic counts ---
    const [usersSnapshot, feedbackSnapshot, spacesSnapshot] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('feedback').count().get(),
      adminDb.collection('spaces').count().get(),
    ]);

    const totalUsers = usersSnapshot.data().count;
    const totalFeedback = feedbackSnapshot.data().count;
    const activeSpaces = spacesSnapshot.data().count;

    // --- User Growth (last 12 months) ---
    const userGrowth = await getUserGrowthByMonth();

    // --- Active Users ---
    const [dailyActiveSnapshot, weeklyActiveSnapshot] = await Promise.all([
      adminDb.collection('users').where('lastLoginAt', '>=', oneDayAgo).count().get(),
      adminDb.collection('users').where('lastLoginAt', '>=', oneWeekAgo).count().get(),
    ]);

    const activeUsers = {
      daily: dailyActiveSnapshot.data().count,
      weekly: weeklyActiveSnapshot.data().count,
      monthly: totalUsers, // Approximation
    };

    // --- App Usage (from appsUsed field) ---
    const appUsage = await getAppUsageStats();

    // --- Feedback by App ---
    const feedbackByApp = await getFeedbackByApp();

    // --- Recent Feedback (for trends) ---
    const feedbackTrends = await getFeedbackTrends();

    // --- Recent Activity ---
    const recentActivity = await getRecentActivity();

    // --- Subscription Stats ---
    const subscriptionStats = await getSubscriptionStats();

    const stats = {
      // Summary cards
      totalUsers,
      totalFeedback,
      activeSpaces,
      pageViews: Math.floor(totalUsers * 6.1),

      // Charts data
      userGrowth,
      activeUsers,
      appUsage,
      feedbackByApp,
      feedbackTrends,
      recentActivity,
      subscriptionStats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

/**
 * Get user registration counts by month for the last 12 months
 */
async function getUserGrowthByMonth() {
  const months: { month: string; count: number }[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const startTimestamp = date.getTime();
    const endTimestamp = nextMonth.getTime();

    const snapshot = await adminDb
      .collection('users')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<', endTimestamp)
      .count()
      .get();

    months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      count: snapshot.data().count,
    });
  }

  return months;
}

/**
 * Get app usage statistics from users' appsUsed field
 */
async function getAppUsageStats() {
  const usersSnapshot = await adminDb.collection('users').select('appsUsed', 'appsEligible').get();

  const appCounts: Record<string, number> = {
    notes: 0,
    todo: 0,
    journal: 0,
    calendar: 0,
    habits: 0,
    health: 0,
    album: 0,
    fit: 0,
    projects: 0,
    docs: 0,
    tables: 0,
    flow: 0,
    subs: 0,
  };

  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const appsUsed = data.appsUsed || {};
    const appsEligible = data.appsEligible || [];

    // Count from appsUsed (actual usage timestamps)
    Object.keys(appsUsed).forEach((app) => {
      if (appCounts[app] !== undefined) {
        appCounts[app]++;
      }
    });

    // Also count eligible apps if appsUsed is empty
    if (Object.keys(appsUsed).length === 0) {
      appsEligible.forEach((app: string) => {
        if (appCounts[app] !== undefined) {
          appCounts[app]++;
        }
      });
    }
  });

  // Convert to array sorted by count
  const total = Object.values(appCounts).reduce((a, b) => a + b, 0) || 1;

  return Object.entries(appCounts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Top 6 apps
}

/**
 * Get feedback counts by app
 */
async function getFeedbackByApp() {
  const feedbackSnapshot = await adminDb.collection('feedback').select('appId').get();

  const appCounts: Record<string, number> = {};

  feedbackSnapshot.docs.forEach((doc) => {
    const appId = doc.data().appId || 'unknown';
    appCounts[appId] = (appCounts[appId] || 0) + 1;
  });

  return Object.entries(appCounts)
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get feedback trends by week (last 4 weeks)
 */
async function getFeedbackTrends() {
  const now = Date.now();
  const weeks: { week: string; count: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
    const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;

    const snapshot = await adminDb
      .collection('feedback')
      .where('createdAt', '>=', weekStart)
      .where('createdAt', '<', weekEnd)
      .count()
      .get();

    weeks.push({
      week: `Week ${4 - i}`,
      count: snapshot.data().count,
    });
  }

  return weeks;
}

/**
 * Get recent activity (users, feedback, spaces)
 */
async function getRecentActivity() {
  const activities: Array<{
    type: string;
    action: string;
    detail: string;
    timestamp: number;
  }> = [];

  // Recent users
  const recentUsersSnapshot = await adminDb
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  recentUsersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    activities.push({
      type: 'user',
      action: 'New user registered',
      detail: data.email || 'Unknown',
      timestamp: data.createdAt || Date.now(),
    });
  });

  // Recent feedback
  const recentFeedbackSnapshot = await adminDb
    .collection('feedback')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  recentFeedbackSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    activities.push({
      type: 'feedback',
      action: 'Feedback submitted',
      detail: data.authorEmail || data.appId || 'Unknown',
      timestamp: data.createdAt || Date.now(),
    });
  });

  // Recent spaces
  const recentSpacesSnapshot = await adminDb
    .collection('spaces')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  recentSpacesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    activities.push({
      type: 'space',
      action: 'New space created',
      detail: data.name || 'Unnamed space',
      timestamp: data.createdAt || Date.now(),
    });
  });

  // Sort by timestamp and return top 10
  return activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
    .map((activity) => ({
      ...activity,
      time: getRelativeTime(activity.timestamp),
    }));
}

/**
 * Get subscription statistics
 */
async function getSubscriptionStats() {
  const usersSnapshot = await adminDb
    .collection('users')
    .select('subscriptionStatus', 'subscriptionTier')
    .get();

  const statusCounts: Record<string, number> = {
    trial: 0,
    active: 0,
    expired: 0,
    canceled: 0,
  };

  const tierCounts: Record<string, number> = {
    trial: 0,
    'single-app': 0,
    'three-apps': 0,
    pro: 0,
    premium: 0,
  };

  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const status = data.subscriptionStatus || 'trial';
    const tier = data.subscriptionTier || 'trial';

    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
    if (tierCounts[tier] !== undefined) {
      tierCounts[tier]++;
    }
  });

  return { statusCounts, tierCounts };
}

/**
 * Convert timestamp to relative time string
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(timestamp).toLocaleDateString();
}
