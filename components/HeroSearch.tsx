"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function HeroSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-lg mx-auto bg-white dark:bg-card p-2 rounded-full shadow-2xl relative">
      <div className="pl-4">
        <Search className="text-gray-400 h-5 w-5" />
      </div>
      <input 
        type="text" 
        placeholder="Search for food..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow bg-transparent border-none focus:ring-0 px-4 py-3 text-black dark:text-white outline-none"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm("")}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button 
        type="submit"
        className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-bold transition-colors"
      >
        Search
      </button>
    </form>
  );
}
