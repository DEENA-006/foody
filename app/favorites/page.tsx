"use client";

import { useEffect, useState, useMemo } from "react";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FoodCard from "@/components/FoodCard";
import { useFavoriteStore, useCartStore } from "@/lib/store";
import Toast from "@/components/Toast";

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  const favorites = useFavoriteStore((state) => state.favorites);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute unique categories from favorites
  const categories = useMemo(() => {
    const cats = Array.from(new Set(favorites.map((f) => f.category)));
    return ["All", ...cats];
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (activeCategory === "All") return favorites;
    return favorites.filter((f) => f.category === activeCategory);
  }, [favorites, activeCategory]);

  const handleAddAllToCart = () => {
    if (filteredFavorites.length === 0) return;
    filteredFavorites.forEach((item) => {
      addItem(item, 1);
    });
    setToastMessage(`Added all ${filteredFavorites.length} favorites to your cart! 🛒`);
  };

  if (!mounted) return null;

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

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-1.5 flex items-center gap-3">
              <Heart className="w-9 h-9 text-brand fill-brand" />
              My Favorites
            </h1>
            <p className="text-foreground/60 text-sm">
              {favorites.length} saved {favorites.length === 1 ? "dish" : "dishes"} for quick reordering
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={handleAddAllToCart}
                className="bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-brand/20 transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" /> Add All to Cart
              </button>
            </div>
          )}
        </div>

        {/* Category Filters (when more than 1 category) */}
        {categories.length > 2 && (
          <div className="flex overflow-x-auto pb-4 mb-8 gap-2 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-brand text-white shadow-sm"
                    : "bg-card border border-border text-foreground/70 hover:border-brand/40"
                }`}
              >
                {cat} {cat !== "All" && `(${favorites.filter((f) => f.category === cat).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Grid Display */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredFavorites.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border p-8">
            <h3 className="text-xl font-bold mb-2">No favorites in this category</h3>
            <p className="text-foreground/60 text-sm mb-6">
              You don't have any saved dishes under "{activeCategory}".
            </p>
            <button
              onClick={() => setActiveCategory("All")}
              className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold text-xs"
            >
              View All Favorites
            </button>
          </div>
        ) : (
          /* Complete Empty State */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mb-6 text-brand">
              <Heart className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No favorites saved yet</h2>
            <p className="text-foreground/60 mb-8 max-w-sm text-sm">
              Tap the <Heart className="w-4 h-4 inline text-red-500 mx-1" /> heart icon on any dish to save it here for fast ordering.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand/20 active:scale-95"
            >
              Explore Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
