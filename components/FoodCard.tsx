"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, CreditCard, Heart } from 'lucide-react';
import { FoodItem } from '@/lib/data';
import { useCartStore, useFavoriteStore } from '@/lib/store';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';
import { useRouter } from 'next/navigation';

export default function FoodCard({ item }: { item: FoodItem }) {
  const addItem = useCartStore((state) => state.addItem);
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const [modalState, setModalState] = useState<{isOpen: boolean, actionType: 'cart'|'buy'}>({ isOpen: false, actionType: 'cart' });
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  const handleConfirm = (confirmedQty: number) => {
    if (modalState.actionType === 'cart') {
      addItem(item, confirmedQty);
      setToastMessage("Added to cart ✅");
    } else {
      // Buy Now: add to cart then navigate to cart
      addItem(item, confirmedQty);
      router.push('/cart');
    }
  };

  const toggleFavorite = () => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <Link href={`/menu/${item.id}`} className="relative h-56 w-full overflow-hidden block">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-border/50">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-foreground">{item.rating}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(); }}
          className="absolute top-3 left-3 text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/30"
          aria-label={isFavorite(item.id) ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
        >
          {isFavorite(item.id) ? <Heart className="h-4 w-4 fill-current" /> : <Heart className="h-4 w-4" />}
        </button>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/menu/${item.id}`}>
            <h3 className="font-bold text-lg leading-tight hover:text-brand transition-colors line-clamp-1">{item.name}</h3>
          </Link>
          <span className="font-bold text-brand text-lg ml-2">${item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-sm text-foreground/60 line-clamp-2 mb-4 flex-grow">
          {item.description}
        </p>
        
        <div className="flex gap-2 mt-auto pt-4 border-t border-border">
          <button 
            className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
            onClick={(e) => {
              e.preventDefault();
              setModalState({ isOpen: true, actionType: 'cart' });
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">Add to Cart</span>
          </button>
          
          <button 
            className="flex-1 bg-foreground hover:bg-foreground/90 text-background py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
            onClick={(e) => {
              e.preventDefault();
              setModalState({ isOpen: true, actionType: 'buy' });
            }}
          >
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">Buy Now</span>
          </button>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleConfirm}
        item={item}
        actionType={modalState.actionType}
        initialQuantity={1}
      />
      <Toast 
        isVisible={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
