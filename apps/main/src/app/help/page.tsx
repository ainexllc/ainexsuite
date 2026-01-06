import { FooterPageLayout } from '@ainexsuite/ui/components';
import {
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle,
  Zap,
  Target,
  Camera,
  TrendingUp,
  Activity,
  StickyNote
} from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  {
    icon: CheckCircle,
    title: 'Getting Started',
    description: 'Set up your account and learn the basics',
    href: '#getting-started',
  },
  {
    icon: BookOpen,
    title: 'User Guides',
    description: 'Detailed guides for each app in the suite',
    href: '#user-guides',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch step-by-step video walkthroughs',
    href: '#videos',
  },
  {
    icon: MessageCircle,
    title: 'FAQs',
    description: 'Quick answers to common questions',
    href: '/faq',
  },
];

const apps = [
  {
    icon: FileText,
    name: 'Journal',
    description: 'Daily reflections and AI insights',
    guides: ['Getting started with journaling', 'Using AI prompts', 'Organizing entries'],
  },
  {
    icon: Target,
    name: 'Track',
    description: 'Habit tracking and streaks',
    guides: ['Creating your first habit', 'Understanding streaks', 'Setting reminders'],
  },
  {
    icon: CheckCircle,
    name: 'Todo',
    description: 'Task management and priorities',
    guides: ['Task organization', 'Priority management', 'Due dates and reminders'],
  },
  {
    icon: Camera,
    name: 'Moments',
    description: 'Photo diary and memories',
    guides: ['Adding photos', 'Creating collections', 'Sharing memories'],
  },
  {
    icon: TrendingUp,
    name: 'Grow',
    description: 'Goal setting and achievement',
    guides: ['Setting SMART goals', 'Tracking progress', 'Milestone celebrations'],
  },
  {
    icon: Activity,
    name: 'Pulse',
    description: 'Mood and energy tracking',
    guides: ['Logging mood', 'Understanding patterns', 'Mood insights'],
  },
  {
    icon: Zap,
    name: 'Fit',
    description: 'Health and fitness monitoring',
    guides: ['Adding workouts', 'Nutrition tracking', 'Fitness goals'],
  },
  {
    icon: StickyNote,
    name: 'Notes',
    description: 'Quick capture and organization',
    guides: ['Creating notes', 'Tags and organization', 'Quick capture tips'],
  },
];

const gettingStartedSteps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up with Google or email to get instant access to all 8 apps in the suite.',
  },
  {
    number: '02',
    title: 'Complete Your Profile',
    description: 'Add your preferences and customize your experience to match your productivity style.',
  },
  {
    number: '03',
    title: 'Explore the Apps',
    description: 'Take a tour of each app and discover which tools fit your current goals and needs.',
  },
  {
    number: '04',
    title: 'Start Tracking',
    description: 'Begin adding data to your apps—journal entries, habits, tasks, or whatever matters most to you.',
  },
  {
    number: '05',
    title: 'Review Insights',
    description: 'After a few days, check your dashboard for AI-powered insights and recommendations.',
  },
];

export default function HelpPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Help Center
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Everything you need to get the most out of AINexSuite. Browse guides, watch tutorials,
            or contact our support team for personalized assistance.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4 transition group-hover:bg-[#f97316]/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{link.title}</h3>
                <p className="text-sm text-white/60">{link.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Getting Started */}
        <div id="getting-started" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Getting Started</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Follow these steps to set up AINexSuite and start your productivity journey.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gettingStartedSteps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg"
              >
                <div className="text-4xl font-bold text-[#f97316]/30 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* App-Specific Guides */}
        <div id="user-guides" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">App Guides</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Comprehensive guides for each app in the AINexSuite platform.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {apps.map((app) => {
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
                    {app.guides.map((guide) => (
                      <li key={guide} className="flex items-start gap-2 text-xs text-white/50">
                        <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Tutorials */}
        <div id="videos" className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316] mx-auto">
              <Video className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Video Tutorials</h2>
            <p className="text-white/70 leading-relaxed">
              Our video library contains step-by-step tutorials covering everything from basic setup
              to advanced features. Watch at your own pace and revisit anytime you need a refresher.
            </p>
            <div className="grid gap-4 sm:grid-cols-3 text-sm text-white/60">
              <div className="rounded-2xl border border-white/10 bg-zinc-800/50 p-4">
                <div className="text-2xl font-bold text-white mb-1">15+</div>
                <div>Tutorial Videos</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/50 p-4">
                <div className="text-2xl font-bold text-white mb-1">2-5 min</div>
                <div>Average Length</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/50 p-4">
                <div className="text-2xl font-bold text-white mb-1">HD</div>
                <div>Quality Videos</div>
              </div>
            </div>
            <button className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors">
              Browse Video Library
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Need More Help?</h2>
              <p className="text-white/70 leading-relaxed">
                Can’t find what you’re looking for? Our support team is here to help. We typically
                respond within 24 hours on business days.
              </p>
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#f97316] mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Email Support</div>
                    <a
                      href="mailto:support@ainexspace.com"
                      className="text-sm text-white/60 hover:text-[#f97316] transition"
                    >
                      support@ainexspace.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-[#f97316] mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Live Chat</div>
                    <div className="text-sm text-white/60">Available Mon-Fri, 9am-5pm EST</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Premium Support</h3>
                <p className="text-sm text-white/70 mb-4">
                  Upgrade to a premium plan for priority support with faster response times and dedicated
                  assistance.
                </p>
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-2 text-sm text-[#f97316] font-semibold hover:underline"
                >
                  View Plans
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Community Forum</h3>
                <p className="text-sm text-white/70 mb-4">
                  Connect with other AINexSuite users, share tips, and learn from the community.
                </p>
                <button className="inline-flex items-center gap-2 text-sm text-[#f97316] font-semibold hover:underline">
                  Join Forum
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
