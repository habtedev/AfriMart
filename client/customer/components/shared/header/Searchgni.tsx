"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  // Debounce search (better performance)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length > 1) {
        onSearch(query.trim());
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    onSearch(trimmed);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full"
    >
      {/* Search Icon */}
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="
          w-full
          pl-10
          pr-10
          h-10
          rounded-full
          border
          bg-background
          focus:outline-none
          focus:ring-2
          focus:ring-primary
          transition
        "
      />

      {/* Clear Button */}
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};

export default ProductSearch;