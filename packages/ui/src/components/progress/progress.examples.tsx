/**
 * Progress Components Examples
 *
 * This file demonstrates all use cases for the Progress components.
 * Copy and paste examples directly into your application.
 */

import { ProgressBar, ProgressRing, ProgressSteps, StreakProgress } from './index';
import { Flame, Target, Trophy, Calendar, Zap, Award, BookOpen } from 'lucide-react';

// ==================== ProgressBar Examples ====================

export function BasicProgressBar() {
  return <ProgressBar value={65} />;
}

export function ProgressBarWithLabel() {
  return <ProgressBar value={75} showLabel labelPosition="outside" />;
}

export function ProgressBarVariants() {
  return (
    <div className="space-y-4">
      {/* Default */}
      <ProgressBar value={60} size="md" variant="default" />

      {/* Gradient */}
      <ProgressBar value={75} size="md" variant="gradient" />

      {/* Striped animated */}
      <ProgressBar value={45} size="md" variant="striped" />
    </div>
  );
}

export function ProgressBarSizes() {
  return (
    <div className="space-y-4">
      <ProgressBar value={60} size="sm" showLabel />
      <ProgressBar value={75} size="md" showLabel />
      <ProgressBar value={90} size="lg" showLabel />
    </div>
  );
}

export function ProgressBarCustomColor() {
  return (
    <div className="space-y-4">
      <ProgressBar value={60} color="#10b981" showLabel />
      <ProgressBar value={75} color="#f59e0b" showLabel />
      <ProgressBar value={90} color="#ef4444" showLabel />
    </div>
  );
}

export function ProgressBarIndeterminate() {
  return <ProgressBar indeterminate />;
}

export function ProgressBarLabelPositions() {
  return (
    <div className="space-y-6">
      {/* Outside */}
      <div>
        <p className="text-sm text-white/50 mb-2">Outside Label</p>
        <ProgressBar value={65} showLabel labelPosition="outside" />
      </div>

      {/* Inside */}
      <div>
        <p className="text-sm text-white/50 mb-2">Inside Label</p>
        <ProgressBar value={75} showLabel labelPosition="inside" size="lg" />
      </div>
    </div>
  );
}

// ==================== ProgressRing Examples ====================

export function BasicProgressRing() {
  return <ProgressRing value={75} />;
}

export function ProgressRingSizes() {
  return (
    <div className="flex gap-6 items-center">
      <ProgressRing value={50} size={80} strokeWidth={6} />
      <ProgressRing value={65} size={120} strokeWidth={8} />
      <ProgressRing value={80} size={160} strokeWidth={10} />
    </div>
  );
}

export function ProgressRingCustomContent() {
  return (
    <div className="flex gap-6">
      {/* Trophy achievement */}
      <ProgressRing value={100} size={150} showValue={false}>
        <div className="text-center">
          <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-white">Complete!</p>
        </div>
      </ProgressRing>

      {/* Streak display */}
      <ProgressRing value={70} size={150} showValue={false}>
        <div className="text-center">
          <Flame className="h-8 w-8 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">7</p>
          <p className="text-xs text-white/50">day streak</p>
        </div>
      </ProgressRing>
    </div>
  );
}

export function ProgressRingCustomColors() {
  return (
    <div className="flex gap-6">
      <ProgressRing value={75} color="#10b981" />
      <ProgressRing value={60} color="#f59e0b" />
      <ProgressRing value={85} color="#ef4444" />
    </div>
  );
}

// ==================== ProgressSteps Examples ====================

export function BasicProgressSteps() {
  const steps = [
    { label: 'Account', completed: true, active: false },
    { label: 'Profile', completed: false, active: true },
    { label: 'Preferences', completed: false, active: false },
    { label: 'Complete', completed: false, active: false },
  ];

  return <ProgressSteps steps={steps} />;
}

export function ProgressStepsWithDescriptions() {
  const steps = [
    {
      label: 'Account',
      description: 'Create your account',
      completed: true,
      active: false,
    },
    {
      label: 'Profile',
      description: 'Set up your profile',
      completed: false,
      active: true,
    },
    {
      label: 'Preferences',
      description: 'Choose your settings',
      completed: false,
      active: false,
    },
    {
      label: 'Complete',
      description: 'Finish setup',
      completed: false,
      active: false,
    },
  ];

  return <ProgressSteps steps={steps} />;
}

export function ProgressStepsVertical() {
  const steps = [
    { label: 'Order placed', completed: true, active: false },
    { label: 'Processing', completed: true, active: false },
    { label: 'Shipped', completed: false, active: true },
    { label: 'Delivered', completed: false, active: false },
  ];

  return <ProgressSteps steps={steps} orientation="vertical" />;
}

