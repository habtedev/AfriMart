"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  // No client-side auth check here; header handles session/redirect
  return <>{children}</>;
}
