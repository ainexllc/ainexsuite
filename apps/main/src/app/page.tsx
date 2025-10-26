'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { LogoWordmark } from '@/components/branding/logo-wordmark';
import { Footer } from '@/components/footer';
import {
  Loader2,
  Brain,
  BarChart3,
  Palette,
  Sparkles,
  LogIn,
  Shield,
  Menu,
  X,
  Chrome,
  Lock,
  Mail,
} from 'lucide-react';
import { auth } from '@ainexsuite/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import {
  checkEmailExists,
  getAccountConflictMessage,
  parseAuthError,
  getAuthErrorWithSuggestion,
  type EmailStatus,
} from '@ainexsuite/auth';

const demoSteps = [
  { text: 'Reading your latest reflections for key signals…', emoji: '🔎' },
  { text: 'Mapping emotional trends and focus shifts in seconds…', emoji: '🧩' },
  { text: 'Delivering your next breakthrough prompt on demand…', emoji: '🚀' },
];

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

const featureCards = [
  {
    title: 'Adaptive Insight Engine',
    description:
      'Surface mood shifts, recurring themes, and creative streaks tuned to the way you write.',
    icon: Brain,
  },
  {
    title: 'Momentum Dashboards',
    description:
      'Watch trends across mood, energy, and output with visuals built for momentum—not vanity metrics.',
    icon: BarChart3,
  },
  {
    title: 'Locked-Down Privacy',
    description:
      'Zero-knowledge encryption, local-first drafts, and granular export control keep every entry in your hands.',
    icon: Shield,
  },
];

const aiHighlights = [
  {
    emoji: '🧠',
    title: 'Context Coach',
    description:
      'Understands tone, topics, and energy before shaping your next prompt.',
  },
  {
    emoji: '🗂️',
    title: 'Auto-Organized Memory',
    description:
      'Tags every entry with themes, projects, and moods so you can surface anything fast.',
  },
  {
    emoji: '📊',
    title: 'Progress Signals',
    description:
      'Highlights habits and inflection points before they harden into patterns.',
  },
];

