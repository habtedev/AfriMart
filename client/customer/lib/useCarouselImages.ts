"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export interface CarouselImage {
  src: string;
  alt?: string;
  _id?: string;
}

export function useCarouselImages() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/carousel`;
      console.debug('[Carousel] Fetching:', url);
      try {
        const res = await axios.get(url);
        console.debug('[Carousel] Response:', res.status, res.data);
        setImages(res.data.images);
      } catch (err: any) {
        console.error('[Carousel] Fetch error:', err);
        setError(err.message || "Failed to fetch carousel images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return { images, loading, error };
}
