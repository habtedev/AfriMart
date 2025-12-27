"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useState as useReactState } from "react";
import { ShoppingCart, Star, Truck, Shield } from "lucide-react";

export interface ProductCardDetailProps {
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  description?: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  category?: string;
  onAddToCart?: () => void;
  variant?: "default" | "compact";
}

export default function ProductCardDetail({
  title,
  image,
  price,
  originalPrice,
  description,
  stock,
  rating = 4.5,
  reviewCount = 0,
  sku,
  category,
  onAddToCart,
  variant = "default",
}: ProductCardDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useReactState(false);
  // Accept _id as prop for correct cart logic
  // @ts-ignore
  const _id = (typeof window !== 'undefined' && window.__PRODUCT_ID__) || undefined;
  // Accept _id as prop for correct cart logic
  // @ts-ignore
  const _id = (typeof window !== 'undefined' && window.__PRODUCT_ID__) || undefined;
  const inStock = stock > 0;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase" && quantity < stock) setQuantity(quantity + 1);
    if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <article className="max-w-4xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8">
        {/* IMAGE */}
        <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain p-4"
            priority
          />
        </div>

        {/* DETAILS */}
        <div className="space-y-5">
          {/* CATEGORY & SKU */}
          <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
            {category && <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">{category}</span>}
            {sku && <span>SKU: {sku}</span>}
          </div>

          {/* TITLE */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>

          {/* RATING */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-300 dark:text-zinc-700"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-zinc-500">{rating} ({reviewCount})</span>
          </div>

          {/* PRICE */}
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">
              {typeof price === "number" ? `${price.toLocaleString()} ETB` : "-"}
            </span>
            {originalPrice && (
              <span className="text-lg line-through text-zinc-400">{originalPrice.toLocaleString()} ETB</span>
            )}
            {discount > 0 && (
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">-{discount}%</span>
            )}
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="flex items-center gap-2 mt-4">
            <span className="font-medium">Quantity:</span>
            <button
              className="px-2 py-1 text-lg font-bold text-zinc-700 hover:text-primary cursor-pointer border rounded-full"
              onClick={() => handleQuantityChange("decrease")}
              disabled={quantity <= 1}
            >-</button>
            <span className="min-w-[2ch] text-center font-semibold text-zinc-900">{quantity}</span>
            <button
              className="px-2 py-1 text-lg font-bold text-zinc-700 hover:text-primary cursor-pointer border rounded-full"
              onClick={() => handleQuantityChange("increase")}
              disabled={quantity >= stock}
            >+</button>
            <span className="ml-2 text-xs text-zinc-500">({stock} in stock)</span>
          </div>

          {/* ADD TO CART BUTTON */}
          <div className="mt-6">
            <button
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:scale-[1.03] transition cursor-pointer"
              disabled={!inStock}
              onClick={() => {
                addToCart({
                  id: _id || sku || title,
                  _id: _id || sku || title,
                  title,
                  image,
                  price,
                  quantity,
                  stock,
                });
                setShowToast(true);
                setTimeout(() => setShowToast(false), 1500);
              }}
            >
              <ShoppingCart className="h-5 w-5 cursor-pointer" />
              Add to Cart
            </button>
            {showToast && (
              <div className="mt-2 text-center text-green-600 font-semibold">Added to cart!</div>
            )}
          </div>

          {/* PRICE */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                ETB {typeof price === "number" ? price.toLocaleString() : "N/A"}
              </p>
              {originalPrice && (
                <>
                  <p className="text-lg sm:text-xl text-zinc-500 line-through">ETB {originalPrice.toLocaleString()}</p>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded">-{discount}%</span>
                </>
              )}
            </div>
            <p className="text-sm text-zinc-500">Inclusive of all taxes</p>
          </div>

          {/* STOCK */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                {inStock ? `${stock} in stock` : "Out of stock"}
              </span>
              {inStock && stock < 10 && <span className="text-sm text-orange-600 font-medium">Only {stock} left!</span>}
            </div>
            {inStock && (
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((stock / 50) * 100, 100)}%` }} />
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
            </div>
          )}

          {/* QUANTITY & ADD TO CART */}
          {inStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg">
                  <button onClick={() => handleQuantityChange("decrease")} disabled={quantity <= 1} className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed">−</button>
                  <span className="px-6 py-2 border-x border-zinc-300 dark:border-zinc-700">{quantity}</span>
                  <button onClick={() => handleQuantityChange("increase")} disabled={quantity >= stock} className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart({
                    id: sku || title,
                    title,
                    image,
                    price,
                    quantity,
                    stock,
                  });
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 1800);
                }}
                className="w-full py-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center justify-center gap-3 cursor-pointer transition"
              >
                <ShoppingCart size={22} />
                Add to Cart • ETB {(price * quantity).toLocaleString()}
              </button>

              {showToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
                  Added to cart!
                </div>
              )}

              <button className="w-full py-4 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer">
                Buy Now
              </button>
            </div>
          )}

          {/* FEATURES */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-blue-500" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm text-zinc-500">On orders over ETB 10,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-green-500" />
              <div>
                <p className="font-medium">Warranty</p>
                <p className="text-sm text-zinc-500">1 year manufacturer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
