"use client";
import * as React from "react"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
}

export default function AdminModernHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activePath, setActivePath] = React.useState("/admine/dashboard")

  const navItems: NavItem[] = [
    { 
      name: "Dashboard", 
      href: "/admine/dashboard", 
      icon: <LayoutDashboard className="h-4 w-4" /> 
    },
    { 
      name: "Products", 
      href: "/admine/products", 
      icon: <Package className="h-4 w-4" />,
      badge: 12
    },
    { 
      name: "Orders", 
      href: "/admine/orders", 
      icon: <ShoppingCart className="h-4 w-4" />,
      badge: 5
    },
    { 
      name: "Users", 
      href: "/admine/users", 
      icon: <Users className="h-4 w-4" />,
      badge: 3
    },
  ]

  const isActive = (path: string) => activePath === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-6 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">AM</span>
                    </div>
                    <span className="font-bold text-xl text-primary">AfriMart Admin</span>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={() => {
                          setActivePath(item.href)
                          setMobileMenuOpen(false)
                        }}
                      >
                        {item.icon}
                        {item.name}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-8 w-8 rounded-lg bg-primary items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AM</span>
              </div>
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-primary">
                AfriMart Admin
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex">
                v2.0
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="relative gap-2"
                  asChild
                >
                  <a 
                    href={item.href}
                    onClick={() => setActivePath(item.href)}
                  >
                    {item.icon}
                    {item.name}
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                </Button>
              ))}
            </nav>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-muted/50 border-border/50"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {["New order received", "Low stock alert", "New user registered"].map((note, i) => (
                    <DropdownMenuItem key={i} className="cursor-pointer py-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{note}</p>
                          <p className="text-xs text-muted-foreground">Just now</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://ui-avatars.com/api/?name=Admin+User" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-flex">Admin User</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex lg:hidden items-center gap-2 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 bg-muted/50 border-border/50"
            />
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}