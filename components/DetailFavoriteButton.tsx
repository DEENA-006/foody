"use client";

import { Heart } from "lucide-react";
import { FoodItem } from "@/lib/data";
import { useFavoriteStore } from "@/lib/store";

export default function DetailFavoriteButton({ item }: { item: FoodItem }) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const favorited = isFavorite(item.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorited) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-md ${
        favorited
          ? "bg-red-500 text-white border-red-500 scale-110"
          : "bg-background/80 text-foreground hover:text-red-500 border-border hover:scale-105"
      }`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-5 h-5 ${favorited ? "fill-white" : ""}`} />
    </button>
  );
}
