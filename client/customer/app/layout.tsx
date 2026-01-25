
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import ClientProviders from "./ClientProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afrimart iCoin",
  description: "Afrimart iCoin - Your trusted digital marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/afrimart-icoin.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
