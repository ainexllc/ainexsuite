"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils/cn";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthBoxProps {
  redirectPath?: string;
  className?: string;
  defaultTab?: "login" | "register";
}

export function AuthBox({
  redirectPath = "/workspace",
  className,
  defaultTab = "login",
}: AuthBoxProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    watch,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const getPasswordStrength = () => {
    if (!password || password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const handleLoginSuccess = () => {
    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
      variant: "success",
    });
    router.push(redirectPath as never);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      handleLoginSuccess();
    } catch (error: unknown) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Unable to sign in right now. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await signUpWithEmail(data.email, data.password);
      toast({
        title: "Welcome to NoteNex!",
        description: "Your account has been created successfully.",
        variant: "success",
      });
      router.push(redirectPath as never);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "Signed in with Google successfully.",
        variant: "success",
      });
      router.push(redirectPath as never);
    } catch (error: unknown) {
      toast({
        title: "Google sign-in failed",
        description: error instanceof Error ? error.message : "Unable to sign in with Google.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border border-[#f97316]/20 bg-[#050505]/90 p-8 text-white shadow-[0_25px_80px_-25px_rgba(249,115,22,0.35)] backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#f973161a] via-transparent to-transparent" />

      {/* Tab Switcher */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={cn(
            "flex-1 rounded-full px-6 py-3 text-sm font-semibold transition-all",
            activeTab === "login"
              ? "bg-[#f97316] text-black shadow-[0_8px_30px_rgba(249,115,22,0.4)]"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={cn(
            "flex-1 rounded-full px-6 py-3 text-sm font-semibold transition-all",
            activeTab === "register"
              ? "bg-[#f97316] text-black shadow-[0_8px_30px_rgba(249,115,22,0.4)]"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          )}
        >
          Sign Up
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="text-xs font-semibold tracking-[0.5em] text-[#ff6900]">
            {activeTab === "login" ? "ACCESS" : "GET STARTED"}
          </div>
          <h2 className="text-3xl font-semibold text-white">
            {activeTab === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-white/70">
            {activeTab === "login"
              ? "Access your noteOS quickly."
              : "Start your productivity journey today"}
          </p>
        </div>
        <Sparkles className="mt-1 h-5 w-5 text-[#ff6900]" />
      </div>

      {/* Login Form */}
      {activeTab === "login" && (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Email
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-[#f97316] focus-within:bg-black/40">
              <Mail className="h-4 w-4 text-[#f97316]" />
              <input
                {...registerLogin("email")}
                type="email"
                className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            {loginErrors.email && (
              <p className="mt-1 text-xs text-red-400">{loginErrors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Password
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-[#f97316] focus-within:bg-black/40">
              <Lock className="h-4 w-4 text-[#f97316]" />
              <input
                {...registerLogin("password")}
                type={showPassword ? "text" : "password"}
                className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-white/50 transition hover:text-white/80"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginErrors.password && (
              <p className="mt-1 text-xs text-red-400">{loginErrors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_45px_rgba(249,115,22,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff7d2a] focus:outline-none focus:ring-2 focus:ring-[#f97316]/70 focus:ring-offset-2 focus:ring-offset-[#050505]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                Sign in
              </>
            )}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === "register" && (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Name
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-[#f97316] focus-within:bg-black/40">
              <User className="h-4 w-4 text-[#f97316]" />
              <input
                {...registerSignup("displayName")}
                type="text"
                className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Your name"
                disabled={isLoading}
              />
            </div>
            {registerErrors.displayName && (
              <p className="mt-1 text-xs text-red-400">{registerErrors.displayName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Email
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-[#f97316] focus-within:bg-black/40">
              <Mail className="h-4 w-4 text-[#f97316]" />
              <input
                {...registerSignup("email")}
                type="email"
                className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            {registerErrors.email && (
              <p className="mt-1 text-xs text-red-400">{registerErrors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Password
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-[#f97316] focus-within:bg-black/40">
              <Lock className="h-4 w-4 text-[#f97316]" />
              <input
                {...registerSignup("password")}
                type={showPassword ? "text" : "password"}
                className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Minimum 6 characters"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-white/50 transition hover:text-white/80"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          passwordStrength >= level
                            ? level <= 2
                              ? "bg-red-500"
                              : level <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/60">
                    {passwordStrength === 0
                      ? "Weak"
                      : passwordStrength <= 2
                      ? "Fair"
                      : passwordStrength <= 3
                      ? "Good"
                      : "Strong"}
                  </span>
                </div>
              </div>
            )}
            {registerErrors.password && (
              <p className="mt-1 text-xs text-red-400">{registerErrors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Confirm Password
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-[#f97316] focus-within:bg-black/40">
              <Lock className="h-4 w-4 text-[#f97316]" />
              <input
                {...registerSignup("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-white/50 transition hover:text-white/80"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {registerErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{registerErrors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_45px_rgba(249,115,22,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff7d2a] focus:outline-none focus:ring-2 focus:ring-[#f97316]/70 focus:ring-offset-2 focus:ring-offset-[#050505]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                Create account
              </>
            )}
          </button>
        </form>
      )}

      {/* Google Sign In */}
      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        or
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f97316]/60 hover:bg-[#f97316]/10 focus:outline-none focus:ring-2 focus:ring-[#f97316]/60 focus:ring-offset-2 focus:ring-offset-[#050505]"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Continue with Google
      </button>
    </div>
  );
}
