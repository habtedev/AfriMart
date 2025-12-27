// useOrders.ts
import { useEffect, useState } from 'react';
import { Order } from './OrderList';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const url = `${baseUrl}/order`;
        console.debug('Fetching orders from:', url);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        console.debug('Response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        console.debug('Fetched orders data:', data);
        // Accept both array and object response for best practice
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.debug('Error fetching orders:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return { orders, loading, error };
}
