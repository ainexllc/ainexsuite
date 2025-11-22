import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Target, Users, Sparkles, Shield, TrendingUp, Heart } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Purpose-Driven',
    description: 'We build tools that help people grow, learn, and achieve their goals.',
  },
  {
    icon: Users,
    title: 'User-First',
    description: 'Every feature is designed with your needs, privacy, and experience in mind.',
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'We leverage cutting-edge AI to make productivity intelligent and intuitive.',
  },
  {
    icon: Shield,
    title: 'Privacy',
    description: 'Your data is yours. We never sell it, and we protect it with industry-leading security.',
  },
  {
    icon: TrendingUp,
    title: 'Growth',
    description: 'We believe in continuous improvement—for our users and ourselves.',
  },
  {
    icon: Heart,
    title: 'Empathy',
    description: 'We understand the challenges of modern life and build with compassion.',
  },
];

export default function AboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Building the Future of{' '}
            <span className="bg-gradient-to-r from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent">
              Personal Productivity
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINexSuite is a comprehensive productivity platform that brings together AI-powered tools
            to help you track, understand, and improve every aspect of your life.
          </p>
        </div>

        {/* Mission Section */}
        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 lg:p-12 shadow-lg backdrop-blur">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#f97316]">
                Our Mission
              </div>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Empowering individuals to reach their full potential
              </h2>
              <p className="text-white/70 leading-relaxed">
                We believe that everyone has the capacity for growth, but modern life makes it hard to
                track progress and stay consistent. That’s why we created AINexSuite—a unified platform
                that makes self-improvement intuitive, insightful, and sustainable.
              </p>
              <p className="text-white/70 leading-relaxed">
                Our AI-powered apps work together to give you a complete picture of your habits, goals,
                and growth. Whether you’re journaling, tracking fitness, managing tasks, or building new
                habits, AINexSuite provides the insights you need to keep moving forward.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">8 Integrated Apps</h3>
                <p className="text-sm text-white/70">
                  All your productivity tools in one seamless workspace
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-white/70">
                  Get personalized recommendations based on your patterns and goals
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Privacy-First Design</h3>
                <p className="text-sm text-white/70">
                  End-to-end encryption and full control over your data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Our Values</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              These principles guide everything we build and every decision we make.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-white/70">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl text-center">Our Story</h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                AINexSuite was born from a simple observation: people want to improve themselves, but
                existing tools are fragmented, overwhelming, or lack the intelligence to provide real insights.
              </p>
              <p>
                We started with a vision of creating a unified platform where journaling, habit tracking,
                task management, and personal analytics work together seamlessly. By leveraging AI, we could
                surface patterns, provide contextual prompts, and help users understand their progress in ways
                that no single tool could achieve alone.
              </p>
              <p>
                Today, AINexSuite brings together 8 specialized apps into one powerful suite. Each app is
                designed to excel at its specific function while contributing to a holistic view of your
                personal growth journey.
              </p>
              <p className="text-white font-medium">
                We’re just getting started, and we’re excited to continue building the future of personal
                productivity with you.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready to Get Started?</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Join thousands of users who are already using AINexSuite to transform their productivity
            and achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
