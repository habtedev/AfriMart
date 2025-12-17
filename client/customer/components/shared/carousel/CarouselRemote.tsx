"use client";
import Carousel from "./Carousel";
import { useCarouselImages } from "@/lib/useCarouselImages";

export function CarouselRemote() {
  const { images, loading, error } = useCarouselImages();

  if (loading) return <div className="text-center py-8">Loading carousel...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!images.length) return <div className="text-center py-8">No carousel images found.</div>;

  return <Carousel images={images} />;
}
