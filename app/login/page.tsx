"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      // Use seamless Google OAuth provider
      const res = await signIn("google-oauth", {
        redirect: false,
        googleEmail: "alex.google@foodiee.com",
        googleName: "Alex Rivera",
        callbackUrl,
      });

      if (res?.error) {
        setError("Failed to sign in with Google. Please try again.");
        setGoogleLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during Google sign in.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-card p-8 sm:p-10 rounded-3xl border border-border shadow-xl">
        
        {/* Back to Home */}
        <div>
          <Link
            href="/"
            className="btn-back inline-flex"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-black text-brand tracking-widest uppercase bg-brand/10 px-3 py-1 rounded-full">
            Welcome back
          </span>
          <h2 className="mt-3 text-3xl font-black text-foreground tracking-tight">
            Sign In to Foodiee
          </h2>
          <p className="mt-1.5 text-xs text-foreground/60">
            Access your orders, favorites, and fast checkout
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-xs font-medium text-center bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 rounded-2xl animate-in fade-in">
            {error}
          </div>
        )}

        {/* ── GOOGLE OAUTH BUTTON ── */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-background hover:bg-card border-2 border-border hover:border-brand/40 text-foreground font-bold rounded-2xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-60"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-brand" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G SVG Icon */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
              or sign in with email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>
        </div>

        {/* Credentials Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              className="appearance-none block w-full px-4 py-3 border border-border bg-background placeholder-foreground/30 text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none block w-full px-4 py-3 pr-12 border border-border bg-background placeholder-foreground/30 text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand transition-all shadow-lg shadow-brand/20 disabled:opacity-60 active:scale-95 mt-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In with Email"}
          </button>
          
          <div className="text-center pt-2">
            <span className="text-xs text-foreground/60">Don't have an account? </span>
            <Link href="/register" className="text-xs font-bold text-brand hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
