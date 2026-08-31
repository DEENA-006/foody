import Link from "next/link";
import { UtensilsCrossed, ArrowRight, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-14 shadow-sm max-w-lg w-full space-y-6">
        
        {/* Floating Icon */}
        <div className="w-24 h-24 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <UtensilsCrossed className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Dish Not Found
          </h1>
          <p className="text-sm text-foreground/60 max-w-sm mx-auto">
            Looks like the page you are looking for has been eaten or doesn't exist on our menu anymore.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/menu"
            className="flex-1 bg-brand hover:bg-brand-hover text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" /> Explore Menu
          </Link>
          <Link
            href="/"
            className="flex-1 bg-background hover:bg-card border border-border text-foreground py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
