/**
 * Login Page Template
 *
 * Authentication page with email/password and social sign-in.
 *
 * Features:
 * - Email/password sign-in
 * - Google OAuth
 * - Form validation
 * - Error handling
 * - Redirect to dashboard after login
 * - Link to sign-up page
 *
 * File: app/login/page.tsx
 */

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/Button";
import { FormField } from "@/components/FormField";
import { Card } from "@/components/Card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard");
    return null;
  }

  async function handleEmailSignIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await signInWithEmail(email, password);

      if (authError) {
        setError(authError);
        return;
      }

      // Success - redirect handled by AuthContext
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await signInWithGoogle();

      if (authError) {
        setError(authError);
        return;
      }

      // Success - redirect handled by AuthContext
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-6">
      <Card className="w-full max-w-md" padding="lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink-base">Welcome Back</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="mt-8 space-y-6">
          <FormField label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-outline-subtle bg-white px-4 py-2 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </FormField>

          <FormField label="Password" required>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-outline-subtle bg-white px-4 py-2 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!email || !password}
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-subtle" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-ink-muted">Or continue with</span>
          </div>
        </div>

        {/* Social Sign-In */}
        <Button
          variant="secondary"
          fullWidth
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary-500 hover:text-primary-600"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
