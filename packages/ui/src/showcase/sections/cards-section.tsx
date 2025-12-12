'use client';

import { Card } from '../../components/cards/card';
import { DataCard } from '../../components/cards/data-card';
import { StatsCard } from '../../components/cards/stats-card';
import { TrendingUp, Calendar, Target, Users } from 'lucide-react';

export function CardsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Card</h3>
        <Card>
          <div className="p-4">
            <h4 className="font-medium mb-2">Simple Card</h4>
            <p className="text-sm text-muted-foreground">
              A basic card component with simple styling and content.
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">DataCard Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Total Revenue"
            subtitle="$12,345"
          />
          <DataCard
            icon={<Calendar className="w-5 h-5" />}
            title="Active Days"
            subtitle="127"
            variant="compact"
          />
          <DataCard
            icon={<Target className="w-5 h-5" />}
            title="Goals Achieved"
            subtitle="85%"
            variant="highlighted"
            accentColor="#f97316"
          />
          <DataCard
            icon={<Users className="w-5 h-5" />}
            title="Team Members"
            subtitle="24"
            variant="interactive"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">StatsCard Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            title="Weekly Progress"
            value="7 days"
            icon={<Calendar className="w-5 h-5" />}
          />
          <StatsCard
            title="Completion Rate"
            value="92%"
            variant="compact"
            icon={<Target className="w-5 h-5" />}
          />
          <StatsCard
            title="Monthly Growth"
            value="$15,420"
            variant="detailed"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: 12.5, isPositive: true }}
            subtitle="+12.5% from last month"
          />
          <StatsCard
            title="Active Users"
            value="1,234"
            variant="detailed"
            icon={<Users className="w-5 h-5" />}
            trend={{ value: 8.3, isPositive: true }}
            subtitle="+8.3% this week"
          />
        </div>
      </div>
    </div>
  );
}
