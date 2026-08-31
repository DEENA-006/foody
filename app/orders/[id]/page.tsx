"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  Home,
  MapPin,
  CreditCard,
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Calendar,
  XCircle,
  RotateCcw,
  AlertTriangle,
  FileText,
  DollarSign,
  ShieldAlert,
  ChevronRight,
  Info,
  X,
} from "lucide-react";
import Toast from "@/components/Toast";

interface OrderItem {
  id: string;
  foodId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderDetail {
  id: string;
  userId: string;
  address: string;
  paymentMethod: string;
  couponCode: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED";
  createdAt: string;
  items: OrderItem[];
  cancelReason?: string | null;
  cancelledAt?: string | null;
  returnReason?: string | null;
  returnDetails?: string | null;
  returnStatus?: string | null;
  returnPickup?: string | null;
  refundAmount?: number | null;
  returnedAt?: string | null;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

const cancelReasons = [
  "Changed my mind",
  "Ordered by mistake / wrong items",
  "Delivery time is too long",
  "Found food elsewhere",
  "Need to change delivery address",
  "Other reason",
];

const returnReasons = [
  "Wrong items delivered",
  "Food quality issue / spoiled or undercooked",
  "Food spilled / packaging damaged during transit",
  "Missing items from my order",
  "Food was delivered cold / unsatisfactory",
  "Dietary / allergy concern mismatch",
  "Other issue with food or delivery",
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [cancelNotes, setCancelNotes] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState(returnReasons[0]);
  const [returnDetails, setReturnDetails] = useState("");
  const [returnResolution, setReturnResolution] = useState("Full Refund");
  const [returning, setReturning] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/orders/${resolvedParams.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load order");
        }
        return res.json();
      })
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, notes: cancelNotes }),
      });
      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.error || "Failed to cancel order");
      } else {
        setOrder(data.order);
        setShowCancelModal(false);
        setToastMessage("Order has been cancelled successfully.");
      }
    } catch {
      setToastMessage("Network error while cancelling order");
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!returnDetails.trim()) {
      setToastMessage("Please provide details explaining the return request.");
      return;
    }

    setReturning(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: returnReason,
          details: `${returnDetails.trim()} (Preferred: ${returnResolution})`,
          returnType: returnResolution,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.error || "Failed to submit return request");
      } else {
        setOrder(data.order);
        setShowReturnModal(false);
        setToastMessage("Return request submitted! Our support team will process your refund.");
      }
    } catch {
      setToastMessage("Network error while submitting return request");
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-foreground/60 text-sm">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-4">
        <div className="bg-card p-10 rounded-3xl border border-border text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-foreground/60 mb-6 text-sm">
            {error || "We couldn't retrieve this order. Please check your order history."}
          </p>
          <Link
            href="/orders"
            className="inline-block w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  // Active status stepper
  const statusSteps = [
    { key: "PENDING", label: "Order Placed", icon: CheckCircle2, desc: "Order confirmed & received" },
    { key: "PREPARING", label: "Kitchen Preparing", icon: ChefHat, desc: "Fresh food is being prepared" },
    { key: "OUT_FOR_DELIVERY", label: "On the Way", icon: Truck, desc: "Courier is on the route" },
    { key: "DELIVERED", label: "Delivered", icon: Home, desc: "Delivered to your doorstep" },
  ];

  const statusOrderMap: Record<string, number> = {
    PENDING: 1,
    PREPARING: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
  };

  const currentStep = statusOrderMap[order.status] || 1;
  const isCancellable = order.status === "PENDING" || order.status === "PREPARING";
  const isReturnable = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";
  const isReturnRequested = order.status === "RETURN_REQUESTED" || order.status === "RETURNED";

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="btn-back inline-flex"
            aria-label="Back to orders"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="text-center mb-8">
          {isCancelled ? (
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-red-500/10">
              <XCircle className="w-10 h-10" />
            </div>
          ) : isReturnRequested ? (
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-500/10">
              <RotateCcw className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-green-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            {isCancelled
              ? "Order Cancelled"
              : isReturnRequested
              ? "Return & Refund Request"
              : "Order Confirmed!"}
          </h1>

          <p className="text-foreground/70 text-sm max-w-md mx-auto">
            {isCancelled
              ? "This order has been cancelled and will not be delivered."
              : isReturnRequested
              ? "Your return request is currently being reviewed by our support team."
              : "Thank you for ordering with Foodiee. Your meal is being prepared and delivered shortly."}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Order #{order.id.slice(-8).toUpperCase()}
          </div>
        </div>

        {/* ── CANCELLED ORDER DETAILS BANNER ── */}
        {isCancelled && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-3xl p-6 mb-8 text-foreground">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow">
                <h3 className="font-bold text-base text-red-700 dark:text-red-300">Cancellation Summary</h3>
                <p className="text-sm text-foreground/80">
                  <span className="font-semibold">Reason:</span> {order.cancelReason || "Cancelled by customer"}
                </p>
                {order.cancelledAt && (
                  <p className="text-xs text-foreground/60">
                    Cancelled on:{" "}
                    {new Date(order.cancelledAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs text-foreground/70">
                  <span>Refund Status: Processed to original payment / No charges incurred</span>
                  <span className="font-bold text-red-600 dark:text-red-400">$0.00 Charged</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RETURN & REFUND DETAILS CARD ── */}
        {isReturnRequested && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 sm:p-8 mb-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300">
                    Return Request Details
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Submitted on{" "}
                    {order.returnedAt
                      ? new Date(order.returnedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently"}
                  </p>
                </div>
              </div>

              <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {order.returnStatus || "Under Review"}
              </span>
            </div>

            {/* Return Step Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-1 text-green-600 dark:text-green-400 font-bold text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4" /> 1. Request Filed
                </div>
                <p className="text-xs text-foreground/70">Return ticket registered in system</p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-1 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase">
                  <Clock className="w-4 h-4" /> 2. Review & Pickup
                </div>
                <p className="text-xs text-foreground/70">Support verifying food issues</p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-1 text-foreground/40 font-bold text-xs uppercase">
                  <DollarSign className="w-4 h-4" /> 3. Refund Credit
                </div>
                <p className="text-xs text-foreground/70">
                  ${(order.refundAmount || order.total).toFixed(2)} refund back to account
                </p>
              </div>
            </div>

            {/* Return Reason & Breakdown */}
            <div className="bg-card p-5 rounded-2xl border border-border space-y-3">
              <div>
                <span className="text-xs font-bold uppercase text-foreground/50 block mb-1">
                  Primary Return Reason
                </span>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" /> {order.returnReason}
                </p>
              </div>

              {order.returnDetails && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs font-bold uppercase text-foreground/50 block mb-1">
                    Customer Explanation & Notes
                  </span>
                  <p className="text-xs text-foreground/80 bg-background p-3 rounded-xl leading-relaxed">
                    "{order.returnDetails}"
                  </p>
                </div>
              )}

              {order.returnPickup && (
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground/70">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand" /> Return Pickup Address:
                  </span>
                  <span className="font-medium text-foreground">{order.returnPickup}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LIVE TRACKING STEPPER (for non-cancelled orders) ── */}
        {!isCancelled && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-foreground">Live Delivery Status</h3>
              
              {/* Contextual Action Buttons */}
              <div className="flex items-center gap-2">
                {isCancellable && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Order
                  </button>
                )}

                {isReturnable && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return / Refund
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
              {statusSteps.map((stepItem, idx) => {
                const Icon = stepItem.icon;
                const isCompleted = currentStep > idx + 1;
                const isCurrent = currentStep === idx + 1;

                return (
                  <div key={stepItem.key} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                        isCurrent
                          ? "bg-brand text-white shadow-lg shadow-brand/30 ring-4 ring-brand/20 scale-110"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-background border border-border text-foreground/40"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isCurrent ? "text-brand" : "text-foreground"}`}>
                        {stepItem.label}
                      </h4>
                      <p className="text-[11px] text-foreground/60 leading-tight mt-0.5">
                        {stepItem.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-foreground/60 gap-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand" /> Placed on {orderDate}
              </span>
              <span className="flex items-center gap-1.5 text-brand font-semibold">
                <Clock className="w-3.5 h-3.5" /> Estimated Delivery: 25-35 mins
              </span>
            </div>
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-foreground">Order Breakdown</h3>
            {isCancellable && (
              <span className="text-xs text-foreground/50 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-brand" /> Free cancellation before courier pickup
              </span>
            )}
          </div>

          {/* Items List */}
          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background/30">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-background">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                  <p className="text-xs text-foreground/60">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-sm text-brand">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-background/60 border border-border">
              <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand" /> Delivery Address
              </span>
              <p className="text-sm font-medium text-foreground">{order.address}</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/60 border border-border">
              <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-brand" /> Payment Details
              </span>
              <p className="text-sm font-medium text-foreground capitalize">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
              </p>
              {order.couponCode && (
                <span className="text-[11px] font-bold text-green-600 dark:text-green-400 mt-1 inline-block">
                  Coupon: {order.couponCode} (-${order.discount.toFixed(2)})
                </span>
              )}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2.5 text-xs text-foreground/80 pt-4 border-t border-border">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">${order.subtotal.toFixed(2)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                <span>Discount Applied</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span className="font-semibold text-foreground">${order.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-foreground">
                {order.deliveryFee === 0 ? "FREE" : `$${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="font-bold text-base text-foreground">Total</span>
              <span className="font-black text-2xl text-brand">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/menu"
              className="flex-1 bg-brand hover:bg-brand-hover text-white py-3.5 rounded-xl font-bold text-center transition-all shadow-lg shadow-brand/20 active:scale-95 text-sm"
            >
              Order More Food
            </Link>
            <Link
              href="/orders"
              className="flex-1 bg-card border border-border hover:bg-background text-foreground py-3.5 rounded-xl font-bold text-center transition-all text-sm"
            >
              View Order History
            </Link>
          </div>
        </div>

      </div>

      {/* ── CANCEL ORDER MODAL ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5 text-red-500">
                <XCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">Cancel Order</h3>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-foreground/40 hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-sm text-foreground/70">
                Are you sure you want to cancel Order #{order.id.slice(-8).toUpperCase()}? This action cannot be undone.
              </p>

              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                  Select Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  {cancelReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why you're cancelling..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-background transition-colors"
                >
                  Keep My Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RETURN & REFUND MODAL ── */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5 text-amber-500">
                <RotateCcw className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">Request Return & Refund</h3>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-foreground/40 hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <p className="text-sm text-foreground/70">
                We're sorry your meal did not meet expectations. Please submit your return request below and our team will process your refund immediately.
              </p>

              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                  Primary Issue / Return Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  {returnReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                  Detailed Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe what was wrong with the items received, freshness, spill details, etc."
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                  Preferred Resolution
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {["Full Refund", "Store Credit", "Replacement"].map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setReturnResolution(res)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        returnResolution === res
                          ? "border-brand bg-brand/10 text-brand ring-2 ring-brand/20"
                          : "border-border text-foreground/70 hover:border-brand/40 bg-background"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refund summary banner */}
              <div className="p-4 bg-background/80 rounded-2xl border border-border flex items-center justify-between text-xs">
                <span className="text-foreground/70">Estimated Refund Amount:</span>
                <span className="font-extrabold text-base text-brand">${order.total.toFixed(2)}</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returning}
                  className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {returning ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Return Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
