"use client";


import { useCart } from "@/context/CartContext";
import CartPage from "@/components/shared/cart/CartPage";

export default function CartRoute() {
  const { items } = useCart();
  // Use items.length as key to force re-mount on cart clear
  return <CartPage key={items.length} />;
}
