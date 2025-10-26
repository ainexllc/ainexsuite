'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import {
  Loader2,
  Menu,
  X,
  Shield,
  BrainCircuit,
  Flame,
  HeartPulse,
  Sparkles,
  LogIn,
  Chrome,
  Lock,
  Mail,
  Dumbbell,
  Timer,
  LineChart,
} from 'lucide-react';
import { LogoWordmark } from '@/components/branding/logo-wordmark';
import { Footer } from '@/components/footer';
import { AppActivationBox } from '@ainexsuite/auth';

const demoSteps = [
  { text: 'Syncing your wearable data and recent workouts…', emoji: '📡' },
  { text: 'Spotting plateaus and overtraining risks instantly…', emoji: '📉' },
  { text: 'Generating a fresh training block with AI coaching…', emoji: '🤖' },
];

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'Coaching' },
];

const featureCards = [
  {
    title: 'Adaptive Programming',
    description:
      'Daily training plans evolve with your recovery, goals, and logged performance—no spreadsheets required.',
    icon: BrainCircuit,
  },
  {
    title: 'Performance Intelligence',
    description:
      'Visualize strength trends, energy zones, and readiness signals in dashboards designed for athletes.',
    icon: LineChart,
  },
  {
    title: 'Recovery Guardrails',
    description:
      'Automatic deload prompts, sleep sync, and mobility reminders keep you progressing without burnout.',
    icon: HeartPulse,
  },
];

const aiHighlights = [
  {
    emoji: '🧠',
    title: 'Coach-on-Call',
    description:
      'Ask anything from technique tweaks to macro adjustments—AINex Fit replies with context from your history.',
  },
  {
    emoji: '⏱️',
    title: 'Session Auto-Build',
    description:
      'Drop in your available time and equipment; the planner creates interval, strength, or mobility sessions instantly.',
  },
  {
    emoji: '📊',
    title: 'Progress Signals',
    description:
      'Weekly recaps highlight new PRs, weak spots, and recovery gaps so you can focus your next block.',
  },
];

const communityHighlights = [
  'Strength Foundations',
  'Hybrid Endurance',
  'Functional Fitness',
  'Mobility Reset',
  'Sprint Conditioning',
];

