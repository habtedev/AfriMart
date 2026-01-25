"use client";

import React from "react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Star, Truck, Shield } from "lucide-react";
import useProductDetail from "@/lib/useProductDetail";

// Helper: Build a map for quick stock lookup
const buildVariantStockMap = (variants: any[] | undefined) => {
  if (!variants) return {};
  const map: Record<string, Record<string, number>> = {};
  for (const v of variants) {
    if (!v.color || !v.size) continue;
    if (!map[v.color]) map[v.color] = {};
    map[v.color][v.size] = typeof v.stock === 'number' ? v.stock : 0;
  }
  return map;
};

export default function ProductCardDetail({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const { product, loading, error } = useProductDetail(productId);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<any>(undefined);

  // Calculate discount percentage if offPrice is present and greater than displayPrice
  let discount: number | null = null;
  // displayPrice is defined below, so we need to calculate after it is defined


  // Memoized stock map for color/size
  const variantStockMap = useMemo(() => buildVariantStockMap(product?.variants), [product?.variants]);

  // Fallback: treat single color/size as array
  // Only show colors and sizes that exist in variants and have stock > 0
  const colorList = product?.variants
    ? Array.from(new Set(product.variants.filter(v => v.color && v.size && v.stock > 0).map(v => v.color)))
    : (product?.color && product.color.length > 0 ? product.color : (product?.color ? [product.color] : []));

  const sizeList = product?.variants && selectedColor
    ? Array.from(new Set(product.variants.filter(v => v.color === selectedColor && v.size && v.stock > 0).map(v => v.size)))
    : (product?.size && product.size.length > 0 ? product.size : (product?.size ? [product.size] : []));

  // Initialize color and size selections
  useEffect(() => {
    if (colorList.length && !selectedColor) {
      // Find first available color with stock
      const availableColor = colorList.find(c => 
        sizeList.some(s => variantStockMap[c]?.[s] > 0)
      );
      setSelectedColor(availableColor || colorList[0]);
    }
    if (sizeList.length && !selectedSize && selectedColor) {
      // Find first available size for selected color
      const availableSize = sizeList.find(s => variantStockMap[selectedColor]?.[s] > 0);
      setSelectedSize(availableSize || sizeList[0]);
    }
  }, [colorList, sizeList, selectedColor, variantStockMap]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (product?.variants && selectedColor && selectedSize) {
      const found = product.variants.find(
        (v: any) => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariant(found);
    } else {
      setSelectedVariant(undefined);
    }
  }, [product, selectedColor, selectedSize]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error || !product) return <div className="text-red-600 text-center p-8">Failed to load product details.</div>;

  const {
    title,
    image,
    price = 0,
    offPrice,
    description,
    stock = 0,
    rating = 4.5,
    reviewCount = 0,
    sku,
    category,
    color,
    size,
  } = product;

  // Calculate display price with variant adjustment
  const displayPrice = selectedVariant?.priceAdjustment
    ? price + selectedVariant.priceAdjustment
    : price;
  if (offPrice && displayPrice < offPrice) {
    discount = Math.round(((offPrice - displayPrice) / offPrice) * 100);
  }

  // Determine display stock
  const displayStock = selectedColor && selectedSize && selectedVariant
    ? selectedVariant.stock ?? 0
    : stock;

  // In stock status
  const inStock = displayStock > 0;

  // Handle quantity change
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase" && quantity < displayStock) {
      setQuantity(quantity + 1);
    }
    if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) return;

    addToCart({
      id: product._id,
      title,
      image,
      price: displayPrice,
      quantity,
      stock: displayStock,
      color: selectedColor,
      size: selectedSize,
      variantId: selectedVariant?._id || undefined,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <article className="max-w-4xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8">
        {/* IMAGE */}
        <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {image && image !== "" && (
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        {/* DETAILS */}
        <div className="space-y-6">
          {/* CATEGORY & SKU */}
          <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
            {category && (
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                {category}
              </span>
            )}
            {sku && <span>SKU: {sku}</span>}
          </div>

          {/* TITLE */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>

          {/* COLOR SELECT */}
          {/* COLOR SELECT */}
          {colorList.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium">Color:</span>
              <select
                className="w-full max-w-xs border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                value={selectedColor || ""}
                onChange={e => setSelectedColor(e.target.value)}
              >
                <option value="">Select color</option>
                {colorList.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* SIZE SELECT */}
          {sizeList.length > 0 && selectedColor && (
            <div className="space-y-2">
              <span className="font-medium">Size:</span>
              <select
                className="w-full max-w-xs border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                value={selectedSize || ""}
                onChange={e => setSelectedSize(e.target.value)}
              >
                <option value="">Select size</option>
                {sizeList.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* RATING */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={`${i < Math.floor(rating) 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-zinc-300 dark:text-zinc-700"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-zinc-500">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>

          {/* PRICE */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                ETB {displayPrice.toLocaleString()}
              </span>
              {offPrice && displayPrice < offPrice && (
                <>
                  <span className="text-lg line-through text-zinc-400">
                    ETB {offPrice.toLocaleString()}
                  </span>
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-zinc-500">Inclusive of all taxes</p>
          </div>

          {/* STOCK STATUS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${
                inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  inStock ? "bg-green-500" : "bg-red-500"
                }`} />
                {inStock
                  ? `${displayStock} in stock${selectedColor && selectedSize 
                      ? ` for ${selectedColor} / ${selectedSize}` 
                      : ''}`
                  : "Out of stock"}
              </span>
              {inStock && displayStock < 10 && (
                <span className="text-sm text-orange-600 font-medium">
                  Only {displayStock} left!
                </span>
              )}
            </div>
            {inStock && (
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((displayStock / 50) * 100, 100)}%` }} 
                />
              </div>
            )}
          </div>

          {/* OUT OF STOCK WARNING */}
          {selectedColor && selectedSize && !inStock && (
            <div className="text-red-600 text-sm font-semibold p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              Selected color/size is out of stock.
            </div>
          )}

          {/* QUANTITY SELECTOR */}
          {inStock && (
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
                  <span className="px-6 py-2 border-x border-zinc-300 dark:border-zinc-700 min-w-[3ch] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange("increase")} 
                    disabled={quantity >= displayStock}
                    className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-zinc-500">
                  Max: {displayStock}
                </span>
              </div>

              {/* ADD TO CART BUTTON */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              >
                <ShoppingCart size={22} />
                {inStock ? `Add to Cart • ETB ${(displayPrice * quantity).toLocaleString()}` : "Out of Stock"}
              </button>
            </div>
          )}

          {/* DESCRIPTION */}
          {description && (
            <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {description}
              </p>
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

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          Added to cart!
        </div>
      )}
    </article>
  );
}