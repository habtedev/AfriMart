"use client";

import Image from "next/image";
import { memo } from "react";

export interface ProductCategoryCardProps {
  title: string;
  image: string;
  onClick: () => void;
}

function ProductCategoryCard({
  title,
  image,
  onClick,
}: ProductCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Browse products in ${title} category`}
      className="
        group
        relative
        flex
        flex-col
        items-center
        gap-3
        rounded-xl
        border
        border-zinc-200
        dark:border-zinc-800
        bg-white
        dark:bg-zinc-900
        p-5
        text-center
        transition
        hover:shadow-lg
        hover:-translate-y-0.5
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-zinc-900
      "
    >
      {/* Image */}
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
        <Image
          src={image}
          alt={title}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          priority={false}
        />
      </div>

      {/* Title */}
      <span className="text-sm font-semibold capitalize tracking-wide text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 transition-colors">
        {title}
      </span>
    </button>
  );
}

export default memo(ProductCategoryCard);
