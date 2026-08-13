"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, Settings, Heart, ShoppingBag } from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { useFavoriteStore } from "@/lib/store";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const favorites = useFavoriteStore((state) => state.favorites);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-10">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 text-center border-b border-border">
                <div className="w-20 h-20 bg-brand/20 text-brand rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <h2 className="font-bold text-lg">{session?.user?.name}</h2>
                <p className="text-sm text-foreground/60">{session?.user?.email}</p>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === "profile" ? "bg-brand/10 text-brand" : "text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <Settings className="w-5 h-5" /> Profile Settings
                </button>
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === "orders" ? "bg-brand/10 text-brand" : "text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <ShoppingBag className="w-5 h-5" /> Order History
                </button>
                <button 
                  onClick={() => setActiveTab("favorites")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === "favorites" ? "bg-brand/10 text-brand" : "text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <Heart className="w-5 h-5" /> Favorites
                </button>
                <button 
                  onClick={() => signOut()}
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
              {activeTab === "profile" && (
                <>
                  <h3 className="text-2xl font-bold mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-4 py-3 border border-border bg-gray-50 dark:bg-gray-900 text-foreground rounded-xl"
                        value={session?.user?.name || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <input
                        type="email"
                        disabled
                        className="w-full px-4 py-3 border border-border bg-gray-50 dark:bg-gray-900 text-foreground rounded-xl"
                        value={session?.user?.email || ""}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "orders" && (
                <>
                  <h3 className="text-2xl font-bold mb-6">Order History</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-xl flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <div>
                        <p className="font-bold">Order #10293</p>
                        <p className="text-sm text-foreground/70">Placed on Oct 12, 2026</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">$45.99</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Delivered</span>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-xl flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <div>
                        <p className="font-bold">Order #10284</p>
                        <p className="text-sm text-foreground/70">Placed on Sep 28, 2026</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">$32.50</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Delivered</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

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
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border">
                      <Heart className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
                      <p className="text-foreground/70">You haven't saved any favorites yet.</p>
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
