"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCardDetail from "@/components/shared/product-category-card/ProductCardDetail";

interface ProductCardDetailData {
  _id: string;
  title: string;
  image: string;
  price: number;
  description?: string;
  stock: number;
}

const ProductCardDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<ProductCardDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:8500/api/product-category-card/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch product detail");
        return res.json();
      })
      .then(data => {
        setProduct(data.productCard || null);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <div className="text-center py-8">No product selected.</div>;
  if (loading) return <div className="text-center py-8">Loading product...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!product) return <div className="text-center py-8">Product not found.</div>;

  return <ProductCardDetail {...product} />;
};

export default ProductCardDetailPage;
