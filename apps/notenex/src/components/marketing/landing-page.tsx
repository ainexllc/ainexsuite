"use client";

import { useCallback, useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { LogoWordmark } from "@/components/branding/logo-wordmark";
import { Container } from "@/components/layout/container";

type AuthMode = "signin" | "signup";

type Feature = {
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    title: "Capture instantly",
    description:
      "Drop ideas, tasks, and insights into a space that keeps pace with your brain.",
  },
  {
    title: "Focus-ready canvas",
    description:
      "Switch into a minimalist workspace with ambient timers and noise blockers.",
  },
  {
    title: "Collaborate fluidly",
    description:
      "Share notes, assign reminders, and keep everyone aligned in real time.",
  },
];

function AuthCard() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setSubmitting(true);

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setError("Enter an email and password to continue.");
        setSubmitting(false);
        return;
      }

      try {
        if (mode === "signin") {
          await signInWithEmail(trimmedEmail, trimmedPassword);
        } else {
          await signUpWithEmail(trimmedEmail, trimmedPassword);
        }
      } catch (authError) {
        const message =
          authError instanceof Error
            ? authError.message
            : "Something went wrong. Please try again.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, mode, signInWithEmail, signUpWithEmail],
  );

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setGoogleSubmitting(true);
      setError(null);
      await signInWithGoogle();
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Google sign-in failed. Please try again.";
      setError(message);
    } finally {
      setGoogleSubmitting(false);
    }
  }, [signInWithGoogle]);

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-orange-500/20 bg-black/70 p-6 shadow-[0_20px_60px_-25px_rgba(249,115,22,0.35)] backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
            Access
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Get into your workspace
          </h2>
        </div>
        <Lock className="h-6 w-6 text-orange-500" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-300">
          Email
          <span className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black px-4 py-3 transition focus-within:border-orange-400">
            <Mail className="h-4 w-4 text-orange-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@company.com"
              className="flex-1 bg-black text-sm text-white outline-none placeholder:text-gray-500 autofill:bg-black autofill:text-white focus:bg-black focus-visible:bg-black"
              required
            />
          </span>
        </label>

        <label className="block text-sm font-medium text-gray-300">
          Password
          <span className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black px-4 py-3 transition focus-within:border-orange-400">
            <Lock className="h-4 w-4 text-orange-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="At least 6 characters"
              className="flex-1 bg-black text-sm text-white outline-none placeholder:text-gray-500 autofill:bg-black autofill:text-white focus:bg-black focus-visible:bg-black"
              minLength={6}
              required
            />
          </span>
        </label>

        {error ? (
          <p className="text-sm font-medium text-orange-300/90">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-80"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          )}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-sm text-gray-400 transition hover:text-white"
        >
          {mode === "signin"
            ? "Need an account? Create one in seconds."
            : "Have an account already? Sign in instead."}
        </button>
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gray-500">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        <span>or</span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => void handleGoogleSignIn()}
        disabled={googleSubmitting}
        className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400 hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-80"
      >
        {googleSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        Continue with Google
      </button>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-gray-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.25),_transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,_rgba(255,115,35,0.12)_0%,_rgba(17,17,17,0.85)_45%,_rgba(6,6,6,1)_100%)]" />

      <header className="py-8">
        <Container className="flex items-center justify-between" variant="wide">
          <LogoWordmark href="/" iconSize={96} />

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">
              Alpha access
            </span>
            <a
              href="#features"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              FAQ
            </a>
          </div>
        </Container>
      </header>

      <section className="pb-24 pt-10 lg:pb-28 lg:pt-16">
        <Container
          className="grid items-center gap-12 lg:grid-cols-[1.1fr_minmax(0,1fr)]"
          variant="wide"
        >
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              New
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
              Ideas stay vivid with a workspace built for late-night makers.
            </h1>
            <p className="max-w-xl text-lg text-gray-400">
              NoteNex blends rapid capture with guided focus so your projects move
              from sparks to shipped work. Everything syncs instantly and rides on
              privacy-first infrastructure.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-orange-400" />
                AI-assisted insight surfacing
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-orange-400" />
                Pinned focus sprints
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-orange-400" />
                Collaborative labels
              </div>
            </div>
          </div>

          <AuthCard />
        </Container>
      </section>

      <section
        id="features"
        className="relative border-t border-white/5 bg-black/60 py-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_60%)] opacity-70" />
        <Container className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" variant="wide">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b0b0b] via-[#090909] to-[#050505] p-6 transition hover:border-orange-500/50"
            >
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </Container>
      </section>
    </main>
  );
}
