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
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  "clothing",
  "electronics",
  "handcraft",
  "home-goods",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "clothing": "Clothing",
  "electronics": "Electronics",
  "handcraft": "Handcraft",
  "home-goods": "Home Goods",
};

const CATEGORY_COLORS: Record<string, string> = {
  "clothing": "bg-pink-500",
  "electronics": "bg-blue-500",
  "handcraft": "bg-amber-500",
  "home-goods": "bg-green-500",
};

// Zod schema for form validation
const formSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  
  price: z.number()
    .min(0, "Price must be 0 or greater")
    .max(100000, "Price is too high"),
  
  stock: z.number()
    .min(0, "Stock cannot be negative")
    .max(10000, "Stock is too high"),
  
  category: z.enum(CATEGORY_OPTIONS),
  
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductCard {
  _id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductCategoryCardAdminPage() {
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8500/api";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      stock: 0,
      category: "clothing",
      image: undefined,
    },
  });

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/product-category-card`);
      const data = res.data;
      // Correctly extract productCards array from backend response
      const cardsArray = Array.isArray(data?.productCards) ? data.productCards : [];
      setCards(cardsArray);
      toast({
        title: "Cards loaded",
        description: `${cardsArray.length} cards found`,
      });
    } catch (err) {
      console.error("Fetch error:", err);
        toast({
          title: "Failed to load cards",
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
      formData.append("category", data.category);
      formData.append("price", data.price.toString());
      formData.append("stock", data.stock.toString());
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      if (editingId) {
        await axios.put(`${baseUrl}/product-category-card/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Card updated",
          description: `${data.title} has been updated successfully`,
        });
      } else {
        await axios.post(`${baseUrl}/product-category-card`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Card added",
          description: `${data.title} has been added successfully`,
        });
      }

      form.reset();
      setEditingId(null);
      setPreviewImage(null);
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
      stock: card.stock,
      category: card.category as any,
      image: undefined,
    });
    if (card.image) {
      setPreviewImage(card.image);
    }
  }

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await axios.delete(`${baseUrl}/product-category-card/${id}`);
      toast({
        title: "Card deleted",
        description: "The card has been removed successfully",
      });
      fetchCards();
    } catch (err) {
        toast({
          title: "Failed to delete card",
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

  function handleCancelEdit() {
    setEditingId(null);
    form.reset();
    setPreviewImage(null);
  }

  // Filter cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const stats = {
    total: cards.length,
    totalValue: cards.reduce((sum, card) => sum + (card.price * card.stock), 0),
    lowStock: cards.filter(card => card.stock < 10).length,
    outOfStock: cards.filter(card => card.stock === 0).length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Cards Management</h1>
          <p className="text-muted-foreground">
            Manage your product category cards with full CRUD operations
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
                <TrendingUp className="h-5 w-5 text-green-500" />
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
              <div className="p-2 rounded-full bg-amber-500/10">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
              </div>
              <div className="p-2 rounded-full bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Card" : "Add New Card"}
            </CardTitle>
            <CardDescription>
              {editingId 
                ? "Update the details of this product card" 
                : "Create a new product category card"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter card title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter description" 
                          className="min-h-[100px] resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                              <div className={`flex items-center gap-2`}>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock *</FormLabel>
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


                {/* Category select with duplicate prevention is rendered below */}

                <div className="space-y-4">
                  <FormLabel>Image</FormLabel>
                  <div className="space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                    <FormDescription>
                      Upload a product image (optional)
                    </FormDescription>
                  </div>

                  {previewImage && (
                    <div className="relative aspect-video overflow-hidden rounded-lg border">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  {!previewImage && (
                    <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted/30">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No image selected
                        </p>
                      </div>
                    </div>
                  )}
                </div>

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
                        {editingId ? "Update Card" : "Add Card"}
                      </>
                    )}
                  </Button>
                  
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Column - Cards List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Product Cards</CardTitle>
                <CardDescription>
                  {filteredCards.length} of {cards.length} cards
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
                  <SelectTrigger className="w-[140px]">
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
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No cards found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first card"
                  }
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCards.map((card) => (
                  <Card key={card._id} className="overflow-hidden">
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
                      <Badge 
                        className="absolute top-2 right-2"
                        style={{ backgroundColor: CATEGORY_COLORS[card.category] }}
                      >
                        {CATEGORY_LABELS[card.category]}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-1">{card.title}</h3>
                        <span className="font-bold text-lg">
                          ETB {typeof card.price === 'number' && !isNaN(card.price) ? card.price.toLocaleString('en-ET', { minimumFractionDigits: 2 }) : '0.00'}
                        </span>
                      </div>
                      
                      {card.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${card.stock === 0 ? 'bg-red-500' : card.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
                          <span>{card.stock} in stock</span>
                        </div>
                        {card.createdAt && (
                          <span className="text-muted-foreground text-xs">
                            {new Date(card.createdAt).toLocaleDateString()}
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
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{card.title}" and remove it from your cards.
                                This action cannot be undone.
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
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredCards.map((card) => (
                  <div key={card._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                      
                      <div>
                        <h4 className="font-semibold">{card.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline"
                            style={{ backgroundColor: CATEGORY_COLORS[card.category] + '20' }}
                          >
                            {CATEGORY_LABELS[card.category]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ETB {typeof card.price === 'number' && !isNaN(card.price) ? card.price.toLocaleString('en-ET', { minimumFractionDigits: 2 }) : '0.00'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {card.stock} in stock
                          </span>
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
                            <AlertDialogTitle>Delete Card</AlertDialogTitle>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}