import { useEffect, useState } from "react";
import axios from "axios";

export interface ProductDetail {
  _id: string;
  title: string;
  image: string;
  price?: number;
  offPrice?: number;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
  stock: number;
  description?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  color?: string[];
  size?: string[];
  variants?: Array<{
    color?: string;
    size?: string;
    stock?: number;
    sku?: string;
    priceAdjustment?: number;
  }>;
}

export default function useProductDetail(productId: string | undefined) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    const fetchProduct = async () => {
      try {
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        baseUrl = baseUrl.replace(/\/$/, "");
        baseUrl = baseUrl.replace(/\/api$/, "");
        const url = `${baseUrl}/api/product-cards/${productId}`;
        const response = await axios.get(url, { headers: { Accept: "application/json" } });
        // The backend returns the product object directly
        setProduct(response.data || null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}
