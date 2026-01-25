"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical,
  Upload,
  RefreshCw,
  ArrowUpDown,
  Filter,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { format } from "date-fns";

// API Types
interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description?: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// API functions (replace with real API calls)
const fetchCarousels = async (): Promise<CarouselItem[]> => {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
          title: "Summer Collection 2024",
          description: "Discover our new summer collection with exclusive offers",
          link: "/collections/summer-2024",
          buttonText: "Shop Now",
          isActive: true,
          order: 1,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-20T14:45:00Z",
        },
        {
          id: "2",
          image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a",
          title: "Limited Time Offer",
          description: "Get 50% off on selected items this week only",
          link: "/sales/flash-sale",
          buttonText: "Grab Deal",
          isActive: true,
          order: 2,
          createdAt: "2024-01-10T09:15:00Z",
          updatedAt: "2024-01-18T11:20:00Z",
        },
        {
          id: "3",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
          title: "New Arrivals",
          description: "Check out our latest products just arrived",
          link: "/new-arrivals",
          buttonText: "Explore",
          isActive: false,
          order: 3,
          createdAt: "2024-01-05T14:20:00Z",
          updatedAt: "2024-01-12T16:30:00Z",
        },
      ]);
    }, 500);
  });
};

const createCarousel = async (data: Partial<CarouselItem>): Promise<CarouselItem> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...data,
        image: data.image || "",
        title: data.title || "",
        isActive: data.isActive ?? true,
        order: data.order || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as CarouselItem);
    }, 300);
  });
};

const updateCarousel = async (id: string, data: Partial<CarouselItem>): Promise<CarouselItem> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      } as CarouselItem);
    }, 300);
  });
};

const deleteCarousel = async (id: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 300);
  });
};

