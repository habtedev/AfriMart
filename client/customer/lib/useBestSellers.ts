// Fetch best sellers by real sales (top 20)
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function useBestSellers() {
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/best-sellers/sales`,
    fetcher
  );
  return {
    products: data ?? [],
    loading: isLoading,
    error: error ? 'Failed to load best sellers' : ''
  };
}
