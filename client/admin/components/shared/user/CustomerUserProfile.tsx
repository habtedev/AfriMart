"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  ChevronRight,
  Plus,
  ChevronLeft,
  ChevronRightIcon,
  FilterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive?: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive" | "suspended";
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusConfig = {
  active: { label: "Active", color: "bg-green-500", badge: "bg-green-100 text-green-800" },
  inactive: { label: "Inactive", color: "bg-gray-500", badge: "bg-gray-100 text-gray-800" },
  suspended: { label: "Suspended", color: "bg-red-500", badge: "bg-red-100 text-red-800" },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchCustomers = useCallback(async (showToast = false) => {
    if (showToast) {
      setIsRefreshing(true);
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiBase}/admin/customers?${params}`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch customers: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.customers && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      } else if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }

      if (data.meta) {
        setPaginationMeta(data.meta);
      }

      if (showToast) {
        toast.success("Customers data refreshed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load customers data");
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, limit, sortBy, sortOrder, searchQuery, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleStatusToggle = async (customerId: string, status: Customer["status"]) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiBase}/admin/customers/${customerId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Customer marked as ${status}`);
      fetchCustomers(true);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (customerId: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiBase}/admin/customers/${customerId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete customer");

      toast.success("Customer deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(true);
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchCustomers();
  };

  const handleExport = () => {
    toast.success("Exporting customer data...");
    // Implement export logic here
  };

  const filteredAndSortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Customer];
      let bValue: any = b[sortBy as keyof Customer];

      if (sortBy === "totalSpent") {
        aValue = a.totalSpent;
        bValue = b.totalSpent;
      } else if (sortBy === "totalOrders") {
        aValue = a.totalOrders;
        bValue = b.totalOrders;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [customers, sortBy, sortOrder]);

  if (loading && !isRefreshing) {
    return <CustomersListSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Customers</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                <Button onClick={() => fetchCustomers()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage and view all customer accounts
            {paginationMeta && (
              <span className="ml-2 text-sm">
                ({paginationMeta.total} total customers)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="totalOrders">Total Orders</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchCustomers(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <UserIcon className="h-12 w-12 mb-4 opacity-50" />
                      <p>No customers found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedCustomers.map((customer) => (
                  <TableRow key={customer._id || customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                          <AvatarFallback className="text-xs">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{customer.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusConfig[customer.status]?.badge || 'bg-gray-100 text-gray-800'} border-transparent`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${statusConfig[customer.status]?.color || 'bg-gray-500'} mr-2`}
                        />
                        {statusConfig[customer.status]?.label || customer.status || 'Unknown'}
                      </Badge>
                      <span className="ml-2">
                        {customer.isEmailVerified ? (
                          <span className="text-green-600 font-semibold">Email Verified</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Not Verified</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(`/admin/customer/${customer.id}`, '_blank')}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${customer.email}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            {customer.status !== "active" && (
                              <DropdownMenuItem onClick={() => handleStatusToggle(customer.id, "active")}> 
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Mark as Active
                              </DropdownMenuItem>
                            )}
                            {customer.status !== "inactive" && (
                              <DropdownMenuItem onClick={() => handleStatusToggle(customer.id, "inactive")}> 
                                <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                                Mark as Inactive
                              </DropdownMenuItem>
                            )}
                            {customer.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => handleStatusToggle(customer._id || customer.id, "suspended")}> 
                                <Shield className="mr-2 h-4 w-4 text-red-600" />
                                Suspend Account
                              </DropdownMenuItem>
                            )}
                            {customer.status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleStatusToggle(customer._id || customer.id, "active")}> 
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Un-Suspend Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(customer._id || customer.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {paginationMeta && paginationMeta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, paginationMeta.total)} of{" "}
            {paginationMeta.total} customers
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, paginationMeta.totalPages) }, (_, i) => {
                let pageNum;
                if (paginationMeta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= paginationMeta.totalPages - 2) {
                  pageNum = paginationMeta.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < paginationMeta.totalPages && setPage(page + 1)}
                  className={page >= paginationMeta.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{selectedCustomer?.name}</span>'s account
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCustomer && handleDelete(selectedCustomer.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CustomersListSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(6)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}