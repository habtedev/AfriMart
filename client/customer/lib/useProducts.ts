import { useEffect, useState } from "react";
import axios from "axios";

export interface Product {
  _id: string;
  title: string;
  image: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api"}/products`);
        setProducts(res.data.products);
      } catch (err: any) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
}
