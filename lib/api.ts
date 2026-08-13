import { FoodItem } from './data';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function fetchCategories() {
  try {
    const res = await fetch(`${BASE_URL}/categories.php`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.categories.map((c: any) => ({
      id: c.idCategory,
      name: c.strCategory,
      icon: c.strCategoryThumb,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [
      { id: "1", name: "Beef", icon: "https://www.themealdb.com/images/category/beef.png" },
      { id: "2", name: "Chicken", icon: "https://www.themealdb.com/images/category/chicken.png" },
      { id: "3", name: "Dessert", icon: "https://www.themealdb.com/images/category/dessert.png" },
      { id: "8", name: "Seafood", icon: "https://www.themealdb.com/images/category/seafood.png" },
      { id: "14", name: "Vegan", icon: "https://www.themealdb.com/images/category/vegan.png" }
    ];
  }
}

export async function fetchMealsByCategory(category: string): Promise<FoodItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/filter.php?c=${category}`, { next: { revalidate: 3600 } });
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
  } catch (error) {
    console.error(`Failed to fetch meals for category ${category}:`, error);
    return [
      {
        id: Math.floor(Math.random() * 100000),
        name: `Delicious ${category} Special`,
        category: category,
        price: 12.99,
        rating: "4.5",
        reviews: 120,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
        description: 'A delicious meal from our kitchen (fallback data).',
        ingredients: [],
        nutritionalInfo: { calories: 500, protein: '20g', carbs: '50g', fat: '15g' },
        spiceLevel: 0,
        dietary: []
      }
    ];
  }
}

export async function fetchAllMeals(): Promise<FoodItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/search.php?s=`, { next: { revalidate: 3600 } });
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
  } catch (error) {
    console.error("Failed to fetch all meals:", error);
    return [
      {
        id: 1,
        name: "Chef's Special",
        category: "Various",
        price: 15.99,
        rating: "4.8",
        reviews: 300,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
        description: "A signature dish crafted by our executive chef.",
        ingredients: [],
        nutritionalInfo: { calories: 600, protein: '25g', carbs: '45g', fat: '20g' },
        spiceLevel: 1,
        dietary: []
      }
    ];
  }
}

export async function fetchMealDetails(id: string): Promise<FoodItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`, { next: { revalidate: 3600 } });
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
      rating: "4.8",
      reviews: 124,
      image: meal.strMealThumb,
      description: meal.strInstructions.slice(0, 250) + '...',
      ingredients: ingredients,
      nutritionalInfo: { calories: 600, protein: '30g', carbs: '40g', fat: '20g' },
      spiceLevel: 0,
      dietary: []
    };
  } catch (error) {
    console.error(`Failed to fetch meal details for ${id}:`, error);
    return {
      id: parseInt(id),
      name: "Delicious Meal",
      category: "Various",
      price: 12.99,
      rating: "4.8",
      reviews: 124,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
      description: "A delightful dish prepared just for you.",
      ingredients: ["Fresh ingredients"],
      nutritionalInfo: { calories: 600, protein: '30g', carbs: '40g', fat: '20g' },
      spiceLevel: 0,
      dietary: []
    };
  }
}
