import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, Flame, Leaf } from "lucide-react";
import { fetchMealDetails } from "@/lib/api";
import AddToCartControls from "@/components/AddToCartControls";

export default async function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await fetchMealDetails(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/menu" className="inline-flex items-center gap-2 text-foreground/70 hover:text-brand mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Menu</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-lg border border-border">
              <Image 
                src={item.image} 
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-semibold mb-3">
                  {item.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{item.name}</h1>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-brand block">${item.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{item.rating}</span>
                <span className="text-foreground/60 text-sm">({item.reviews} reviews)</span>
              </div>
              
              <div className="flex items-center gap-1 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                <Clock className="h-4 w-4 text-brand" />
                <span className="font-medium text-sm">20-30 min</span>
              </div>

              {item.spiceLevel > 0 && (
                <div className="flex items-center gap-1 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm text-red-500">Spicy</span>
                </div>
              )}

              {item.dietary.includes('Veg') && (
                <div className="flex items-center gap-1 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm text-green-500">Vegetarian</span>
                </div>
              )}
            </div>

            <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
              {item.description}
            </p>

            {/* Ingredients */}
            {item.ingredients.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient, index) => (
                    <span key={index} className="bg-gray-100 dark:bg-gray-800 text-foreground px-3 py-1 rounded-md text-sm">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition */}
            <div className="mb-10 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Nutritional Info</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <span className="block text-foreground/60 text-xs uppercase tracking-wider mb-1">Calories</span>
                  <span className="font-bold">{item.nutritionalInfo.calories}</span>
                </div>
                <div>
                  <span className="block text-foreground/60 text-xs uppercase tracking-wider mb-1">Protein</span>
                  <span className="font-bold">{item.nutritionalInfo.protein}</span>
                </div>
                <div>
                  <span className="block text-foreground/60 text-xs uppercase tracking-wider mb-1">Carbs</span>
                  <span className="font-bold">{item.nutritionalInfo.carbs}</span>
                </div>
                <div>
                  <span className="block text-foreground/60 text-xs uppercase tracking-wider mb-1">Fat</span>
                  <span className="font-bold">{item.nutritionalInfo.fat}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <AddToCartControls item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
