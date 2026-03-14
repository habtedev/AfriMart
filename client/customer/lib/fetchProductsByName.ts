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

export async function fetchProductsByName(query: string): Promise<Product[]> {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  baseUrl = baseUrl.replace(/\/$/, "");
  baseUrl = baseUrl.replace(/\/api$/, "");
  const url = `${baseUrl}/api/product-cards`;
  const response = await axios.get(url, {
    headers: { Accept: "application/json" },
  });
  const data = response.data;
  if (!Array.isArray(data)) return [];
  const lower = query.toLowerCase();
  return data.filter((item: Product) =>
    item.title.toLowerCase().includes(lower)
  );
}
