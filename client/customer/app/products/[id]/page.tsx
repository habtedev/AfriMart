"use client";
import React from "react";
import { useParams } from "next/navigation";
import ProductCardDetail from "@/components/shared/product-card/ProductCardDetail";

const ProductCardDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  if (!id) return <div className="text-center py-8">No product selected.</div>;
  // ProductCardDetail will handle fetching and UI
  return <ProductCardDetail productId={id} />;
};

export default ProductCardDetailPage;
