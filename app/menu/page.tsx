"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Loader2,
  UtensilsCrossed,
  X,
  Leaf,
  DollarSign,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { FoodItem } from "@/lib/data";
import { fetchCategories, fetchMealsByCategory, fetchAllMeals, searchMeals } from "@/lib/api";

const dietaryOptions = [
  { id: "all", label: "All Diets", icon: "🍽️" },
  { id: "veg", label: "Vegetarian / Vegan", icon: "🌱", filterFn: (item: FoodItem) => item.dietary.some((d) => d.includes("Veg")) },
  { id: "protein", label: "High-Protein", icon: "🥩", filterFn: (item: FoodItem) => item.dietary.some((d) => d.includes("Protein")) },
  { id: "gluten", label: "Gluten-Free", icon: "🌾", filterFn: (item: FoodItem) => item.dietary.some((d) => d.includes("Gluten")) },
  { id: "seafood", label: "Seafood Catch", icon: "🦐", filterFn: (item: FoodItem) => item.dietary.some((d) => d.includes("Seafood")) },
  { id: "organic", label: "Organic Earth", icon: "✨", filterFn: (item: FoodItem) => item.dietary.some((d) => d.includes("Organic")) },
];

const priceOptions = [
  { id: "all", label: "Any Budget", min: 0, max: 999 },
  { id: "under10", label: "Under $10", min: 0, max: 9.99 },
  { id: "10to15", label: "$10 – $15", min: 10, max: 15 },
  { id: "over15", label: "$15 & Above", min: 15.01, max: 999 },
];

