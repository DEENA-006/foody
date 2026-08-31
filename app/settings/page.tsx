"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  LogOut,
  Settings,
  Heart,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  UserCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { useFavoriteStore } from "@/lib/store";

interface OrderSummary {
  id: string;
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
}

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const favorites = useFavoriteStore((state) => state.favorites);

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // Orders state
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Load profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setName(data.user.name || "");
            setPhone(data.user.phone || "");
          }
        })
        .catch(() => {
          setName(session?.user?.name || "");
        });

      // Load addresses
      fetch("/api/addresses")
        .then((r) => r.json())
        .then((data) => {
          if (data.addresses) setAddresses(data.addresses);
        })
        .catch(console.error);
    }
  }, [status, session]);

  // Load orders when switching to orders tab
  useEffect(() => {
    if (activeTab === "orders" && status === "authenticated") {
      setOrdersLoading(true);
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
          setOrdersLoading(false);
        })
        .catch(() => setOrdersLoading(false));
    }
  }, [activeTab, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/settings");
    }
  }, [status, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSaveStatus("error");
        setSaveMessage(data.error || "Failed to save.");
      } else {
        setSaveStatus("success");
        setSaveMessage("Profile saved successfully!");
        await updateSession({ name: data.user.name });
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      setSaveStatus("error");
      setSaveMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (data.address) {
        setAddresses([data.address, ...addresses]);
        setShowAddAddress(false);
        setNewAddress({ label: "Home", street: "", city: "", state: "", zip: "", isDefault: false });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: Settings },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <h1 className="text-4xl font-bold mb-10">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              {/* Avatar */}
              <div className="p-6 text-center border-b border-border">
                <div className="w-20 h-20 bg-brand/20 text-brand rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4">
                  {name?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0) || "U"}
                </div>
                <h2 className="font-bold text-lg truncate">{name || session?.user?.name}</h2>
                <p className="text-sm text-foreground/60 truncate">{session?.user?.email}</p>
              </div>

              <div className="p-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${
                      activeTab === id
                        ? "bg-brand/10 text-brand"
                        : "text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">

              {/* ── Profile Settings Tab ── */}
              {activeTab === "profile" && (
                <>
                  <h3 className="text-2xl font-bold mb-6">Profile Information</h3>

                  {saveStatus === "success" && (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      {saveMessage}
                    </div>
                  )}
                  {saveStatus === "error" && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {saveMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <label htmlFor="profile-name" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <UserCircle className="w-4 h-4 text-brand" /> Full Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="profile-email" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-brand" /> Email Address
                        <span className="text-xs text-foreground/40 font-normal">(cannot be changed)</span>
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        disabled
                        className="w-full px-4 py-3 border border-border bg-gray-50 dark:bg-gray-900 text-foreground/60 rounded-xl cursor-not-allowed"
                        value={session?.user?.email || ""}
                      />
                    </div>

                    <div>
                      <label htmlFor="profile-phone" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-brand" /> Phone Number
                      </label>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
                      <p className="text-sm text-foreground/60">
                        <span className="font-medium text-foreground">Account Status:</span> Active & Verified
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 active:scale-95"
                    >
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
                    </button>
                  </form>
                </>
              )}

              {/* ── Saved Addresses Tab ── */}
              {activeTab === "addresses" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Saved Addresses</h3>
                    <button
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-hover transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> {showAddAddress ? "Cancel" : "Add New"}
                    </button>
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleAddAddress} className="bg-background/60 p-5 rounded-2xl border border-border mb-6 space-y-4">
                      <h4 className="font-bold text-sm text-foreground">Add New Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Label (e.g. Home, Work)"
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm"
                        />
                        <input
                          type="text"
                          required
                          placeholder="ZIP Code"
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                          className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm"
                        />
                        <input
                          type="text"
                          required
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-hover transition-colors"
                      >
                        {addressLoading ? "Saving..." : "Save Address"}
                      </button>
                    </form>
                  )}

                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="p-4 rounded-2xl border border-border bg-background/40 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-brand" /> {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] uppercase font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} {addr.zip}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/50 py-6 text-center">
                      No saved addresses yet. Add one above or during checkout.
                    </p>
                  )}
                </>
              )}

              {/* ── Order History Tab ── */}
              {activeTab === "orders" && (
                <>
                  <h3 className="text-2xl font-bold mb-6">Order History</h3>
                  {ordersLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-5 border border-border rounded-2xl bg-background/40 hover:border-brand/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-foreground">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
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
                            <p className="text-xs text-foreground/60 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-foreground/70 mt-2">
                              {order.items.length} {order.items.length === 1 ? "item" : "items"}:{" "}
                              {order.items.map((i) => i.name).join(", ")}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                            <p className="font-extrabold text-xl text-brand">${order.total.toFixed(2)}</p>
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                            >
                              Track Order <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-border">
                      <ShoppingBag className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                      <p className="font-semibold text-foreground/60 mb-2">No orders placed yet</p>
                      <p className="text-sm text-foreground/40 mb-6">Your completed orders will appear here.</p>
                      <Link href="/menu" className="inline-block bg-brand text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-hover transition-colors">
                        Browse Menu
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ── Favorites Tab ── */}
              {activeTab === "favorites" && (
                <>
                  <h3 className="text-2xl font-bold mb-6">My Favorites</h3>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {favorites.map((item) => (
                        <FoodCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-border">
                      <Heart className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                      <p className="font-semibold text-foreground/60 mb-2">No favorites yet</p>
                      <p className="text-sm text-foreground/40 mb-6">Tap the ♥ on any dish to save it here.</p>
                      <Link href="/menu" className="inline-block bg-brand text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-hover transition-colors">
                        Explore Menu
                      </Link>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
