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
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api"}/carousel`);
        setImages(res.data.images);
      } catch (err: any) {
        setError(err.message || "Failed to fetch carousel images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return { images, loading, error };
}
