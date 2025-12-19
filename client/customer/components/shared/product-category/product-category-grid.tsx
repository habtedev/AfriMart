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
    <section className="mb-3">
      {/* Header with visual interest */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-0">
        <div className="relative rounded-2xl px-6 py-6 w-full max-w-2xl mx-auto text-center border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl animate-fade-in">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/70 via-pink-400/40 to-yellow-300/40 dark:from-blue-900/80 dark:via-pink-900/30 dark:to-yellow-800/30 blur-[2px] opacity-80 z-0" />
          {/* Icon */}
          <div className="relative z-10 flex justify-center mb-2 animate-bounce-slow">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-700 dark:text-blue-300 drop-shadow-lg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h2
            className="relative z-10 text-4xl font-extrabold tracking-tight mb-1 animate-fade-in-up bg-gradient-to-r from-yellow-300 via-pink-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] animate-text-glow"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35), 0 1px 0 #fff' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="relative z-10 text-lg font-semibold animate-fade-in-up delay-100 bg-gradient-to-r from-white/90 via-yellow-200/80 to-blue-200/80 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] animate-text-glow"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.25), 0 1px 0 #fff' }}
            >
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
      {/* View More Button */}
      <div className="flex justify-center mt-6">
        <Link
          href={viewAllUrl || "/products"}
          className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg"
        >
          View More
        </Link>
      </div>
    </section>
  );
}
