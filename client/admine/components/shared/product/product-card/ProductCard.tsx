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
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  "best-seller",
  "coffees",
  "shoose",
  "today's deals",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "best-seller": "Best Seller",
  "coffees": "Coffees",
  "shoose": "Shoes",
  "today's deals": "Today's Deals",
};

const CATEGORY_COLORS: Record<string, string> = {
  "best-seller": "bg-amber-500",
  "coffees": "bg-rose-500",
  "shoose": "bg-blue-500",
  "today's deals": "bg-red-500",
};

// Zod schema for form validation
const formSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  
  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(1000000, "Price is too high"),
  
  offPrice: z.number()
    .optional(),
  
  stock: z.number()
    .min(0, "Stock cannot be negative")
    .max(10000, "Stock is too high"),
  
  rating: z.number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5")
    .default(4.5),

  reviewCount: z.number()
    .min(0, "Review count cannot be negative")
    .default(0),
  
  sku: z.string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be less than 50 characters")
    .optional(),
  
  category: z.enum(CATEGORY_OPTIONS),
  
  isBestSeller: z.boolean().default(false),
  isTodayDeal: z.boolean().default(false),
  
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductCard {
  _id: string;
  title: string;
  description?: string;
  price: number;
  offPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  sku?: string;
  category: string;
  isBestSeller: boolean;
  isTodayDeal: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}


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
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({key: 'createdAt', direction: 'desc'});
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api";

  // Workaround for react-hook-form/zodResolver type mismatch
  // Bypass react-hook-form/zodResolver type errors by casting to any
  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      offPrice: undefined,
      stock: 20,
      rating: 4.5,
      reviewCount: 0,
      sku: "",
      category: "best-seller",
      isBestSeller: false,
      isTodayDeal: false,
      image: undefined,
    },
  }) as any;

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
      })));
      toast({
        title: "Cards loaded",
        description: `${cardsArray.length} product cards found`,
      });
    } catch (err) {
      console.error("Fetch error:", err);
      toast({
        title: "Failed to load product cards",
        description: "Please check your connection and try again",
      });
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
      formData.append("stock", data.stock.toString());
      formData.append("rating", data.rating?.toString() || "4.5");
      formData.append("reviewCount", data.reviewCount?.toString() || "0");
      formData.append("sku", data.sku || "");
      formData.append("category", data.category);
      formData.append("isBestSeller", data.isBestSeller.toString());
      formData.append("isTodayDeal", data.isTodayDeal.toString());
      if (data.image) formData.append("image", data.image);

      if (editingId) {
        await axios.put(`${baseUrl}/product-cards/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Product card updated",
          description: `${data.title} has been updated successfully`,
        });
      } else {
        await axios.post(`${baseUrl}/product-cards`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Product card added",
          description: `${data.title} has been added successfully`,
        });
      }

      resetForm();
      fetchCards();
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({
        title: "Operation failed",
        description: err.response?.data?.message || "Please try again",
      });
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
      stock: card.stock,
      rating: card.rating ?? 4.5,
      reviewCount: card.reviewCount ?? 0,
      sku: card.sku || "",
      category: card.category as any,
      isBestSeller: typeof card.isBestSeller === 'boolean' ? card.isBestSeller : false,
      isTodayDeal: typeof card.isTodayDeal === 'boolean' ? card.isTodayDeal : false,
      image: undefined,
    });
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
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function resetForm() {
    setEditingId(null);
    form.reset();
    setPreviewImage(null);
  }

  function generateSKU() {
    const title = form.getValues("title");
    if (title) {
      const sku = title
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 8)
        + "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      form.setValue("sku", sku);
    }
  }

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => {
      const matchesSearch = 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || card.category === selectedCategory;
      
      const matchesTab = activeTab === "all" || 
        (activeTab === "best-seller" && card.isBestSeller) ||
        (activeTab === "today-deals" && card.isTodayDeal) ||
        (activeTab === "low-stock" && card.stock < 10) ||
        (activeTab === "out-of-stock" && card.stock === 0);
      
      return matchesSearch && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'price' || sortConfig.key === 'stock' || sortConfig.key === 'rating') {
        const aVal = a[sortConfig.key as keyof ProductCard] as number;
        const bVal = b[sortConfig.key as keyof ProductCard] as number;
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (sortConfig.key === 'title') {
        const aVal = a.title.toLowerCase();
        const bVal = b.title.toLowerCase();
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (sortConfig.key === 'createdAt') {
        const aVal = new Date(a.createdAt || 0).getTime();
        const bVal = new Date(b.createdAt || 0).getTime();
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

  // Statistics
  const stats = {
    total: cards.length,
    totalValue: cards.reduce((sum, card) => sum + (card.price * card.stock), 0),
    bestSellers: cards.filter(card => card.isBestSeller).length,
    todayDeals: cards.filter(card => card.isTodayDeal).length,
    lowStock: cards.filter(card => card.stock < 10 && card.stock > 0).length,
    outOfStock: cards.filter(card => card.stock === 0).length,
    totalReviews: cards.reduce((sum, card) => sum + (card.reviewCount || 0), 0),
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (price: number, offPrice?: number) => {
    if (!offPrice || offPrice >= price) return 0;
    return Math.round((1 - offPrice / price) * 100);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Cards Management</h1>
          <p className="text-muted-foreground">
            Manage all your product cards with complete CRUD operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchCards} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); form.reset(); setPreviewImage(null); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product Card" : "Add New Product Card"}</DialogTitle>
                <DialogDescription>
                  {editingId 
                    ? "Update the details of this product card" 
                    : "Create a new product card for your store"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...(form as any)}>
                <form onSubmit={(form as any).handleSubmit(handleSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    
                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                          <FormField
                            control={(form as any).control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Title *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter product title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={(form as any).control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter product description"
                                    className="min-h-37.5 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={(form as any).control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  SKU
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 text-xs"
                                    onClick={generateSKU}
                                  >
                                    Generate
                                  </Button>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Product SKU" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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

                          <FormField
                            control={(form as any).control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                          <FormField
                            control={(form as any).control}
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

                          <FormField
                            control={(form as any).control}
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
                                      placeholder="Optional discount price"
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

                          <FormField
                            control={(form as any).control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock Quantity *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="20"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={(form as any).control}
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

                          <FormField<FormValues>
                            control={(form as any).control}
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

                          <div className="space-y-4">
                            <FormLabel>Special Attributes</FormLabel>
                            <FormField
                              control={(form as any).control}
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

                            <FormField
                              control={(form as any).control}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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

      {/* Main Content */}
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
                      
                      {/* Stock & SKU */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${card.stock === 0 ? 'bg-red-500' : card.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
                          <span className={card.stock === 0 ? 'text-red-600 font-medium' : ''}>
                            {card.stock === 0 ? 'Out of stock' : `${card.stock} in stock`}
                          </span>
                        </div>
                        {card.sku && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {card.sku}
                          </span>
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
                          <span className={`text-sm ${card.stock === 0 ? 'text-red-500' : card.stock < 10 ? 'text-amber-500' : 'text-green-500'}`}>
                            {card.stock} in stock
                          </span>
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
                    <th className="text-left p-4 font-medium">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => setSortConfig({key: 'category', direction: sortConfig.key === 'category' && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                      >
                        Category
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => setSortConfig({key: 'price', direction: sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                      >
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => setSortConfig({key: 'stock', direction: sortConfig.key === 'stock' && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                      >
                        Stock
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">Rating</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => {
                    const discount = calculateDiscount(card.price, card.offPrice);
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
                            <div className={`h-2 w-2 rounded-full ${card.stock === 0 ? 'bg-red-500' : card.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
                            <span>{card.stock}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{card.rating?.toFixed(1) || "4.5"}</span>
                            <span className="text-xs text-muted-foreground">
                              ({card.reviewCount})
                            </span>
                          </div>
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
                                onClick={() => setCardToDelete(card._id)}
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
