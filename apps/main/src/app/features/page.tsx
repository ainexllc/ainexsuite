import { FooterPageLayout } from '@ainexsuite/ui/components';
import {
  FileText,
  Target,
  CheckCircle,
  Camera,
  TrendingUp,
  Activity,
  Zap,
  StickyNote,
  Brain,
  Lock,
  Smartphone,
  BarChart3,
  Users,
  Cloud,
} from 'lucide-react';

const apps = [
  {
    icon: FileText,
    name: 'Journal',
    tagline: 'Daily Reflections & AI Insights',
    description: 'Capture your thoughts, track your mood, and receive AI-powered prompts that help you reflect deeper and grow faster.',
    features: [
      'AI-powered journaling prompts tailored to your goals',
      'Mood tracking with sentiment analysis',
      'Rich text editor with markdown support',
      'Daily, weekly, and monthly reflection templates',
      'Search and tag your entries for easy retrieval',
      'Private and encrypted by default',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Target,
    name: 'Track',
    tagline: 'Habit Tracking & Streaks',
    description: 'Build lasting habits with streak tracking, smart reminders, and insights that show you what works.',
    features: [
      'Visual habit streak tracking and calendars',
      'Smart reminders at optimal times',
      'Habit stacking and routine building',
      'Progress charts and completion rates',
      'Habit categories and custom icons',
      'Streak recovery and flexible scheduling',
    ],
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: CheckCircle,
    name: 'Todo',
    tagline: 'Task Management & Priorities',
    description: 'Organize your tasks, set priorities, and get things done with a clean, distraction-free interface.',
    features: [
      'Priority-based task organization (P1-P4)',
      'Project and category grouping',
      'Due dates with smart notifications',
      'Recurring tasks for regular activities',
      'Quick capture for rapid task entry',
      'Subtasks and task dependencies',
    ],
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Camera,
    name: 'Moments',
    tagline: 'Photo Diary & Memories',
    description: 'Create a visual timeline of your life with photo journals, collections, and AI-generated captions.',
    features: [
      'Photo-first journaling with captions',
      'Collections to organize memories by theme',
      'AI-generated descriptions and tags',
      'Timeline view of your visual journey',
      'Private albums with sharing options',
      'Cloud storage with automatic backup',
    ],
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    name: 'Grow',
    tagline: 'Goal Setting & Achievement',
    description: 'Set ambitious goals, break them into milestones, and track your progress with data-driven insights.',
    features: [
      'SMART goal framework and templates',
      'Milestone tracking with deadlines',
      'Progress visualization and charts',
      'Goal categories (career, health, personal)',
      'Accountability check-ins and reminders',
      'Goal correlations with habits and tasks',
    ],
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Activity,
    name: 'Pulse',
    tagline: 'Mood & Energy Tracking',
    description: 'Understand your emotional patterns, track energy levels, and discover what impacts your well-being.',
    features: [
      'Quick mood and energy logging',
      'Pattern detection and trend analysis',
      'Correlation with habits and activities',
      'Customizable mood scales and factors',
      'Weekly and monthly mood reports',
      'Trigger identification and insights',
    ],
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Zap,
    name: 'Fit',
    tagline: 'Health & Fitness Monitoring',
    description: 'Log workouts, track nutrition, monitor health metrics, and see how fitness impacts other areas of life.',
    features: [
      'Workout logging with exercise library',
      'Nutrition tracking and meal planning',
      'Weight and body metrics tracking',
      'Fitness goal setting and progress',
      'Integration with Apple Health & Google Fit',
      'Workout plans and routine templates',
    ],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: StickyNote,
    name: 'Notes',
    tagline: 'Quick Capture & Organization',
    description: 'Capture ideas instantly, organize with tags, and find everything with powerful search.',
    features: [
      'Instant note capture from anywhere',
      'Markdown support for formatting',
      'Tags and folders for organization',
      'Full-text search across all notes',
      'Voice notes and audio recording',
      'Link notes to tasks, goals, and journal entries',
    ],
    color: 'from-yellow-500 to-orange-500',
  },
];

const platformFeatures = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations based on patterns across all your data.',
  },
  {
    icon: Lock,
    title: 'Privacy & Security',
    description: 'End-to-end encryption and complete control over your personal data.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Seamless experience across web, mobile, and desktop.',
  },
  {
    icon: BarChart3,
    title: 'Unified Analytics',
    description: 'See how different aspects of your life connect and influence each other.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share goals, habits, and workspaces with family or teams.',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description: 'Your data syncs automatically across all devices in real-time.',
  },
];

export default function FeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent">
              Transform Your Life
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            8 powerful apps working together in one seamless platform. Track habits, set goals, journal,
            manage tasks, and unlock AI-powered insights about your personal growth.
          </p>
        </div>

        {/* Apps Grid */}
        <div className="space-y-12">
          {apps.map((app, index) => {
            const Icon = app.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={app.name}
                className={`rounded-3xl border border-white/10 bg-zinc-800/80 p-8 lg:p-12 shadow-lg ${
                  isEven ? '' : ''
                }`}
              >
                <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
                  {/* Content */}
                  <div className={`space-y-6 ${isEven ? '' : 'lg:col-start-2'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} text-white`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-semibold text-white">{app.name}</h2>
                        <p className="text-white/60 text-sm">{app.tagline}</p>
                      </div>
                    </div>
                    <p className="text-lg text-white/70 leading-relaxed">{app.description}</p>
                    <div className="space-y-3">
                      {app.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual */}
                  <div className={`${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`}>
                    <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${app.color} opacity-20`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Features */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Platform Features</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Built-in capabilities that make AINexSuite more than just 8 separate apps.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Section */}
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">
              The Power of Integration
            </h2>
            <p className="text-white/70 max-w-3xl mx-auto text-lg">
              Unlike standalone apps, AINexSuite connects your data to reveal powerful insights about your life.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Cross-App Insights</h3>
              <p className="text-sm text-white/70">
                See how your exercise habits affect your mood, or how journaling impacts your productivity.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Unified Search</h3>
              <p className="text-sm text-white/70">
                Find anything instantly—journal entries, tasks, notes, or photos—from one search box.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Smart Correlations</h3>
              <p className="text-sm text-white/70">
                AI discovers patterns you might miss, like which activities boost your energy or productivity.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Linked Data</h3>
              <p className="text-sm text-white/70">
                Connect tasks to goals, photos to journal entries, and habits to fitness metrics.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Holistic Dashboard</h3>
              <p className="text-sm text-white/70">
                See your complete picture—habits, goals, mood, fitness—all in one personalized view.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Contextual AI</h3>
              <p className="text-sm text-white/70">
                Get recommendations based on your entire data landscape, not just isolated metrics.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to Experience the Difference?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Start your 14-day free trial and discover how AINexSuite can transform your productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/plans"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
