'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={clsx('rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>

        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}

        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span className={clsx('font-medium', trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
