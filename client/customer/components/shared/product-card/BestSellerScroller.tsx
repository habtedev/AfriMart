"use client";

import React from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/shared/product-card/ProductCard";
import useBestSellers from "@/lib/useBestSellers";

export default function BestSellerScroller() {
  const { products, loading, error } = useBestSellers();

  if (loading) return <div className="py-8 text-center">Loading best sellers...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  // Only include products with sold > 0, sorted descending, limit 20
  const filtered = [...products]
    .filter((p) => typeof p.sold === 'number' && p.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 20);

  if (!filtered.length) return <div className="py-8 text-center text-zinc-400">No best sellers found.</div>;

  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Best Sellers
        </h2>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex gap-5 overflow-x-auto pb-5 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300"
      >
        {filtered.map((product) => (
          <motion.div
            key={product._id}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="snap-start cursor-pointer"
          >
            <ProductCard {...product} />
            <div className="mt-2 text-xs text-center text-blue-600 font-semibold">
              Sold: {product.sold}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