function PublicHomePage() {
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoSteps.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  // Check email when user enters it
  const handleEmailCheck = async (emailValue: string) => {
    if (!emailValue || !emailValue.includes('@')) {
      setEmailStatus(null);
      setEmailChecked(false);
      return;
    }

    setCheckingEmail(true);
    setError('');

    try {
      const status = await checkEmailExists(emailValue);
      setEmailStatus(status);
      setEmailChecked(true);

      // If email exists, show helpful message
      if (status.exists) {
        const message = getAccountConflictMessage(status);
        setError(message);

        // Auto-switch to sign-in mode if email exists
        if (isSignUp) {
          setIsSignUp(false);
        }
      } else if (!isSignUp && emailChecked) {
        // If email doesn't exist and user is trying to sign in, suggest signup
        setError('No account found with this email. Would you like to sign up?');
      }
    } catch (err) {
      console.error('Email check error:', err);
      // Don't show error to user for email check failures
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setError('');

    try {
      // Check email one more time before submission
      if (!emailChecked) {
        await handleEmailCheck(email);
      }

      if (isSignUp) {
        // Prevent signup if email already exists
        if (emailStatus?.exists) {
          setError(getAccountConflictMessage(emailStatus));
          setSignInLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/workspace');
    } catch (err: unknown) {
      const errorInfo = parseAuthError(err);
      setError(getAuthErrorWithSuggestion(err));
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setSignInLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/workspace');
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      // Don't show error if user just closed the popup
      if (firebaseError.code !== 'auth/popup-closed-by-user' && firebaseError.code !== 'auth/cancelled-popup-request') {
        setError(getAuthErrorWithSuggestion(err));
      }
      setSignInLoading(false);
    }
  };

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),rgba(5,5,5,0.95)_55%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.12),rgba(5,5,5,0.95)_65%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#f97316]/25 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/3 right-[-12%] h-[360px] w-[360px] rounded-full bg-[#6366f1]/20 blur-[160px]" />
      <header className="relative z-50 border-b border-white/10 bg-[#050505]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="flex items-center">
            <LogoWordmark iconSize={88} />
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-white/60 transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/5 md:hidden"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full mt-2 px-6 pb-6 md:hidden z-40">
            <nav className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b]/90 p-6 text-sm font-medium text-white/70">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 transition hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="pt-28">
        <section className="relative overflow-hidden">

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:px-8">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-1 text-xs font-medium uppercase tracking-wide text-white/60">
                <Shield className="h-3.5 w-3.5" />
                Encrypted by default
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent">
                  You write. AI finds insights.
                </span>
                <br />
                <span className="text-white">Mood tracking and prompts, automatically.</span>
              </h1>
              <p className="text-lg text-white/70 sm:text-xl">
                Every time you open your workspace, AI reflects on your recent entries, delivers fresh summaries, and asks thoughtful questions to guide your next session.
              </p>

              <div className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-800/80 p-5 backdrop-blur sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Coached Prompts</p>
                    <p className="text-xs text-white/60">Dynamic suggestions tuned to your current tone, goals, and streak.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Multimedia Journaling</p>
                    <p className="text-xs text-white/60">Drop in photos, voice notes, and links without breaking your writing flow.</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="login" className="relative mb-[75px]">
              <div className="absolute inset-0 -translate-y-6 rounded-3xl bg-gradient-to-tr from-[#f97316]/15 via-transparent to-[#6366f1]/20 blur-2xl" />
              <div className="relative w-full overflow-hidden rounded-3xl border border-[#f97316]/20 bg-[#050505]/90 p-8 text-white shadow-[0_25px_80px_-25px_rgba(249,115,22,0.35)] backdrop-blur-xl">
                <div className="mb-6 flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f97316]">
                      Early Access
                    </span>
                    <h2 className="text-3xl font-semibold text-white">
                      {isSignUp ? 'Create Account' : 'Welcome back'}
                    </h2>
                    <p className="text-sm text-white/70">
                      {isSignUp
                        ? 'Create your account to access all Ainex apps.'
                        : 'Sign in to access your workspace across every Ainex app.'}
                    </p>
                  </div>
                  <Lock className="mt-1 h-5 w-5 text-[#f97316]" />
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          // Reset email status when user changes email
                          setEmailChecked(false);
                          setEmailStatus(null);
                          if (error) setError('');
                        }}
                        onBlur={(e) => handleEmailCheck(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition"
                        required
                        disabled={checkingEmail}
                      />
                      {checkingEmail && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 animate-spin" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {signInLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogIn className="h-5 w-5" />
                    )}
                    {signInLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#050505]/90 text-white/60">or</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={signInLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signInLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Chrome className="h-5 w-5 text-[#f97316]" />
                  )}
                  Continue with Google
                </button>

                {/* Toggle Sign Up / Sign In */}
                <div className="mt-4 text-center text-xs text-white/60">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setEmailChecked(false);
                      setEmailStatus(null);
                      // Recheck email when switching modes
                      if (email && email.includes('@')) {
                        handleEmailCheck(email);
                      }
                    }}
                    className="text-[#f97316] font-semibold hover:text-[#ea6a0f] transition"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>

                <p className="mt-4 text-xs text-white/50 text-center">
                  We never post or access your data without permission. 30-day trial included.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl -mt-8">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-zinc-800/80 shadow-lg">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/ccw3-B2nKaQ"
                title="JournalNex demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built for writers who demand more than a blank page</h2>
            <p className="mt-3 text-lg text-white/70">
              From onboarding to analytics, every workflow keeps you consistent, curious, and moving forward.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-zinc-800/90 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-white/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="ai-power" className="relative overflow-hidden border-y border-white/5 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">An AI collaborator that actually knows you</h2>
                <p className="text-lg text-white/70">
                  JournalNex learns from your own words to surface inflection points, ask sharper questions, and keep you tethered to what matters most.
                </p>
                <ul className="space-y-4 text-white/70">
                  {aiHighlights.map((item) => (
                    <li key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-800/80 p-4">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-white/60">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-700/60 px-4 py-2 text-sm text-white/60">
                    <LogIn className="h-5 w-5" />
                    JournalNex Copilot
                  </div>
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-white/60">Live demo</p>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-700/60 p-6">
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-2xl">{demoSteps[activeDemo].emoji}</span>
                        <span className="text-sm font-medium">{demoSteps[activeDemo].text}</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/60">
                      Private by default—AI only works on entries you approve, with session history and export logs for full control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="themes" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">Make the workspace feel like yours</h2>
                <p className="text-lg text-white/70">
                  Swap palettes and layouts built for flow, focus, or deep reflection—without losing the personalization you already love.
                </p>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7A18]" />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFB347]" />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f97316]/40" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Clarity Canvas', 'Deep Focus', 'Momentum Dashboard', 'Mindful Planning', 'Night Shift Studio'].map((layout) => (
                  <div key={layout} className="rounded-2xl border border-white/10 bg-zinc-700/70 p-4 text-sm font-medium text-white">
                    {layout}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer 
        appName="AINexSuite"
        productLinks={[
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'FAQ', href: '/faq' },
        ]}
        companyLinks={[
          { label: 'About', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Careers', href: '/careers' },
        ]}
        resourceLinks={[
          { label: 'Help Center', href: '/help' },
          { label: 'Contact Us', href: 'mailto:support@ainexsuite.com' },
          { label: 'Documentation', href: '/docs' },
        ]}
        legalLinks={[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
          { label: 'Acceptable Use Policy', href: '/acceptable-use' },
          { label: 'GDPR', href: '/gdpr' },
        ]}
      />
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user) {
      setLoadingMessage('Welcome back! Redirecting you to your workspace...');
    } else {
      setLoadingMessage('');
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#f97316]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#f97316]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
                  Redirecting to your workspace
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <PublicHomePage />;
}
