"use client";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/shared/header/theme-provider";
import Header from "@/components/shared/header/Header";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Header />
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
}