const ITEMS_PER_PAGE = 16;

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDiet, setActiveDiet] = useState("all");
  const [activePrice, setActivePrice] = useState("all");
  const [sortOption, setSortOption] = useState<"price_asc" | "price_desc" | "rating" | "reviews">("price_asc");

  const [categories, setCategories] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Sync from URL params on mount / URL changes
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const diet = searchParams.get("diet");
    const price = searchParams.get("price");
    const sort = searchParams.get("sort");

    if (search) {
      setSearchQuery(search);
      setDebouncedQuery(search);
    }
    if (category) setActiveCategory(category);
    if (diet) setActiveDiet(diet);
    if (price) setActivePrice(price);
    if (sort) setSortOption(sort as any);
  }, [searchParams]);

  // Debounce search query input (300ms for snappy responsiveness)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(ITEMS_PER_PAGE);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Load category list
  useEffect(() => {
    async function loadCategories() {
      const cats = await fetchCategories();
      setCategories([{ id: "all", name: "All", icon: "" }, ...cats]);
    }
    loadCategories();
  }, []);

  // Fetch meals when category or debounced query changes
  useEffect(() => {
    let cancelled = false;

    async function loadMeals() {
      setLoading(true);
      let meals: FoodItem[] = [];

      if (debouncedQuery.trim()) {
        // Universal search across all items
        const searched = await searchMeals(debouncedQuery);

        // If user is inside a specific category, try filtering by that category first
        if (activeCategory !== "All") {
          const inCategory = searched.filter(
            (m) => m.category.toLowerCase() === activeCategory.toLowerCase()
          );
          // If category filter yields results, use them; otherwise show all matching dishes across entire menu
          meals = inCategory.length > 0 ? inCategory : searched;
        } else {
          meals = searched;
        }
      } else if (activeCategory === "All") {
        meals = await fetchAllMeals();
      } else {
        meals = await fetchMealsByCategory(activeCategory);
      }

      if (!cancelled) {
        setFoodItems(meals);
        setVisibleCount(ITEMS_PER_PAGE);
        setLoading(false);
      }
    }

    loadMeals();
    return () => { cancelled = true; };
  }, [debouncedQuery, activeCategory]);

  // Filter and sort items in memory
  const processedItems = useMemo(() => {
    let result = [...foodItems];

    // Dietary filter
    if (activeDiet !== "all") {
      const selectedDiet = dietaryOptions.find((d) => d.id === activeDiet);
      if (selectedDiet?.filterFn) {
        result = result.filter(selectedDiet.filterFn);
      }
    }

    // Price filter
    if (activePrice !== "all") {
      const selectedPrice = priceOptions.find((p) => p.id === activePrice);
      if (selectedPrice) {
        result = result.filter((m) => m.price >= selectedPrice.min && m.price <= selectedPrice.max);
      }
    }

    // Sort
    return result.sort((a, b) => {
      if (sortOption === "price_asc") return a.price - b.price;
      if (sortOption === "price_desc") return b.price - a.price;
      if (sortOption === "reviews") return b.reviews - a.reviews;
      return b.rating - a.rating;
    });
  }, [foodItems, activeDiet, activePrice, sortOption]);

  const displayedItems = processedItems.slice(0, visibleCount);
  const hasMore = visibleCount < processedItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleCategoryClick = (name: string) => {
    setActiveCategory(name);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setActiveCategory("All");
    setActiveDiet("all");
    setActivePrice("all");
    setSortOption("price_asc");
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const activeFilterCount =
    (debouncedQuery ? 1 : 0) +
    (activeCategory !== "All" ? 1 : 0) +
    (activeDiet !== "all" ? 1 : 0) +
    (activePrice !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="btn-back inline-flex"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20 mb-2.5" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              <Sparkles className="w-3.5 h-3.5" /> Chef&apos;s Daily Curations
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight" style={{fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic"}}>
              Explore <span className="text-brand" style={{fontStyle: "normal"}}>Our</span> Menu
            </h1>
            <p className="text-foreground/60 text-xs sm:text-sm mt-2" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              {loading
                ? "Preparing our menu catalog..."
                : `Showing ${displayedItems.length} of ${processedItems.length} delicious ${processedItems.length === 1 ? "dish" : "dishes"}${
                    debouncedQuery ? ` for "${debouncedQuery}"` : ""
                  }`}
            </p>
          </div>

          {/* Search Box & Sort Selection */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search input */}
            <div className="relative flex-grow sm:w-80">
              <Search className="h-4 w-4 text-foreground/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dishes, ingredients..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-border bg-card text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm shadow-2xs transition-all"
                style={{fontFamily: "'Playfair Display', Georgia, serif"}}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full sm:w-auto bg-card border border-border px-4 py-3 rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer shadow-2xs"
                style={{fontFamily: "'Playfair Display', Georgia, serif"}}
              >
                <option value="price_asc">Price: Low to High ↑</option>
                <option value="price_desc">Price: High to Low ↓</option>
                <option value="rating">Top Rated ★</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Carousel Pills */}
        <div className="flex overflow-x-auto pb-3 mb-6 gap-2.5 hide-scrollbar items-center">
          {categories.map((category) => {
            const isSelected = activeCategory === category.name;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex-shrink-0 h-10 whitespace-nowrap px-4 rounded-full transition-all flex items-center justify-center gap-2.5 shadow-2xs ${
                  isSelected
                    ? "bg-gradient-to-r from-brand to-orange-500 text-white shadow-md shadow-brand/25 ring-2 ring-brand/20 scale-[1.02]"
                    : "bg-card border border-border/80 hover:bg-brand/10 hover:text-brand hover:border-brand/40 text-foreground/85"
                }`}
              >
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-80">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
                </span>
                <span style={{fontFamily: "'Playfair Display', Georgia, serif"}} className="text-[13px] font-semibold italic tracking-wide">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* ── Refined Artisanal Filter Hub ── */}
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-3xl p-5 sm:p-6 mb-10 shadow-2xs space-y-4">
          
          {/* Row 1: Dietary Preferences */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-7 h-7 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <Leaf className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-foreground/80 italic" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
                Dietary Choices
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {dietaryOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setActiveDiet(opt.id); setVisibleCount(ITEMS_PER_PAGE); }}
                  style={{fontFamily: "'Playfair Display', Georgia, serif"}}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                    activeDiet === opt.id
                      ? "bg-brand text-white shadow-sm ring-2 ring-brand/30 font-semibold"
                      : "bg-background border border-border text-foreground/75 hover:border-brand/40 hover:text-foreground hover:bg-brand/5"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Row 2: Price Range & Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-7 h-7 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-foreground/80 italic" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
                Budget Range
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {priceOptions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setActivePrice(p.id); setVisibleCount(ITEMS_PER_PAGE); }}
                  style={{fontFamily: "'Playfair Display', Georgia, serif"}}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activePrice === p.id
                      ? "bg-foreground text-background shadow-sm ring-2 ring-foreground/20 font-semibold"
                      : "bg-background border border-border text-foreground/75 hover:border-brand/40 hover:text-foreground hover:bg-brand/5"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  style={{fontFamily: "'Playfair Display', Georgia, serif"}}
                  className="text-xs text-brand hover:text-brand-hover font-semibold px-3 py-1.5 rounded-full bg-brand/10 hover:bg-brand/20 transition-colors flex items-center gap-1.5 flex-shrink-0 ml-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Menu Grid / Loading / Empty State */}
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
            <p className="text-foreground/60 text-sm italic" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              {debouncedQuery ? `Searching for "${debouncedQuery}"...` : "Loading dishes..."}
            </p>
          </div>
        ) : displayedItems.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination & Load More */}
            {hasMore && (
              <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-3">
                <p className="text-xs text-foreground/50 italic" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
                  Showing {displayedItems.length} of {processedItems.length} dishes
                </p>
                
                {/* Progress bar */}
                <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-300"
                    style={{ width: `${(displayedItems.length / processedItems.length) * 100}%` }}
                  />
                </div>

                <button
                  onClick={handleLoadMore}
                  style={{fontFamily: "'Playfair Display', Georgia, serif"}}
                  className="bg-card hover:bg-background border border-border text-foreground font-bold px-8 py-3.5 rounded-2xl text-sm shadow-sm transition-all hover:border-brand hover:text-brand active:scale-95 flex items-center gap-2 italic"
                >
                  Load More Dishes ({processedItems.length - displayedItems.length} remaining)
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-border mt-6 p-8">
            <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-brand" />
            </div>
            <h3 className="text-2xl font-bold mb-2 italic" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>No matching dishes found</h3>
            <p className="text-foreground/70 mb-6 max-w-md mx-auto text-sm" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              {debouncedQuery
                ? `We couldn&apos;t find any dishes matching "${debouncedQuery}" with current filters.`
                : "No dishes match your selected filters. Try changing or resetting them."}
            </p>
            <button
              onClick={clearAllFilters}
              style={{fontFamily: "'Playfair Display', Georgia, serif"}}
              className="bg-brand text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 active:scale-95 italic"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
