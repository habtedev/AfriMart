
import { useEffect, useState } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export function useAdminSession(): { user: User | null, loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8500/api';
        const res = await fetch(`${apiBase}/auth/me`, {
          credentials: "include"
        });
        const data = await res.json();
        setUser(data.user || null);
        setLoading(false);
        if (!data.user) {
          // Log for debugging
          console.warn('No user in /api/auth/me response:', data);
        }
      } catch (err) {
        setUser(null);
        setLoading(false);
        console.error('Error fetching /api/auth/me:', err);
      }
    }
    fetchSession();
  }, []);

  return { user, loading };
}
