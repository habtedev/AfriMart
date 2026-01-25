"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Image as ImageIcon,
  Grid,
  List,
  Star,
  Tag,
  Zap,
  DollarSign,
  Percent,
  Clock,
  ShoppingCart,
  ArrowUpDown,
  Users,
  BarChart3,
  Palette,
  Ruler,
  Layers,
  Hash,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";

const CATEGORY_OPTIONS = [
  "best-seller",
  "coffees",
  "shoes",
  "clothing",
  "electronics",
  "home-decor",
  "today's deals",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "best-seller": "Best Seller",
  "coffees": "Coffees",
  "shoes": "Shoes",
  "clothing": "Clothing",
  "electronics": "Electronics",
  "home-decor": "Home Decor",
  "today's deals": "Today's Deals",
};

const CATEGORY_COLORS: Record<string, string> = {
  "best-seller": "bg-amber-500",
  "coffees": "bg-rose-500",
  "shoes": "bg-blue-500",
  "clothing": "bg-purple-500",
  "electronics": "bg-emerald-500",
  "home-decor": "bg-orange-500",
  "today's deals": "bg-red-500",
};

// Predefined options for common sizes and colors
const COMMON_COLORS = [
  { value: "Red", label: "Red", hex: "#ef4444" },
  { value: "Blue", label: "Blue", hex: "#3b82f6" },
  { value: "Green", label: "Green", hex: "#10b981" },
  { value: "Black", label: "Black", hex: "#000000" },
  { value: "White", label: "White", hex: "#ffffff" },
  { value: "Gray", label: "Gray", hex: "#6b7280" },
  { value: "Yellow", label: "Yellow", hex: "#f59e0b" },
  { value: "Purple", label: "Purple", hex: "#8b5cf6" },
  { value: "Pink", label: "Pink", hex: "#ec4899" },
  { value: "Orange", label: "Orange", hex: "#f97316" },
  { value: "Brown", label: "Brown", hex: "#92400e" },
  { value: "Navy", label: "Navy", hex: "#1e3a8a" },
  { value: "Beige", label: "Beige", hex: "#f5f5dc" },
  { value: "Maroon", label: "Maroon", hex: "#800000" },
  { value: "Teal", label: "Teal", hex: "#0d9488" },
];

const CLOTHING_SIZES = [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL",
  "28", "30", "32", "34", "36", "38", "40", "42", "44",
  "One Size", "T-shirt", "Suri"
];

const SHOE_SIZES = [
  "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", 
  "10", "10.5", "11", "11.5", "12", "13", "14", "15"
];

const ELECTRONICS_SIZES = [
  "Small", "Medium", "Large", "Standard", "Compact", "Portable"
];

// Variant type for stock per color/size/combination
const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative").max(10000, "Stock is too high"),
  sku: z.string().optional(),
  priceAdjustment: z.number().optional(),
});

// Zod schema for form validation (with shipping, color, size, variants)
const formSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters"),
  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(1000000, "Price is too high"),
  offPrice: z.number(),
  rating: z.number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5"),
  reviewCount: z.number()
    .min(0, "Review count cannot be negative"),
  sku: z.string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be less than 50 characters"),
  category: z.enum(CATEGORY_OPTIONS),
  isBestSeller: z.boolean(),
  isTodayDeal: z.boolean(),
  image: z.any(),
  shippingDate: z.string(),
  shippingPrice: z.number(),
  shippingPercent: z.number(),
  color: z.array(z.string()),
  size: z.array(z.string()),
  variants: z.array(variantSchema),
});

type Variant = z.infer<typeof variantSchema>;
type FormValues = z.infer<typeof formSchema>;

interface ProductCard {
  _id: string;
  title: string;
  description: string;
  price: number;
  offPrice: number;
  rating: number;
  reviewCount: number;
  sku: string;
  category: string;
  isBestSeller: boolean;
  isTodayDeal: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  shippingDate: string;
  shippingPrice: number;
  shippingPercent: number;
  color: string[];
  size: string[];
  variants: Variant[];
}

