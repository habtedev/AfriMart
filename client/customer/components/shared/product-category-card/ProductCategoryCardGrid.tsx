"use client";

import { useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Eye, ShoppingCart, ArrowUpRight } from "lucide-react";

export interface ProductCategory {
  _id: string;
  title: string;
  image: string;
  category: string;
}

interface ProductCategoryCardGridProps {
  categories: ProductCategory[];
}

export default function ProductCategoryCardGrid({
  categories,
}: ProductCategoryCardGridProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleCategoryClick = useCallback(
    (category: string) => {
      router.push(`/products?category=${encodeURIComponent(category)}`);
    },
    [router]
  );

  return (
    <section className="py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <Card
            key={cat._id}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border-none
              bg-zinc-50
              dark:bg-zinc-900/60
              transition-all
              duration-500
              hover:shadow-2xl
            "
          >
            {/* Image */}
            <div
              className="relative aspect-[4/5] cursor-pointer overflow-hidden"
              onClick={() => handleCategoryClick(cat.category)}
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority={false}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70" />

              {/* Floating Actions */}
              <div
                className="absolute bottom-4 left-4 right-4 flex gap-3"
              >
                <Button
                  size="sm"
                  className="flex-1 gap-2 rounded-full bg-white/90 text-zinc-900 backdrop-blur hover:bg-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/products/${cat._id}`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-[1.03] transition cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      id: cat._id,
                      title: cat.title,
                      image: cat.image,
                      price: 0,
                      quantity: 1,
                    });
                  }}
                >
                  <ShoppingCart className="h-4 w-4 cursor-pointer" />
                  Add
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider"
                >
                  {cat.category}
                </Badge>

                <button
                  onClick={() => handleCategoryClick(cat.category)}
                  className="text-zinc-400 hover:text-primary transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>

              <h3
                onClick={() => handleCategoryClick(cat.category)}
                className="
                  text-lg
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                  cursor-pointer
                  hover:underline
                  underline-offset-4
                "
              >
                {cat.title}
              </h3>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
