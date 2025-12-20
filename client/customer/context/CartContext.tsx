"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "stock"> & { quantity?: number; stock: number }) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};


export function CartProvider({ children }: { children: ReactNode }) {
    const updateCartItemQuantity = (id: string, quantity: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      );
    };
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("afrimart_cart");
    if (stored) setItems(JSON.parse(stored));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("afrimart_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity" | "stock"> & { quantity?: number; stock: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const addQty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      if (existing) {
        // Do not allow adding more than stock
        const newQty = Math.min(existing.quantity + addQty, item.stock);
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQty, stock: item.stock } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(addQty, item.stock), stock: item.stock }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const getItemCount = () => items.reduce((sum, i) => sum + i.quantity, 0);

  if (!isLoaded) return null;
  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, getItemCount, updateCartItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
