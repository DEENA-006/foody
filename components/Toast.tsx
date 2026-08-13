"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <CheckCircle2 className="h-5 w-5 text-green-400" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
