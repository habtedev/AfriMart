"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Separator } from "@/components/ui/separator";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Globe,
  ChevronDown,
  Phone,
  Check,
  Package,
  LogOut,
  Heart,
  LogIn,
  UserPlus,
  MoreVertical,
} from "lucide-react";

import { translations, Language } from "@/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

// Import AuthContext (scaffolded below)
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = React.useState("");
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const { language, setLanguage } = useLanguage();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const t = translations[language];

  const languages = [
    { code: "en", label: "English", native: "English", flag: "🇬🇧" },
    { code: "am", label: "Amharic", native: "አማርኛ", flag: "🇪🇹" },
    { code: "ti", label: "Tigrinya", native: "ትግርኛ", flag: "🇪🇷" },
    { code: "om", label: "Afan Oromo", native: "Afaan Oromoo", flag: "🇪🇹" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl shadow-sm">
      {/* ───────────── Desktop Top Bar ───────────── */}
      <div className="hidden sm:block bg-gradient-to-r from-zinc-900/90 to-zinc-800/80 text-zinc-100 text-[11px] py-1.5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> <span className="font-semibold tracking-wide">+251 911 234 567</span></span>
            <span className="text-zinc-400 capitalize font-medium">{t.freeShipping}</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Desktop Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors font-semibold">
                <Globe className="h-3 w-3" /> {languages.find(l => l.code === language)?.native} <ChevronDown className="h-2 w-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-0 mt-2">
                {languages.map(l => (
                  <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code as Language)} className={`rounded-lg hover:bg-primary/10 ${language === l.code ? 'text-red-500 font-bold' : ''}`}>
                    {l.flag} {l.native} {language === l.code && <Check className="ml-auto h-3 w-3 text-red-500" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ───────────── Main Navbar ───────────── */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
        {/* Mobile Menu & User Context */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] flex flex-col p-0">
            <SheetHeader className="p-6 bg-primary text-primary-foreground text-left">
              <SheetTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" /> 
                {isLoggedIn ? "Hello, User" : "Welcome to AfriMart"}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Theme & Language Toggle (Mobile) */}
              <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-xs font-medium">Appearance</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-xs font-medium flex items-center gap-1">
                    <Globe className="h-4 w-4" /> {language.toUpperCase()}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {languages.map(l => (
                      <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code as Language)}>
                        {l.flag} {l.native}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Dynamic Auth Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-widest mb-2">Account</p>
                {isLoggedIn ? (
                  <>
                    <Link href="/profile" className="flex items-center gap-3 p-3 text-sm rounded-md hover:bg-accent"><User className="h-4 w-4"/> My Profile</Link>
                    <Link href="/orders" className="flex items-center gap-3 p-3 text-sm rounded-md hover:bg-accent"><Package className="h-4 w-4"/> My Orders</Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-sm rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 mt-4 border-t border-dashed">
                      <LogOut className="h-4 w-4"/> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={`/auth/login?next=${encodeURIComponent(pathname || '/')}`} className="flex items-center gap-3 p-3 text-sm rounded-md hover:bg-accent"><LogIn className="h-4 w-4"/> {t.signIn}</Link>
                    <Link href={`/auth/register?next=${encodeURIComponent(pathname || '/')}`} className="flex items-center gap-3 p-3 text-sm rounded-md hover:bg-accent font-bold text-primary"><UserPlus className="h-4 w-4"/> {t.register}</Link>
                  </>
                )}
              </div>

              <Separator className="my-4" />
              <p className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-widest mb-2">Shop Categories</p>
              <nav className="space-y-1">
                {t.categories.map(cat => (
                  <Link key={cat.name} href={cat.href} className="block p-3 text-sm rounded-md hover:bg-accent">{cat.name}</Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-auto lg:mr-0 group">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl p-2 shadow-lg group-hover:scale-105 transition-transform">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary group-hover:to-blue-400 transition-colors">AFRIMART</span>
        </Link>

        {/* Search (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Input placeholder={t.search} className="rounded-full pl-10 h-10 bg-secondary/30 border-none" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block"><ThemeToggle /></div>

          {/* Account Dropdown (Desktop) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden sm:flex gap-2 items-center px-4 py-2 rounded-xl border border-primary/30 shadow-sm hover:bg-primary/10 transition-colors">
                <User className="h-5 w-5 text-primary" />
                <div className="text-left hidden lg:block">
                  <p className="text-[10px] text-muted-foreground leading-none">Account</p>
                  <p className="text-xs font-bold text-primary">{isLoggedIn ? "My Profile" : "Login"}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-0 mt-2">
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel>Manage Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-lg hover:bg-primary/10"> <User className="mr-2 h-4 w-4"/> Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")} className="rounded-lg hover:bg-primary/10"> <Package className="mr-2 h-4 w-4"/> Orders</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"><LogOut className="mr-2 h-4 w-4"/> Sign Out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`)} className="font-bold rounded-lg hover:bg-primary/10"><LogIn className="mr-2 h-4 w-4"/> {t.signIn}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/auth/register?next=${encodeURIComponent(pathname || '/')}`)} className="rounded-lg hover:bg-primary/10"> <UserPlus className="mr-2 h-4 w-4"/> {t.register}</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button asChild className="relative rounded-full h-11 w-11 p-0 bg-gradient-to-br from-primary/80 to-blue-500/80 shadow-lg hover:scale-105 transition-transform" variant="secondary">
            <Link href="/cart">
              <ShoppingCart className="h-6 w-6 text-white" />
              {cartCount > 0 && <Badge className="absolute -top-1 -right-1 px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-white text-primary font-bold shadow">{cartCount}</Badge>}
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-10 h-10 bg-secondary/50 border-none rounded-lg focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
    </header>
  );
}