export default function CarouselAdminPage() {
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState<Partial<CarouselItem>>({
    image: "",
    title: "",
    description: "",
    link: "",
    buttonText: "Learn More",
    isActive: true,
    order: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [carouselToDelete, setCarouselToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadCarousels();
  }, []);

  const loadCarousels = async () => {
    setLoading(true);
    try {
      const data = await fetchCarousels();
      setCarousels(data);
      toast({
        title: "Data loaded",
        description: `${data.length} carousel items found`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load carousel items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCarousels();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingId) {
        const updated = await updateCarousel(editingId, form);
        setCarousels(carousels.map(item => item.id === editingId ? updated : item));
        toast({
          title: "Success",
          description: "Carousel item updated successfully",
        });
      } else {
        const newItem = await createCarousel(form);
        setCarousels([...carousels, newItem]);
        toast({
          title: "Success",
          description: "Carousel item created successfully",
        });
      }
      
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save carousel item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (carousel: CarouselItem) => {
    setEditingId(carousel.id);
    setForm({
      image: carousel.image,
      title: carousel.title,
      description: carousel.description,
      link: carousel.link,
      buttonText: carousel.buttonText,
      isActive: carousel.isActive,
      order: carousel.order,
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setCarouselToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!carouselToDelete) return;
    
    setLoading(true);
    try {
      await deleteCarousel(carouselToDelete);
      setCarousels(carousels.filter(item => item.id !== carouselToDelete));
      toast({
        title: "Deleted",
        description: "Carousel item removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete carousel item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setCarouselToDelete(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setLoading(true);
    try {
      const item = carousels.find(c => c.id === id);
      if (!item) return;
      
      const updated = await updateCarousel(id, { ...item, isActive: !item.isActive });
      setCarousels(carousels.map(item => item.id === id ? updated : item));
      toast({
        title: "Status Updated",
        description: `Carousel item ${!item.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      image: "",
      title: "",
      description: "",
      link: "",
      buttonText: "Learn More",
      isActive: true,
      order: carousels.length,
    });
  };

  const filteredCarousels = carousels.filter(carousel => {
    const matchesSearch = 
      carousel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carousel.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && carousel.isActive) ||
      (statusFilter === "inactive" && !carousel.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: carousels.length,
    active: carousels.filter(c => c.isActive).length,
    inactive: carousels.filter(c => !c.isActive).length,
  };

  if (loading && carousels.length === 0) {
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
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carousel Management</h1>
            <p className="text-muted-foreground">
              Manage homepage carousel banners ({carousels.length} total)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
            
            <Button
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              {previewMode ? (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  Close Preview
                </>
              ) : (
                <>
                  <PanelLeftOpen className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Carousel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Carousel Item" : "Add New Carousel Item"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId 
                      ? "Update the carousel banner details below."
                      : "Create a new carousel banner for your homepage."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter banner title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        placeholder="Order number"
                        value={form.order}
                        onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter banner description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        placeholder="https://example.com/image.jpg"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        required
                      />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="link">Link URL</Label>
                      <Input
                        id="link"
                        placeholder="/collection/summer"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="buttonText">Button Text</Label>
                      <Input
                        id="buttonText"
                        placeholder="Shop Now"
                        value={form.buttonText}
                        onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={form.isActive}
                        onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    
                    {form.image && (
                      <div className="text-sm text-muted-foreground">
                        <ImageIcon className="inline h-4 w-4 mr-1" />
                        Image preview available
                      </div>
                    )}
                  </div>
                  
                  {form.image && (
                    <div className="rounded-lg border p-4">
                      <Label>Image Preview</Label>
                      <div className="relative h-40 w-full mt-2 rounded overflow-hidden bg-muted">
                        <Image
                          src={form.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setOpenDialog(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingId ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Active on homepage
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently visible to users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Banners</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Hidden from homepage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {previewMode && (
          <Card>
            <CardHeader>
              <CardTitle>Carousel Preview</CardTitle>
              <CardDescription>
                This is how your carousel will appear on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
                {carousels.filter(c => c.isActive).length > 0 ? (
                  <div className="absolute inset-0">
                    <Image
                      src={carousels.filter(c => c.isActive)[0]?.image || "/placeholder.jpg"}
                      alt="Carousel Preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white max-w-lg">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {carousels.filter(c => c.isActive)[0]?.title}
                      </h3>
                      <p className="mb-4 opacity-90">
                        {carousels.filter(c => c.isActive)[0]?.description}
                      </p>
                      {carousels.filter(c => c.isActive)[0]?.link && (
                        <Button variant="secondary">
                          {carousels.filter(c => c.isActive)[0]?.buttonText || "Learn More"}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No active banners</h3>
                      <p className="text-muted-foreground">
                        Add and activate banners to see preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {carousels.filter(c => c.isActive).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === 0 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search banners by title or description..."
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
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Banners
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Active Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                      Inactive Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {}}>
                      By Order (Ascending)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      By Order (Descending)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      By Date Created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      Alphabetical
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carousel Table */}
        <Card>
          <CardHeader>
            <CardTitle>Carousel Banners</CardTitle>
            <CardDescription>
              {filteredCarousels.length} of {carousels.length} banners shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Preview</TableHead>
                  <TableHead>Title & Description</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarousels.map((carousel) => (
                  <TableRow key={carousel.id} className="group">
                    <TableCell>
                      <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted">
                        {carousel.image ? (
                          <Image
                            src={carousel.image}
                            alt={carousel.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{carousel.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {carousel.description || "No description"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {carousel.link ? (
                        <a
                          href={carousel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                          <LinkIcon className="mr-1 h-3 w-3" />
                          {carousel.buttonText || "View"}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No link</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{carousel.order}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 text-xs font-normal ${
                          carousel.isActive 
                            ? 'hover:bg-green-100 dark:hover:bg-green-900/30' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => handleToggleStatus(carousel.id)}
                        disabled={loading}
                      >
                        {carousel.isActive ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(carousel.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(carousel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Banner
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(carousel.id)}>
                            {carousel.isActive ? (
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
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(carousel.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Empty State */}
            {filteredCarousels.length === 0 && (
              <div className="py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No banners found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first carousel banner"}
                </p>
                {(!searchTerm && statusFilter === "all") && (
                  <Button onClick={() => setOpenDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Banner
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Carousel Banner</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this banner? This action cannot be undone.
                {carouselToDelete && (
                  <p className="mt-2 font-medium">
                    Banner: {carousels.find(c => c.id === carouselToDelete)?.title}
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}