'use client';

import { Dumbbell, UtensilsCrossed, Droplets, Scale, TrendingUp, Flame, Target } from 'lucide-react';

/**
 * Main dashboard view for the Fit app.
 * Shows an overview of workouts, nutrition, water, and body metrics.
 */
export function FitDashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Dumbbell}
          label="Workouts This Week"
          value="0"
          color="blue"
        />
        <StatCard
          icon={Flame}
          label="Calories Today"
          value="0"
          color="orange"
        />
        <StatCard
          icon={Droplets}
          label="Water Today"
          value="0 / 8"
          suffix="glasses"
          color="cyan"
        />
        <StatCard
          icon={Scale}
          label="Current Weight"
          value="--"
          suffix="lbs"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Progress */}
        <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[hsl(var(--app-primary))]" />
            Today&apos;s Progress
          </h3>
          <div className="space-y-4">
            <ProgressRow label="Workouts" current={0} target={1} unit="session" />
            <ProgressRow label="Calories" current={0} target={2000} unit="kcal" />
            <ProgressRow label="Protein" current={0} target={150} unit="g" />
            <ProgressRow label="Water" current={0} target={8} unit="glasses" />
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[hsl(var(--app-primary))]" />
            Recent Workouts
          </h3>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No workouts logged yet. Start tracking!</p>
          </div>
        </div>
      </div>

      {/* Nutrition Summary */}
      <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-[hsl(var(--app-primary))]" />
          Today&apos;s Nutrition
        </h3>
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          <p className="text-sm">No meals logged today. Log your first meal!</p>
        </div>
      </div>

      {/* Weight Trend */}
      <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--app-primary))]" />
          Weight Trend
        </h3>
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          <p className="text-sm">Log your weight to see trends over time.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  suffix?: string;
  color: 'blue' | 'orange' | 'cyan' | 'purple' | 'green';
}) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500',
    orange: 'bg-orange-500/10 text-orange-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    purple: 'bg-purple-500/10 text-purple-500',
    green: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border p-4">
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function ProgressRow({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
}) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[hsl(var(--app-primary))] rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
