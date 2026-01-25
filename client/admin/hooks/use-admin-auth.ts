// Basic admin auth hook placeholder
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8500/api';
        const res = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
        const data = await res.json();
        // Debug log
        if (typeof window !== 'undefined') {
          console.log('[ADMIN AUTH DEBUG] /auth/me response:', data);
        }
        // Accept 'admin' or 'superadmin' roles
        if (res.ok && data.user && (data.user.role === 'admin' || data.user.role === 'superadmin')) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user, isLoading, isAuthenticated };
}
