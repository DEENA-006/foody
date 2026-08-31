"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  ShieldCheck,
  Truck,
  Plus,
  Building,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useCartStore } from "@/lib/store";

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const cartItems = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
    saveForFuture: true,
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "upi">("cod");

  // Load saved addresses & profile data on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/addresses")
        .then((r) => r.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr.id : data.addresses[0].id);
          }
        })
        .catch(console.error);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-4">
        <div className="bg-card p-10 rounded-3xl border border-border text-center max-w-md w-full shadow-sm">
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5 text-brand">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No items to checkout</h2>
          <p className="text-foreground/60 mb-6 text-sm">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/menu"
            className="inline-block w-full bg-brand text-white py-3.5 rounded-xl font-bold hover:bg-brand-hover transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const discount = getDiscountAmount();
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.1;
  const deliveryFee = subtotal > 0 ? (subtotal >= 50 ? 0 : 5.0) : 0;
  const total = discountedSubtotal + tax + deliveryFee;

  // Selected or constructed formatted address string
  const getFormattedAddress = () => {
    if (selectedAddressId !== "new") {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip} (${addr.label})`;
    }
    return `${addressForm.street}, ${addressForm.city}, ${addressForm.state} ${addressForm.zip}`;
  };

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedAddressId === "new") {
      if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.zip.trim()) {
        setError("Please fill in all address fields.");
        return;
      }

      // Optionally save to DB
      if (addressForm.saveForFuture) {
        try {
          const res = await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addressForm),
          });
          const data = await res.json();
          if (data.address) {
            setSavedAddresses([data.address, ...savedAddresses]);
            setSelectedAddressId(data.address.id);
          }
        } catch (err) {
          console.error("Failed to save address:", err);
        }
      }
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError("");

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        address: getFormattedAddress(),
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        subtotal,
        discount,
        tax,
        deliveryFee,
        total,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order. Please try again.");
        setSubmitting(false);
      } else {
        clearCart();
        router.push(`/orders/${data.order.id}`);
      }
    } catch {
      setError("Network error while placing your order.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="btn-back inline-flex"
            aria-label="Back to cart"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-border w-full -z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand transition-all duration-300 -z-0"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            />

            {/* Step 1 */}
            <div
              onClick={() => setStep(1)}
              className={`relative z-10 flex flex-col items-center cursor-pointer`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= 1 ? "bg-brand text-white ring-4 ring-brand/20 shadow-md" : "bg-card border border-border text-foreground/60"
                }`}
              >
                1
              </div>
              <span className="text-xs font-semibold mt-2 text-foreground">Address</span>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => (step > 2 ? setStep(2) : null)}
              className={`relative z-10 flex flex-col items-center ${step >= 2 ? "cursor-pointer" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= 2 ? "bg-brand text-white ring-4 ring-brand/20 shadow-md" : "bg-card border border-border text-foreground/60"
                }`}
              >
                2
              </div>
              <span className="text-xs font-semibold mt-2 text-foreground">Payment</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === 3 ? "bg-brand text-white ring-4 ring-brand/20 shadow-md" : "bg-card border border-border text-foreground/60"
                }`}
              >
                3
              </div>
              <span className="text-xs font-semibold mt-2 text-foreground">Review</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Step Form */}
          <div className="flex-grow">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
              
              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 rotate-45" />
                  {error}
                </div>
              )}

              {/* ── STEP 1: Delivery Address ── */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-2.5 mb-6">
                    <MapPin className="w-6 h-6 text-brand" />
                    <h2 className="text-2xl font-bold">Delivery Address</h2>
                  </div>

                  {/* Saved Addresses Selector */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">
                        Select a saved address:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? "border-brand bg-brand/5 ring-2 ring-brand/20 shadow-sm"
                                : "border-border hover:border-brand/40 bg-background/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-brand" /> {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} {addr.zip}
                            </p>
                          </div>
                        ))}

                        <div
                          onClick={() => setSelectedAddressId("new")}
                          className={`p-4 rounded-2xl border border-dashed cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                            selectedAddressId === "new"
                              ? "border-brand bg-brand/5 text-brand"
                              : "border-border text-foreground/60 hover:text-brand hover:border-brand"
                          }`}
                        >
                          <Plus className="w-4 h-4" /> Add New Address
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New Address Form */}
                  {selectedAddressId === "new" && (
                    <form id="address-form" onSubmit={handleNextStep1} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-1">
                            Address Label
                          </label>
                          <select
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-1">
                            ZIP / Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 90210"
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="123 Main Street, Apt 4B"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Los Angeles"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-1">
                            State / Province <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="CA"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-foreground/80 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={addressForm.saveForFuture}
                          onChange={(e) => setAddressForm({ ...addressForm, saveForFuture: e.target.checked })}
                          className="rounded border-border text-brand focus:ring-brand"
                        />
                        Save this address to my profile for future orders
                      </label>
                    </form>
                  )}

                  <div className="mt-8 pt-6 border-t border-border flex justify-end">
                    <button
                      type={selectedAddressId === "new" ? "submit" : "button"}
                      form={selectedAddressId === "new" ? "address-form" : undefined}
                      onClick={selectedAddressId !== "new" ? () => setStep(2) : undefined}
                      className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-brand/20 transition-all active:scale-95"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Payment Method ── */}
              {step === 2 && (
                <div>
                  <div className="flex items-center gap-2.5 mb-6">
                    <CreditCard className="w-6 h-6 text-brand" />
                    <h2 className="text-2xl font-bold">Payment Method</h2>
                  </div>

                  <div className="space-y-3 mb-8">
                    {/* Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-5 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                        paymentMethod === "cod"
                          ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                          : "border-border hover:border-brand/40 bg-background/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-foreground">Cash on Delivery (COD)</h4>
                        <p className="text-xs text-foreground/60">Pay with cash or card upon receiving your order</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-brand bg-brand text-white" : "border-border"}`}>
                        {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Credit / Debit Card (Demo) */}
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`p-5 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                        paymentMethod === "card"
                          ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                          : "border-border hover:border-brand/40 bg-background/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-foreground">Credit / Debit Card (Stripe)</h4>
                        <p className="text-xs text-foreground/60">Instant safe card payment (Demo sandbox enabled)</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "card" ? "border-brand bg-brand text-white" : "border-border"}`}>
                        {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* UPI / Digital Wallet */}
                    <div
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-5 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                        paymentMethod === "upi"
                          ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                          : "border-border hover:border-brand/40 bg-background/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-foreground">UPI / Instant QR</h4>
                        <p className="text-xs text-foreground/60">Google Pay, PhonePe, Paytm or Net Banking</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "upi" ? "border-brand bg-brand text-white" : "border-border"}`}>
                        {paymentMethod === "upi" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-card text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-brand/20 transition-all active:scale-95"
                    >
                      Review Order
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Review & Confirm ── */}
              {step === 3 && (
                <div>
                  <div className="flex items-center gap-2.5 mb-6">
                    <ShieldCheck className="w-6 h-6 text-brand" />
                    <h2 className="text-2xl font-bold">Review & Place Order</h2>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Delivery Destination */}
                    <div className="p-4 rounded-2xl bg-background/60 border border-border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand" /> Delivery Address
                        </span>
                        <button
                          onClick={() => setStep(1)}
                          className="text-xs text-brand hover:underline font-medium"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {getFormattedAddress()}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="p-4 rounded-2xl bg-background/60 border border-border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-brand" /> Payment
                        </span>
                        <button
                          onClick={() => setStep(2)}
                          className="text-xs text-brand hover:underline font-medium"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : paymentMethod === "card"
                          ? "Credit / Debit Card"
                          : "UPI / Digital Wallet"}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3 mb-8">
                    <h3 className="text-sm font-bold text-foreground/80">Order Items ({cartItems.length})</h3>
                    <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background/40">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-3.5 flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-background">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                            <p className="text-xs text-foreground/60">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-sm text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setStep(2)}
                      className="px-5 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-card text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Payment
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handlePlaceOrder}
                      className="bg-brand hover:bg-brand-hover text-white font-black px-10 py-4 rounded-xl flex items-center gap-2 text-lg shadow-xl shadow-brand/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                        </>
                      ) : (
                        `Place Order • $${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Mini Price Breakdown */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm sticky top-24 space-y-4">
              <h3 className="font-bold text-lg text-foreground">Summary</h3>

              <div className="space-y-2.5 text-xs text-foreground/80 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery</span>
                  <span className="font-semibold text-foreground">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-bold uppercase">
                        Free
                      </span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-baseline">
                <span className="font-bold text-base text-foreground">Total</span>
                <span className="font-black text-2xl text-brand">${total.toFixed(2)}</span>
              </div>

              <div className="pt-2 text-[11px] text-foreground/50 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Estimated delivery: 25 - 35 mins</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
