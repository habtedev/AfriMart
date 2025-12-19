"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShoppingBag,
  Star,
  Zap,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt?: string;
  title?: string;
  price?: string;
  discount?: string;
  rating?: number;
  badge?: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
  showProductInfo?: boolean;
  withQuickAdd?: boolean;
  withFullscreen?: boolean;
  overlay?: React.ReactNode;
}

export default function FullWidthEcommerceCarousel({
  images,
  autoPlay = true,
  interval = 5000,
  showThumbnails = true,
  showProductInfo = true,
  withQuickAdd = true,
  withFullscreen = false,
  overlay,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  const length = images.length;
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressRef = React.useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(
    () => setCurrent((p) => (p + 1) % length),
    [length]
  );

  const prev = () =>
    setCurrent((p) => (p === 0 ? length - 1 : p - 1));

  const resetProgress = () => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  useEffect(() => {
    if (!isPlaying) return;

    resetProgress();

    progressRef.current = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 100 / (interval / 100)));
    }, 100);

    timerRef.current = setTimeout(next, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, isPlaying, interval, next]);

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* HERO */}
      <div
        className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[75vh] w-full overflow-hidden bg-muted"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Overlay in the center */}
        {overlay && (
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center z-[60] pointer-events-none pb-8 overflow-visible">
            <div
              className="pointer-events-auto w-screen max-w-none rounded-none p-0 md:p-0 overflow-visible"
              style={{ minHeight: '220px', height: 'clamp(180px, 22vh, 320px)', gap: '2.5rem', background: 'none', boxShadow: 'none', zIndex: 70 }}
            >
              {overlay}
            </div>
          </div>
        )}
        {/* Progress */}
        {isPlaying && (
          <div className="absolute top-0 inset-x-0 z-40">
            <Progress value={progress} className="h-[3px] rounded-none" />
          </div>
        )}

        {/* Badge */}
        {images[current].badge && (
          <Badge className="absolute top-6 left-6 z-30 bg-gradient-to-r from-pink-500 to-rose-500 border-0">
            <Zap className="w-3 h-3 mr-1" />
            {images[current].badge}
          </Badge>
        )}

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={images[current].src}
              alt={images[current].alt ?? "Product image"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-6 transition-opacity",
            !hovered && "opacity-0"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full h-12 w-12"
            onClick={prev}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full h-12 w-12"
            onClick={next}
          >
            <ChevronRight />
          </Button>
        </div>

      </div>
 
    </section>
  );
}
