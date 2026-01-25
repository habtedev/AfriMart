"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SocialCallback() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        console.debug('[SocialCallback] /api/auth/me response:', data);
        // Check cookies in browser
        console.debug('[SocialCallback] Document cookies:', document.cookie);
        if (res.ok && data.user) {
          login(data.user);
          router.replace("/");
        } else {
          router.replace("/auth/login");
        }
      } catch {
        router.replace("/auth/login");
      }
    }
    fetchUser();
  }, [login, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">Signing you in with Google...</p>
      </div>
    </main>
  );
}
