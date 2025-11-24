'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Menu,
  X,
  Sparkles,
  LogIn,
  Chrome,
  Lock,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { Footer } from '../footer';
import { auth } from '@ainexsuite/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

export type DemoStep = {
  text: string;
  emoji: string;
};

export type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type AIHighlight = {
  emoji: string;
  title: string;
  description: string;
};

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type AppCard = {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  href: string;
};

export type HomepageTemplateProps = {
  /** App branding (logo component) */
  logo: ReactNode;
  /** Background animation component */
  backgroundComponent?: ReactNode;
  /** App name for login form */
  appName: string;
  /** Demo steps for animation */
  demoSteps: DemoStep[];
  /** Navigation links */
  navLinks: NavLink[];
  /** Hero section */
  hero: {
    badge: { icon: LucideIcon; text: string };
    headline: string;
    subheadline: string;
    description: string;
    highlights: Array<{ icon: LucideIcon; title: string; description: string }>;
  };
  /** Apps showcase section */
  apps?: {
    sectionTitle: string;
    sectionDescription: string;
    cards: AppCard[];
  };
  /** Login form customization */
  login: {
    badgeText: string;
    signUpTitle: string;
    signInTitle: string;
    signUpDescription: string;
    signInDescription: string;
    footerText: string;
  };
  /** Features section */
  features: {
    videoUrl?: string;
    videoTitle?: string;
    sectionTitle: string;
    sectionDescription: string;
    cards: FeatureCard[];
  };
  /** AI Power section */
  aiPower?: {
    title: string;
    description: string;
    highlights: AIHighlight[];
    demoCard: {
      title: string;
      subtitle: string;
      items: string[];
    };
  };
  /** Footer links (optional) */
  footer?: {
    appDisplayName: string;
    productLinks: FooterLink[];
    companyLinks: FooterLink[];
    resourceLinks: FooterLink[];
    legalLinks: FooterLink[];
  };
  /** Optional: show activation box instead of login */
  showActivation?: boolean;
  /** Activation component */
  activationComponent?: ReactNode;
  /** Primary accent color for buttons and highlights (defaults to orange #f97316) */
  accentColor?: string;
  /** Gradient start color for headline (defaults to #FF7A18) */
  gradientFrom?: string;
  /** Gradient end color for headline (defaults to #FFB347) */
  gradientTo?: string;
};