const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_MAIN_DOMAIN}`
  : '';

const marketingLink = (path: string) =>
  path.startsWith('/') && mainDomain ? `${mainDomain}${path}` : path;

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const productLinks: FooterLink[] = [
  { label: 'Training Features', href: '/features' },
  { label: 'Coaching Plans', href: '/pricing' },
  { label: 'Program Library', href: '/programs', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Ambassadors', href: '/coaches', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:coach@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

const resolveHref = (href: string, external = false) =>
  external ? marketingLink(href) : href;

const resolvedProductLinks = productLinks.map((link) => ({
  ...link,
  href: resolveHref(link.href, link.external),
}));

const resolvedCompanyLinks = companyLinks.map((link) => ({
  ...link,
  href: resolveHref(link.href, link.external),
}));

const resolvedResourceLinks = resourceLinks.map((link) => ({
  ...link,
  href: resolveHref(link.href, link.external),
}));

const resolvedLegalLinks = legalLinks.map((link) => ({
  ...link,
  href: resolveHref(link.href, link.external),
}));

type PublicFitHomePageProps = {
  showActivation?: boolean;
  onActivated?: () => void;
  onSwitchToLogin?: () => void;
};

function PublicFitHomePage({
  showActivation = false,
  onActivated,
  onSwitchToLogin,
}: PublicFitHomePageProps) {
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoSteps.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/workspace');
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message || 'Authentication failed. Please try again.');
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
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setError(firebaseError.message || 'Authentication failed. Please try again.');
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
            {navLinks.map((item) => {
              const href = resolveHref(item.href, item.external);
              return (
                <a
                  key={item.href}
                  href={href}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {item.label}
                </a>
              );
            })}
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
              {navLinks.map((item) => {
                const href = resolveHref(item.href, item.external);
                return (
                  <a
                    key={item.href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-4 py-3 transition hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </a>
                );
              })}
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
                Recovery-first programming
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent">
                  Train smarter. Recover stronger.
                </span>
                <br />
                <span className="text-white">AINex Fit is your AI strength coach on every device.</span>
              </h1>
              <p className="text-lg text-white/70 sm:text-xl">
                Log sessions, sync wearables, and let AI tune the next block. Your personal dashboard keeps you on pace for PRs without overtraining.
              </p>

              <div className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-800/80 p-5 backdrop-blur sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Strength & Conditioning</p>
                    <p className="text-xs text-white/60">Balanced programming for barbell, kettlebell, and conditioning athletes.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Timer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Session Pacing</p>
                    <p className="text-xs text-white/60">Interval timers, rest tracking, and auto-progressions built-in.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                <Sparkles className="h-4 w-4 text-[#f97316]" />
                <div className="overflow-hidden">
                  <div key={demoSteps[activeDemo].text} className="transition-opacity duration-300" aria-live="polite">
                    {demoSteps[activeDemo].emoji} {demoSteps[activeDemo].text}
                  </div>
                </div>
              </div>
            </div>

            {showActivation ? (
              <AppActivationBox
                appName="fit"
                appDisplayName="Fit"
                onActivated={onActivated}
                onDifferentEmail={onSwitchToLogin}
              />
            ) : (
              <div id="login" className="relative mb-[75px]">
                <div className="absolute inset-0 -translate-y-6 rounded-3xl bg-gradient-to-tr from-[#f97316]/15 via-transparent to-[#6366f1]/20 blur-2xl" />
                <div className="relative w-full overflow-hidden rounded-3xl border border-[#f97316]/20 bg-[#050505]/90 p-8 text-white shadow-[0_25px_80px_-25px_rgba(249,115,22,0.35)] backdrop-blur-xl">
                <div className="mb-6 flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f97316]">
                      Athlete Access
                    </span>
                    <h2 className="text-3xl font-semibold text-white">
                      {isSignUp ? 'Join AINex Fit' : 'Welcome back'}
                    </h2>
                    <p className="text-sm text-white/70">
                      {isSignUp
                        ? 'Create your account to unlock AI-powered training.'
                        : 'Sign in to access your personalized training workspace.'}
                    </p>
                  </div>
                  <Lock className="mt-1 h-5 w-5 text-[#f97316]" />
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition"
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

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#050505]/90 text-white/60">or</span>
                  </div>
                </div>

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

                <div className="mt-4 text-center text-xs text-white/60">
                  {isSignUp ? 'Already training with us?' : 'Need an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-[#f97316] font-semibold hover:text-[#ea6a0f] transition"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>

                <p className="mt-4 text-xs text-white/50 text-center">
                  Secure storage, private logs, and athlete-grade encryption are always on.
                </p>
              </div>
            </div>
            )}
          </div>
        </section>

        <section id="features" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl -mt-8">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-zinc-800/80 shadow-lg">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/EPx4lJloFKM"
                title="AINex Fit demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built for athletes who demand precision</h2>
            <p className="mt-3 text-lg text-white/70">
              From microcycles to race prep, every workflow keeps you aligned with your training load and lifestyle.
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
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">An AI coach that knows your body</h2>
                <p className="text-lg text-white/70">
                  Daily readiness scores, nutrition insights, and adaptive programming draw from your own training history—not generic templates.
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
                    <LogIn className="h-5 w-5 text-[#f97316]" />
                    AI feedback on every rep and interval
                  </div>
                  <div className="mt-6 space-y-4 text-sm text-white/70">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Today&apos;s Focus</span>
                        <span className="inline-flex items-center gap-2 text-xs text-[#f97316]">
                          <Flame className="h-4 w-4" />
                          Peak Load
                        </span>
                      </div>
                      <p className="mt-2 text-white/60">
                        Heavy lower session with velocity tracking. AI will prompt rest adjustments when bar speed drops.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-[#f97316]/10 via-transparent to-[#6366f1]/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">Community Programs</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {communityHighlights.map((layout) => (
                          <div
                            key={layout}
                            className="rounded-xl border border-white/10 bg-zinc-700/60 px-4 py-3 text-sm font-medium text-white"
                          >
                            {layout}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer
        appName="AINex Fit"
        productLinks={resolvedProductLinks}
        companyLinks={resolvedCompanyLinks}
        resourceLinks={resolvedResourceLinks}
        legalLinks={resolvedLegalLinks}
      />
    </div>
  );
}

export default function FitHomePage() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('fit');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  // Update loading message based on auth state
  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your training hub…');
    } else if (user && needsActivation) {
      setLoadingMessage('');
      setShowActivation(true); // Show activation box for signed-in users who need to activate
    } else {
      setLoadingMessage('');
    }
  }, [loading, checking, user, needsActivation]);

  // Redirect to workspace if user is signed in and activated
  useEffect(() => {
    if (!loading && !checking && user && !needsActivation) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, checking, user, needsActivation, router]);

  // Show loading spinner while checking auth or during redirect
  if (loading || checking || (user && !needsActivation)) {
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
              {user && !needsActivation && (
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

  // Show public homepage with activation box or login form
  return (
    <PublicFitHomePage
      showActivation={showActivation}
      onActivated={() => window.location.reload()}
      onSwitchToLogin={async () => {
        await firebaseSignOut(auth);
        setShowActivation(false);
      }}
    />
  );
}
