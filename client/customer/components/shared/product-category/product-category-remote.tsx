"use client";

import { useLanguage } from "@/context/LanguageContext";
import HomeProductGrid from "./product-category-grid";
import { useCategoryProducts } from "@/lib/useCategoryProducts";
import { translations } from "@/i18n";

const CATEGORY_ORDER = ["coffee", "electronics", "handcraft", "home-goods"];

export default function HomeCategorySection() {
  const { language } = useLanguage();
  const t = translations[language];

  const { products, loading, error } =
    useCategoryProducts(CATEGORY_ORDER);

  if (loading) {
    return (
      <HomeProductGrid
        title={t.featuredCategories || "Featured Categories"}
        subtitle={t.localFavorites || "Local favorites and trending items"}
        products={[null, null, null, null]}
      />
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-medium">
        Failed to load products. Please try again later.
      </div>
    );
  }

  if (!products.some(Boolean)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products available at the moment.
      </div>
    );
  }

  return (
    <HomeProductGrid
      title={t.featuredCategories || "Featured Categories"}
      subtitle={t.localFavorites || "Local favorites and trending items"}
      products={products.map((p, idx) =>
        p
          ? {
              image: p.image,
              title:
                t.productCategories?.[CATEGORY_ORDER[idx] as keyof typeof t.productCategories] ||
                p.title,
              badge:
                t.productCategories?.[CATEGORY_ORDER[idx] as keyof typeof t.productCategories] ||
                p.category,
            }
          : null
      )}
      viewAllUrl="/products"
    />
  );
}
