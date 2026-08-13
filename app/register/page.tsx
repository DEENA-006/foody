"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl border border-border shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Join Foodiee today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-gray-500 text-foreground rounded-xl focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Email address</label>
              <input
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-gray-500 text-foreground rounded-xl focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-gray-500 text-foreground rounded-xl focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign up"}
            </button>
          </div>
          
          <div className="text-center mt-4">
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
