"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

interface StrengthRule {
  label: string;
  test: (pw: string) => boolean;
}

const strengthRules: StrengthRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "Contains a number", test: (pw) => /\d/.test(pw) },
  { label: "Contains uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Contains special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const passedRules = strengthRules.filter((r) => r.test(password));
  const strength = passedRules.length; // 0‑4
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (strength < 2) {
      setError("Password is too weak. Please follow the strength rules.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Auto-login after successful registration
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (signInRes?.error) {
          router.push("/login");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl border border-border shadow-lg">
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
        <div className="text-center">
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Create an account</h1>
          <p className="mt-2 text-sm text-foreground/70">Join Foodiee today</p>
        </div>

        {/* Google Sign-up */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              await signIn("google-oauth", {
                redirect: false,
                googleEmail: "alex.google@foodiee.com",
                googleName: "Alex Rivera",
                callbackUrl: "/",
              });
              router.push("/");
              router.refresh();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-background hover:bg-card border-2 border-border hover:border-brand/40 text-foreground font-bold rounded-2xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-60"
          >
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
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
              or register with email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>
        </div>

        <form className="mt-4 space-y-5" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              className="w-full px-4 py-3 border border-border bg-background placeholder-gray-400 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-foreground mb-1">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              className="w-full px-4 py-3 border border-border bg-background placeholder-gray-400 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-12 border border-border bg-background placeholder-gray-400 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? strengthColor : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                {strengthLabel && (
                  <p className={`text-xs font-medium ${["", "text-red-500", "text-orange-400", "text-yellow-500", "text-green-500"][strength]}`}>
                    {strengthLabel} password
                  </p>
                )}
                <ul className="mt-2 space-y-1">
                  {strengthRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? "text-green-600 dark:text-green-400" : "text-foreground/50"}`}>
                        {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? "text" : "password"}
                required
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-background text-foreground placeholder-gray-400 transition-shadow ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-border"
                }`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
            {confirmPassword && confirmPassword === password && (
              <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-brand hover:bg-brand-hover font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand/20 active:scale-95"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
          </button>

          <div className="text-center">
            <span className="text-sm text-foreground/70">Already have an account? </span>
            <Link href="/login" className="text-sm font-medium text-brand hover:text-brand-hover">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
