"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { ChevronRight } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  image: string;
  price?: number;
  offPrice?: number;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
}

const fetchProducts = async (): Promise<Product[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  const res = await fetch(`${baseUrl}/product-cards`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
};

/* ---------------------------------- */
/* Section Wrapper */
/* ---------------------------------- */
function ProductSection({
  title,
  products,
  onAddToCart,
  onViewDetails,
}: {
  title: string;
  products: Product[];
  onAddToCart: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  if (!products.length) return null;

  return (
    <section className="mt-14">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>

        <button
          className="
            flex items-center gap-1
            text-sm font-medium
            text-blue-600
            cursor-pointer
            hover:gap-2
            hover:text-blue-700
            transition-all
          "
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Horizontal Scroll */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="
          relative
          flex gap-5
          overflow-x-auto
          pb-5
          scroll-smooth
          snap-x snap-mandatory
          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-zinc-300
        "
      >
        {products.map((product) => (
          <motion.div
            key={product._id}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="snap-start cursor-pointer"
          >
            <ProductCard
              {...product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ---------------------------------- */
/* Main Component */
/* ---------------------------------- */

export default function ProductCardByCategory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (id: string) => {
    const product = products.find((p) => p._id === id);
    if (product) {
      addToCart({
        id: product._id,
        title: product.title,
        image: product.image,
        price: product.offPrice || product.price || 0,
      });
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/products/${id}`);
  };

  /* Loading Skeleton */
  if (loading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 w-48 rounded-lg bg-zinc-200 mb-5 animate-pulse" />
            <div className="flex gap-5">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="
                    h-[300px] w-[220px]
                    rounded-2xl
                    bg-zinc-200
                    animate-pulse
                  "
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <ProductSection
        title="🔥 Best Sellers"
        products={products.filter((p) => p.isBestSeller)}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />

      <ProductSection
        title="⏰ Today’s Deals"
        products={products.filter((p) => p.isTodayDeal)}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />

      <ProductSection
        title="☕ Coffees"
        products={products.filter((p) => p.category === "coffees")}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />

      <ProductSection
        title="🍔 Food"
        products={products.filter((p) => p.category === "food")}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
