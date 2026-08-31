import { FoodItem } from './data';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/** Deterministic price seeded by meal id — stable across reloads */
export function seededPrice(id: number): number {
  const hash = ((id * 2654435761) >>> 0) % 1000;
  return Math.round((hash / 1000) * 15 * 100 + 5 * 100) / 100; // $5.00 – $20.00
}

/** Deterministic rating seeded by meal id — stable across reloads */
export function seededRating(id: number): number {
  const hash = ((id * 40503) >>> 0) % 100;
  return Math.round((hash / 100 * 1 + 4) * 10) / 10; // 4.0 – 5.0
}

/** Deterministic dietary badges & nutrition derived from category & id */
function getDietaryInfo(category: string, id: number): { dietary: string[]; spiceLevel: number; nutrition: { calories: number; protein: string; carbs: string; fat: string } } {
  const cat = category.toLowerCase();
  const dietary: string[] = [];

  if (cat.includes('vegan')) {
    dietary.push('Vegan', 'Plant-Based', 'Dairy-Free');
  } else if (cat.includes('vegetarian')) {
    dietary.push('Vegetarian', 'Plant-Based');
  } else if (cat.includes('seafood')) {
    dietary.push('Seafood', 'High-Protein', 'Pescatarian');
  } else if (cat.includes('chicken') || cat.includes('beef') || cat.includes('lamb') || cat.includes('pork')) {
    dietary.push('High-Protein');
    if (id % 2 === 0) dietary.push('Chef Special');
  } else if (cat.includes('dessert')) {
    dietary.push('Sweet Tooth');
  } else if (cat.includes('pasta')) {
    dietary.push('Comfort Food', 'Italian');
  }

  if (id % 3 === 0 && !dietary.includes('Dairy-Free')) dietary.push('Gluten-Free');
  if (id % 5 === 0) dietary.push('Organic');

  // Spice level 0 to 3
  let spiceLevel = 0;
  if (!cat.includes('dessert')) {
    spiceLevel = (id % 4); // 0, 1, 2, or 3
  }

  // Nutrition
  const baseCalories = cat.includes('dessert') ? 450 : cat.includes('vegan') ? 380 : cat.includes('beef') ? 680 : 520;
  const calories = baseCalories + ((id % 20) * 10);
  const protein = cat.includes('beef') || cat.includes('chicken') || cat.includes('seafood') ? `${28 + (id % 12)}g` : `${12 + (id % 8)}g`;
  const carbs = cat.includes('pasta') || cat.includes('dessert') ? `${55 + (id % 20)}g` : `${35 + (id % 15)}g`;
  const fat = cat.includes('dessert') || cat.includes('beef') ? `${18 + (id % 8)}g` : `${10 + (id % 6)}g`;

  return {
    dietary,
    spiceLevel,
    nutrition: { calories, protein, carbs, fat },
  };
}

/** Shared mapper: raw TheMealDB meal object → FoodItem */
function mapMeal(meal: any, category?: string): FoodItem {
  const id = parseInt(meal.idMeal);
  const cat = category || meal.strCategory || 'Various';
  const { dietary, spiceLevel, nutrition } = getDietaryInfo(cat, id);

  return {
    id,
    name: meal.strMeal,
    category: cat,
    price: seededPrice(id),
    rating: seededRating(id),
    reviews: ((id * 1664525 + 1013904223) >>> 0) % 200 + 50,
    image: meal.strMealThumb,
    description: meal.strInstructions
      ? meal.strInstructions.slice(0, 140) + '...'
      : `Delicious ${meal.strMeal} prepared fresh in our kitchen.`,
    ingredients: [],
    nutritionalInfo: nutrition,
    spiceLevel,
    dietary,
  };
}

// In-memory cache for fast responsive menu & search
let cachedAllMeals: FoodItem[] | null = null;
let cachedCategories: any[] | null = null;

