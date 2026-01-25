"use client";


import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import useProductDetail from "@/lib/useProductDetail";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  _id: string;
  title: string;
  image: string;
  price?: number;
  offPrice?: number;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
  onViewDetails?: (id: string) => void;
}

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

const ProductCard: React.FC<ProductCardProps> = ({
  _id,
  title,
  image,
  price,
  offPrice,
  category,
  isBestSeller,
  isTodayDeal,
  onViewDetails,
}) => {
  const { addToCart } = useCart();
  const { product } = useProductDetail(_id);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [showOptions, setShowOptions] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Memoized stock map for color/size
  const variantStockMap = useMemo(() => buildVariantStockMap(product?.variants), [product?.variants]);
  const colorList = product?.color && product.color.length > 0 ? product.color : (product?.color ? [product.color] : []);
  const sizeList = product?.size && product.size.length > 0 ? product.size : (product?.size ? [product.size] : []);

  // Set default color/size
  useMemo(() => {
    if (colorList.length && !selectedColor) {
      const availableColor = colorList.find(c => sizeList.some(s => variantStockMap[c]?.[s] > 0));
      setSelectedColor(availableColor || colorList[0]);
    }
    if (sizeList.length && !selectedSize && selectedColor) {
      const availableSize = sizeList.find(s => variantStockMap[selectedColor]?.[s] > 0);
      setSelectedSize(availableSize || sizeList[0]);
    }
    // eslint-disable-next-line
  }, [colorList, sizeList, selectedColor, variantStockMap]);

  // Find selected variant
  const selectedVariant = product?.variants && selectedColor && selectedSize
    ? product.variants.find((v: any) => v.color === selectedColor && v.size === selectedSize)
    : undefined;

  // Calculate display price
  const displayPrice = selectedVariant?.priceAdjustment
    ? (product?.price || 0) + selectedVariant.priceAdjustment
    : (product?.price || price || 0);
  const displayOffPrice = product?.offPrice || offPrice;
  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const inStock = displayStock > 0;

  const handleAddToCart = () => {
    if (colorList.length && !selectedColor) {
      setShowOptions(true);
      return;
    }
    if (sizeList.length && !selectedSize) {
      setShowOptions(true);
      return;
    }
    if (!inStock) return;
    addToCart({
      id: _id,
      title: product?.title || title,
      image: product?.image || image,
      price: displayPrice,
      stock: displayStock,
      color: selectedColor,
      size: selectedSize,
      variantId: selectedVariant?._id || undefined,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1200);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="group relative w-[210px] min-w-[210px] rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-2xl"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {image && image !== "" && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isBestSeller && (
            <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[11px] font-bold text-black shadow">★ Best Seller</span>
          )}
          {isTodayDeal && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">Today’s Deal</span>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition"
        >
          <button
            onClick={() => onViewDetails?.(_id)}
            className="rounded-full bg-white/90 p-2 hover:bg-white shadow cursor-pointer"
          >
            <Eye className="h-4 w-4 text-zinc-800 cursor-pointer" />
          </button>
          <button
            onClick={handleAddToCart}
            className="rounded-full bg-blue-600 p-2 hover:bg-blue-700 shadow cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4 text-white cursor-pointer" />
          </button>
        </motion.div>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>
        <p className="text-xs text-zinc-500 capitalize">{category}</p>
        <div className="pt-1">
          {displayOffPrice && displayOffPrice < displayPrice ? (
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-extrabold">{displayOffPrice} ETB</span>
              <span className="text-xs line-through text-zinc-400">{displayPrice} ETB</span>
            </div>
          ) : (
            <span className="font-bold text-zinc-900 dark:text-white">{displayPrice} ETB</span>
          )}
        </div>
        {/* Color/Size selectors if variants exist */}
        {showOptions && (colorList.length > 0 || sizeList.length > 0) && (
          <div className="pt-2 space-y-2">
            {colorList.length > 0 && (
              <div>
                <label className="block text-xs font-medium mb-1">Color:</label>
                <select
                  className="w-full border border-zinc-300 rounded px-2 py-1"
                  value={selectedColor || ""}
                  onChange={e => setSelectedColor(e.target.value)}
                >
                  <option value="">Select color</option>
                  {colorList.map((c: string) => {
                    const hasStock = sizeList.some((s: string) => variantStockMap[c]?.[s] > 0);
                    return (
                      <option key={c} value={c} disabled={!hasStock}>
                        {c} {!hasStock ? '(Out of Stock)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {sizeList.length > 0 && selectedColor && (
              <div>
                <label className="block text-xs font-medium mb-1">Size:</label>
                <select
                  className="w-full border border-zinc-300 rounded px-2 py-1"
                  value={selectedSize || ""}
                  onChange={e => setSelectedSize(e.target.value)}
                >
                  <option value="">Select size</option>
                  {sizeList.map((s: string) => {
                    const hasStock = selectedColor && variantStockMap[selectedColor]?.[s] > 0;
                    return (
                      <option key={s} value={s} disabled={!hasStock}>
                        {s} {!hasStock ? '(Out of Stock)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        )}
        {/* Stock status */}
        {showOptions && (colorList.length > 0 || sizeList.length > 0) && (
          <div className="pt-1 text-xs">
            {inStock ? (
              <span className="text-green-600">In stock: {displayStock}</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        )}
      </div>
      <div className="px-3 pb-3 md:hidden flex flex-col gap-2">
        <button
          onClick={() => onViewDetails?.(_id)}
          className="w-full rounded-lg bg-white border border-zinc-200 text-xs font-semibold py-2 text-blue-700 hover:bg-zinc-100 transition flex items-center justify-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
        <button
          onClick={handleAddToCart}
          className="w-full rounded-lg bg-blue-600 text-white text-xs font-semibold py-2 hover:bg-blue-700 transition"
        >
          Add to Cart
        </button>
      </div>
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          Added to cart!
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;
