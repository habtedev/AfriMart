"use client";
import React, { useEffect, useState } from "react";
import ProductCategoryCardGrid from "@/components/shared/product-category-card/ProductCategoryCardGrid";
import { useSearchParams } from "next/navigation";

export interface ProductCategory {
  _id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  stock: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    let url = `${baseUrl.replace(/\/$/, '')}/api/product-category-card`;
    if (category) url += `?category=${encodeURIComponent(category)}`;
    console.debug('[ProductsPage] Fetching (axios):', url);
    import('axios').then(({ default: axios }) => {
      axios.get(url)
        .then(res => {
          let data = res.data;
          // If API returns HTML (ngrok error), catch and show error
          if (typeof data === 'string' && data.startsWith('<!DOCTYPE html>')) {
            console.error('[ProductsPage] API returned HTML error page:', data);
            setError('API did not return valid product data. Check backend and ngrok.');
            setProducts([]);
            return;
          }
          if (!res.status || res.status < 200 || res.status >= 300) {
            setError(data.message || 'Failed to fetch products');
            setProducts([]);
            return;
          }
          setProducts(data.productCards || []);
          setError(null);
        })
        .catch(err => {
          if (err.response && typeof err.response.data === 'string' && err.response.data.startsWith('<!DOCTYPE html>')) {
            setError('API returned an HTML error page. Check backend and ngrok.');
            setProducts([]);
          } else {
            setError(err.message || 'Failed to fetch products');
            setProducts([]);
          }
        })
        .finally(() => setLoading(false));
    });
  }, [category]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center capitalize">
        {category ? `All ${category} Products` : "All Product Categories"}
      </h1>
      {loading && <div className="text-center py-8">Loading products...</div>}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8">No products found.</div>
      )}
      {!loading && !error && products.length > 0 && (
        <ProductCategoryCardGrid categories={products} />
      )}
    </div>
  );
};

export default ProductsPage;
