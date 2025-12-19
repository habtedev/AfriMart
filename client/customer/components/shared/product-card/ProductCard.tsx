"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  _id: string;
  title: string;
  image: string;
  price?: number;
  offPrice?: number;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
  onAddToCart?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  _id,
  title,
  image,
  price,
  offPrice,
  category,
  isBestSeller,
  isTodayDeal,
  onAddToCart,
  onViewDetails,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="
        group relative w-[210px] min-w-[210px]
        rounded-2xl overflow-hidden
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-800
        shadow-md hover:shadow-2xl
      "
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="
            object-cover
            transition-transform duration-700
            group-hover:scale-110
          "
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isBestSeller && (
            <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[11px] font-bold text-black shadow">
              ★ Best Seller
            </span>
          )}
          {isTodayDeal && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
              Today’s Deal
            </span>
          )}
        </div>

        {/* Hover actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2
            flex gap-2
            opacity-0 group-hover:opacity-100
            transition
          "
        >
          <button

            onClick={() => onViewDetails?.(_id)}
            className="
              rounded-full bg-white/90 p-2
              hover:bg-white shadow
              cursor-pointer
            "
          >
            <Eye className="h-4 w-4 text-zinc-800 cursor-pointer" />
          </button>

          <button
            onClick={() => onAddToCart?.(_id)}
            className="
              rounded-full bg-blue-600 p-2
              hover:bg-blue-700 shadow
              cursor-pointer
            "
          >
            <ShoppingCart className="h-4 w-4 text-white cursor-pointer" />
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">
          {title}
        </h3>

        <p className="text-xs text-zinc-500 capitalize">
          {category}
        </p>

        {/* Price */}
        <div className="pt-1">
          {offPrice ? (
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-extrabold">
                {offPrice} ETB
              </span>
              <span className="text-xs line-through text-zinc-400">
                {price} ETB
              </span>
            </div>
          ) : (
            <span className="font-bold text-zinc-900 dark:text-white">
              {price} ETB
            </span>
          )}
        </div>
      </div>

      {/* Bottom CTAs (always visible on mobile) */}
      <div className="px-3 pb-3 md:hidden flex flex-col gap-2">
        <button
          onClick={() => onViewDetails?.(_id)}
          className="w-full rounded-lg bg-white border border-zinc-200 text-xs font-semibold py-2 text-blue-700 hover:bg-zinc-100 transition flex items-center justify-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
        <button
          onClick={() => onAddToCart?.(_id)}
          className="w-full rounded-lg bg-blue-600 text-white text-xs font-semibold py-2 hover:bg-blue-700 transition"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
