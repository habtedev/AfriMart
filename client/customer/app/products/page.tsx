"use client";
import React, { useEffect, useState } from "react";
import ProductCategoryCardGrid from "@/components/shared/product-category-card/ProductCategoryCardGrid";
import { useSearchParams } from "next/navigation";

export interface ProductCategory {
  _id: string;
  title: string;
  image: string;
  category: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    setLoading(true);
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500"}/product-category-card`;
    if (category) url += `?category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then(data => {
        setProducts(data.productCards || []);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
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
