"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { FoodItem } from "@/lib/data";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  item: FoodItem;
  actionType: "cart" | "buy";
  initialQuantity?: number;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  actionType,
  initialQuantity = 1,
}: ConfirmationModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<{lat: number; lon: number} | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      document.body.style.overflow = 'hidden';
      if (actionType === 'buy') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          }, () => {
            setLocation(null);
          });
        }
      } else {
        setLocation(null);
      }
    } else {
      document.body.style.overflow = 'unset';
      setLocation(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialQuantity, actionType]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex gap-4 items-center mb-6">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.name}</h3>
            <p className="text-brand font-bold mt-1">${item.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-foreground/80 font-medium">
            {actionType === "cart" 
                ? "Add this item to your cart?" 
                : "Proceed to buy this item now?"}
        </p>
        {actionType === 'buy' && location && (
          <p className="text-sm text-foreground/60 mt-2">
            Your location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </p>
        )}
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="font-bold text-2xl w-8 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border font-bold text-foreground hover:bg-foreground/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm(quantity);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold transition-colors shadow-lg shadow-brand/20"
          >
            {actionType === "cart" ? "Add to Cart" : "Confirm & Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}
