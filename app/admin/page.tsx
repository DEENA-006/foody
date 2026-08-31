"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  Edit,
  Shield,
  Loader2,
  Calendar,
  MapPin,
  Star,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import Toast from "@/components/Toast";

interface StatsData {
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalReviews: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "menu" | "reviews" | "users">("overview");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Order filtering state
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");

  // Add Dish modal state
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: "",
    category: "Chicken",
    price: "",
    image: "",
    description: "",
    calories: "500",
    protein: "25g",
    carbs: "45g",
    fat: "15g",
    spiceLevel: "0",
    dietary: "Chef Special",
  });
  const [addingDish, setAddingDish] = useState(false);

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Fetch stats & data
  const loadAdminData = async () => {
    try {
      const [statsRes, ordersRes, foodsRes, reviewsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/foods").then((r) => r.json()),
        fetch("/api/reviews?limit=50").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
      ]);

      if (statsRes.stats) {
        setStats(statsRes.stats);
        setRecentOrders(statsRes.recentOrders || []);
      }
      if (ordersRes.orders) setAllOrders(ordersRes.orders);
      if (foodsRes.foods) setFoods(foodsRes.foods);
      if (reviewsRes.reviews) setReviews(reviewsRes.reviews);
      if (usersRes.users) setUsers(usersRes.users);
    } catch (err) {
      console.error("Admin data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
      return;
    }
    if (status === "authenticated") {
      loadAdminData();
    }
  }, [status, router]);

  // Update order status action
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, returnStatus?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, returnStatus }),
      });

      if (res.ok) {
        setToastMessage(`Order status updated to ${newStatus.replace(/_/g, " ")} ✅`);
        loadAdminData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus, returnStatus }));
        }
      } else {
        setToastMessage("Failed to update order status");
      }
    } catch {
      setToastMessage("Network error updating status");
    }
  };

  // Add custom dish action
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingDish(true);
    try {
      const res = await fetch("/api/admin/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishForm),
      });
      const data = await res.json();
      if (res.ok) {
        setToastMessage(`Dish "${data.food.name}" added to menu! 🍽️`);
        setShowAddDishModal(false);
        setDishForm({
          name: "",
          category: "Chicken",
          price: "",
          image: "",
          description: "",
          calories: "500",
          protein: "25g",
          carbs: "45g",
          fat: "15g",
          spiceLevel: "0",
          dietary: "Chef Special",
        });
        loadAdminData();
      } else {
        setToastMessage(data.error || "Failed to add dish");
      }
    } catch {
      setToastMessage("Network error creating dish");
    } finally {
      setAddingDish(false);
    }
  };

  // Delete dish action
  const handleDeleteDish = async (dishId: string) => {
    if (!confirm("Are you sure you want to remove this dish?")) return;
    try {
      const res = await fetch(`/api/admin/foods/${dishId}`, { method: "DELETE" });
      if (res.ok) {
        setToastMessage("Dish deleted from menu");
        loadAdminData();
      }
    } catch {
      setToastMessage("Failed to delete dish");
    }
  };

  // Delete review action
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Delete this customer review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setToastMessage("Review removed");
        loadAdminData();
      }
    } catch {
      setToastMessage("Failed to delete review");
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      if (res.ok) {
        setToastMessage(`User role updated to ${nextRole} 🛡️`);
        loadAdminData();
      }
    } catch {
      setToastMessage("Failed to change user role");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-foreground/60 text-sm">Loading Admin Center...</p>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = allOrders.filter((order) => {
    const matchesStatus = orderStatusFilter === "ALL" || order.status === orderStatusFilter;
    const matchesQuery =
      !orderSearch ||
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const navTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: `Orders (${allOrders.length})`, icon: ShoppingBag },
    { id: "menu", label: `Menu Management (${foods.length})`, icon: Utensils },
    { id: "reviews", label: `Reviews (${reviews.length})`, icon: MessageSquare },
    { id: "users", label: `Users (${users.length})`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin Command Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Foodiee Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddDishModal(true)}
              className="bg-brand hover:bg-brand-hover text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-brand/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add New Dish
            </button>
            <Link
              href="/menu"
              className="bg-card border border-border hover:bg-background text-foreground font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              View Live Store
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-8 gap-2 hide-scrollbar border-b border-border">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "text-foreground/70 hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: OVERVIEW & STATS ── */}
        {activeTab === "overview" && stats && (
          <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-1">
                  Total Revenue
                </span>
                <p className="text-3xl font-black text-brand">${stats.totalRevenue.toFixed(2)}</p>
                <span className="text-[11px] text-green-600 font-semibold mt-1 inline-block">
                  Lifetime processed
                </span>
              </div>

              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-1">
                  Total Orders
                </span>
                <p className="text-3xl font-black text-foreground">{stats.totalOrders}</p>
                <span className="text-[11px] text-foreground/50 mt-1 inline-block">
                  {stats.pendingOrders} pending delivery
                </span>
              </div>

              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-1">
                  Pending Orders
                </span>
                <p className="text-3xl font-black text-amber-500">{stats.pendingOrders}</p>
                <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
                  Requires kitchen prep
                </span>
              </div>

              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-1">
                  Registered Users
                </span>
                <p className="text-3xl font-black text-foreground">{stats.totalUsers}</p>
                <span className="text-[11px] text-foreground/50 mt-1 inline-block">
                  Active customer base
                </span>
              </div>

              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-1">
                  Customer Reviews
                </span>
                <p className="text-3xl font-black text-foreground">{stats.totalReviews}</p>
                <span className="text-[11px] text-amber-500 font-semibold mt-1 inline-block">
                  ★ Verified ratings
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-foreground">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                >
                  View All Orders <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background/30">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-card/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-bold text-sm text-foreground">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-brand/10 text-brand">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/70">
                        {order.user?.name || order.user?.email} • {order.items?.length} items
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-black text-lg text-brand">${order.total.toFixed(2)}</span>
                      <button
                        onClick={() => { setSelectedOrder(order); }}
                        className="text-xs bg-foreground text-background px-4 py-2 rounded-xl font-bold hover:bg-foreground/90 transition-colors"
                      >
                        Manage Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ORDER MANAGEMENT ── */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Filter & Search Toolbar */}
            <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Order # or Customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar w-full sm:w-auto">
                {["ALL", "PENDING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === st
                        ? "bg-brand text-white shadow-sm"
                        : "bg-background border border-border text-foreground/70 hover:border-brand/40"
                    }`}
                  >
                    {st === "ALL" ? "All Orders" : st.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table / Cards */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 hover:border-brand/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-base text-foreground">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                          : order.status === "RETURN_REQUESTED"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                          : "bg-brand/10 text-brand"
                      }`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <span className="text-xs text-foreground/60 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand" />{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-foreground/80">
                    <div>
                      <span className="font-bold text-foreground block mb-1">Customer Info:</span>
                      <p>{order.user?.name || "Customer"}</p>
                      <p className="text-foreground/60">{order.user?.email}</p>
                      {order.user?.phone && <p className="text-foreground/60">{order.user.phone}</p>}
                    </div>

                    <div>
                      <span className="font-bold text-foreground block mb-1">Delivery Address:</span>
                      <p className="line-clamp-2">{order.address}</p>
                      <p className="text-foreground/60 mt-1 capitalize">Payment: {order.paymentMethod}</p>
                    </div>

                    <div>
                      <span className="font-bold text-foreground block mb-1">Items Summary:</span>
                      <p>{order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(", ")}</p>
                      <p className="font-black text-base text-brand mt-1">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Return or Cancellation Reason if any */}
                  {order.cancelReason && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
                      <span className="font-bold">Cancellation Reason:</span> {order.cancelReason}
                    </div>
                  )}

                  {order.returnReason && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-bold">Return Request:</span> {order.returnReason} — "{order.returnDetails}"
                    </div>
                  )}

                  {/* Action Bar / Status Transition */}
                  <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground/60 mr-1">Update Status:</span>
                      
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
                        >
                          → Mark Preparing
                        </button>
                      )}

                      {order.status === "PREPARING" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
                        >
                          → Mark Out for Delivery
                        </button>
                      )}

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
                        >
                          ✓ Mark Delivered
                        </button>
                      )}

                      {order.status === "RETURN_REQUESTED" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "RETURNED", "APPROVED")}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
                        >
                          ✓ Approve Return & Refund
                        </button>
                      )}
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    >
                      View Live Tracking Page <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: MENU / FOOD MANAGEMENT ── */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-foreground">Custom Menu Dishes</h3>
                <p className="text-xs text-foreground/60">Dishes created through admin panel</p>
              </div>

              <button
                onClick={() => setShowAddDishModal(true)}
                className="bg-brand text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:bg-brand-hover"
              >
                <Plus className="w-4 h-4" /> Add Custom Dish
              </button>
            </div>

            {foods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {foods.map((food) => (
                  <div key={food.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative h-44 w-full bg-background">
                      <Image src={food.image} alt={food.name} fill className="object-cover" />
                      <span className="absolute top-3 left-3 bg-background/90 text-brand text-xs font-bold px-3 py-1 rounded-full">
                        {food.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2 flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-base text-foreground">{food.name}</h4>
                        <span className="font-black text-brand text-base">${food.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-foreground/70 line-clamp-2">{food.description}</p>
                    </div>

                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => handleDeleteDish(food.id)}
                        className="flex-1 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-3xl border border-border">
                <Utensils className="w-12 h-12 mx-auto text-foreground/20 mb-3" />
                <h4 className="font-bold text-base text-foreground mb-1">No custom dishes yet</h4>
                <p className="text-xs text-foreground/50 mb-6">Create new menu specials to display alongside TheMealDB recipes.</p>
                <button
                  onClick={() => setShowAddDishModal(true)}
                  className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  Create First Dish
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: REVIEW MODERATION ── */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Customer Reviews Moderation</h3>

            <div className="divide-y divide-border border border-border rounded-3xl overflow-hidden bg-card shadow-sm">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {rev.user?.name || rev.user?.email}
                      </span>
                      <span className="text-[11px] text-brand font-semibold">
                        on {rev.foodName || `Dish #${rev.foodId}`}
                      </span>
                      <div className="flex items-center text-amber-400 ml-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-400" : "opacity-20"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-foreground/80">"{rev.comment}"</p>
                    <span className="text-[10px] text-foreground/40 block">
                      {new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors self-end sm:self-auto"
                    aria-label="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: USER MANAGEMENT ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-4">User Accounts & Roles</h3>

            <div className="divide-y divide-border border border-border rounded-3xl overflow-hidden bg-card shadow-sm">
              {users.map((u) => (
                <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-black flex items-center justify-center text-sm">
                      {u.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{u.name || "Customer"}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-gray-100 dark:bg-gray-800 text-foreground/70"
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/60">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-foreground/60">
                      {u._count?.orders || 0} orders • {u._count?.reviews || 0} reviews
                    </span>
                    <button
                      onClick={() => handleToggleUserRole(u.id, u.role)}
                      className="text-xs font-bold px-4 py-2 border border-border rounded-xl hover:bg-background transition-colors"
                    >
                      {u.role === "ADMIN" ? "Demote to User" : "Make Admin 🛡️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── ADD NEW DISH MODAL ── */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Utensils className="w-5 h-5 text-brand" /> Add New Menu Dish
              </h3>
              <button onClick={() => setShowAddDishModal(false)} className="text-foreground/40 hover:text-foreground">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Truffle Mushroom Burger"
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase mb-1">Category *</label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm"
                  >
                    {["Beef", "Chicken", "Dessert", "Lamb", "Pasta", "Pork", "Seafood", "Side", "Starter", "Vegan", "Vegetarian"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="14.99"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={dishForm.image}
                    onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/70 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the flavors, ingredients, and cooking technique..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase mb-1">Calories</label>
                  <input
                    type="number"
                    value={dishForm.calories}
                    onChange={(e) => setDishForm({ ...dishForm, calories: e.target.value })}
                    className="w-full px-2.5 py-2 bg-background border border-border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase mb-1">Protein</label>
                  <input
                    type="text"
                    value={dishForm.protein}
                    onChange={(e) => setDishForm({ ...dishForm, protein: e.target.value })}
                    className="w-full px-2.5 py-2 bg-background border border-border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase mb-1">Carbs</label>
                  <input
                    type="text"
                    value={dishForm.carbs}
                    onChange={(e) => setDishForm({ ...dishForm, carbs: e.target.value })}
                    className="w-full px-2.5 py-2 bg-background border border-border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase mb-1">Fat</label>
                  <input
                    type="text"
                    value={dishForm.fat}
                    onChange={(e) => setDishForm({ ...dishForm, fat: e.target.value })}
                    className="w-full px-2.5 py-2 bg-background border border-border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingDish}
                  className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {addingDish ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Publish Dish"}
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
