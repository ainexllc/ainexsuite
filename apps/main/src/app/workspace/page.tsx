'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { SmartDashboardService, InsightCardData, DashboardStats } from '@/lib/smart-dashboard';
import { SmartGrid } from '@/components/smart-dashboard/smart-grid';
import { WelcomeHeader, DailyFocus, QuickActions, TodaysSchedule, WeeklyProgress, AchievementsWidget } from '@/components/dashboard';
import { DashboardSkeleton } from '@/components/loading/dashboard-skeleton';
import { WorkspacePageLayout } from '@ainexsuite/ui/components';
import { motion } from 'framer-motion';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function WorkspacePage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightCardData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    currentStreak: 0,
    bestStreak: 0,
    tasksCompletedToday: 0,
    tasksDueToday: 0,
    habitsAtRisk: 0,
  });
  const [loading, setLoading] = useState(true);

  // Subscribe to insights and dashboard stats
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const service = new SmartDashboardService(user.uid);
    const unsubscribes: (() => void)[] = [];

    // Subscribe to insights
    unsubscribes.push(
      service.subscribeToInsights((data) => {
        setInsights(data);
        setLoading(false);
      })
    );

    // Subscribe to dashboard stats for real streak data
    unsubscribes.push(
      service.subscribeToDashboardStats((stats) => {
        setDashboardStats(stats);
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user?.uid]);

  // Handle focus item click
  const handleFocusClick = (insight: InsightCardData) => {
    if (insight.actionUrl) {
      window.location.href = insight.actionUrl;
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      className="space-y-8 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.section
        className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
        variants={itemVariants}
      >
        <WelcomeHeader
          userName={user?.displayName}
          tasksDueToday={dashboardStats.tasksDueToday}
          tasksCompletedToday={dashboardStats.tasksCompletedToday}
          currentStreak={dashboardStats.currentStreak}
          habitsAtRisk={dashboardStats.habitsAtRisk}
        />
      </motion.section>

      {/* Weekly Progress */}
      <motion.section
        className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
        variants={itemVariants}
      >
        <WeeklyProgress />
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
        variants={itemVariants}
      >
        <QuickActions />
      </motion.section>

      {/* Daily Focus - Top priority items */}
      {insights.length > 0 && (
        <motion.section
          className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
          variants={itemVariants}
        >
          <DailyFocus
            insights={insights}
            onItemClick={handleFocusClick}
            maxItems={3}
          />
        </motion.section>
      )}

      {/* Today's Schedule */}
      <motion.section
        className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
        variants={itemVariants}
      >
        <TodaysSchedule maxItems={5} />
      </motion.section>

      {/* Smart Dashboard Grid */}
      <motion.div variants={itemVariants}>
        <WorkspacePageLayout maxWidth="wide">
          <SmartGrid />
        </WorkspacePageLayout>
      </motion.div>

      {/* Achievements */}
      <motion.section
        className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={itemVariants}
      >
        <AchievementsWidget />
      </motion.section>
    </motion.div>
  );
}
