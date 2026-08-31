"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Tag, Check, X, Loader2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Toast from "@/components/Toast";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getTotalPrice();
  const discount = getDiscountAmount();
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.1; // 10% tax
  const deliveryFee = subtotal > 0 ? (subtotal >= 50 ? 0 : 5.0) : 0;
  const total = discountedSubtotal + tax + deliveryFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
      } else {
        applyCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
        });
        setCouponInput("");
        setToastMessage(`Coupon ${data.code} applied (${data.discountPercent}% OFF) 🎉`);
      }
    } catch {
      setCouponError("Network error validating coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 flex flex-col items-center justify-center">
        <div className="bg-card p-12 rounded-3xl border border-border text-center shadow-sm max-w-md w-full mx-4">
          <div className="bg-brand/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-brand" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-foreground/70 mb-8">
            Looks like you haven't added any delicious food to your cart yet.
          </p>
          <Link
            href="/menu"
            className="inline-flex bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl font-bold transition-all w-full items-center justify-center shadow-lg shadow-brand/20 active:scale-95"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/menu"
            className="btn-back inline-flex"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-foreground/60">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items in your cart
            </p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-medium text-brand hover:underline hidden sm:block"
          >
            + Add more items
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-grow space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-6 bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-brand/30 transition-colors"
              >
                <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-background">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-grow text-center sm:text-left w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/menu/${item.id}`}
                        className="hover:text-brand transition-colors"
                      >
                        <h3 className="font-bold text-lg">{item.name}</h3>
                      </Link>
                      <p className="text-foreground/60 text-xs mt-0.5">{item.category}</p>
                    </div>
                    <span className="font-bold text-lg text-brand hidden sm:block">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-brand/10 hover:text-brand transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-9 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-brand/10 hover:text-brand transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-brand sm:hidden">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm sticky top-24 space-y-6">
              <h2 className="text-2xl font-bold">Order Summary</h2>

              {/* Promo Code Section */}
              <div className="border border-border/80 rounded-2xl p-4 bg-background/50">
                <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand" /> Promo / Coupon Code
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-3.5 py-2.5 rounded-xl text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <div>
                        <span className="font-bold text-green-700 dark:text-green-300">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 ml-1.5">
                          ({appliedCoupon.discountPercent}% OFF)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-foreground/50 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. FOODIEE20"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-grow px-3.5 py-2 border border-border bg-card text-foreground rounded-xl text-sm uppercase font-medium focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-foreground text-background hover:bg-foreground/90 font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 font-medium">{couponError}</p>
                    )}
                    <p className="text-[11px] text-foreground/50">
                      Try codes: <span className="font-semibold text-brand">FOODIEE20</span>, <span className="font-semibold text-brand">WELCOME10</span>
                    </p>
                  </form>
                )}
              </div>

              {/* Price calculations */}
              <div className="space-y-3 text-sm text-foreground/80 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Coupon Discount ({appliedCoupon?.discountPercent}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 dark:text-green-400 uppercase text-xs font-bold">
                        FREE (over $50)
                      </span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-baseline mb-6">
                  <div>
                    <span className="font-bold text-lg block">Total Amount</span>
                    <span className="text-xs text-foreground/50">Includes all taxes</span>
                  </div>
                  <span className="font-black text-3xl text-brand">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/20 active:scale-95 text-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
