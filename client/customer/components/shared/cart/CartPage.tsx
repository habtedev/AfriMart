"use client";


import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const router = useRouter();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (typeof item.stock === 'number' && newQty > item.stock) return;
    updateCartItemQuantity(id, newQty);
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary cursor-pointer" />
          Shopping Cart
        </h1>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 text-zinc-500"
        >
          <ShoppingCart className="mx-auto mb-4 h-14 w-14 text-zinc-400" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm mt-1">Add products to see them here</p>
        </motion.div>
      ) : (
        <>
          {/* CART ITEMS */}
          <ul className="space-y-5">
            <AnimatePresence>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
                >
                  {/* IMAGE */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg line-clamp-2">
                      {item.title}
                    </h2>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-primary hover:text-white transition font-bold cursor-pointer"
                      >
                        −
                      </button>

                      <span className="min-w-[32px] text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-primary hover:text-white transition font-bold cursor-pointer"
                        disabled={typeof item.stock === 'number' && item.quantity >= item.stock}
                        title={typeof item.stock === 'number' && item.quantity >= item.stock ? 'No more stock available' : ''}
                      >
                        +
                      </button>
                    </div>

                    <p className="mt-2 font-bold text-primary">
                      ETB {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-bold text-primary">
                      ETB {(item.price * item.quantity).toLocaleString()}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* DESKTOP SUMMARY */}
          <div className="hidden md:flex mt-10 items-center justify-between p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <span className="text-xl font-bold">
              Total: ETB {total.toLocaleString()}
            </span>

            <button
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:scale-[1.04] transition"
              onClick={() => router.push("/shopping/address")}
            >
              Proceed to Checkout
            </button>
          </div>

          {/* MOBILE STICKY CHECKOUT */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-lg font-bold">
                ETB {total.toLocaleString()}
              </p>
            </div>

            <button
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg"
              onClick={() => router.push("/shopping/address")}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </section>
  );
}
