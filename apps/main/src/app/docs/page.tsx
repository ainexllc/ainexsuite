import { FooterPageLayout } from '@ainexsuite/ui/components';
import {
  Rocket,
  Settings,
  Key,
  Database,
  Code,
  Smartphone,
  HelpCircle,
  FileText,
  Target,
  CheckCircle,
  Camera,
  TrendingUp,
  Activity,
  Zap,
  StickyNote,
} from 'lucide-react';
import Link from 'next/link';

const quickStart = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'Create your account and learn the basics of AINexSpace.',
    link: '#getting-started',
  },
  {
    icon: Settings,
    title: 'Account Setup',
    description: 'Configure your profile, preferences, and notification settings.',
    link: '#account-setup',
  },
  {
    icon: Key,
    title: 'Authentication',
    description: 'Learn about sign-in methods, security, and account recovery.',
    link: '#authentication',
  },
  {
    icon: Database,
    title: 'Data & Privacy',
    description: 'Understanding data storage, export, and privacy controls.',
    link: '#data-privacy',
  },
];

const appDocs = [
  {
    icon: FileText,
    name: 'Journal',
    description: 'AI-powered daily reflections and mood tracking',
    topics: ['Writing your first entry', 'Using AI prompts', 'Mood tracking', 'Search and tags'],
  },
  {
    icon: Target,
    name: 'Track',
    description: 'Habit tracking, streaks, and routine building',
    topics: ['Creating habits', 'Managing streaks', 'Setting reminders', 'Progress charts'],
  },
  {
    icon: CheckCircle,
    name: 'Todo',
    description: 'Task management and priority organization',
    topics: ['Adding tasks', 'Setting priorities', 'Due dates', 'Recurring tasks'],
  },
  {
    icon: Camera,
    name: 'Moments',
    description: 'Photo diary and visual memory timeline',
    topics: ['Adding photos', 'Creating collections', 'AI captions', 'Sharing'],
  },
  {
    icon: TrendingUp,
    name: 'Grow',
    description: 'Goal setting and milestone tracking',
    topics: ['Setting goals', 'Milestones', 'Progress tracking', 'Goal categories'],
  },
  {
    icon: Activity,
    name: 'Pulse',
    description: 'Mood and energy level monitoring',
    topics: ['Logging mood', 'Energy tracking', 'Pattern analysis', 'Correlations'],
  },
  {
    icon: Zap,
    name: 'Fit',
    description: 'Fitness, workouts, and health metrics',
    topics: ['Logging workouts', 'Nutrition tracking', 'Health metrics', 'Integrations'],
  },
  {
    icon: StickyNote,
    name: 'Notes',
    description: 'Quick capture and note organization',
    topics: ['Creating notes', 'Markdown support', 'Tags & folders', 'Search'],
  },
];

const advancedTopics = [
  {
    icon: Code,
    title: 'API & Integrations',
    description: 'Connect AINexSpace with other tools and services.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Using AINexSpace on iOS and Android devices.',
  },
  {
    icon: Settings,
    title: 'Advanced Settings',
    description: 'Customize the platform to match your workflow.',
  },
  {
    icon: HelpCircle,
    title: 'Troubleshooting',
    description: 'Solutions to common issues and error messages.',
  },
];

export default function DocsPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Documentation
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Everything you need to know about using AINexSpace effectively. From getting started
            to advanced features.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 px-6 py-4 text-white placeholder:text-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-[#f97316] px-6 py-2 text-sm font-semibold text-white hover:bg-[#ea6a0f] transition">
              Search
            </button>
          </div>
        </div>

        {/* Quick Start */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Quick Start</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              New to AINexSpace? Start here to learn the fundamentals.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickStart.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.link}
                  className="group rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4 transition group-hover:bg-[#f97316]/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* App Documentation */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">App Guides</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              In-depth documentation for each app in the AINexSpace platform.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {appDocs.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.name}
                  className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{app.name}</h3>
                  <p className="text-sm text-white/60 mb-4">{app.description}</p>
                  <ul className="space-y-2">
                    {app.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 text-xs text-white/50">
                        <span className="text-[#f97316] mt-0.5">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Popular Topics</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Most frequently accessed documentation articles.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">How to export my data?</h3>
              <p className="text-sm text-white/60 mb-3">
                Learn how to download all your data in multiple formats for backup or migration.
              </p>
              <Link href="#" className="text-sm text-[#f97316] font-semibold hover:underline">
                Read guide →
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Connecting with third-party apps</h3>
              <p className="text-sm text-white/60 mb-3">
                Integrate AINexSpace with Apple Health, Google Fit, and other services.
              </p>
              <Link href="#" className="text-sm text-[#f97316] font-semibold hover:underline">
                Read guide →
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Understanding AI insights</h3>
              <p className="text-sm text-white/60 mb-3">
                Discover how our AI analyzes your data to provide personalized recommendations.
              </p>
              <Link href="#" className="text-sm text-[#f97316] font-semibold hover:underline">
                Read guide →
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Keyboard shortcuts</h3>
              <p className="text-sm text-white/60 mb-3">
                Master keyboard shortcuts to navigate AINexSpace faster and more efficiently.
              </p>
              <Link href="#" className="text-sm text-[#f97316] font-semibold hover:underline">
                Read guide →
              </Link>
            </div>
          </div>
        </div>

        {/* Advanced Topics */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Advanced</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              For power users looking to get the most out of AINexSpace.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {advancedTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.title}
                  className="flex gap-4 rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">{topic.title}</h3>
                    <p className="text-xs text-white/60">{topic.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div id="getting-started" className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 lg:p-12 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316]">
              <Rocket className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Getting Started with AINexSpace</h2>
              <p className="text-white/60">Everything you need for your first 7 days</p>
            </div>
          </div>
          <div className="space-y-6 text-white/70">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Step 1: Create Your Account</h3>
              <p className="leading-relaxed">
                Sign up using your Google account or email address. Your account gives you access to all 8 apps
                immediately. No credit card required for the 14-day free trial.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Step 2: Set Your Goals</h3>
              <p className="leading-relaxed">
                Start by setting 1-3 goals in the Grow app. These could be personal, professional, health, or
                learning goals. Having clear goals helps the AI provide more relevant insights.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Step 3: Create Your First Habits</h3>
              <p className="leading-relaxed">
                Open the Track app and add 2-5 habits you want to build. Start small—it’s better to consistently
                track a few habits than to overwhelm yourself with too many.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Step 4: Start Journaling</h3>
              <p className="leading-relaxed">
                Use the Journal app to reflect on your day. The AI will provide prompts to help you think deeper.
                Even 5 minutes of journaling daily can provide valuable insights over time.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Step 5: Explore Other Apps</h3>
              <p className="leading-relaxed">
                As you get comfortable, explore Todo for task management, Pulse for mood tracking, and the other
                apps. You don’t need to use all 8 apps right away—add them as they become relevant to you.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Still Have Questions?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Our help center has answers, or contact support for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Visit Help Center
            </Link>
            <a
              href="mailto:support@ainexspace.com"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
