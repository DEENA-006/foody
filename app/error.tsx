"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Application Error]", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-14 shadow-sm max-w-lg w-full space-y-6">
        
        <div className="w-20 h-20 bg-red-100 dark:bg-red-950/60 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            We encountered an unexpected kitchen delay. Our team has been notified.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-brand hover:bg-brand-hover text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 bg-background hover:bg-card border border-border text-foreground py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