export async function fetchCategories(): Promise<any[]> {
  if (cachedCategories) return cachedCategories;
  try {
    const res = await fetch(`${BASE_URL}/categories.php`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const mapped = data.categories.map((c: any) => ({
      id: c.idCategory,
      name: c.strCategory,
      icon: c.strCategoryThumb,
    }));
    cachedCategories = mapped;
    return mapped;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [
      { id: '1', name: 'Beef', icon: 'https://www.themealdb.com/images/category/beef.png' },
      { id: '2', name: 'Chicken', icon: 'https://www.themealdb.com/images/category/chicken.png' },
      { id: '3', name: 'Dessert', icon: 'https://www.themealdb.com/images/category/dessert.png' },
      { id: '8', name: 'Seafood', icon: 'https://www.themealdb.com/images/category/seafood.png' },
      { id: '14', name: 'Vegan', icon: 'https://www.themealdb.com/images/category/vegan.png' },
    ];
  }
}

export async function fetchMealsByCategory(category: string): Promise<FoodItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/filter.php?c=${category}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (!data.meals) return [];
    return data.meals.map((meal: any) => mapMeal(meal, category));
  } catch (error) {
    console.error(`Failed to fetch meals for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch ALL meals by loading every category in parallel and caching the result.
 */
export async function fetchAllMeals(): Promise<FoodItem[]> {
  if (cachedAllMeals && cachedAllMeals.length > 0) {
    return cachedAllMeals;
  }

  try {
    const catRes = await fetch(`${BASE_URL}/categories.php`, { next: { revalidate: 3600 } });
    const catData = await catRes.json();
    const categoryNames: string[] = catData.categories.map((c: any) => c.strCategory);

    const results = await Promise.allSettled(
      categoryNames.map((name) =>
        fetch(`${BASE_URL}/filter.php?c=${name}`, { next: { revalidate: 3600 } })
          .then((r) => r.json())
          .then((d) => (d.meals ? d.meals.map((m: any) => mapMeal(m, name)) : []))
      )
    );

    const seen = new Set<number>();
    const all: FoodItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            all.push(item);
          }
        }
      }
    }
    cachedAllMeals = all;
    return all;
  } catch (error) {
    console.error('Failed to fetch all meals:', error);
    return [];
  }
}

/**
 * Universal high-accuracy search:
 * Searches across the entire meal database matching dish name, category, description, and dietary tags.
 */
export async function searchMeals(query: string): Promise<FoodItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return fetchAllMeals();

  const allMeals = await fetchAllMeals();
  const searchTokens = cleanQuery.split(/\s+/).filter(Boolean);

  // Match all tokens or substring
  const localMatches = allMeals.filter((meal) => {
    const name = meal.name.toLowerCase();
    const cat = meal.category.toLowerCase();
    const desc = (meal.description || '').toLowerCase();
    const dietary = meal.dietary.map((d) => d.toLowerCase()).join(' ');

    const combinedText = `${name} ${cat} ${desc} ${dietary}`;
    return searchTokens.every((token) => combinedText.includes(token));
  });

  if (localMatches.length > 0) {
    return localMatches;
  }

  // Also query TheMealDB endpoint if no local match found
  try {
    const res = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(cleanQuery)}`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      return data.meals.map((m: any) => mapMeal(m));
    }
  } catch (err) {
    console.warn('TheMealDB fallback search failed:', err);
  }

  return [];
}

export async function fetchMealDetails(id: string): Promise<FoodItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (!data.meals) return null;

    const meal = data.meals[0];
    const ingredients: string[] = [];

    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
        const measure = meal[`strMeasure${i}`]?.trim();
        const ingredientName = meal[`strIngredient${i}`].trim();
        ingredients.push(measure ? `${measure} ${ingredientName}` : ingredientName);
      }
    }

    const mealId = parseInt(meal.idMeal);
    const cat = meal.strCategory || 'Various';
    const { dietary, spiceLevel, nutrition } = getDietaryInfo(cat, mealId);

    return {
      id: mealId,
      name: meal.strMeal,
      category: cat,
      price: seededPrice(mealId),
      rating: seededRating(mealId),
      reviews: ((mealId * 1664525 + 1013904223) >>> 0) % 200 + 50,
      image: meal.strMealThumb,
      description: meal.strInstructions || 'A delightful dish prepared fresh in our kitchen.',
      ingredients,
      nutritionalInfo: nutrition,
      spiceLevel,
      dietary,
    };
  } catch (error) {
    console.error(`Failed to fetch meal details for ${id}:`, error);
    return null;
  }
}

/**
 * Fetch related / similar meals within the same category
 */
export async function fetchRelatedMeals(category: string, excludeId: number, limit = 4): Promise<FoodItem[]> {
  try {
    const meals = await fetchMealsByCategory(category);
    return meals.filter((m) => m.id !== excludeId).slice(0, limit);
  } catch {
    return [];
  }
}
