// Fetch product sales and seller count
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function useProductSales(productId: string) {
  const { data, error, isLoading } = useSWR(
    productId ? `${process.env.NEXT_PUBLIC_API_URL}/api/product-sales/${productId}` : null,
    fetcher
  );
  return {
    sales: data?.sold ?? 0,
    sellerCount: data?.uniqueBuyers ?? 0,
    loading: isLoading,
    error: error ? 'Failed to load sales data' : ''
  };
}
