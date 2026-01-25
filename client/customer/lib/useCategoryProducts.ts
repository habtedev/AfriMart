import { useEffect, useState } from "react";
import axios from "axios";

export interface Product {
  _id: string;
  title: string;
  image: string;
  category: string;
}

export function useCategoryProducts(categories: string[]) {
  const [products, setProducts] = useState<(Product | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          categories.map(async (cat) => {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/products?category=${cat}`;
            console.debug('[useCategoryProducts] Fetching:', apiUrl);
            const res = await axios.get(apiUrl);
            console.debug('[useCategoryProducts] Response:', res);
            if (typeof res.data === 'string' && res.data.startsWith('<!DOCTYPE html>')) {
              console.error('[useCategoryProducts] API returned HTML error page:', res.data);
              throw new Error('API did not return valid product data. Check backend and ngrok.');
            }
            if (!res.data.products || !Array.isArray(res.data.products)) {
              console.error('[useCategoryProducts] Unexpected API response:', res.data);
              return null;
            }
            if (!res.data.products.length) {
              console.warn('[useCategoryProducts] No products in array for category:', cat);
              return null;
            }
            return res.data.products[0];
          })
        );
        setProducts(results);
      } catch (err: any) {
        console.error('[useCategoryProducts] Error:', err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categories]);

  return { products, loading, error };
}
