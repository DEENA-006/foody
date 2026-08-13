import { FoodItem } from './data';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/categories.php`);
  const data = await res.json();
  return data.categories.map((c: any) => ({
    id: c.idCategory,
    name: c.strCategory,
    icon: c.strCategoryThumb,
  }));
}

export async function fetchMealsByCategory(category: string): Promise<FoodItem[]> {
  const res = await fetch(`${BASE_URL}/filter.php?c=${category}`);
  const data = await res.json();
  
  if (!data.meals) return [];
  
  return data.meals.map((meal: any) => ({
    id: parseInt(meal.idMeal),
    name: meal.strMeal,
    category: category,
    price: (Math.random() * 15 + 5), // Mock price since API doesn't have it
    rating: (Math.random() * 1 + 4).toFixed(1), // Mock rating 4.0 - 5.0
    reviews: Math.floor(Math.random() * 200 + 50),
    image: meal.strMealThumb,
    description: 'A delicious meal from our kitchen.',
    ingredients: [],
    nutritionalInfo: { calories: 500, protein: '20g', carbs: '50g', fat: '15g' },
    spiceLevel: 0,
    dietary: []
  }));
}

export async function fetchAllMeals(): Promise<FoodItem[]> {
  const res = await fetch(`${BASE_URL}/search.php?s=`);
  const data = await res.json();
  
  if (!data.meals) return [];
  
  return data.meals.map((meal: any) => ({
    id: parseInt(meal.idMeal),
    name: meal.strMeal,
    category: meal.strCategory || 'Various',
    price: (Math.random() * 15 + 5), // Mock price
    rating: (Math.random() * 1 + 4).toFixed(1), // Mock rating 4.0 - 5.0
    reviews: Math.floor(Math.random() * 200 + 50),
    image: meal.strMealThumb,
    description: meal.strInstructions ? meal.strInstructions.slice(0, 100) + '...' : 'A delicious meal from our kitchen.',
    ingredients: [],
    nutritionalInfo: { calories: 500, protein: '20g', carbs: '50g', fat: '15g' },
    spiceLevel: 0,
    dietary: []
  }));
}

export async function fetchMealDetails(id: string): Promise<FoodItem | null> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await res.json();
  
  if (!data.meals) return null;
  
  const meal = data.meals[0];
  const ingredients = [];
  
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
      ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);
    }
  }
  
  return {
    id: parseInt(meal.idMeal),
    name: meal.strMeal,
    category: meal.strCategory,
    price: 12.99, // Static mock price
    rating: 4.8,
    reviews: 124,
    image: meal.strMealThumb,
    description: meal.strInstructions.slice(0, 250) + '...',
    ingredients: ingredients,
    nutritionalInfo: { calories: 600, protein: '30g', carbs: '40g', fat: '20g' },
    spiceLevel: 0,
    dietary: []
  };
}
