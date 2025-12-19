"use client";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/shared/header/theme-provider";

import { CartProvider } from "@/context/CartContext";
import Header from "@/components/shared/header/Header";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
