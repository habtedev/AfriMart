// Real-world search algorithm for products and categories
// This is a simple, recommended, and scalable approach using fuzzy search
// In production, use a library like Fuse.js or Algolia for better results

export interface SearchItem {
  id: string;
  name: string;
  type: "product" | "category";
}

// Example: Fuzzy search using Fuse.js (recommended for real-world apps)
// For demo, a simple case-insensitive substring match is used
export function searchItems(
  items: SearchItem[],
  query: string
): SearchItem[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return items.filter(
    (item) => item.name.toLowerCase().includes(lower)
  );
}

// For production, install and use Fuse.js:
// import Fuse from "fuse.js";
// const fuse = new Fuse(items, { keys: ["name"] });
// return fuse.search(query).map(result => result.item);
