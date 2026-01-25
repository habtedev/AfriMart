import { useEffect, useState } from "react";
import axios from "axios";

export interface Product {
  _id: string;
  title: string;
  image: string;
  price?: number;
  offPrice?: number;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
  stock: number;
}

const fetchProducts = async (): Promise<Product[]> => {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  baseUrl = baseUrl.replace(/\/$/, "");
  baseUrl = baseUrl.replace(/\/api$/, "");
  const url = `${baseUrl}/api/product-cards`;
  const response = await axios.get(url, {
    headers: { Accept: "application/json" },
  });
  const data = response.data;
  if (typeof data === "string" && data.startsWith("<!DOCTYPE html>")) {
    throw new Error("API did not return valid product data. Check backend.");
  }
  if (!Array.isArray(data)) {
    throw new Error("API did not return a product array.");
  }
  return data;
};

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetchProducts()
      .then(setProducts)
      .catch((err) => {
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
