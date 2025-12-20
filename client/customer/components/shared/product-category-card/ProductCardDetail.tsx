"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Heart, Star, Share2, Truck, Shield } from "lucide-react";

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
  onWishlistToggle?: () => void;
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
  onWishlistToggle,
  variant = "default",
}: ProductCardDetailProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const inStock = stock > 0;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.();
  };

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase" && quantity < stock) {
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You can add a toast notification here
    }
  };

  if (variant === "compact") {
    return (
      <article className="max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4">
        <div className="flex gap-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 128px) 100vw, 128px"
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg line-clamp-2">{title}</h2>
              <button
                onClick={handleWishlistToggle}
                className="text-zinc-400 hover:text-red-500 transition-colors"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-blue-600">
                ETB {typeof price === "number" ? price.toLocaleString() : "N/A"}
              </p>
              {typeof originalPrice === "number" && (
                <p className="text-sm text-zinc-500 line-through">
                  ETB {originalPrice.toLocaleString()}
                </p>
              )}
            </div>
            
            <button
              disabled={!inStock}
              onClick={onAddToCart}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="max-w-4xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleWishlistToggle}
              className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                isWishlisted
                  ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-red-500 hover:text-red-500"
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              {isWishlisted ? "Saved" : "Save for later"}
            </button>
            
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          {/* Category & SKU */}
          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            {category && (
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                {category}
              </span>
            )}
            {sku && <span>SKU: {sku}</span>}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-zinc-300 dark:text-zinc-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-sm text-zinc-500">
                ({reviewCount} reviews)
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-blue-600">
                ETB {typeof price === "number" ? price.toLocaleString() : "N/A"}
              </p>
              {typeof originalPrice === "number" && (
                <>
                  <p className="text-xl text-zinc-500 line-through">
                    ETB {originalPrice.toLocaleString()}
                  </p>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-zinc-500">Inclusive of all taxes</p>
          </div>

          {/* Stock Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${
                  inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    inStock ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {inStock ? `${stock} items in stock` : "Out of stock"}
              </span>
              
              {inStock && stock < 10 && (
                <span className="text-sm text-orange-600 font-medium">
                  Only {stock} left!
                </span>
              )}
            </div>
            
            {inStock && (
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stock / 50) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  disabled={quantity <= 1}
                  className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="px-6 py-2 border-x border-zinc-300 dark:border-zinc-700">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  disabled={quantity >= stock}
                  className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              disabled={!inStock}
              onClick={() => {
                  addToCart({
                    id: sku || title,
                    title,
                    image,
                    price: typeof price === "number" ? price : 0,
                    quantity,
                    stock,
                  });
                setShowToast(true);
                setTimeout(() => setShowToast(false), 1800);
              }}
              className="w-full py-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 group"
            >
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              Add to Cart • ETB {typeof price === "number" ? (price * quantity).toLocaleString() : "N/A"}
            </button>
            {showToast && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
                Added to cart!
              </div>
            )}

            {/* Buy Now Button */}
            <button
              disabled={!inStock}
              className="w-full py-4 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Buy Now
            </button>
          </div>

          {/* Features */}
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