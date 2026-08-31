"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Calendar,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  XCircle,
  RotateCcw,
} from "lucide-react";

interface OrderItem {
  id: string;
  foodId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderSummary {
  id: string;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/orders");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load orders:", err);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-foreground/60 text-sm">Loading your orders...</p>
      </div>
    );
  }

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus.toUpperCase()) {
      case "DELIVERED":
        return (
          <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs px-3 py-1 rounded-full font-bold">
            Delivered
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" /> On the Way
          </span>
        );
      case "PREPARING":
        return (
          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Preparing
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "RETURN_REQUESTED":
        return (
          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Return Requested
          </span>
        );
      case "RETURNED":
        return (
          <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refunded / Returned
          </span>
        );
      default:
        return (
          <span className="bg-brand/10 text-brand border border-brand/20 text-xs px-3 py-1 rounded-full font-bold">
            Order Placed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-6">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-1.5 flex items-center gap-3">
              <ShoppingBag className="w-9 h-9 text-brand" /> My Orders
            </h1>
            <p className="text-foreground/60 text-sm">
              Track active deliveries and view past order history
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-colors shadow-sm self-start sm:self-auto"
          >
            Order Food <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders placed yet</h2>
            <p className="text-foreground/60 mb-8 max-w-sm mx-auto text-sm">
              Hungry? Browse our menu and order your favorite meals today!
            </p>
            <Link
              href="/menu"
              className="inline-block bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95 text-sm"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-brand/40 transition-all"
                >
                  {/* Top Bar: Order ID, Date & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-base text-foreground">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> {formattedDate}
                    </div>
                  </div>

                  {/* Middle: Items preview */}
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex items-center gap-2.5 flex-shrink-0 bg-background/60 p-2 rounded-xl border border-border">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-card">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground truncate max-w-[130px]">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-foreground/60">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <span className="text-xs font-bold text-foreground/50 bg-background px-3 py-2 rounded-xl border border-border flex-shrink-0">
                          +{order.items.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-6 flex-shrink-0">
                      <div>
                        <span className="text-[11px] text-foreground/50 block">Total</span>
                        <span className="font-black text-2xl text-brand">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="bg-brand/10 hover:bg-brand hover:text-white text-brand px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 active:scale-95"
                      >
                        Track & Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Bottom: Destination summary */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-foreground/60">
                    <p className="truncate max-w-lg">
                      <span className="font-medium text-foreground">Delivered to:</span> {order.address}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
