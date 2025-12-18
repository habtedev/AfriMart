"use client";

import Link from "next/link";
import HomeProductCard, { HomeProductCardProps } from "./product-category";

interface HomeProductGridProps {
  title: string;
  subtitle?: string;
  products: (HomeProductCardProps | null)[];
  viewAllUrl?: string;
}

export default function HomeProductGrid({
  title,
  subtitle,
  products,
  viewAllUrl,
}: HomeProductGridProps) {
  return (
    <section className="my-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product, idx) =>
          product ? (
            <HomeProductCard key={idx} {...product} />
          ) : (
            <div
              key={idx}
              className="h-[320px] rounded-xl bg-muted animate-pulse"
            />
          )
        )}
      </div>
    </section>
  );
}