export function HomepageTemplate(props: HomepageTemplateProps) {
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % props.demoSteps.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [props.demoSteps.length]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setError('');

    try {
      console.log('🔐 HomepageTemplate: Starting email auth...');
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      console.log('🔐 HomepageTemplate: Email auth successful, user:', result.user.email);

      // Create server-side session cookie for SSO
      console.log('🔐 HomepageTemplate: Getting ID token for session cookie...');
      const idToken = await result.user.getIdToken();
      console.log('🔐 HomepageTemplate: Got ID token, calling /api/auth/session...');

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      console.log('🔐 HomepageTemplate: Session response status:', sessionResponse.status);
      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        console.error('🔐 HomepageTemplate: Session creation failed:', errorData);
      } else {
        console.log('🔐 HomepageTemplate: Session cookie created successfully!');
      }

      router.push('/workspace');
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      console.error('🔐 HomepageTemplate: Email auth error:', firebaseError);
      setError(firebaseError.message || 'Authentication failed. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setSignInLoading(true);
    setError('');

    try {
      console.log('🔐 HomepageTemplate: Starting Google auth...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('🔐 HomepageTemplate: Google auth successful, user:', result.user.email);

      // Create server-side session cookie for SSO
      console.log('🔐 HomepageTemplate: Getting ID token for session cookie...');
      const idToken = await result.user.getIdToken();
      console.log('🔐 HomepageTemplate: Got ID token, calling /api/auth/session...');

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      console.log('🔐 HomepageTemplate: Session response status:', sessionResponse.status);
      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        console.error('🔐 HomepageTemplate: Session creation failed:', errorData);
      } else {
        console.log('🔐 HomepageTemplate: Session cookie created successfully!');
      }

      router.push('/workspace');
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      console.error('🔐 HomepageTemplate: Google auth error:', firebaseError);
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setError(firebaseError.message || 'Authentication failed. Please try again.');
      }
      setSignInLoading(false);
    }
  };

  const HeroBadgeIcon = props.hero.badge.icon;
  const accentColor = props.accentColor || '#f97316';

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      {/* Background placeholder - component will be passed from parent */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {props.backgroundComponent}
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-[#050505]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="flex items-center">
            {props.logo}
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {props.navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-white/60 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <div className="w-px h-5 bg-white/10" />
            <button
              onClick={() => {
                setIsSignUp(false);
                setShowEmailModal(true);
              }}
              className="text-sm text-white/80 hover:text-white transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setShowEmailModal(true);
              }}
              className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:brightness-90 flex items-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              Sign Up
              <Sparkles className="w-4 h-4" />
            </button>
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
              {props.navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 transition hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setShowEmailModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-2xl px-4 py-3 transition hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setShowEmailModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-white rounded-2xl font-semibold transition-all hover:brightness-90"
                  style={{ backgroundColor: accentColor }}
                >
                  Sign Up
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-28">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-20">
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-1 text-xs font-medium uppercase tracking-wide text-white/60">
                <HeroBadgeIcon className="h-3.5 w-3.5" />
                {props.hero.badge.text}
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${props.gradientFrom || '#FF7A18'}, ${props.gradientTo || '#FFB347'})`
                  }}
                >
                  {props.hero.headline}
                </span>
                <br />
                <span className="text-white">{props.hero.subheadline}</span>
              </h1>
              <p className="text-lg text-white/70 sm:text-xl max-w-2xl mx-auto">
                {props.hero.description}
              </p>

              <div className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-800/80 p-5 backdrop-blur sm:grid-cols-2 max-w-2xl mx-auto">
                {props.hero.highlights.map((highlight) => {
                  const HighlightIcon = highlight.icon;
                  return (
                    <div key={highlight.title} className="flex items-center gap-3 text-left">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
                      >
                        <HighlightIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{highlight.title}</p>
                        <p className="text-xs text-white/60">{highlight.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 max-w-2xl mx-auto">
                <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: accentColor }} />
                <div className="overflow-hidden">
                  <div key={props.demoSteps[activeDemo].text} className="transition-opacity duration-300" aria-live="polite">
                    {props.demoSteps[activeDemo].emoji} {props.demoSteps[activeDemo].text}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email/Password Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowEmailModal(false)}>
              <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {isSignUp ? props.login.signUpTitle : props.login.signInTitle}
                    </h2>
                    <p className="text-white/60">
                      {isSignUp ? props.login.signUpDescription : props.login.signInDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/15 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition"
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
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/15 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-semibold transition-all hover:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: accentColor }}
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
                    <span className="px-2 bg-[#1a1a1a] text-white/60">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={signInLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signInLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Chrome className="h-5 w-5 text-[#f97316]" />
                  )}
                  Continue with Google
                </button>

                <div className="mt-6 text-center text-sm text-white/60">
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="font-semibold transition hover:opacity-80"
                    style={{ color: accentColor }}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>

                <p className="text-xs text-white/50 text-center mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Apps Showcase Section */}
        {props.apps && (
          <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                {props.apps.sectionTitle}
              </h2>
              <p className="mt-3 text-lg text-white/70">
                {props.apps.sectionDescription}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {props.apps.cards.map((app) => {
                const AppIcon = app.icon;
                return (
                  <Link
                    key={app.name}
                    href={app.href}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
                  >
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at top left, ${app.color}15, transparent 70%)`,
                      }}
                    />
                    <div className="relative">
                      <div
                        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${app.color}20` }}
                      >
                        <AppIcon className="h-6 w-6" style={{ color: app.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {app.name}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {app.description}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium" style={{ color: app.color }}>
                        Learn more
                        <svg
                          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          {props.features.videoUrl && (
            <div className="mx-auto max-w-5xl -mt-8">
              <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-zinc-800/80 shadow-lg">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={props.features.videoUrl}
                  title={props.features.videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">{props.features.sectionTitle}</h2>
            <p className="mt-3 text-lg text-white/70">
              {props.features.sectionDescription}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {props.features.cards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-zinc-800/90 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
                  >
                    {Icon && <Icon className="h-7 w-7" />}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-white/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Power Section */}
        {props.aiPower && (
          <section id="ai-power" className="relative overflow-hidden border-y border-white/5 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl font-semibold text-white sm:text-4xl">{props.aiPower.title}</h2>
                  <p className="text-lg text-white/70">
                    {props.aiPower.description}
                  </p>
                  <ul className="space-y-4 text-white/70">
                    {props.aiPower.highlights.map((item) => (
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
                      <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
                      {props.aiPower.demoCard.title}
                    </div>
                    <div className="mt-6 space-y-4 text-sm text-white/70">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{props.aiPower.demoCard.subtitle}</span>
                          <span
                            className="inline-flex items-center gap-2 text-xs"
                            style={{ color: accentColor }}
                          >
                            <Sparkles className="h-4 w-4" />
                            AI Powered
                          </span>
                        </div>
                        <p className="mt-2 text-white/60">
                          Smart insights and automation working behind the scenes.
                        </p>
                      </div>
                      <div
                        className="rounded-2xl border border-white/5 p-4"
                        style={{
                          background: `linear-gradient(to right, ${accentColor}1A, transparent, #6366f133)`
                        }}
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Quick Access</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {props.aiPower.demoCard.items.map((item) => (
                            <div
                              key={item}
                              className="rounded-xl border border-white/10 bg-zinc-700/60 px-4 py-3 text-sm font-medium text-white"
                            >
                              {item}
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
        )}
      </main>

      {/* Footer */}
      {props.footer && (
        <Footer
          appName={props.footer.appDisplayName}
          productLinks={props.footer.productLinks}
          companyLinks={props.footer.companyLinks}
          resourceLinks={props.footer.resourceLinks}
          legalLinks={props.footer.legalLinks}
        />
      )}
    </div>
  );
}