export function ProgressStepsSizes() {
  const steps = [
    { label: 'Step 1', completed: true, active: false },
    { label: 'Step 2', completed: false, active: true },
    { label: 'Step 3', completed: false, active: false },
  ];

  return (
    <div className="space-y-8">
      <ProgressSteps steps={steps} size="sm" />
      <ProgressSteps steps={steps} size="md" />
      <ProgressSteps steps={steps} size="lg" />
    </div>
  );
}

// ==================== StreakProgress Examples ====================

export function BasicStreakProgress() {
  return (
    <StreakProgress
      current={7}
      target={30}
      label="Daily Meditation"
      unit="days"
    />
  );
}

export function StreakProgressWorkout() {
  return (
    <StreakProgress
      current={15}
      target={20}
      label="Workout Goal"
      icon={Target}
      color="#3b82f6"
      unit="sessions"
      showPercentage
    />
  );
}

export function StreakProgressComplete() {
  return (
    <StreakProgress
      current={100}
      target={100}
      label="Challenge Complete"
      icon={Trophy}
      color="#eab308"
      celebrateOnComplete
      unit="points"
    />
  );
}

export function StreakProgressSizes() {
  return (
    <div className="space-y-4">
      <StreakProgress
        current={5}
        target={10}
        label="Small Streak"
        size="sm"
      />

      <StreakProgress
        current={7}
        target={30}
        label="Medium Streak"
        size="md"
      />

      <StreakProgress
        current={15}
        target={30}
        label="Large Streak"
        size="lg"
      />
    </div>
  );
}

export function StreakProgressCustomIcons() {
  return (
    <div className="space-y-4">
      <StreakProgress
        current={5}
        target={7}
        label="Weekly Goals"
        icon={Calendar}
        color="#8b5cf6"
      />

      <StreakProgress
        current={12}
        target={20}
        label="Energy Boost"
        icon={Zap}
        color="#eab308"
      />

      <StreakProgress
        current={8}
        target={10}
        label="Achievements"
        icon={Award}
        color="#10b981"
      />

      <StreakProgress
        current={25}
        target={50}
        label="Books Read"
        icon={BookOpen}
        color="#06b6d4"
      />
    </div>
  );
}

// ==================== Real-World Use Cases ====================

export function GoalTrackerExample() {
  return (
    <div className="surface-card rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Learning Goals</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white">JavaScript Mastery</span>
            <span className="text-white/50">45/100 hours</span>
          </div>
          <ProgressBar value={45} variant="gradient" />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white">TypeScript Advanced</span>
            <span className="text-white/50">78/100 hours</span>
          </div>
          <ProgressBar value={78} variant="gradient" />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white">React Patterns</span>
            <span className="text-white/50">62/100 hours</span>
          </div>
          <ProgressBar value={62} variant="gradient" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsExample() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="surface-card rounded-2xl p-6 flex flex-col items-center">
        <ProgressRing value={85} size={120} color="#10b981" />
        <p className="text-sm text-white/70 mt-4">Completion Rate</p>
      </div>

      <div className="surface-card rounded-2xl p-6 flex flex-col items-center">
        <ProgressRing value={72} size={120} color="#f59e0b" />
        <p className="text-sm text-white/70 mt-4">Weekly Progress</p>
      </div>

      <div className="surface-card rounded-2xl p-6 flex flex-col items-center">
        <ProgressRing value={91} size={120} color="#3b82f6" />
        <p className="text-sm text-white/70 mt-4">Accuracy Score</p>
      </div>
    </div>
  );
}

export function OnboardingFlowExample() {
  const steps = [
    {
      label: 'Welcome',
      description: 'Get started with your account',
      completed: true,
      active: false,
    },
    {
      label: 'Profile Setup',
      description: 'Tell us about yourself',
      completed: true,
      active: false,
    },
    {
      label: 'Preferences',
      description: 'Customize your experience',
      completed: false,
      active: true,
    },
    {
      label: 'Integration',
      description: 'Connect your tools',
      completed: false,
      active: false,
    },
    {
      label: 'Ready!',
      description: "You're all set",
      completed: false,
      active: false,
    },
  ];

  return (
    <div className="surface-card rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-8">Setup Your Account</h2>
      <ProgressSteps steps={steps} size="lg" />
    </div>
  );
}

export function AchievementTrackerExample() {
  return (
    <div className="grid gap-4">
      <StreakProgress
        current={7}
        target={30}
        label="Daily Meditation Streak"
        icon={Flame}
        color="#f97316"
        unit="days"
        showPercentage
      />

      <StreakProgress
        current={15}
        target={20}
        label="Workout Challenge"
        icon={Target}
        color="#3b82f6"
        unit="sessions"
        showPercentage
      />

      <StreakProgress
        current={50}
        target={50}
        label="Learning Marathon"
        icon={Trophy}
        color="#eab308"
        unit="hours"
        celebrateOnComplete
      />
    </div>
  );
}
