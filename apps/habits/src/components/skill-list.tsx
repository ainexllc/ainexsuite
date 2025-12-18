'use client';

import type { SkillProgress } from '@ainexsuite/types';
import { format } from 'date-fns';
import { Award, Clock, TrendingUp } from 'lucide-react';
import { getSkillLevelLabel } from '@/lib/utils';

interface SkillListProps {
  skills: SkillProgress[];
  onUpdate: () => void;
}

export function SkillList({ skills }: SkillListProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <Award className="h-16 w-16 text-ink-600 mx-auto" />
        <p className="text-ink-600">
          No skills tracked yet. Start learning and practicing to see your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {skills.map((skill) => {
        const { label, color } = getSkillLevelLabel(skill.level);

        return (
          <div key={skill.skill} className="surface-card rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{skill.skill}</h3>
                <span className={`skill-badge ${color}`}>{label}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-500">
                  {skill.level}%
                </div>
                <div className="text-xs text-ink-600">Level</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-full h-2 surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 progress-bar"
                  style={{ width: `${skill.level}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-ink-700">
                  <TrendingUp className="h-4 w-4" />
                  <span>{skill.totalSessions} sessions</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700">
                  <Clock className="h-4 w-4" />
                  <span>{Math.round(skill.totalMinutes / 60)}h practiced</span>
                </div>
              </div>

              <div className="text-xs text-ink-600 pt-2 border-t border-surface-hover">
                Last practiced: {format(new Date(skill.lastPracticed), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
