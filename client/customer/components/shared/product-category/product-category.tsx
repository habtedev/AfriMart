"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface HomeProductCardProps {
  image: string;
  title: string;
  badge?: string;
  onAddToCart?: () => void;
}

export default function HomeProductCard({
  image,
  title,
  badge,
  onAddToCart,
}: HomeProductCardProps) {
  return (
    <div className="group relative rounded-xl border bg-background shadow-sm hover:shadow-lg transition-all overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/2.2] w-full bg-muted overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />

        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold line-clamp-2 min-h-[2.5em]">
          {title}
        </h3>

        {/* No price or rating shown */}

        <Button
          size="sm"
          className="w-full mt-2"
          onClick={onAddToCart}
        >
          View details
        </Button>
      </div>
    </div>
  );
}
