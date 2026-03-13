"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
// Fetch reviews for a product
function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError("");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer-reviews/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load reviews");
        setLoading(false);
      });
  }, [productId]);

  return { reviews, loading, error };
}
import Image from "next/image";
import { ShoppingCart, Star, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import useProductDetail from "@/lib/useProductDetail";
import CommentCard from "./CommentCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

/** * TypeScript Interfaces for better maintainability 
 */
interface ProductVariant {
  _id: string;
  color: string;
  size: string;
  stock: number;
  priceAdjustment?: number;
}

interface Product {
  _id: string;
  title: string;
  image: string;
  price: number;
  offPrice?: number;
  description?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  sku?: string;
  category?: string;
  variants?: ProductVariant[];
  color?: string | string[];
  size?: string | string[];
}

/**
 * Helper to build a fast lookup map for variant availability
 */
const buildVariantStockMap = (variants: ProductVariant[] | undefined) => {
  const map: Record<string, Record<string, number>> = {};
  if (!variants) return map;

  variants.forEach((v) => {
    if (!v.color || !v.size) return;
    if (!map[v.color]) map[v.color] = {};
    map[v.color][v.size] = v.stock ?? 0;
  });
  return map;
};

export default function ProductCardDetail({ productId }: { productId: string }) {
  const { reviews, loading: reviewsLoading, error: reviewsError } = useProductReviews(productId);
  const { addToCart } = useCart();
  const { product, loading, error } = useProductDetail(productId) as { 
    product: Product | null, 
    loading: boolean, 
    error: any 
  };

  // --- Component State ---
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  // --- Derived State (Memoized) ---
  const variantStockMap = useMemo(() => buildVariantStockMap(product?.variants), [product?.variants]);

  const colorList = useMemo(() => {
    if (product?.variants?.length) {
      return Array.from(new Set(product.variants.filter(v => v.stock > 0).map(v => v.color)));
    }
    const colorVal = product?.color;
    return Array.isArray(colorVal) ? colorVal : colorVal ? [colorVal] : [];
  }, [product]);

  const sizeList = useMemo(() => {
    if (product?.variants?.length && selectedColor) {
      return Array.from(
        new Set(
          product.variants
            .filter(v => v.color === selectedColor && v.stock > 0)
            .map(v => v.size)
        )
      );
    }
    const sizeVal = product?.size;
    return Array.isArray(sizeVal) ? sizeVal : sizeVal ? [sizeVal] : [];
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    return product?.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
  }, [product, selectedColor, selectedSize]);

  // Pricing & Stock Logic
  const basePrice = product?.price ?? 0;
  const displayPrice = selectedVariant?.priceAdjustment 
    ? basePrice + selectedVariant.priceAdjustment 
    : basePrice;
  
  const offPrice = product?.offPrice;
  const discount = (offPrice && displayPrice < offPrice) 
    ? Math.round(((offPrice - displayPrice) / offPrice) * 100) 
    : null;

  const displayStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);
  const inStock = displayStock > 0;

  // --- Effects ---
  // Initial Selection
  useEffect(() => {
    if (colorList.length && !selectedColor) {
      setSelectedColor(colorList[0]);
    }
  }, [colorList, selectedColor]);

  useEffect(() => {
    if (sizeList.length && (!selectedSize || !sizeList.includes(selectedSize))) {
      setSelectedSize(sizeList[0] || "");
    }
  }, [sizeList, selectedSize]);

  // Reset quantity if it exceeds stock
  useEffect(() => {
    if (quantity > displayStock && displayStock > 0) {
      setQuantity(displayStock);
    } else if (displayStock === 0) {
      setQuantity(1);
    }
  }, [displayStock, quantity]);

  // --- Handlers ---
  const handleQuantity = (dir: 'inc' | 'dec') => {
    setQuantity(prev => {
      if (dir === 'inc' && prev < displayStock) return prev + 1;
      if (dir === 'dec' && prev > 1) return prev - 1;
      return prev;
    });
  };

  const onAddToCart = () => {
    if (!product || !inStock) return;

    addToCart({
      id: product._id,
      title: product.title,
      image: product.image,
      price: displayPrice,
      quantity,
      stock: displayStock,
      color: selectedColor,
      size: selectedSize,
      variantId: selectedVariant?._id,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // --- Render States ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium">Loading Product Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-red-800 dark:text-red-400">Unable to load product</h2>
        <p className="text-red-600 dark:text-red-500 mt-2">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <article className="max-w-6xl mx-auto bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Gallery Section */}
        <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900/50 p-6 flex items-center justify-center relative">
          <div className="relative w-full aspect-square max-w-lg transition-transform hover:scale-105 duration-500">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
          {discount && (
            <div className="absolute top-8 left-8 bg-red-600 text-white font-bold px-4 py-2 rounded-full shadow-lg">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="lg:col-span-5 p-8 lg:p-12 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <span>{product.category}</span>
                <span className="text-zinc-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.floor(product.rating) ? "fill-current" : "text-zinc-300 dark:text-zinc-700"} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="text-sm text-zinc-500">{product.reviewCount} Reviews</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">
                  ETB {displayPrice.toLocaleString()}
                </span>
                {offPrice && displayPrice < offPrice && (
                  <span className="text-xl text-zinc-400 line-through decoration-red-500/50">
                    ETB {offPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-medium">Shipping calculated at checkout</p>
            </div>

            {/* Variant Selectors */}
            <div className="space-y-4 pt-4">
              {colorList.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Color</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorList.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {sizeList.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeList.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-sm font-bold ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inStock ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {inStock ? `${displayStock} Available` : 'Sold Out'}
                </div>
                {inStock && displayStock < 10 && (
                  <span className="text-xs font-bold text-orange-500 animate-pulse">Low Stock!</span>
                )}
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${displayStock < 10 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min((displayStock / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1 border border-zinc-200 dark:border-zinc-800">
                <button 
                  onClick={() => handleQuantity('dec')}
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-30"
                  disabled={quantity <= 1 || !inStock}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => handleQuantity('inc')}
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-30"
                  disabled={quantity >= displayStock || !inStock}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <button
                onClick={onAddToCart}
                disabled={!inStock}
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all active:scale-95 shadow-lg ${
                  inStock 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" 
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart size={22} />
                {inStock ? `Add To Cart` : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Content Section */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Product Overview
            </h3>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Customer Reviews</h3>
            <div className="space-y-4">
              {reviewsLoading && <div>Loading reviews...</div>}
              {reviewsError && <div className="text-red-500">{reviewsError}</div>}
              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <div className="text-zinc-500">No reviews yet.</div>
              )}
              {reviews.map((review) => (
                <div key={review._id} className="flex gap-3 items-center">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    {reviewsLoading ? (
                      <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (
                      <Avatar>
                        {review.userId?.photo ? (
                          <AvatarImage src={review.userId.photo} alt={review.userId?.name || "User"} />
                        ) : null}
                        <AvatarFallback>
                          <User className="w-5 h-5 text-zinc-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {review.userId?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CommentCard
                      rating={review.rating}
                      comment={review.comment}
                      date={review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold">
            <CheckCircle size={20} />
            Successfully added to cart!
          </div>
        </div>
      )}
    </article>
  );
}