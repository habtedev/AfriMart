"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertCircle, FolderOpen } from "lucide-react";
import ProductCategoryGrid, {
  ProductCategory,
} from "./ProductCategoryCardGrid";

interface CacheData {
  data: ProductCategory[];
  timestamp: number;
}

export default function ProductCategoryRemote() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Cache configuration
  const CACHE_KEY = "product_categories_cache";
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const getCachedData = (): CacheData | null => {
    if (typeof window === "undefined") return null;
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached) as CacheData;
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      return isExpired ? null : parsed;
    } catch {
      return null;
    }
  };

  const setCachedData = (data: ProductCategory[]) => {
    if (typeof window === "undefined") return;
    
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  const clearCache = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CACHE_KEY);
  };

  const fetchCategories = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true);
    setError("");

    try {
      // Try cache first (unless retrying)
      if (!isRetry) {
        const cached = getCachedData();
        if (cached) {
          setCategories(cached.data);
          setLoading(false);
          return;
        }
      }

      // Fetch from API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch("/api/product-category-card", {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache", // Let browser handle caching
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      const data = result.productCards ?? [];

      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }

      setCategories(data);
      setCachedData(data);
      setRetryCount(0);
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' 
        ? "Request timed out. Please check your connection."
        : err.message || "Failed to load categories";
      
      setError(errorMessage);
      
      // Only retry if not a timeout and less than 3 retries
      if (err.name !== 'AbortError' && retryCount < 3 && !isRetry) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchCategories(true);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRetry = () => {
    clearCache();
    setRetryCount(0);
    fetchCategories();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center mb-8">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mx-auto"></div>
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mx-auto mt-2"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
            >
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Unable to Load Categories</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          <button
            onClick={() => {
              clearCache();
              window.location.reload();
            }}
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            Clear Cache & Reload
          </button>
        </div>
        
        {retryCount > 0 && (
          <p className="text-sm text-zinc-500 mt-4">
            Attempt {retryCount + 1} of 3
          </p>
        )}
      </div>
    );
  }

  // Empty state
  if (!categories.length) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mb-4">
          <FolderOpen size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          There are no product categories available at the moment.
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>
    );
  }

  // Success state with header
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Browse our curated collection of products organized by category for easy discovery
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className="text-sm text-zinc-500">
            {categories.length} categories available
          </span>
          <button
            onClick={() => {
              clearCache();
              fetchCategories();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            title="Refresh categories"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <ProductCategoryGrid categories={categories} />
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-zinc-500 text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
          Data loaded from {getCachedData() ? 'cache' : 'API'}
          <button
            onClick={clearCache}
            className="ml-2 text-red-500 hover:text-red-600"
          >
            Clear cache
          </button>
        </div>
      )}
    </div>
  );
}