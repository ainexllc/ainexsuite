'use client';

import { useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Settings,
  Bell,
  Palette,
  Shield,
  Smartphone,
  HelpCircle,
  ChevronRight,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { FirestoreSync } from '@/components/FirestoreSync';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHints } from '@/components/hints';

function SettingsContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const router = useRouter();
  const { resetHints } = useHints();
  const [isResettingHints, setIsResettingHints] = useState(false);

  const handleResetHints = async () => {
    setIsResettingHints(true);
    await resetHints();
    setTimeout(() => setIsResettingHints(false), 1000);
  };

  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (authLoading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Reminders and alerts',
          href: '/workspace/settings/notifications',
        },
        {
          icon: Palette,
          label: 'Appearance',
          description: 'Theme and display',
          href: '#',
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: Smartphone,
          label: 'Install App',
          description: 'Add to home screen',
          href: '#',
        },
        {
          icon: Shield,
          label: 'Privacy',
          description: 'Data and permissions',
          href: '#',
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'FAQs and contact',
          href: '/faq',
        },
      ],
    },
  ];

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      appName="Habits"
    >
      <FirestoreSync />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/workspace"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-400" />
            Settings
          </h1>
          <p className="text-sm text-white/50">Customize your experience</p>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="max-w-xl space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h2>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-white/40">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/20" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Tips Section */}
        <div>
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
            Tips & Guidance
          </h2>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={handleResetHints}
              disabled={isResettingHints}
              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors w-full text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                {isResettingHints ? (
                  <RotateCcw className="h-5 w-5 text-teal-400 animate-spin" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-teal-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Reset Tips</p>
                <p className="text-xs text-white/40">
                  {isResettingHints ? 'Tips reset!' : 'Show all helpful tips again'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center pt-8 pb-20">
          <p className="text-xs text-white/20">Grow v1.0.0</p>
          <p className="text-xs text-white/20">Made with love by AinexSuite</p>
        </div>
      </div>

      <BottomNav />
    </WorkspaceLayout>
  );
}

export default function SettingsPage() {
  return (
    <SuiteGuard appName="habits">
      <SettingsContent />
    </SuiteGuard>
  );
}
