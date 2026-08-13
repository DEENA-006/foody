export const categories = [
  { id: 1, name: 'Pizza', icon: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80' },
  { id: 2, name: 'Burgers', icon: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' },
  { id: 3, name: 'Desserts', icon: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&q=80' },
  { id: 4, name: 'Drinks', icon: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80' },
  { id: 5, name: 'Salads', icon: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80' },
];

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  spiceLevel: number;
  dietary: string[];
}

export const foodItems: FoodItem[] = [
  {
    id: 1,
    name: 'Spicy Pepperoni Pizza',
    category: 'Pizza',
    price: 14.99,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
    description: 'Classic pepperoni pizza with a spicy kick, mozzarella cheese, and our signature tomato sauce.',
    ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce', 'Chili Flakes', 'Oregano'],
    nutritionalInfo: { calories: 850, protein: '34g', carbs: '92g', fat: '38g' },
    spiceLevel: 2,
    dietary: ['Non-Veg']
  },
  {
    id: 2,
    name: 'Classic Cheeseburger',
    category: 'Burgers',
    price: 9.99,
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    description: 'Juicy beef patty with melted cheddar cheese, crisp lettuce, tomato, and special sauce on a toasted brioche bun.',
    ingredients: ['Beef Patty', 'Cheddar Cheese', 'Lettuce', 'Tomato', 'Brioche Bun'],
    nutritionalInfo: { calories: 650, protein: '30g', carbs: '45g', fat: '35g' },
    spiceLevel: 0,
    dietary: ['Non-Veg']
  },
  {
    id: 3,
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 12.99,
    rating: 4.9,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=800&auto=format&fit=crop',
    description: 'Traditional Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella, and basil.',
    ingredients: ['San Marzano Tomatoes', 'Fresh Mozzarella', 'Fresh Basil', 'Olive Oil'],
    nutritionalInfo: { calories: 700, protein: '28g', carbs: '88g', fat: '26g' },
    spiceLevel: 0,
    dietary: ['Veg']
  },
  {
    id: 4,
    name: 'Double Smash Burger',
    category: 'Burgers',
    price: 12.49,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=800&auto=format&fit=crop',
    description: 'Two smashed beef patties, caramelized onions, double American cheese, and house sauce.',
    ingredients: ['Beef Patties', 'American Cheese', 'Caramelized Onions', 'House Sauce'],
    nutritionalInfo: { calories: 820, protein: '42g', carbs: '40g', fat: '52g' },
    spiceLevel: 0,
    dietary: ['Non-Veg']
  },
  {
    id: 5,
    name: 'Chocolate Lava Cake',
    category: 'Desserts',
    price: 6.99,
    rating: 4.9,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop',
    description: 'Decadent chocolate cake with a molten chocolate center, served with vanilla bean ice cream.',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Vanilla Ice Cream'],
    nutritionalInfo: { calories: 540, protein: '8g', carbs: '62g', fat: '32g' },
    spiceLevel: 0,
    dietary: ['Veg']
  },
  {
    id: 6,
    name: 'Mango Smoothie',
    category: 'Drinks',
    price: 4.99,
    rating: 4.5,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=800&auto=format&fit=crop',
    description: 'Refreshing tropical smoothie made with ripe mangoes, Greek yogurt, and a touch of honey.',
    ingredients: ['Mango', 'Greek Yogurt', 'Honey', 'Milk'],
    nutritionalInfo: { calories: 210, protein: '6g', carbs: '42g', fat: '2g' },
    spiceLevel: 0,
    dietary: ['Veg', 'Gluten-Free']
  }
];

export const reviews = [
  { id: 1, user: 'Sarah M.', rating: 5, comment: 'The best pizza I\'ve had in a long time! Fast delivery and arrived piping hot.' },
  { id: 2, user: 'John D.', rating: 4, comment: 'Burgers are amazing, but the fries could be crispier. Overall great experience.' },
  { id: 3, user: 'Emily R.', rating: 5, comment: 'Obsessed with the chocolate lava cake. A must-try!' }
];
