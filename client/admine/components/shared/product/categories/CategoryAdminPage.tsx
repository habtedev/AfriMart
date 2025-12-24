"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import CategoryAddForm, { FormValues } from "./CategoryAddForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Package,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Grid,
  List,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

// Set axios baseURL from .env if not already set
console.log("[DEBUG] NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
console.log("[DEBUG] axios.defaults.baseURL before:", axios.defaults.baseURL);
if (!axios.defaults.baseURL && process.env.NEXT_PUBLIC_API_BASE_URL) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("[DEBUG] axios.defaults.baseURL set to:", axios.defaults.baseURL);
}
else {
  console.log("[DEBUG] axios.defaults.baseURL already set:", axios.defaults.baseURL);
}

// Category options
const CATEGORY_OPTIONS = [
  "handcraft",
  "home-goods",
  "electronics",
  "best-seller",
  "clothing",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "handcraft": "Handcraft",
  "home-goods": "Home Goods",
  "electronics": "Electronics",
  "best-seller": "Best Seller",
  "clothing": "Clothing",
};

const CATEGORY_COLORS: Record<string, string> = {
  "handcraft": "bg-amber-100 text-amber-800 border-amber-200",
  "home-goods": "bg-blue-100 text-blue-800 border-blue-200",
  "electronics": "bg-purple-100 text-purple-800 border-purple-200",
  "best-seller": "bg-green-100 text-green-800 border-green-200",
  "clothing": "bg-pink-100 text-pink-800 border-pink-200",
};

type Category = {
  id: string | number;
  _id?: string | number;
  title: string;
  description?: string;
  slug?: string;
  image?: string;
  category: string;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
};


export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | number | null>(null);


  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || axios.defaults.baseURL || "";
      const url = baseUrl + "/products";

      const res = await axios.get(url);
      console.log("[DEBUG] API response:", res.data);
      setCategories(
        (res.data.products || []).map((cat: Category) => ({ ...cat, id: cat._id }))
      );
    } catch (err) {
      console.error("[DEBUG] Fetch error:", err);
      toast({ title: "Failed to load categories" });
    }
    setIsLoading(false);
  }

  async function handleAddCategory(newCat: FormValues & { imageFile?: File }) {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || axios.defaults.baseURL || "";
      const url = baseUrl + "/products";
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("title", newCat.title);
      if (newCat.description) formData.append("description", newCat.description);
      if (newCat.slug) formData.append("slug", newCat.slug);
      formData.append("category", newCat.category);
      formData.append("isActive", String(newCat.isActive));
      if (newCat.metaTitle) formData.append("metaTitle", newCat.metaTitle);
      if (newCat.metaDescription) formData.append("metaDescription", newCat.metaDescription);
      // Attach file if present
      if (newCat.imageFile) {
        formData.append("image", newCat.imageFile);
      }
      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({
        title: "Category added successfully",
        description: `Category has been added to your categories.`,
      });
      fetchCategories();
    } catch (err: any) {
      // Custom error for duplicate category
      if (err?.response?.data?.error?.includes('already exists')) {
        toast({
          title: "Category type already exists",
          description: `You can only add one category per type.`
        });
      } else {
        toast({ title: "Failed to add category" });
      }
    }
    setIsLoading(false);
  }

  async function handleDeleteCategory(id: string | number) {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || axios.defaults.baseURL || "";
      const url = baseUrl + `/products/${id}`;
      await axios.delete(url);
      setCategoryToDelete(null);
      toast({
        title: "Category deleted",
        description: "The category has been removed successfully."
      });
      fetchCategories();
    } catch (err) {
      toast({ title: "Failed to delete category" });
    }
    setIsLoading(false);
  }

  async function handleToggleStatus(id: string | number) {
    setIsLoading(true);
    try {
      const cat = categories.find(c => c.id === id);
      if (!cat) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || axios.defaults.baseURL || "";
      const url = baseUrl + `/products/${id}`;
      await axios.put(url, { ...cat, isActive: !cat.isActive });
      toast({
        title: "Status updated",
        description: "Category status has been updated.",
      });
      fetchCategories();
    } catch (err) {
      toast({ title: "Failed to update status" });
    }
    setIsLoading(false);
  }

  async function handleExportData() {
    // Simulate export functionality
    toast({
      title: "Export started",
      description: "Your categories data is being exported.",
    });
  }

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = 
      cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || cat.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: categories.length,
    active: categories.filter(cat => cat.isActive).length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage and organize your product categories ({categories.length} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new product category to organize your inventory.
                </DialogDescription>
              </DialogHeader>
              <CategoryAddForm onSubmit={handleAddCategory} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all category types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedCategory === "all" ? "All Types" : CATEGORY_LABELS[selectedCategory]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCategory("all" as string)}>
                    All Types
                  </DropdownMenuItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setSelectedCategory(option as string)}
                    >
                      {CATEGORY_LABELS[option]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none border-r"
                  onClick={() => setViewMode("list" as "list" | "grid")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("grid" as "list" | "grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table/Grid */}
      {viewMode === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle>Category List</CardTitle>
            <CardDescription>
              {filteredCategories.length} categories found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={cat.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{cat.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-50">
                            {cat.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={CATEGORY_COLORS[cat.category]}
                      >
                        {CATEGORY_LABELS[cat.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{cat.productCount}</div>
                      <div className="text-xs text-muted-foreground">products</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cat.isActive ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {cat.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cat.createdAt}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated {cat.updatedAt}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(cat.id)}>
                            {cat.isActive ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setCategoryToDelete(cat.id as string | number);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the category "{cat.title}"
                                  and remove it from your list. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        // Grid View
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden">
              <div className="relative h-48 w-full bg-muted">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge 
                  variant={cat.isActive ? "default" : "secondary"}
                  className="absolute top-3 right-3"
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{cat.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {cat.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline"
                    className={CATEGORY_COLORS[cat.category]}
                  >
                    {CATEGORY_LABELS[cat.category]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Products</div>
                    <div className="text-muted-foreground">{cat.productCount}</div>
                  </div>
                  <div>
                    <div className="font-medium">Created</div>
                    <div className="text-muted-foreground">{cat.createdAt}</div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setCategoryToDelete(cat.id as string | number)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{cat.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No categories found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first category"}
              </p>
              {(!searchTerm && selectedCategory === "all") && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryAddForm onSubmit={handleAddCategory} isLoading={isLoading} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}