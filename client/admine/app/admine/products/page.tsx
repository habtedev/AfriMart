
"use client";
import * as React from "react";
import AdminProductOptions from "../../../components/shared/product/AdminProductOptions";


export default function ProductsPage() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <AdminProductOptions />
    </div>
  );
}
