"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";

import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Globe,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Package,
} from "lucide-react";

import { translations, Language } from "@/i18n";
// import Searchgni from "./Searchgni"; // Unused, can be removed or integrated if needed
import { fetchProductsByName, Product } from "@/lib/fetchProductsByName";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/* ---------------- Layout Tokens ---------------- */

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export default function Header() {

    const [searchResults, setSearchResults] = React.useState<Product[]>([]);
    const [searching, setSearching] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Real-world search handler
    const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const results = await fetchProductsByName(query);
        setSearchResults(results);
      } catch (err) {
        setSearchResults([]);
      }
      setSearching(false);
    };

    // Real-world search handler
    // Remove unused handleSearch
  const router = useRouter();
  const pathname = usePathname();

  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const { language, setLanguage } = useLanguage();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const t = translations[language];

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "am", name: "አማርኛ", flag: "🇪🇹" },
    { code: "ti", name: "ትግርኛ", flag: "🇪🇷" },
    { code: "om", name: "Afaan Oromoo", flag: "🇪🇹" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">

      {/* ================= NAVBAR ================= */}

      <div className={`${container} flex h-20 items-center gap-4`}>

        {/* Mobile Menu */}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
            {/* Visually hidden DialogTitle for accessibility */}
            <SheetTitle className="sr-only">Menu</SheetTitle>

  {/* ===== User Header ===== */}

  <div className="bg-primary text-primary-foreground p-6">

    <div className="flex items-center gap-3">

      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
        <User className="h-5 w-5" />
      </div>

      <div className="text-sm">

        {isLoggedIn ? (
          <>
            <p className="font-semibold">{user?.name || "Account"}</p>
            <p className="text-xs opacity-80">{user?.email}</p>
          </>
        ) : (
          <p className="font-semibold">Welcome to AFRIMART</p>
        )}

      </div>

    </div>

  </div>


  {/* ===== Scroll Content ===== */}

  <div className="flex-1 overflow-y-auto p-4 space-y-6">

    {/* Account */}

    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
        Account
      </p>

      <div className="space-y-1">

        {isLoggedIn ? (
          <>
            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
              <User className="h-4 w-4" /> Profile
            </Link>

            <Link href="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
              <Package className="h-4 w-4" /> Orders
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/auth/login?next=${encodeURIComponent(pathname || "/")}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
            >
              <LogIn className="h-4 w-4" /> {t.signIn}
            </Link>

            <Link
              href={`/auth/register?next=${encodeURIComponent(pathname || "/")}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
            >
              <UserPlus className="h-4 w-4" /> {t.register}
            </Link>
          </>
        )}

      </div>
    </div>


    {/* Quick Links */}
     <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">

        <span className="text-sm">Appearance</span>

        <ThemeToggle />

      </div>

    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
        Quick Access
      </p>

      <div className="space-y-1">

        <Link href="/cart" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
          <ShoppingCart className="h-4 w-4" /> Cart
        </Link>

        <Link href="/wishlist" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
          ❤️ Wishlist
        </Link>

      </div>
    </div>


    {/* Categories */}

    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
        Shop Categories
      </p>

      <div className="space-y-1">

        <Link href="/category/electronics" className="block p-3 rounded-lg hover:bg-accent">
          Electronics
        </Link>

        <Link href="/category/fashion" className="block p-3 rounded-lg hover:bg-accent">
          Fashion
        </Link>

        <Link href="/category/home" className="block p-3 rounded-lg hover:bg-accent">
          Home & Kitchen
        </Link>

        <Link href="/category/beauty" className="block p-3 rounded-lg hover:bg-accent">
          Beauty
        </Link>

        <Link href="/category/sports" className="block p-3 rounded-lg hover:bg-accent">
          Sports
        </Link>

        <Link href="/category/books" className="block p-3 rounded-lg hover:bg-accent">
          Books
        </Link>

      </div>
    </div>


    {/* Settings */}

    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
        Settings
      </p>


      {/* Language */}

      <div className="mt-3">

        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-accent"
          >
            {lang.flag} {lang.name}
          </button>
        ))}

      </div>

    </div>

  </div>

</SheetContent>
        </Sheet>

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl"
        >
          <div className="p-2 rounded-xl bg-primary text-white shadow-md">
            <ShoppingCart className="h-5 w-5" />
          </div>

          <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            AFRIMART
          </span>
        </Link>

        {/* Search */}

        <div className="hidden lg:flex flex-1 max-w-xl mx-auto">
          <form
            className="relative w-full"
            onSubmit={e => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }}
            autoComplete="off"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              className="pl-10 rounded-full h-10 bg-secondary/40 border-none"
              value={searchQuery}
              onChange={handleSearchInput}
            />
            {/* Search Results Dropdown */}
            {searching && (
              <div className="absolute left-0 top-12 w-full bg-background border shadow rounded p-4 z-50">
                <span>Searching...</span>
              </div>
            )}
            {!searching && searchResults.length > 0 && (
              <div className="absolute left-0 top-12 w-full bg-background border shadow rounded p-4 z-50">
                <ul>
                  {searchResults.map((item) => (
                    <li
                      key={item._id}
                      onClick={() => {
                        router.push(`/products/${item._id}`);
                        setSearchResults([]);
                      }}
                      className="py-1 px-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">[{item.category}]</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-muted-foreground">Powered by simple search. For production, use <a href="https://fusejs.io/" target="_blank" className="underline">Fuse.js</a> or Algolia.</div>
              </div>
            )}
          </form>
        </div>

        {/* Right Side */}

        <div className="flex items-center gap-3 ml-auto">

          <ThemeToggle />

          {/* Language */}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm">
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                >
                  {lang.flag} {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Account */}

          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {isLoggedIn ? "Account" : "Login"}
              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              {isLoggedIn ? (
                <>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    Orders
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/auth/login?next=${pathname}`)
                    }
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t.signIn}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/auth/register?next=${pathname}`)
                    }
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.register}
                  </DropdownMenuItem>
                </>
              )}

            </DropdownMenuContent>

          </DropdownMenu>

          {/* CART (Improved Visibility) */}

          <Link
            href="/cart"
            className="
            relative
            flex
            items-center
            justify-center
            h-11
            w-11
            rounded-full
            bg-primary
            text-primary-foreground
            shadow-md
            hover:scale-105
            hover:shadow-lg
            transition
            "
          >

            <ShoppingCart className="h-5 w-5" />

            {cartCount > 0 && (
              <Badge
                className="
                absolute
                -top-1
                -right-1
                h-5
                min-w-5
                flex
                items-center
                justify-center
                rounded-full
                bg-red-500
                text-white
                text-[10px]
                font-bold
                shadow
                "
              >
                {cartCount}
              </Badge>
            )}

          </Link>

        </div>

      </div>

      {/* Mobile Search */}

      <div className="lg:hidden px-4 pb-3">
        <form
          className="relative"
          onSubmit={e => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
          }}
          autoComplete="off"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            className="pl-10 rounded-lg bg-secondary/40 border-none"
            value={searchQuery}
            onChange={handleSearchInput}
          />
          {/* Search Results Dropdown */}
          {searching && (
            <div className="absolute left-0 top-12 w-full bg-background border shadow rounded p-4 z-50">
              <span>Searching...</span>
            </div>
          )}
          {!searching && searchResults.length > 0 && (
            <div className="absolute left-0 top-12 w-full bg-background border shadow rounded p-4 z-50">
              <ul>
                {searchResults.map((item) => (
                  <li
                    key={item._id}
                    onClick={() => {
                      router.push(`/products/${item._id}`);
                      setSearchResults([]);
                    }}
                    className="py-1 px-2 hover:bg-accent rounded cursor-pointer"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">[{item.category}]</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-muted-foreground">Powered by simple search. For production, use <a href="https://fusejs.io/" target="_blank" className="underline">Fuse.js</a> or Algolia.</div>
            </div>
          )}
        </form>
      </div>

    </header>
  );
}