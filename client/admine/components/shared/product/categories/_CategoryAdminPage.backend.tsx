// Backend-connected CategoryAdminPage (axios CRUD)
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import CategoryAddForm, { FormValues } from "./CategoryAddForm";
import { toast } from "@/hooks/use-toast";

type Category = {
  id: string | number;
  title: string;
  description?: string;
  slug?: string;
  image?: string;
  category: string;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/product-categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      toast({ title: "Failed to load categories" });
    }
    setIsLoading(false);
  }

  async function handleAddCategory(newCat: FormValues) {
    setIsLoading(true);
    try {
      await axios.post("/api/product-categories", newCat);
      toast({
        title: "Category added successfully",
        description: `${newCat.title} has been added to your categories.`,
      });
      fetchCategories();
    } catch (err) {
      toast({ title: "Failed to add category" });
    }
    setIsLoading(false);
  }

  async function handleDeleteCategory(id: string | number) {
    setIsLoading(true);
    try {
      await axios.delete(`/api/product-categories/${id}`);
      setCategoryToDelete(null);
      toast({
        title: "Category deleted",
        description: "The category has been removed successfully."
      });
      fetchCategories();
    } catch (err) {
      toast({ title: "Failed to delete category" });
    }
    setIsLoading(false);
  }

  async function handleToggleStatus(id: string | number) {
    setIsLoading(true);
    try {
      const cat = categories.find(c => c.id === id);
      if (!cat) return;
      await axios.put(`/api/product-categories/${id}`, { ...cat, isActive: !cat.isActive });
      toast({
        title: "Status updated",
        description: "Category status has been updated.",
      });
      fetchCategories();
    } catch (err) {
      toast({ title: "Failed to update status" });
    }
    setIsLoading(false);
  }

  // ...render logic (copy from your main file, using categories, isLoading, etc.)
  return (
    <div>
      <h1>Product Categories (Backend Connected)</h1>
      <CategoryAddForm onSubmit={handleAddCategory} isLoading={isLoading} />
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.title}</li>
        ))}
      </ul>
    </div>
  );
}
