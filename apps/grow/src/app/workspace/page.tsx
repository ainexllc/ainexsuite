'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { LearningGoal, SkillProgress } from '@ainexsuite/types';
import { TopNav } from '@/components/top-nav';
import { GoalList } from '@/components/goal-list';
import { GoalEditor } from '@/components/goal-editor';
import { SkillList } from '@/components/skill-list';
import { ProgressDashboard } from '@/components/progress-dashboard';
import { AIAssistant } from '@/components/ai-assistant';
import { getLearningGoals, getSkills } from '@/lib/learning';
import { Plus, GraduationCap } from 'lucide-react';

type ViewMode = 'goals' | 'skills' | 'dashboard';

function GrowWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('goals');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [goalsData, skillsData] = await Promise.all([
          getLearningGoals(),
          getSkills(),
        ]);
        setGoals(goalsData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    const [goalsData, skillsData] = await Promise.all([
      getLearningGoals(),
      getSkills(),
    ]);
    setGoals(goalsData);
    setSkills(skillsData);
    setShowEditor(false);
    setSelectedGoal(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading your learning journey...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <GraduationCap className="h-16 w-16 text-ink-600 mx-auto" />
          <p className="text-ink-600">Please sign in to track your learning goals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav viewMode={viewMode} onViewModeChange={setViewMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {viewMode === 'goals' && (
          <>
            {goals.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <GraduationCap className="h-16 w-16 text-ink-600 mx-auto" />
                <p className="text-ink-600">
                  No learning goals yet. Start your growth journey!
                </p>
              </div>
            ) : (
              <GoalList
                goals={goals}
                onEdit={(goal) => {
                  setSelectedGoal(goal);
                  setShowEditor(true);
                }}
                onUpdate={handleUpdate}
              />
            )}
          </>
        )}

        {viewMode === 'skills' && (
          <SkillList skills={skills} onUpdate={handleUpdate} />
        )}

        {viewMode === 'dashboard' && (
          <ProgressDashboard goals={goals} skills={skills} />
        )}
      </main>

      <button
        onClick={() => {
          setSelectedGoal(null);
          setShowEditor(true);
        }}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        type="button"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {showEditor && (
        <GoalEditor
          goal={selectedGoal}
          onClose={() => {
            setShowEditor(false);
            setSelectedGoal(null);
          }}
          onSave={handleUpdate}
        />
      )}

      <AIAssistant />
    </div>
  );
}

export default function GrowWorkspacePage() {
  return (
    <SuiteGuard appName="grow">
      <GrowWorkspaceContent />
    </SuiteGuard>
  );
}

