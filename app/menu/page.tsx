"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { FoodItem } from "@/lib/data";
import { fetchCategories, fetchMealsByCategory, fetchAllMeals } from "@/lib/api";

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search')) {
      setSearchQuery(params.get('search') || '');
      setActiveCategory('All');
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      const cats = await fetchCategories();
      const allCategory = { id: 'all', name: 'All', icon: '' };
      setCategories([allCategory, ...cats.slice(0, 8)]); // prepend All
      
      const params = new URLSearchParams(window.location.search);
      if (!params.has('search') && !activeCategory) {
        setActiveCategory("All");
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadMeals() {
      if (!activeCategory) return;
      setLoading(true);
      let meals;
      if (activeCategory === 'All') {
        meals = await fetchAllMeals();
      } else {
        meals = await fetchMealsByCategory(activeCategory);
      }
      setFoodItems(meals);
      setLoading(false);
    }
    loadMeals();
  }, [activeCategory]);

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
            <p className="text-foreground/70">Discover our delicious offerings</p>
          </div>
          
          <div className="w-full md:w-96 flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search food..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-card border border-border p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <SlidersHorizontal className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-3 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 ${
                activeCategory === category.name 
                  ? "bg-brand text-white" 
                  : "bg-card border border-border hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <img src={category.icon} alt={category.name} className="w-6 h-6 rounded-full object-cover" /> 
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border mt-8">
            <h3 className="text-2xl font-bold mb-2">not tasted</h3>
            <p className="text-foreground/70 mb-6">We couldn't find anything matching "{searchQuery}" in {activeCategory}</p>
            <button 
              onClick={() => {
                setSearchQuery("");
              }}
              className="bg-brand text-white px-6 py-2 rounded-full font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