// Helper functions
const calculateDiscount = (price: number, offPrice?: number) => {
  if (!offPrice || offPrice >= price) return 0;
  return Math.round(((price - offPrice) / price) * 100);
};

const formatPrice = (price?: number) => {
  if (typeof price !== 'number' || isNaN(price)) return '$0.00';
  return `$${price.toFixed(2)}`;
};

const getSizeOptions = (category: string) => {
  switch(category) {
    case 'shoes':
      return SHOE_SIZES;
    case 'clothing':
      return CLOTHING_SIZES;
    case 'electronics':
      return ELECTRONICS_SIZES;
    default:
      return [...CLOTHING_SIZES, ...SHOE_SIZES, ...ELECTRONICS_SIZES].filter((v, i, a) => a.indexOf(v) === i);
  }
};

export default function ProductCardsAdminPage() {
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: keyof ProductCard | 'totalStock', direction: 'asc' | 'desc'}>({key: 'createdAt', direction: 'desc'});
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api";

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      offPrice: 0,
      variants: [],
      rating: 4.5,
      reviewCount: 0,
      sku: "",
      category: "best-seller",
      isBestSeller: false,
      isTodayDeal: false,
      image: undefined,
      shippingDate: "",
      shippingPrice: 0,
      shippingPercent: 0,
      color: [],
      size: [],
    },
  });

  // Watch category to update size options
  const selectedCategoryValue = form.watch("category");

  // Reset form function
  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      price: 0,
      offPrice: 0,
      variants: [],
      rating: 4.5,
      reviewCount: 0,
      sku: "",
      category: "best-seller",
      isBestSeller: false,
      isTodayDeal: false,
      image: undefined,
      shippingDate: "",
      shippingPrice: 0,
      shippingPercent: 0,
      color: [],
      size: [],
    });
    setPreviewImage(null);
    setEditingId(null);
    setIsDialogOpen(false);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/product-cards`);
      const data = res.data;
      // Extract product cards array from backend response
      const cardsArray = Array.isArray(data?.productCards) ? data.productCards : 
                        Array.isArray(data) ? data : 
                        Array.isArray(data?.cards) ? data.cards : [];
      setCards(cardsArray.map((card: any) => ({
        ...card,
        rating: typeof card.rating === 'number' ? card.rating : 4.5,
        reviewCount: typeof card.reviewCount === 'number' ? card.reviewCount : 0,
        isBestSeller: typeof card.isBestSeller === 'boolean' ? card.isBestSeller : false,
        isTodayDeal: typeof card.isTodayDeal === 'boolean' ? card.isTodayDeal : false,
        color: Array.isArray(card.color) ? card.color : [],
        size: Array.isArray(card.size) ? card.size : [],
        variants: Array.isArray(card.variants) ? card.variants : [],
      })));
    } catch (err) {
      console.error("Fetch error:", err);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: FormValues) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("price", data.price.toString());
      if (data.offPrice) formData.append("offPrice", data.offPrice.toString());
      formData.append("rating", data.rating?.toString() || "4.5");
      formData.append("reviewCount", data.reviewCount?.toString() || "0");
      formData.append("sku", data.sku || "");
      formData.append("category", data.category);
      // Add variants as JSON string
      formData.append("variants", JSON.stringify(data.variants || []));
      formData.append("isBestSeller", data.isBestSeller.toString());
      formData.append("isTodayDeal", data.isTodayDeal.toString());
      
      // Append image if it's a File object
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }
      
      if (data.shippingDate) formData.append("shippingDate", data.shippingDate);
      if (data.shippingPrice !== undefined) formData.append("shippingPrice", data.shippingPrice.toString());
      if (data.shippingPercent !== undefined) formData.append("shippingPercent", data.shippingPercent.toString());
      if (data.color && data.color.length > 0) {
        data.color.forEach((c) => formData.append("color[]", c));
      }
      if (data.size && data.size.length > 0) {
        data.size.forEach((s) => formData.append("size[]", s));
      }

      if (editingId) {
        await axios.put(`${baseUrl}/product-cards/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${baseUrl}/product-cards`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      fetchCards();
    } catch (err: any) {
      console.error("Submit error:", err);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleEdit(card: ProductCard) {
    setEditingId(card._id);
    form.reset({
      title: card.title,
      description: card.description || "",
      price: card.price,
      offPrice: card.offPrice,
      variants: card.variants || [],
      rating: card.rating ?? 4.5,
      reviewCount: card.reviewCount ?? 0,
      sku: card.sku || "",
      category: card.category as any,
      isBestSeller: card.isBestSeller ?? false,
      isTodayDeal: card.isTodayDeal ?? false,
      image: undefined,
      shippingDate: card.shippingDate || "",
      shippingPrice: card.shippingPrice,
      shippingPercent: card.shippingPercent,
      color: card.color || [],
      size: card.size || [],
    });
    setSelectedColors(card.color || []);
    setSelectedSizes(card.size || []);
    if (card.image) {
      setPreviewImage(card.image);
    }
    setIsDialogOpen(true);
  }

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await axios.delete(`${baseUrl}/product-cards/${id}`);
      toast({
        title: "Product card deleted",
        description: "The product card has been removed successfully",
      });
      fetchCards();
    } catch (err) {
      toast({
        title: "Failed to delete product card",
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
      setCardToDelete(null);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Set the file object in the form
      form.setValue("image", file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Clean up URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
    }
  }

  // Helper to get total stock from variants
  const getTotalStock = (card: ProductCard) =>
    Array.isArray(card.variants) && card.variants.length > 0
      ? card.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : 0;

  // Calculate stats
  const stats = {
    total: cards.length,
    totalValue: cards.reduce((sum, card) => sum + (card.price * getTotalStock(card)), 0),
    bestSellers: cards.filter(card => card.isBestSeller).length,
    todayDeals: cards.filter(card => card.isTodayDeal).length,
    lowStock: cards.filter(card => getTotalStock(card) > 0 && getTotalStock(card) < 10).length,
    outOfStock: cards.filter(card => getTotalStock(card) === 0).length,
  };

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || card.category === selectedCategory;
      
      // Tab filter
      const matchesTab = (() => {
        switch(activeTab) {
          case "best-seller": return card.isBestSeller;
          case "today-deals": return card.isTodayDeal;
          case "low-stock": return getTotalStock(card) > 0 && getTotalStock(card) < 10;
          case "out-of-stock": return getTotalStock(card) === 0;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        const dateA = new Date((a as any)[sortConfig.key] || 0).getTime();
        const dateB = new Date((b as any)[sortConfig.key] || 0).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'totalStock') {
        const aStock = getTotalStock(a);
        const bStock = getTotalStock(b);
        return sortConfig.direction === 'asc' ? aStock - bStock : bStock - aStock;
      }
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Generate all variant combinations from selected colors and sizes
  const generateAllVariants = () => {
    const colors = form.getValues('color') || [];
    const sizes = form.getValues('size') || [];
    const variants: Variant[] = [];
    
    if (colors.length === 0 && sizes.length === 0) {
      variants.push({ color: "", size: "", stock: 0 });
    } else if (colors.length > 0 && sizes.length > 0) {
      // Generate matrix of all color-size combinations
      colors.forEach(color => {
        sizes.forEach(size => {
          variants.push({ color, size, stock: 0 });
        });
      });
    } else if (colors.length > 0) {
      // Only colors
      colors.forEach(color => {
        variants.push({ color, size: "", stock: 0 });
      });
    } else if (sizes.length > 0) {
      // Only sizes
      sizes.forEach(size => {
        variants.push({ color: "", size, stock: 0 });
      });
    }
    
    form.setValue('variants', variants);
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    const currentColors = form.getValues('color') || [];
    if (currentColors.includes(color)) {
      const newColors = currentColors.filter(c => c !== color);
      form.setValue('color', newColors);
      setSelectedColors(newColors);
    } else {
      const newColors = [...currentColors, color];
      form.setValue('color', newColors);
      setSelectedColors(newColors);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    const currentSizes = form.getValues('size') || [];
    if (currentSizes.includes(size)) {
      const newSizes = currentSizes.filter(s => s !== size);
      form.setValue('size', newSizes);
      setSelectedSizes(newSizes);
    } else {
      const newSizes = [...currentSizes, size];
      form.setValue('size', newSizes);
      setSelectedSizes(newSizes);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Cards</h1>
          <p className="text-muted-foreground">
            Manage your product cards inventory
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchCards} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Product Card" : "Add New Product Card"}
                </DialogTitle>
                <DialogDescription>
                  {editingId 
                    ? "Update the details of your product card below." 
                    : "Fill in the details to create a new product card."
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="variants">Variants</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    
                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                          <FormField<FormValues>
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter product title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField<FormValues>
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter product description" 
                                    className="min-h-25"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField<FormValues>
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., PROD-001" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Unique product identifier
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues>
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-9"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField<FormValues>
                              control={form.control}
                              name="offPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discounted Price</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Optional"
                                        className="pl-9"
                                        {...field}
                                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <FormLabel>Product Image</FormLabel>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange}
                              className="mb-3"
                            />
                            
                            {previewImage ? (
                              <div className="relative aspect-square overflow-hidden rounded-lg border">
                                <Image
                                  src={previewImage}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                            ) : (
                              <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/30">
                                <div className="text-center">
                                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    No image selected
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <FormField<FormValues>
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {CATEGORY_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        <div className="flex items-center gap-2">
                                          <div className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[option]}`} />
                                          {CATEGORY_LABELS[option]}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Variants Tab - Improved */}
                    <TabsContent value="variants" className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Color Selection */}
                          <div>
                            <FormLabel className="flex items-center gap-2 mb-3">
                              <Palette className="h-4 w-4" />
                              Available Colors
                            </FormLabel>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {COMMON_COLORS.map((color) => {
                                  const isSelected = selectedColors.includes(color.value);
                                  return (
                                    <button
                                      key={color.value}
                                      type="button"
                                      onClick={() => handleColorSelect(color.value)}
                                      className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                                        ${isSelected 
                                          ? 'border-primary bg-primary/10' 
                                          : 'border-gray-200 hover:border-gray-300'
                                        }
                                      `}
                                    >
                                      <div 
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      <span className="text-sm">{color.label}</span>
                                      {isSelected && (
                                        <Check className="h-3 w-3 text-primary" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Custom color"
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        handleColorSelect(input.value.trim());
                                        input.value = '';
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Custom color"]') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                      handleColorSelect(input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Size Selection */}
                          <div>
                            <FormLabel className="flex items-center gap-2 mb-3">
                              <Ruler className="h-4 w-4" />
                              Available Sizes
                            </FormLabel>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {getSizeOptions(selectedCategoryValue).map((size) => {
                                  const isSelected = selectedSizes.includes(size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => handleSizeSelect(size)}
                                      className={`
                                        px-3 py-2 rounded-lg border transition-all text-sm
                                        ${isSelected 
                                          ? 'border-primary bg-primary/10 text-primary' 
                                          : 'border-gray-200 hover:border-gray-300'
                                        }
                                      `}
                                    >
                                      {size}
                                      {isSelected && (
                                        <Check className="inline-block ml-2 h-3 w-3" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Custom size"
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        handleSizeSelect(input.value.trim());
                                        input.value = '';
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Custom size"]') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                      handleSizeSelect(input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Generate Variants Button */}
                        {(selectedColors.length > 0 || selectedSizes.length > 0) && (
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                            <div>
                              <p className="font-medium">
                                {selectedColors.length} colors × {selectedSizes.length} sizes = {selectedColors.length * selectedSizes.length} variants
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Click below to generate all variant combinations
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={generateAllVariants}
                              variant="secondary"
                            >
                              <Layers className="mr-2 h-4 w-4" />
                              Generate All Variants
                            </Button>
                          </div>
                        )}

                        {/* Variant Stock Management */}
                        <FormField<FormValues>
                          control={form.control}
                          name="variants"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel className="flex items-center gap-2">
                                  <Layers className="h-4 w-4" />
                                  Variant Stock Management
                                </FormLabel>
                                <span className="text-sm text-muted-foreground">
                                  {Array.isArray(field.value) ? field.value.length : 0} variants
                                </span>
                              </div>
                              <FormControl>
                                <div className="space-y-2">
                                  {(Array.isArray(field.value) && field.value.length > 0) ? (
                                    <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="text-left text-xs text-muted-foreground border-b">
                                            <th className="p-2">Color</th>
                                            <th className="p-2">Size</th>
                                            <th className="p-2">Stock</th>
                                            <th className="p-2">SKU</th>
                                            <th className="p-2"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {field.value.map((variant: Variant, idx: number) => (
                                            <tr key={idx} className="border-b hover:bg-muted/30">
                                              <td className="p-2">
                                                <Select
                                                  value={variant.color || ""}
                                                  onValueChange={val => {
                                                    const newVariants = Array.isArray(field.value) ? [...field.value] : [];
                                                    newVariants[idx] = { ...newVariants[idx], color: val };
                                                    field.onChange(newVariants);
                                                  }}
                                                >
                                                  <SelectTrigger className="border-0 shadow-none h-8">
                                                    <SelectValue placeholder="Color" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="NoColor">No Color</SelectItem>
                                                    {COMMON_COLORS.map(color => (
                                                      <SelectItem key={color.value} value={color.value}>
                                                        <div className="flex items-center gap-2">
                                                          <div 
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: color.hex }}
                                                          />
                                                          {color.label}
                                                        </div>
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </td>
                                              <td className="p-2">
                                                <Select
                                                  value={variant.size || ""}
                                                  onValueChange={val => {
                                                    const newVariants = Array.isArray(field.value) ? [...field.value] : [];
                                                    newVariants[idx] = { ...newVariants[idx], size: val };
                                                    field.onChange(newVariants);
                                                  }}
                                                >
                                                  <SelectTrigger className="border-0 shadow-none h-8">
                                                    <SelectValue placeholder="Size" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="NoSize">No Size</SelectItem>
                                                    {getSizeOptions(selectedCategoryValue).map(size => (
                                                      <SelectItem key={size} value={size}>
                                                        {size}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </td>
                                              <td className="p-2">
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  placeholder="Stock"
                                                  className="h-8"
                                                  value={variant.stock}
                                                  onChange={e => {
                                                    const newVariants = Array.isArray(field.value) ? [...field.value] : [];
                                                    newVariants[idx] = { ...newVariants[idx], stock: parseInt(e.target.value) || 0 };
                                                    field.onChange(newVariants);
                                                  }}
                                                />
                                              </td>
                                              <td className="p-2">
                                                <Input
                                                  placeholder="SKU"
                                                  className="h-8"
                                                  value={variant.sku || ""}
                                                  onChange={e => {
                                                    const newVariants = Array.isArray(field.value) ? [...field.value] : [];
                                                    newVariants[idx] = { ...newVariants[idx], sku: e.target.value };
                                                    field.onChange(newVariants);
                                                  }}
                                                />
                                              </td>
                                              <td className="p-2">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => {
                                                    const newVariants = Array.isArray(field.value) ? field.value.filter((_, i) => i !== idx) : [];
                                                    field.onChange(newVariants);
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                      <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                      <p className="text-muted-foreground mb-2">No variants added yet</p>
                                      <p className="text-sm text-muted-foreground mb-4">
                                        Select colors and sizes above, then generate variants
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.onChange([...(Array.isArray(field.value) ? field.value : []), { color: "", size: "", stock: 0 }])}
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add Single Variant
                                    </Button>
                                    
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => field.onChange([])}
                                      disabled={!Array.isArray(field.value) || field.value.length === 0}
                                    >
                                      <X className="h-4 w-4 mr-1" /> Clear All
                                    </Button>
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Manage stock for each color, size, or combination. Each variant can have its own SKU.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Shipping Tab */}
                    <TabsContent value="shipping" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                          <FormField<FormValues>
                            control={form.control}
                            name="shippingDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Date</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="date"
                                      className="pl-9"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField<FormValues>
                            control={form.control}
                            name="shippingPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Price</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Shipping price"
                                      className="pl-9"
                                      {...field}
                                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      value={field.value || ""}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField<FormValues>
                            control={form.control}
                            name="shippingPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Percent (%)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Shipping percent"
                                      className="pl-9"
                                      {...field}
                                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      value={field.value || ""}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-6">
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-medium mb-2">Shipping Notes</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Enter shipping date for estimated delivery</li>
                              <li>• Shipping price adds to product price</li>
                              <li>• Shipping percent calculates as % of product price</li>
                              <li>• Both price and percent can be used together</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                          <FormField<FormValues>
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="5"
                                      placeholder="4.5"
                                      className="pl-9"
                                      {...field}
                                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="reviewCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Review Count</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <FormLabel>Special Attributes</FormLabel>
                          <FormField<FormValues>
                            control={form.control}
                            name="isBestSeller"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                                    Best Seller
                                  </FormLabel>
                                  <FormDescription>
                                    Mark as best-selling product
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField<FormValues>
                            control={form.control}
                            name="isTodayDeal"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-red-500" />
                                    Today's Deal
                                  </FormLabel>
                                  <FormDescription>
                                    Featured in today's special deals
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          {editingId ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          {editingId ? "Update Product Card" : "Add Product Card"}
                        </>
                      )}
                    </Button>
                    
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards (same as before) */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Sellers</p>
                <p className="text-2xl font-bold">{stats.bestSellers}</p>
              </div>
              <div className="p-2 rounded-full bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Deals</p>
                <p className="text-2xl font-bold">{stats.todayDeals}</p>
              </div>
              <div className="p-2 rounded-full bg-red-500/10">
                <Zap className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
              <div className="p-2 rounded-full bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content (same as before) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Product Cards</CardTitle>
              <CardDescription>
                {filteredCards.length} of {cards.length} cards found
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {CATEGORY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none border-r"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none border-r"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("table")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="best-seller">
                <TrendingUp className="h-4 w-4 mr-2" />
                Best Sellers
              </TabsTrigger>
              <TabsTrigger value="today-deals">
                <Zap className="h-4 w-4 mr-2" />
                Today's Deals
              </TabsTrigger>
              <TabsTrigger value="low-stock">
                <AlertCircle className="h-4 w-4 mr-2" />
                Low Stock
              </TabsTrigger>
              <TabsTrigger value="out-of-stock">
                <XCircle className="h-4 w-4 mr-2" />
                Out of Stock
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No product cards found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || selectedCategory !== "all" || activeTab !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first product card"
                }
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => {
                const discount = calculateDiscount(card.price, card.offPrice);
                const totalStock = getTotalStock(card);
                return (
                  <Card key={card._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-muted">
                      {card.image ? (
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {discount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            -{discount}% OFF
                          </Badge>
                        )}
                        {card.isBestSeller && (
                          <Badge className="bg-amber-500 text-white gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Best Seller
                          </Badge>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <Badge 
                          className="text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[card.category] }}
                        >
                          {CATEGORY_LABELS[card.category]}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-1">{card.title}</h3>
                        {card.isTodayDeal && (
                          <Badge variant="destructive" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Today's Deal
                          </Badge>
                        )}
                      </div>
                      
                      {card.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{card.rating?.toFixed(1) || "4.5"}</span>
                        <span className="text-xs text-muted-foreground">
                          ({card.reviewCount?.toLocaleString() || 0} reviews)
                        </span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold">
                          {card.offPrice ? formatPrice(card.offPrice) : formatPrice(card.price)}
                        </span>
                        {card.offPrice && card.offPrice < card.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(card.price)}
                          </span>
                        )}
                      </div>
                      
                      {/* Variants Display */}
                      {card.variants && card.variants.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 mb-2">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">Variants (Stock):</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border rounded">
                              <thead>
                                <tr className="bg-muted text-muted-foreground">
                                  <th className="px-2 py-1 border">Color</th>
                                  <th className="px-2 py-1 border">Size</th>
                                  <th className="px-2 py-1 border">Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {card.variants.map((v, i) => (
                                  <tr key={i} className="border-b last:border-b-0">
                                    <td className="px-2 py-1 border">{v.color || '-'}</td>
                                    <td className="px-2 py-1 border">{v.size || '-'}</td>
                                    <td className="px-2 py-1 border font-semibold {v.stock === 0 ? 'text-red-500' : ''}">{v.stock}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {/* Stock, SKU, Shipping */}
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${totalStock === 0 ? 'bg-red-500' : totalStock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
                            <span className={totalStock === 0 ? 'text-red-600 font-medium' : ''}>
                              {totalStock === 0 ? 'Out of stock' : `${totalStock} in stock`}
                            </span>
                          </div>
                          {card.sku && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {card.sku}
                            </span>
                          )}
                        </div>
                        {card.shippingDate && (
                          <div className="text-xs text-muted-foreground">Shipping Date: {card.shippingDate}</div>
                        )}
                        {card.shippingPrice !== undefined && (
                          <div className="text-xs text-muted-foreground">Shipping: {formatPrice(card.shippingPrice)}</div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => setCardToDelete(card._id)}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product Card</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{card.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(card._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-3">
              {filteredCards.map((card) => {
                const discount = calculateDiscount(card.price, card.offPrice);
                const totalStock = getTotalStock(card);
                return (
                  <div key={card._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        {card.image ? (
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{card.title}</h4>
                          {card.isBestSeller && (
                            <Badge variant="default" className="bg-amber-500 text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Best Seller
                            </Badge>
                          )}
                          {card.isTodayDeal && (
                            <Badge variant="destructive" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Today's Deal
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge 
                            variant="outline"
                            style={{ backgroundColor: CATEGORY_COLORS[card.category] + '20' }}
                          >
                            {CATEGORY_LABELS[card.category]}
                          </Badge>
                          <span className="text-muted-foreground">
                            {card.offPrice ? formatPrice(card.offPrice) : formatPrice(card.price)}
                          </span>
                          {discount > 0 && (
                            <span className="text-red-500 text-xs">
                              -{discount}%
                            </span>
                          )}
                          <span className={`text-sm ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-amber-500' : 'text-green-500'}`}> 
                            {totalStock} in stock
                          </span>
                          
                          {/* Variants quick view */}
                          {card.variants && card.variants.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Layers className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {card.variants.length} variants
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{card.rating?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(card)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCardToDelete(card._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product Card</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{card.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(card._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Table View
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium">Variants</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => {
                    const discount = calculateDiscount(card.price, card.offPrice);
                    const totalStock = getTotalStock(card);
                    return (
                      <tr key={card._id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                              {card.image ? (
                                <Image
                                  src={card.image}
                                  alt={card.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{card.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {card.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="outline"
                            style={{ backgroundColor: CATEGORY_COLORS[card.category] + '20' }}
                          >
                            {CATEGORY_LABELS[card.category]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {card.offPrice ? formatPrice(card.offPrice) : formatPrice(card.price)}
                          </div>
                          {discount > 0 && (
                            <div className="text-sm text-red-500">
                              {discount}% OFF
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${totalStock === 0 ? 'bg-red-500' : totalStock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
                            <span>{totalStock}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {card.variants && card.variants.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">{card.variants.length} variants</span>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(card.variants.slice(0, 2).map(v => v.color).filter(Boolean))).map(color => (
                                  <Badge key={color} variant="outline" className="text-xs">
                                    {color}
                                  </Badge>
                                ))}
                                {Array.from(new Set(card.variants.slice(0, 2).map(v => v.size).filter(Boolean))).map(size => (
                                  <Badge key={size} variant="outline" className="text-xs">
                                    {size}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No variants</span>
                          )}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(card)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setCardToDelete(card._id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}