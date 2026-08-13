"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { FoodItem } from "@/lib/data";
import ConfirmationModal from "./ConfirmationModal";
import Toast from "./Toast";

export default function AddToCartControls({ item }: { item: FoodItem }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  
  const [modalState, setModalState] = useState<{isOpen: boolean, actionType: 'cart'|'buy'}>({ isOpen: false, actionType: 'cart' });
  const [toastMessage, setToastMessage] = useState("");

  const handleConfirm = (confirmedQty: number) => {
    if (modalState.actionType === 'cart') {
      addItem(item, confirmedQty);
      setToastMessage("Added to cart ✅");
    } else {
      setToastMessage("Redirecting to checkout...");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6 border-t border-border">
        <div className="flex items-center justify-between border border-border bg-card rounded-xl px-4 py-3 sm:w-1/3">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 hover:text-brand transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="font-bold text-lg">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="p-1 hover:text-brand transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <button 
          onClick={() => setModalState({ isOpen: true, actionType: 'cart' })}
          className="flex-1 bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-brand/30 active:scale-95 text-lg"
        >
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </button>

        <button 
          onClick={() => setModalState({ isOpen: true, actionType: 'buy' })}
          className="flex-1 bg-foreground hover:bg-foreground/90 text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-lg"
        >
          <CreditCard className="h-5 w-5" />
          Buy Now
        </button>
      </div>

      <ConfirmationModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleConfirm}
        item={item}
        actionType={modalState.actionType}
        initialQuantity={quantity}
      />
      <Toast 
        isVisible={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </>
  );
}
