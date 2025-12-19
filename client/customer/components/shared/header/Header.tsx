"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Menu,
  ShoppingCart,
  User,
  Phone,
  ChevronDown,
  Globe,
  CreditCard,
  Check,
} from "lucide-react";

import { translations, Language } from "@/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";


export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language: lang, setLanguage: setLang } = useLanguage();
  const { getItemCount } = useCart();
  const cartItems = getItemCount();

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
    { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ", flag: "🇪🇷" },
    { code: "om", name: "Afan Oromo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
  ];

  const t = translations[lang];

  return (
    <header className="w-full bg-background border-b sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-zinc-900 text-zinc-100 py-2 px-4 text-[13px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 border-r border-zinc-700 pr-4">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>{t.call}: +251 911 234 567</span>
            </div>
            <span className="text-zinc-400">{t.freeShipping}</span>
          </div>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-zinc-100 hover:bg-zinc-800 gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                {languages.find(l => l.code === lang)?.nativeName}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {languages.map(l => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code as Language)}
                  className={`flex items-center justify-between cursor-pointer ${
                    lang === l.code
                      ? "bg-primary/10 text-primary font-semibold"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.nativeName}</span>
                  </div>
                  {lang === l.code && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px]">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <nav className="mt-10 flex flex-col gap-4">
                  {t.categories.map(cat => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      className="text-lg font-medium border-b pb-2"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-black italic">AFRIMART</div>
                <div className="text-[10px] text-primary font-bold tracking-widest">
                  ETHIOPIA
                </div>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Input
                type="search"
                placeholder={t.search}
                className="pl-4 pr-12 py-6 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex gap-2">
                  <User className="h-4 w-4" />
                  {t.account}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-bold text-primary">
                  {t.signIn}
                </DropdownMenuItem>
                <DropdownMenuItem>{t.register}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild className="rounded-full px-5">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {cartItems}
              </Link>
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="hidden lg:flex justify-between py-2 border-t">
          <div className="flex gap-8">
            {t.categories.map(cat => (
              <Link
                key={cat.name}
                href={cat.href}
                className="text-sm font-medium text-zinc-600 hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-green-700">
              Telebirr
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
