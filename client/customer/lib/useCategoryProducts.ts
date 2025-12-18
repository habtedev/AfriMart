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
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api"}/products?category=${cat}`);
            return res.data.products[0];
          })
        );
        setProducts(results);
     } catch (err: any) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
 }, [categories]);

  return { products, loading, error };
}
