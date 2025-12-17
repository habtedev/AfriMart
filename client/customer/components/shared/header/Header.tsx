"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Menu, ShoppingCart, User, Phone, MapPin, ChevronDown, Globe, CreditCard, Check } from "lucide-react";
import { translations, Language } from "@/i18n";


export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<Language>("en");
  const cartItems = 3;

  // Language options for switcher
  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
    { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ", flag: "🇪🇷" },
    { code: "om", name: "Afan Oromo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
  ];

  const t = translations[lang];

  return (
    <header className="w-full bg-background border-b sticky top-0 z-50 shadow-sm">
      {/* Top Announcement Bar with Language Switcher */}
      <div className="bg-zinc-900 text-zinc-100 py-2 px-4 text-[13px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 border-r border-zinc-700 pr-4">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>{t.call}: +251 911 234 567</span>
            </div>
            <span className="text-zinc-400 text-center sm:text-left">
              {t.freeShipping}
            </span>
          </div>
          <div className="flex items-center gap-5">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-zinc-100 hover:bg-zinc-800 hover:text-white gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="capitalize">{languages.find(l => l.code === lang)?.nativeName}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code as Language)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer ${
                      lang === l.code 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{l.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{l.name}</span>
                        <span className="text-xs text-zinc-500">{l.nativeName}</span>
                      </div>
                    </div>
                    {lang === l.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden sm:flex items-center gap-5">
              <Link href="/delivery" className="hover:text-primary transition">{t.delivery}</Link>
              <Link href="/track-order" className="hover:text-primary transition">{t.track}</Link>
            </div>
          </div>
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
                <h2 className="sr-only">Menu</h2>
                <div className="mt-10 space-y-6">
                  {/* Mobile Language Switcher */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-semibold text-zinc-500 mb-2">Language</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((l) => (
                        <Button
                          key={l.code}
                          variant={lang === l.code ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLang(l.code as Language)}
                          className="justify-start h-10"
                        >
                          <span className="mr-2">{l.flag}</span>
                          <span className="text-xs">{l.nativeName}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <nav className="flex flex-col gap-4">
                    {t.categories.map((cat) => (
                      <Link 
                        key={cat.name} 
                        href={cat.href} 
                        className="text-lg font-medium border-b pb-2 hover:text-primary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight italic">AFRIMART</span>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em]">ETHIOPIA</span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Input
                type="search"
                placeholder={t.search}
                className="pl-4 pr-12 py-6 rounded-full border-2 focus-visible:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex rounded-full gap-2">
                  <User className="h-4 w-4" />
                  <span>{t.account}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-bold text-primary">{t.signIn}</DropdownMenuItem>
                <DropdownMenuItem>{t.register}</DropdownMenuItem>
                <hr className="my-1" />
                <DropdownMenuItem>{t.orders}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button variant="default" className="relative rounded-full px-5 h-11" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span className="font-bold">{cartItems}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Categories Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-between py-2 border-t">
          <div className="flex gap-8">
            {t.categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-[14px] font-medium text-zinc-600 hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <Link href="/deals" className="text-sm font-bold text-red-600 flex items-center gap-1 hover:scale-105 transition">
              <span className="text-lg">🔥</span> {t.deals}
            </Link>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <div className="flex items-center gap-4 grayscale hover:grayscale-0 transition opacity-80 hover:opacity-100">
               <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Pay With</span>
               <div className="flex gap-3 items-center">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-[13px] font-semibold text-green-700">Telebirr</span>
               </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}