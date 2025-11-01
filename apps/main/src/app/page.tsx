'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Footer } from '@/components/footer';
import { useVisualStyle } from '@/lib/theme/visual-style';
import { AinexStudiosLogo } from '@/components/branding/ainex-studios-logo';
import {
  Loader2,
  Sparkles,
  Menu,
  X,
  Chrome,
  Lock,
  Mail,
  Brain,
  BarChart3,
  Shield,
  Palette,
  Paintbrush,
  LogIn,
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
  parseAuthError,
} from '@ainexsuite/auth';
import clsx from 'clsx';

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

const heroHighlights = [
  {
    title: 'AI Coached Prompts',
    description: 'Nudge toward deeper insights without getting micromanaged.',
  },
  {
    title: 'Multimedia Journaling',
    description: 'Upload a photo, record voice, or just type—your way, your record.',
  },
];

const suiteBenefits = [
  {
    title: 'Adaptive Insight Engine',
    description: 'Surface mood paths, recurring themes, and creative streaks travel to the day you write.',
    icon: Brain,
  },
  {
    title: 'Momentum Dashboards',
    description: 'Watch trends evolve mood, insight frequency, and forward to fuel for momentum—not guilt.',
    icon: BarChart3,
  },
  {
    title: 'Locked-Down Privacy',
    description: 'Zero-knowledge encryption, local-first drafts, and granular control keeps every entry private.',
    icon: Shield,
  },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedVariant, variants, selectVariantById, cycleVariant } = useVisualStyle();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-rotate demo steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoSteps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/workspace');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setSignInLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/workspace');
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorInfo = parseAuthError(firebaseError);
      setError(errorInfo.userMessage);
    } finally {
      setSignInLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setSignInLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/workspace');
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorInfo = parseAuthError(firebaseError);
      setError(errorInfo.userMessage);
    } finally {
      setSignInLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className={clsx('h-8 w-8 animate-spin', selectedVariant.loaderColor)} />
      </div>
    );
  }

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className={`pointer-events-none absolute inset-0 -z-10 ${selectedVariant.heroAtmosphere}`} />
      {/* Theme-aware atmospheric glows */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[150px]"
        style={{
          backgroundColor: selectedVariant.id === 'ember-glow'
            ? 'rgba(249, 115, 22, 0.4)'
            : 'rgba(56, 189, 248, 0.35)'
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-[-12%] h-[460px] w-[460px] rounded-full blur-[160px]"
        style={{
          backgroundColor: selectedVariant.id === 'ember-glow'
            ? 'rgba(234, 88, 12, 0.3)'
            : 'rgba(14, 165, 233, 0.25)'
        }}
      />
      <header
        className="relative z-50 border-b"
        style={{
          borderColor: selectedVariant.id === 'ember-glow'
            ? 'rgba(249, 115, 22, 0.2)'
            : 'rgba(56, 189, 248, 0.2)'
        }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-70" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: selectedVariant.id === 'ember-glow'
              ? 'linear-gradient(to right, rgba(249, 115, 22, 0.05), transparent, rgba(234, 88, 12, 0.05))'
              : 'linear-gradient(to right, rgba(56, 189, 248, 0.05), transparent, rgba(14, 165, 233, 0.05))'
          }}
        />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-6">
            <AinexStudiosLogo align="center" size="lg" className="hidden sm:flex" />
            <AinexStudiosLogo align="center" size="md" className="sm:hidden" />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
              >
                {item.label}
                <span
                  className="pointer-events-none absolute inset-x-4 bottom-1 h-px scale-x-0 rounded-full transition duration-300 ease-out group-hover:scale-x-100"
                  style={{
                    backgroundColor: selectedVariant.id === 'ember-glow'
                      ? '#6366f1'
                      : '#38bdf8'
                  }}
                />
              </a>
            ))}
            <button
              type="button"
              onClick={cycleVariant}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/20"
              aria-label="Cycle visual style"
            >
              <Paintbrush className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/10 md:hidden"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full mt-2 px-6 pb-6 md:hidden z-40">
            <nav className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b]/95 p-6 text-sm font-medium text-white/70">
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
              <button
                type="button"
                onClick={() => {
                  cycleVariant();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Cycle visual style
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-8">
        <section className="relative overflow-hidden pb-16 sm:pb-20 lg:pb-24">
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:px-8">
            <div className="space-y-8">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-wide"
                style={{
                  borderColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.3)'
                    : 'rgba(125, 211, 252, 0.4)',
                  backgroundColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.1)'
                    : 'rgba(125, 211, 252, 0.1)',
                  color: selectedVariant.id === 'ember-glow'
                    ? '#f97316'
                    : '#7dd3fc'
                }}
              >
                <Shield className="h-3.5 w-3.5" />
                Encrypted by default
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                <span className={`bg-gradient-to-r ${selectedVariant.headlineGradient} bg-clip-text text-transparent`}>
                  You write. AI finds insights.
                </span>
                <br />
                <span className="text-white">Mood tracking and prompts, automatically.</span>
              </h1>
              <p className="text-lg text-white/70 sm:text-xl">
                Every time you open your workspace, AI reflects on your recent entries, delivers fresh summaries, and asks thoughtful questions to guide your next session.
              </p>

              <div
                className="mt-6 w-full rounded-3xl border bg-white/[0.04] px-6 py-5 backdrop-blur"
                style={{
                  borderColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.2)'
                    : 'rgba(56, 189, 248, 0.2)',
                  boxShadow: selectedVariant.id === 'ember-glow'
                    ? '0 12px 40px -20px rgba(249, 115, 22, 0.5)'
                    : '0 12px 40px -20px rgba(56, 189, 248, 0.5)'
                }}
              >
                <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-xl font-semibold sm:text-2xl"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#f97316'
                          : '#7dd3fc'
                      }}
                    >
                      2.1K
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                      writers in private beta
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#6366f1'
                          : '#7dd3fc'
                      }}
                    >
                      +34% weekly growth
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-xl font-semibold sm:text-2xl"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#f97316'
                          : '#7dd3fc'
                      }}
                    >
                      3.2×
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                      faster insight capture
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#6366f1'
                          : '#7dd3fc'
                      }}
                    >
                      vs personal baselines
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-xl font-semibold sm:text-2xl"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#f97316'
                          : '#7dd3fc'
                      }}
                    >
                      100%
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                      entries encrypted edge-side
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#6366f1'
                          : '#7dd3fc'
                      }}
                    >
                      zero-knowledge key custody
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="grid gap-4 rounded-3xl border bg-white/[0.03] p-5 backdrop-blur sm:grid-cols-2"
                style={{
                  borderColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(56, 189, 248, 0.25)',
                  boxShadow: selectedVariant.id === 'ember-glow'
                    ? '0 12px 40px -20px rgba(249, 115, 22, 0.5)'
                    : '0 12px 40px -20px rgba(56, 189, 248, 0.5)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: selectedVariant.id === 'ember-glow'
                        ? 'rgba(249, 115, 22, 0.15)'
                        : 'rgba(56, 189, 248, 0.15)',
                      color: selectedVariant.id === 'ember-glow'
                        ? '#f97316'
                        : '#7dd3fc'
                    }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Coached Prompts</p>
                    <p className="text-xs text-white/60">Dynamic suggestions tuned to your current tone, goals, and streak.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: selectedVariant.id === 'ember-glow'
                        ? 'rgba(249, 115, 22, 0.15)'
                        : 'rgba(56, 189, 248, 0.15)',
                      color: selectedVariant.id === 'ember-glow'
                        ? '#f97316'
                        : '#7dd3fc'
                    }}
                  >
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Multimedia Journaling</p>
                    <p className="text-xs text-white/60">Drop in photos, voice notes, and links without breaking your writing flow.</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="login" className="relative">
              <div
                className="absolute inset-0 -translate-y-6 rounded-3xl blur-2xl"
                style={{
                  background: selectedVariant.id === 'ember-glow'
                    ? 'linear-gradient(to top right, rgba(249, 115, 22, 0.15), transparent, rgba(234, 88, 12, 0.2))'
                    : 'linear-gradient(to top right, rgba(56, 189, 248, 0.15), transparent, rgba(14, 165, 233, 0.2))'
                }}
              />
              <div
                className="relative w-full overflow-hidden rounded-3xl border bg-[#050505]/90 p-8 text-white backdrop-blur-xl"
                style={{
                  borderColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.2)'
                    : 'rgba(56, 189, 248, 0.25)',
                  boxShadow: selectedVariant.id === 'ember-glow'
                    ? '0 25px 80px -25px rgba(249, 115, 22, 0.35)'
                    : '0 25px 80px -25px rgba(56, 189, 248, 0.35)'
                }}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="space-y-2">
                    <span
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                      style={{
                        borderColor: selectedVariant.id === 'ember-glow'
                          ? 'rgba(249, 115, 22, 0.3)'
                          : 'rgba(125, 211, 252, 0.4)',
                        backgroundColor: selectedVariant.id === 'ember-glow'
                          ? 'rgba(249, 115, 22, 0.1)'
                          : 'rgba(125, 211, 252, 0.1)',
                        color: selectedVariant.id === 'ember-glow'
                          ? '#f97316'
                          : '#7dd3fc'
                      }}
                    >
                      Early Access
                    </span>
                    <h2 className="text-3xl font-semibold text-white">
                      {isSignUp ? 'Create Account' : 'Welcome back'}
                    </h2>
                    <p className="text-sm text-white/70">
                      {isSignUp
                        ? 'Create your account to access AINexAgent.'
                        : 'Sign in to access your AI workspace.'}
                    </p>
                  </div>
                  <Lock
                    className="mt-1 h-5 w-5"
                    style={{
                      color: selectedVariant.id === 'ember-glow'
                        ? '#f97316'
                        : '#7dd3fc'
                    }}
                  />
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-transparent transition"
                        style={{
                          boxShadow: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = selectedVariant.id === 'ember-glow'
                            ? '0 0 0 2px rgba(249, 115, 22, 0.5)'
                            : '0 0 0 2px rgba(56, 189, 248, 0.5)';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
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
                        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-transparent transition"
                        style={{
                          boxShadow: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = selectedVariant.id === 'ember-glow'
                            ? '0 0 0 2px rgba(249, 115, 22, 0.5)'
                            : '0 0 0 2px rgba(56, 189, 248, 0.5)';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: selectedVariant.id === 'ember-glow'
                        ? '#f97316'
                        : 'linear-gradient(to right, #38bdf8, #7dd3fc, #818cf8)',
                      color: selectedVariant.id === 'ember-glow'
                        ? '#ffffff'
                        : '#0f172a'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedVariant.id === 'ember-glow') {
                        e.currentTarget.style.background = '#ea6a0f';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to right, #7dd3fc, #a5f3fc, #a5b4fc)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedVariant.id === 'ember-glow') {
                        e.currentTarget.style.background = '#f97316';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to right, #38bdf8, #7dd3fc, #818cf8)';
                      }
                    }}
                  >
                    {signInLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-current" />
                    ) : (
                      <LogIn className="h-5 w-5 text-current" />
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
                  onClick={handleGoogleSignIn}
                  disabled={signInLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signInLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Chrome
                      className="h-5 w-5"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#f97316'
                          : '#7dd3fc'
                      }}
                    />
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
                    }}
                    className="font-semibold transition"
                    style={{
                      color: selectedVariant.id === 'ember-glow'
                        ? '#f97316'
                        : '#7dd3fc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = selectedVariant.id === 'ember-glow'
                        ? '#ea6a0f'
                        : '#a5f3fc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = selectedVariant.id === 'ember-glow'
                        ? '#f97316'
                        : '#7dd3fc';
                    }}
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

        <section id="features" className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[48px] border border-white/5 bg-gradient-to-b from-white/10 via-white/0 to-transparent" />
          <div className="mx-auto max-w-5xl">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-zinc-800/80 shadow-lg">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/ccw3-B2nKaQ"
                title="AINexAgent demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mx-auto mt-12 sm:mt-16 lg:mt-20 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built for writers who demand more than a blank page</h2>
            <p className="mt-4 text-lg text-white/70">
              From onboarding to analytics, every workflow keeps you consistent, curious, and moving forward.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16 grid gap-6 lg:grid-cols-3">
            {suiteBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-white/10 bg-zinc-800/90 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedVariant.featureIconWrapper}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm text-white/60">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="ai-power" className="relative overflow-hidden border-y border-white/5 bg-[#040404]/80 py-16 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_60%)]" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">An AI collaborator that actually knows you</h2>
                <p className="text-lg text-white/70">
                  AINexAgent learns from your own words to surface inflection points, ask sharper questions, and keep you tethered to what matters most.
                </p>
                <ul className="space-y-4 text-white/70">
                  <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-800/80 p-4">
                    <span className="text-xl">🧠</span>
                    <div>
                      <p className="font-semibold text-white">Context Coach</p>
                      <p className="text-sm text-white/60">Understands tone, topics, and energy before shaping your next prompt.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-800/80 p-4">
                    <span className="text-xl">🗂️</span>
                    <div>
                      <p className="font-semibold text-white">Auto-Organized Memory</p>
                      <p className="text-sm text-white/60">Tags every entry with themes, projects, and moods so you can surface anything fast.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-800/80 p-4">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="font-semibold text-white">Progress Signals</p>
                      <p className="text-sm text-white/60">Highlights habits and inflection points before they harden into patterns.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-700/60 px-4 py-2 text-sm text-white/60">
                    <LogIn className="h-5 w-5" />
                    AINexAgent Copilot
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

        <section id="themes" className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[48px] border border-white/5 bg-gradient-to-tr from-white/10 via-white/0 to-transparent" />
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">Make the workspace feel like yours</h2>
                <p className="text-lg text-white/70">
                  Swap palettes and layouts tuned for focus, flow, or deep reflection—every variant keeps the brand grounded in AINEX Studios.
                </p>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  {selectedVariant.themeSwatches.map((swatch, index) => (
                    <span
                      key={`${selectedVariant.id}-swatch-${index}`}
                      className={clsx(
                        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10',
                        swatch,
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {variants.map((variant) => {
                  const isActive = variant.id === selectedVariant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => selectVariantById(variant.id)}
                      className={clsx(
                        'rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-colors',
                        'bg-zinc-700/70 text-white/80 hover:bg-white/10 hover:text-white',
                        isActive
                          ? 'border-white/40 text-white'
                          : 'border-white/10',
                      )}
                      aria-pressed={isActive}
                    >
                      <span className="block text-xs uppercase tracking-[0.3em] text-white/50">Palette</span>
                      <span className="mt-1 block text-lg font-semibold text-white">{variant.label}</span>
                      <span className="mt-2 block text-xs text-white/60">
                        {isActive ? 'Active now' : 'Tap to preview'}
                      </span>
                      <div className="mt-3 flex items-center gap-1.5">
                        {variant.themeSwatches.map((swatch, swatchIndex) => (
                          <span
                            key={`${variant.id}-swatch-${swatchIndex}`}
                            className={clsx(
                              'inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10',
                              swatch,
                            )}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
