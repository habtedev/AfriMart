"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AdminModernHeader from "../components/shared/header/AdminModernHeader";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // Hide header on /admin/login, /admin/login/reset-password, /admin/login/set-new-password
  const hideHeader = ["/admin/login", "/admin/login/reset-password", "/admin/login/set-new-password"].includes(pathname);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {!hideHeader && <AdminModernHeader />}
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
