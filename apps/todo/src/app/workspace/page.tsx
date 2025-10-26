'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { TodoTask, TodoProject } from '@ainexsuite/types';
import { getTasks, getProjects } from '@/lib/todo';
import { TopNav } from '@/components/top-nav';
import { Sidebar } from '@/components/sidebar';
import { TaskList } from '@/components/task-list';
import { TaskEditor } from '@/components/task-editor';
import { ProjectEditor } from '@/components/project-editor';
import { AIAssistant } from '@/components/ai-assistant';
import { Plus, ListTodo } from 'lucide-react';

type ViewFilter = 'all' | 'today' | 'upcoming' | 'completed';

function TodoWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [projects, setProjects] = useState<TodoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedProjects] = await Promise.all([getTasks(), getProjects()]);
      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = (tasksToFilter: TodoTask[]): TodoTask[] => {
    let filtered = [...tasksToFilter];

    if (selectedProject) {
      filtered = filtered.filter((t) => t.projectId === selectedProject);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 86400000;

    switch (viewFilter) {
      case 'today':
        filtered = filtered.filter(
          (t) => !t.completed && t.dueDate && t.dueDate >= todayStart && t.dueDate < todayEnd,
        );
        break;
      case 'upcoming':
        filtered = filtered.filter((t) => !t.completed && t.dueDate && t.dueDate >= todayEnd);
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.completed);
        break;
      default:
        filtered = filtered.filter((t) => !t.completed);
    }

    return filtered;
  };

  const filteredTasks = filterTasks(tasks);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading your tasks...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Please sign in to access your tasks.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base">
      <TopNav />

      <div className="flex">
        <Sidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          viewFilter={viewFilter}
          onViewFilterChange={setViewFilter}
          onCreateProject={() => setIsCreatingProject(true)}
          taskCounts={{
            all: tasks.filter((t) => !t.completed).length,
            today: tasks.filter((t) => {
              if (t.completed || !t.dueDate) return false;
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const taskDate = new Date(t.dueDate);
              taskDate.setHours(0, 0, 0, 0);
              return taskDate.getTime() === now.getTime();
            }).length,
            upcoming: tasks.filter((t) => {
              if (t.completed || !t.dueDate) return false;
              const endOfToday = new Date();
              endOfToday.setHours(23, 59, 59, 999);
              return t.dueDate > endOfToday.getTime();
            }).length,
            completed: tasks.filter((t) => t.completed).length,
          }}
        />

        <main className="flex-1 p-6 ml-[280px]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {selectedProject
                    ? projects.find((p) => p.id === selectedProject)?.name || 'Project'
                    : viewFilter === 'today'
                    ? 'Today'
                    : viewFilter === 'upcoming'
                    ? 'Upcoming'
                    : viewFilter === 'completed'
                    ? 'Completed'
                    : 'All Tasks'}
                </h1>
                <p className="text-ink-600">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              <button
                onClick={() => setIsCreatingTask(true)}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium transition-colors"
                type="button"
              >
                <Plus className="h-5 w-5" />
                New Task
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ListTodo className="h-16 w-16 mx-auto mb-4 text-ink-600" />
                <p className="text-ink-600 mb-4">No tasks yet</p>
                <button
                  onClick={() => setIsCreatingTask(true)}
                  className="text-accent-500 hover:text-accent-600 font-medium"
                  type="button"
                >
                  Create your first task
                </button>
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                projects={projects}
                onTaskClick={(task) => setEditingTask(task)}
                onTaskUpdate={loadData}
              />
            )}
          </div>
        </main>
      </div>

      {(isCreatingTask || editingTask) && (
        <TaskEditor
          task={editingTask}
          projects={projects}
          defaultProjectId={selectedProject}
          onClose={() => {
            setIsCreatingTask(false);
            setEditingTask(null);
          }}
          onSave={() => {
            void loadData();
            setIsCreatingTask(false);
            setEditingTask(null);
          }}
        />
      )}

      {isCreatingProject && (
        <ProjectEditor
          onClose={() => setIsCreatingProject(false)}
          onSave={() => {
            void loadData();
            setIsCreatingProject(false);
          }}
        />
      )}

      <AIAssistant />
    </div>
  );
}

export default function TodoWorkspacePage() {
  return (
    <SuiteGuard appName="todo">
      <TodoWorkspaceContent />
    </SuiteGuard>
  );
}

