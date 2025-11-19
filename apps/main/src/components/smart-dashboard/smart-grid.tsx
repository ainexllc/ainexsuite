'use client';

import { useEffect, useState } from 'react';
import { SmartDashboardService, InsightCardData } from '@/lib/smart-dashboard';
import { useAuth } from '@ainexsuite/auth';
import { 
  CheckSquare, FileText, Dumbbell, BookOpen, 
  AlertCircle, ArrowRight, GraduationCap, Activity, CheckCircle, Plus,
  Target, Image as ImageIcon, Layers
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { db } from '@ainexsuite/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ActionDispatcher } from '@/lib/action-dispatcher';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  todo: CheckSquare,
  notes: FileText,
  fit: Dumbbell,
  journey: BookOpen,
  grow: GraduationCap,
  pulse: Activity,
  track: Target,
  moments: ImageIcon,
  projects: Layers,
};

const colorMap: Record<string, string> = {
  todo: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  notes: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  fit: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  journey: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  grow: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  pulse: 'text-red-400 bg-red-500/10 border-red-500/20',
  track: 'text-green-400 bg-green-500/10 border-green-500/20',
  moments: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  projects: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export function SmartGrid() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    setLoading(true);
    const service = new SmartDashboardService(user.uid);
    
    const unsubscribe = service.subscribeToInsights((data) => {
      setInsights(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-surface-muted/50" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return null; // Or a simplified welcome state
  }

  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold text-white mb-4 px-1">
        Daily Briefing
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} data={insight} index={index} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ data, index }: { data: InsightCardData; index: number }) {
  const { user } = useAuth();
  const Icon = iconMap[data.appSlug] || AlertCircle;
  const themeClass = colorMap[data.appSlug] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAction = async (e: React.MouseEvent, action: { type: string, payload?: any }) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action.type === 'complete' && action.payload?.taskId) {
      setIsCompleting(true);
      try {
        await updateDoc(doc(db, 'tasks', action.payload.taskId), {
           completed: true,
           updatedAt: serverTimestamp()
        });
        setIsCompleted(true);
      } catch (error) {
        console.error("Failed to complete task", error);
      } finally {
        setIsCompleting(false);
      }
    } else if (action.type === 'create_prompt' && user?.uid) {
        // Use dispatcher to create a default task or just redirect
        // For now, we'll dispatch a creation if type is 'task'
        if (action.payload?.type === 'task') {
             setIsCompleting(true);
             const dispatcher = new ActionDispatcher(user.uid);
             // Dispatch a default task creation
             await dispatcher.dispatch("Create task Check out the new dashboard");
             setIsCompleted(true); // Hide card or just show success state
             alert("Task created! Check your Todo app.");
             setIsCompleting(false);
        } else if (action.payload?.type === 'workout') {
             setIsCompleting(true);
             const dispatcher = new ActionDispatcher(user.uid);
             await dispatcher.dispatch("Log workout Quick Session");
             setIsCompleted(true);
             alert("Workout logged! Keep it up.");
             setIsCompleting(false);
        }
    }
  };

  if (isCompleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link 
        href={data.actionUrl || '#'}
        className="group block relative h-full overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className={clsx("p-2 rounded-lg", themeClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex gap-2">
              {data.priority === 'high' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                  Urgent
                </span>
              )}
              {data.actions?.map((action, i) => (
                <button
                  key={i}
                  onClick={(e) => handleAction(e, action)}
                  disabled={isCompleting}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-green-500/20 hover:text-green-400 transition-colors disabled:opacity-50"
                  title={action.label}
                >
                  {action.type === 'complete' ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <h4 className="font-medium text-white group-hover:text-accent-400 transition-colors line-clamp-1">
              {data.title}
            </h4>
            <div className="mt-1 flex items-center justify-between text-xs text-white/50">
              <span>{data.subtitle}</span>
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
