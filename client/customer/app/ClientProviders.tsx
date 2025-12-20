"use client";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/shared/header/theme-provider";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/shared/header/Header";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <Header />
            {children}
          </CartProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
