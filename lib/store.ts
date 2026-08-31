import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FoodItem } from './data';

interface CartItem extends FoodItem {
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (item: FoodItem, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },
      
      clearCart: () => set({ items: [], appliedCoupon: null }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getDiscountAmount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        const subtotal = get().getTotalPrice();
        return Math.round(((subtotal * coupon.discountPercent) / 100) * 100) / 100;
      },
    }),
    {
      name: 'foodiee-cart-storage',
    }
  )
);

interface FavoriteState {
  favorites: FoodItem[];
  addFavorite: (item: FoodItem) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => {
        set((state) => {
          if (!state.favorites.find((i) => i.id === item.id)) {
            return { favorites: [...state.favorites, item] };
          }
          return state;
        });
      },
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((i) => i.id !== id),
        }));
      },
      isFavorite: (id) => {
        return get().favorites.some((i) => i.id === id);
      },
    }),
    {
      name: 'foodiee-favorites-storage',
    }
  )
);
