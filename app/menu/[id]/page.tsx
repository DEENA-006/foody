import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Clock,
  Flame,
  Leaf,
  Sparkles,
  ShieldCheck,
  ChefHat,
  Utensils,
  Share2,
} from "lucide-react";
import { fetchMealDetails, fetchRelatedMeals } from "@/lib/api";
import AddToCartControls from "@/components/AddToCartControls";
import FoodCard from "@/components/FoodCard";
import DetailFavoriteButton from "@/components/DetailFavoriteButton";
import FoodReviewSection from "@/components/FoodReviewSection";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchMealDetails(id);

  if (!item) {
    return {
      title: "Dish Not Found",
    };
  }

  return {
    title: `${item.name} - $${item.price.toFixed(2)}`,
    description: item.description,
    openGraph: {
      title: `${item.name} | Fresh from Foodiee`,
      description: item.description,
      images: [{ url: item.image, alt: item.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} - $${item.price.toFixed(2)}`,
      description: item.description,
      images: [item.image],
    },
  };
}

export default async function FoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await fetchMealDetails(id);

  if (!item) {
    notFound();
  }

  const relatedMeals = await fetchRelatedMeals(item.category, item.id, 4);

  const getSpiceText = (level: number) => {
    switch (level) {
      case 1:
        return "Mild Spice";
      case 2:
        return "Medium Spice";
      case 3:
        return "Hot & Spicy 🔥";
      default:
        return "Non-Spicy";
    }
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-brand font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Menu</span>
          </Link>

          <div className="text-xs text-foreground/50 hidden sm:flex items-center gap-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/menu" className="hover:underline">Menu</Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-xs">{item.name}</span>
          </div>
        </div>

        {/* Main Product Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Left Column: Meal Showcase Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative h-[420px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-xl border border-border bg-card">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority
              />
              
              {/* Floating Category Pill */}
              <span className="absolute top-5 left-5 bg-background/90 backdrop-blur-md text-brand font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-border shadow-sm">
                {item.category}
              </span>

              {/* Floating Favorite Action */}
              <div className="absolute top-5 right-5">
                <DetailFavoriteButton item={item} />
              </div>
            </div>

            {/* Quick Feature Badges below image */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border p-3.5 rounded-2xl text-center shadow-sm">
                <Clock className="w-5 h-5 text-brand mx-auto mb-1" />
                <span className="text-xs font-bold block text-foreground">20-30 Min</span>
                <span className="text-[10px] text-foreground/60">Prep & Cook</span>
              </div>
              <div className="bg-card border border-border p-3.5 rounded-2xl text-center shadow-sm">
                <ChefHat className="w-5 h-5 text-brand mx-auto mb-1" />
                <span className="text-xs font-bold block text-foreground">Fresh Made</span>
                <span className="text-[10px] text-foreground/60">Cooked to Order</span>
              </div>
              <div className="bg-card border border-border p-3.5 rounded-2xl text-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-brand mx-auto mb-1" />
                <span className="text-xs font-bold block text-foreground">100% Quality</span>
                <span className="text-[10px] text-foreground/60">Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Meal Details & Purchase */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Title & Price */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                    {item.name}
                  </h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-3xl sm:text-4xl font-black text-brand">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ratings & Highlights */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 bg-card border border-border px-3.5 py-1.5 rounded-full shadow-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm">{item.rating}</span>
                  <span className="text-foreground/60 text-xs">({item.reviews} reviews)</span>
                </div>

                {/* Spice Indicator */}
                {item.spiceLevel > 0 && (
                  <div className="flex items-center gap-1.5 bg-card border border-border px-3.5 py-1.5 rounded-full shadow-sm text-red-500 text-xs font-bold">
                    <Flame className="h-4 w-4" />
                    <span>{getSpiceText(item.spiceLevel)}</span>
                  </div>
                )}

                {/* Dietary Tags */}
                {item.dietary.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-base text-foreground/80 mb-8 leading-relaxed">
                {item.description}
              </p>

              {/* Nutritional Macro Cards */}
              <div className="mb-8 bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand" /> Nutrition Facts (Per Serving)
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-background/80 p-3 rounded-2xl border border-border">
                    <span className="block text-foreground/50 text-[11px] uppercase font-bold mb-1">Calories</span>
                    <span className="font-extrabold text-base text-foreground">{item.nutritionalInfo.calories}</span>
                  </div>
                  <div className="bg-background/80 p-3 rounded-2xl border border-border">
                    <span className="block text-foreground/50 text-[11px] uppercase font-bold mb-1">Protein</span>
                    <span className="font-extrabold text-base text-foreground">{item.nutritionalInfo.protein}</span>
                  </div>
                  <div className="bg-background/80 p-3 rounded-2xl border border-border">
                    <span className="block text-foreground/50 text-[11px] uppercase font-bold mb-1">Carbs</span>
                    <span className="font-extrabold text-base text-foreground">{item.nutritionalInfo.carbs}</span>
                  </div>
                  <div className="bg-background/80 p-3 rounded-2xl border border-border">
                    <span className="block text-foreground/50 text-[11px] uppercase font-bold mb-1">Fat</span>
                    <span className="font-extrabold text-base text-foreground">{item.nutritionalInfo.fat}</span>
                  </div>
                </div>
              </div>

              {/* Ingredients Pill Grid */}
              {item.ingredients.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70 mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-brand" /> Key Ingredients ({item.ingredients.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-card border border-border text-foreground px-3.5 py-1.5 rounded-xl text-xs font-medium shadow-2xs hover:border-brand/30 transition-colors"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Add To Cart Controls */}
            <div className="pt-4 border-t border-border">
              <AddToCartControls item={item} />
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <FoodReviewSection
          foodId={item.id}
          foodName={item.name}
          initialRating={item.rating}
          initialReviewsCount={item.reviews}
        />

        {/* Related / Similar Dishes Section */}
        {relatedMeals.length > 0 && (
          <div className="border-t border-border pt-16 mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">You Might Also Like</h2>
                <p className="text-foreground/60 text-sm mt-1">
                  More delicious options from the <span className="font-bold text-brand">{item.category}</span> category
                </p>
              </div>
              <Link
                href={`/menu?category=${encodeURIComponent(item.category)}`}
                className="text-brand font-bold text-sm hover:underline"
              >
                View all in {item.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedMeals.map((relatedItem) => (
                <FoodCard key={relatedItem.id} item={relatedItem} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
