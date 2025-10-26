'use client';

import type { LearningGoal, SkillProgress } from '@ainexsuite/types';
import { Target, Award, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProgressDashboardProps {
  goals: LearningGoal[];
  skills: SkillProgress[];
}

export function ProgressDashboard({ goals, skills }: ProgressDashboardProps) {
  const activeGoals = goals.filter((g) => g.active);
  const completedGoals = goals.filter((g) => !g.active);

  const totalProgress =
    activeGoals.reduce((sum, g) => sum + (g.currentLevel / g.targetLevel) * 100, 0) /
    (activeGoals.length || 1);

  const totalLearningTime = skills.reduce((sum, s) => sum + s.totalMinutes, 0);

  const skillChartData = skills.slice(0, 10).map((s) => ({
    name: s.skill.length > 15 ? s.skill.substring(0, 15) + '...' : s.skill,
    level: s.level,
    hours: Math.round(s.totalMinutes / 60),
  }));

  const COLORS = {
    beginner: '#EF4444',
    intermediate: '#F59E0B',
    advanced: '#10B981',
    expert: '#3B82F6',
    master: '#8B5CF6',
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return COLORS.master;
    if (level >= 60) return COLORS.expert;
    if (level >= 40) return COLORS.advanced;
    if (level >= 20) return COLORS.intermediate;
    return COLORS.beginner;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="surface-card rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-accent-500" />
            </div>
            <div>
              <div className="text-sm text-ink-600">Active Goals</div>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-skill-advanced/20 flex items-center justify-center">
              <Award className="h-5 w-5 text-skill-advanced" />
            </div>
            <div>
              <div className="text-sm text-ink-600">Completed</div>
              <div className="text-2xl font-bold">{completedGoals.length}</div>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-skill-expert/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-skill-expert" />
            </div>
            <div>
              <div className="text-sm text-ink-600">Avg Progress</div>
              <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-skill-master/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-skill-master" />
            </div>
            <div>
              <div className="text-sm text-ink-600">Learning Time</div>
              <div className="text-2xl font-bold">
                {Math.round(totalLearningTime / 60)}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {skillChartData.length > 0 && (
        <div className="surface-card rounded-lg p-6">
          <h3 className="font-semibold mb-4">Top Skills by Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillChartData}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
                stroke="#232326"
              />
              <YAxis
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
                stroke="#232326"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1D',
                  border: '1px solid #232326',
                  borderRadius: '8px',
                  color: '#E8E8E8',
                }}
                formatter={(value: number | string, name: string) =>
                  name === 'level'
                    ? [`${value}%`, 'Level']
                    : [`${value}h`, 'Practice Time']
                }
              />
              <Bar dataKey="level" radius={[8, 8, 0, 0]}>
                {skillChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSkillColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="surface-card rounded-lg p-6">
          <h3 className="font-semibold mb-4">Active Goals Progress</h3>
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = ((goal.currentLevel / goal.targetLevel) * 100) || 0;
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-ink-600">
                      {goal.currentLevel}/{goal.targetLevel} ({Math.round(progress)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 progress-bar"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
