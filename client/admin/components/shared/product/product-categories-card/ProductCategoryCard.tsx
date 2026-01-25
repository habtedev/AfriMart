"use client";
import { useState, useEffect, useMemo } from "react";
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
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

// Category constants - RESTRICTED CATEGORIES
const CATEGORY_OPTIONS = [
  "clothing",
  "electronics",
  "handcraft",
  "home-goods",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  clothing: "Clothing",
  electronics: "Electronics",
  handcraft: "Handcraft",
  "home-goods": "Home Goods",
};

const CATEGORY_COLORS: Record<string, string> = {
  clothing: "bg-purple-500",
  electronics: "bg-emerald-500",
  "handcraft": "bg-orange-700",
  "home-goods": "bg-orange-500",
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

// Variant type for stock and price per color/size/combination
const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative").max(10000, "Stock is too high"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  sku: z.string().optional(),
});

// No form validation
const formSchema = z.object({});

type Variant = z.infer<typeof variantSchema>;
type FormValues = {
  title: string;
  description?: string;
  price: number;
  offPrice?: number;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
  image?: File | string;
  shippingDate?: string;
  shippingPrice?: number;
  shippingPercent?: number;
  color?: string[];
  size?: string[];
  variants?: Variant[];
  stock?: number;
};

interface ProductCard {
  _id: string;
  title: string;
  description?: string;
  price: number;
  offPrice?: number;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  category: string;
  isBestSeller?: boolean;
  isTodayDeal?: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  shippingDate?: string;
  shippingPrice?: number;
  shippingPercent?: number;
  color?: string[];
  size?: string[];
  variants?: Variant[];
  stock?: number;
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

export default function ProductCategoryCardAdminPage() {
    // Fetch cards from API
    async function fetchCards() {
      setIsLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/product-category-card`);
        setCards(response.data.productCards || []);
      } catch (err) {
        toast({ title: "Failed to fetch cards", description: "Please try again." });
      } finally {
        setIsLoading(false);
      }
    }

    // Reset form to default values
    function resetForm() {
      form.reset({
        title: "",
        description: "",
        price: 0,
        offPrice: 0,
        variants: [],
        rating: 4.5,
        reviewCount: 0,
        sku: "",
        category: "clothing",
        isBestSeller: false,
        isTodayDeal: false,
        image: undefined,
        shippingDate: "",
        shippingPrice: 0,
        shippingPercent: 0,
        color: [],
        size: [],
        stock: 0,
      });
      setSelectedColors([]);
      setSelectedSizes([]);
      setPreviewImage(null);
      setEditingId(null);
    }

    // Handle form submit (create or update)
    async function handleSubmit(data: FormValues) {
      if (typeof data.price !== 'number' || data.price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Product price must be greater than 0.",
        });
        return;
      }
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        const invalidVariant = data.variants.find(v => typeof v.price !== 'number' || v.price <= 0);
        if (invalidVariant) {
          toast({
            title: "Invalid Variant Price",
            description: "All variant prices must be greater than 0.",
          });
          return;
        }
      }
      setIsUploading(true);
      try {
        // Debug: log the data being submitted and the image type
        console.log('[DEBUG] Submitting form data:', data);
        if (data.image) {
          if (data.image instanceof File) {
            console.log('[DEBUG] Image is a File:', data.image.name, data.image.type, data.image.size);
          } else if (typeof data.image === 'string') {
            console.log('[DEBUG] Image is a string (URL):', data.image);
          } else {
            console.log('[DEBUG] Image is unknown type:', data.image);
          }
        } else {
          console.log('[DEBUG] No image provided');
        }
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "image") {
            if (value instanceof File) {
              formData.append("image", value);
              console.log('[DEBUG] Appended image as File:', value.name);
            } else if (typeof value === "string" && value) {
              // If updating and no new file, send the existing image URL
              formData.append("image", value);
              console.log('[DEBUG] Appended image as string (URL):', value);
            }
          } else if (Array.isArray(value) || typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        let response;
        if (editingId) {
          response = await axios.put(`${baseUrl}/product-category-card/${editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log('[DEBUG] Update response:', response.data);
          toast({
            title: "Product card updated",
            description: `${data.title} has been updated successfully`,
          });
        } else {
          response = await axios.post(`${baseUrl}/product-category-card`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log('[DEBUG] Add response:', response.data);
          if (!response.data || !response.data.productCard) {
            toast({
              title: "Add failed",
              description: `No product was created. Backend response: ${JSON.stringify(response.data)}`,
            });
          } else {
            toast({
              title: "Product card added",
              description: `${data.title} has been added successfully`,
            });
          }
        }
        resetForm();
        fetchCards();
      } catch (err: any) {
        // Debug: log the error
        console.error('[DEBUG] Add/Update error:', err, err?.response?.data);
        toast({
          title: "Operation failed",
          description: err?.response?.data?.message || err?.message || JSON.stringify(err),
        });
      } finally {
        setIsUploading(false);
      }
    }
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

  // UPDATED API BASE URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api";

  // Initialize form
  const form = useForm<FormValues, any, FormValues>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      offPrice: 0,
      variants: [],
      rating: 4.5,
      reviewCount: 0,
      sku: "",
      category: "clothing",
      isBestSeller: false,
    }
  });

  async function handleEdit(card: ProductCard) {
    setEditingId(card._id);
    form.reset({
      title: card.title,
      description: card.description || "",
      price: card.price,
      offPrice: card.offPrice || 0,
      variants: card.variants || [],
      rating: card.rating ?? 4.5,
      reviewCount: card.reviewCount ?? 0,
      sku: card.sku || "",
      category: card.category as any,
      isBestSeller: card.isBestSeller ?? false,
      isTodayDeal: card.isTodayDeal ?? false,
      image: card.image || "",
      shippingDate: card.shippingDate || "",
      shippingPrice: card.shippingPrice || 0,
      shippingPercent: card.shippingPercent || 0,
      color: card.color || [],
      size: card.size || [],
      stock: card.stock || 0,
    });
    setSelectedColors(card.color || []);
    setSelectedSizes(card.size || []);
    if (card.image) {
      setPreviewImage(card.image);
    } else {
      setPreviewImage(null);
    }
    // Ensure form value for image is set to the existing image URL
    form.setValue("image", card.image || "");
    setIsDialogOpen(true);
  }

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      // UPDATED API ENDPOINT
      await axios.delete(`${baseUrl}/product-category-card/${id}`);
      toast({
        title: "Product card deleted",
        description: "The product card has been removed successfully",
      });
      fetchCards();
    } catch (err) {
      toast({
        title: "Failed to delete product card",
        description: "Please try again",
        // removed invalid toast variant
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
    }
  }

  // Helper to get total stock from variants or regular stock
  const getTotalStock = (card: ProductCard) => {
    if (Array.isArray(card.variants) && card.variants.length > 0) {
      return card.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return 0;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const safeCards = Array.isArray(cards) ? cards : [];
    const totalStock = safeCards.reduce((sum, card) => sum + getTotalStock(card), 0);
    const totalValue = safeCards.reduce((sum, card) => sum + (card.price * getTotalStock(card)), 0);
    return {
      total: safeCards.length,
      totalValue,
      totalStock,
      bestSellers: safeCards.filter(card => card.isBestSeller).length,
      todayDeals: safeCards.filter(card => card.isTodayDeal).length,
      lowStock: safeCards.filter(card => getTotalStock(card) > 0 && getTotalStock(card) < 10).length,
      outOfStock: safeCards.filter(card => getTotalStock(card) === 0).length,
      withVariants: safeCards.filter(card => card.variants && card.variants.length > 0).length,
    };
  }, [cards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    const safeCards = Array.isArray(cards) ? cards : [];
    let result = safeCards.filter(card => {
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
          case "with-variants": return card.variants && card.variants.length > 0;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesCategory && matchesTab;
    });

    return result.sort((a, b) => {
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
  }, [cards, searchTerm, selectedCategory, activeTab, sortConfig]);

  // Generate all variant combinations from selected colors and sizes
  const generateAllVariants = () => {
    const colors = form.getValues('color') || [];
    const sizes = form.getValues('size') || [];
    const variants: Variant[] = [];
    
    if (colors.length === 0 && sizes.length === 0) {
      variants.push({ color: "", size: "", stock: 0, price: 0 });
    } else if (colors.length > 0 && sizes.length > 0) {
      // Generate matrix of all color-size combinations
      colors.forEach(color => {
        sizes.forEach(size => {
          variants.push({ color, size, stock: 0, price: 0 });
        });
      });
    } else if (colors.length > 0) {
      // Only colors
      colors.forEach(color => {
        variants.push({ color, size: "", stock: 0, price: 0 });
      });
    } else if (sizes.length > 0) {
      // Only sizes
      sizes.forEach(size => {
        variants.push({ color: "", size, stock: 0, price: 0 });
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

  // Update variant stock
  const updateVariantStock = (index: number, stock: number) => {
    const variants = form.getValues('variants') || [];
    const newVariants = [...variants];
    newVariants[index].stock = stock;
    form.setValue('variants', newVariants);
  };

  // Update variant price adjustment
  const updateVariantPrice = (index: number, priceAdjustment: number) => {
    const variants = form.getValues('variants') || [];
    const newVariants = [...variants];
    // removed priceAdjustment assignment (no longer in schema)
    form.setValue('variants', newVariants);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    const variants = form.getValues('variants') || [];
    const newVariants = variants.filter((_, i) => i !== index);
    form.setValue('variants', newVariants);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Product Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage products with color & size variants and stock tracking
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchCards} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Product Card" : "Add New Product Card"}
                </DialogTitle>
                <DialogDescription>
                  Manage product details, variants, colors, sizes, and stock levels
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                    // Show a toast if validation fails
                    toast({
                      title: "Form validation failed",
                      description: Object.values(errors).map(e => e?.message || "").join("; ") || "Please check all required fields.",
                    });
                    // eslint-disable-next-line no-console
                    console.error("Form validation errors:", errors);
                  })}
                  className="space-y-6"
                >
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
                                  <Input
                                    placeholder="Enter product title"
                                    value={typeof field.value === 'string' ? field.value : ''}
                                    onChange={field.onChange}
                                  />
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
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="Enter product price"
                                    value={typeof field.value === 'number' ? field.value : ''}
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
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
                                <FormLabel>Off Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="Enter discounted price (optional)"
                                    value={typeof field.value === 'number' ? field.value : ''}
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                  <Input
                                    placeholder="e.g., PROD-001"
                                    value={typeof field.value === 'string' ? field.value : ''}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Unique product identifier
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Price, stock, and discount fields removed as requested */}
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
                                  defaultValue={typeof field.value === 'string' ? String(field.value) : undefined}
                                  value={typeof field.value === 'string' ? String(field.value) : undefined}
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

                    {/* Variants Tab */}
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
                                {getSizeOptions(form.getValues('category') || selectedCategory).map((size) => {
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
                                  {Array.isArray(field.value) && field.value.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="text-left text-xs text-muted-foreground border-b">
                                            <th className="p-2">Color</th>
                                            <th className="p-2">Size</th>
                                            <th className="p-2">Stock</th>
                                            <th className="p-2">Price</th>
                                            <th className="p-2">SKU</th>
                                            <th className="p-2"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {Array.isArray(field.value) && (field.value as Variant[]).every(v => v && typeof v === 'object' && !Array.isArray(v))
                                            ? (field.value as Variant[]).map((variant, idx) => {
                                                if (!variant || typeof variant !== 'object') return null;
                                                return (
                                                  <tr key={idx} className="border-b hover:bg-muted/30">
                                                    <td className="p-2">
                                                      <Select
                                                        value={typeof variant.color === 'string' ? variant.color : "none"}
                                                        onValueChange={val => {
                                                          const newVariants = Array.isArray(field.value) && (field.value as Variant[]).every(v => v && typeof v === 'object' && !Array.isArray(v)) ? [...(field.value as Variant[])] : [];
                                                          if (newVariants[idx] && typeof newVariants[idx] === 'object') {
                                                            newVariants[idx] = { ...newVariants[idx], color: val };
                                                            field.onChange(newVariants);
                                                          }
                                                        }}
                                                      >
                                                        <SelectTrigger className="border-0 shadow-none h-8">
                                                          <SelectValue placeholder="Color" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="none">No Color</SelectItem>
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
                                                        value={typeof variant.size === 'string' ? variant.size : "none"}
                                                        onValueChange={val => {
                                                          const newVariants = Array.isArray(field.value) && (field.value as Variant[]).every(v => v && typeof v === 'object' && !Array.isArray(v)) ? [...(field.value as Variant[])] : [];
                                                          if (newVariants[idx] && typeof newVariants[idx] === 'object') {
                                                            newVariants[idx] = { ...newVariants[idx], size: val };
                                                            field.onChange(newVariants);
                                                          }
                                                        }}
                                                      >
                                                        <SelectTrigger className="border-0 shadow-none h-8">
                                                          <SelectValue placeholder="Size" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="none">No Size</SelectItem>
                                                          {getSizeOptions(form.getValues('category') || selectedCategory).map(size => (
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
                                                        className="h-8 w-32 md:w-48"
                                                        value={typeof variant.stock === 'number' ? variant.stock : 0}
                                                        onChange={e => {
                                                          const newVariants = Array.isArray(field.value) && (field.value as Variant[]).every(v => v && typeof v === 'object' && !Array.isArray(v)) ? [...(field.value as Variant[])] : [];
                                                          if (newVariants[idx] && typeof newVariants[idx] === 'object') {
                                                            newVariants[idx] = { ...newVariants[idx], stock: parseInt(e.target.value) || 0 };
                                                            field.onChange(newVariants);
                                                          }
                                                        }}
                                                      />
                                                    </td>
                                                    <td className="p-2">
                                                      <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        className="h-8 w-32 md:w-48"
                                                        value={typeof variant.price === 'number' ? variant.price : ''}
                                                        onChange={e => {
                                                          const newVariants = Array.isArray(field.value) && (field.value as Variant[]).every(v => v && typeof v === 'object' && !Array.isArray(v)) ? [...(field.value as Variant[])] : [];
                                                          if (newVariants[idx] && typeof newVariants[idx] === 'object') {
                                                            newVariants[idx] = { ...newVariants[idx], price: parseFloat(e.target.value) || 0 };
                                                            field.onChange(newVariants);
                                                          }
                                                        }}
                                                      />
                                                    </td>
                                                    <td className="p-2">
                                                      <Input
                                                        placeholder="SKU (spaces allowed)"
                                                        className="h-8 w-40 md:w-60"
                                                        value={typeof variant.sku === 'string' ? variant.sku : ""}
                                                        onChange={e => {
                                                          const newVariants = Array.isArray(field.value) && (field.value as Variant[]).every(v => v && typeof v === 'object' && !Array.isArray(v)) ? [...(field.value as Variant[])] : [];
                                                          if (newVariants[idx] && typeof newVariants[idx] === 'object') {
                                                            newVariants[idx] = { ...newVariants[idx], sku: e.target.value.replace(/^\s+|\s+$/g, "") };
                                                            field.onChange(newVariants);
                                                          }
                                                        }}
                                                      />
                                                    </td>
                                                    <td className="p-2">
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => removeVariant(idx)}
                                                      >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                      </Button>
                                                    </td>
                                                  </tr>
                                                );
                                              })
                                            : null}
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
                                      onClick={() => field.onChange([...(Array.isArray(field.value) ? field.value : []), { color: "", size: "", stock: 0, price: 0 }])}
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
                                Manage price and stock for each color, size, or combination. Each variant can have its own SKU.
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
                                      value={typeof field.value === 'string' || typeof field.value === 'number' ? field.value : ''}
                                      onChange={e => field.onChange(e.target.value)}
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
                                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      value={typeof field.value === 'number' ? field.value : ''}
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
                                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      value={typeof field.value === 'number' ? field.value : ''}
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
                                      value={typeof field.value === 'number' ? field.value : ''}
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
                                    checked={typeof field.value === 'boolean' ? field.value : false}
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
                                    checked={typeof field.value === 'boolean' ? field.value : false}
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
                          {editingId ? "Update Product" : "Add Product"}
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-3xl font-bold mt-2">{stats.totalStock}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <PackageCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Variants</p>
                <p className="text-3xl font-bold mt-2">{stats.withVariants}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <Layers className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold mt-2">{stats.lowStock}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/20">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border shadow-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                {filteredCards.length} products • {stats.totalStock} total units in stock
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="best-seller">
                <Star className="h-4 w-4 mr-2" />
                Best Seller
              </TabsTrigger>
              <TabsTrigger value="today-deals">
                <Zap className="h-4 w-4 mr-2" />
                Today's Deals
              </TabsTrigger>
              <TabsTrigger value="with-variants">
                <Layers className="h-4 w-4 mr-2" />
                With Variants
              </TabsTrigger>
              <TabsTrigger value="low-stock">
                <AlertTriangle className="h-4 w-4 mr-2" />
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
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-24 w-24 text-muted-foreground mb-6" />
              <h3 className="text-2xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== "all" || activeTab !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first product"
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Product
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => {
                const discount = calculateDiscount(card.price, card.offPrice);
                const totalStock = getTotalStock(card);
                
                return (
                  <Card key={card._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Image Section */}
                    <div className="relative h-56 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {card.image ? (
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {card.isBestSeller && (
                          <Badge className="bg-amber-500 text-white">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Best Seller
                          </Badge>
                        )}
                        {card.isTodayDeal && (
                          <Badge className="bg-red-500 text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            Today's Deal
                          </Badge>
                        )}
                        {discount > 0 && (
                          <Badge className="bg-green-500 text-white">
                            -{discount}% OFF
                          </Badge>
                        )}
                      </div>
                      
                      {/* Stock Indicator */}
                      <div className="absolute top-3 right-3">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${totalStock === 0 
                            ? 'bg-red-100 text-red-600' 
                            : totalStock < 10 
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-green-100 text-green-600'
                          }
                        `}>
                          {totalStock} units
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge 
                          className="text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[card.category] || '#6b7280' }}
                        >
                          {CATEGORY_LABELS[card.category] || card.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <CardContent className="p-5">
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg line-clamp-1">
                            {card.title}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{card.rating?.toFixed(1) || "4.5"}</span>
                            <span className="text-xs text-muted-foreground">
                              ({card.reviewCount?.toLocaleString() || 0})
                            </span>
                          </div>
                        </div>
                        
                        {card.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {card.description}
                          </p>
                        )}
                        
                        {/* Variants Display */}
                        {card.variants && card.variants.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Variants:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(card.variants.map(v => v.color).filter(Boolean))).slice(0, 3).map(color => {
                                const colorInfo = COMMON_COLORS.find(c => c.value === color);
                                return (
                                  <div key={color} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
                                    <div 
                                      className="h-3 w-3 rounded-full border"
                                      style={{ backgroundColor: colorInfo?.hex || color }}
                                    />
                                    <span className="text-xs">{color}</span>
                                  </div>
                                );
                              })}
                              {Array.from(new Set(card.variants.map(v => v.size).filter(Boolean))).slice(0, 3).map(size => (
                                <Badge key={size} variant="outline" className="text-xs">
                                  {size}
                                </Badge>
                              ))}
                              {card.variants.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{card.variants.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {card.offPrice && card.offPrice < card.price ? formatPrice(card.offPrice) : formatPrice(card.price)}
                          </span>
                          {card.offPrice && card.offPrice < card.price && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(card.price)}
                              </span>
                              <span className="ml-2 text-xs font-semibold text-green-600">
                                -{discount}%
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* SKU */}
                        {card.sku && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground font-mono">
                              SKU: {card.sku}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Actions */}
                    <CardFooter className="p-5 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{card.title}" and all its variants? This action cannot be undone.
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
          ) : (
            // List View
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
                          <Badge 
                            variant="outline"
                            style={{ backgroundColor: CATEGORY_COLORS[card.category] + '20' }}
                          >
                            {CATEGORY_LABELS[card.category] || card.category}
                          </Badge>
                          {card.isBestSeller && (
                            <Badge variant="default" className="bg-amber-500">
                              <TrendingUp className="h-3 w-3 mr-1" />
                            </Badge>
                          )}
                          {card.isTodayDeal && (
                            <Badge variant="destructive">
                              <Zap className="h-3 w-3 mr-1" />
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-semibold">
                            {card.offPrice && card.offPrice < card.price ? formatPrice(card.offPrice) : formatPrice(card.price)}
                            {discount > 0 && (
                              <>
                                <span className="ml-2 line-through">
                                  {formatPrice(card.price)}
                                </span>
                                <span className="ml-2 text-xs font-semibold text-green-600">
                                  -{discount}%
                                </span>
                              </>
                            )}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            totalStock === 0 
                              ? 'bg-red-100 text-red-600' 
                              : totalStock < 10 
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-green-100 text-green-600'
                          }`}>
                            {totalStock} units
                          </div>
                          
                          {card.variants && card.variants.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              <span className="text-xs">
                                {card.variants.length} variants
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{card.rating?.toFixed(1) || "4.5"}</span>
                          </div>
                          
                          {card.sku && (
                            <span className="text-xs font-mono ml-auto">
                              {card.sku}
                            </span>
                          )}
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}