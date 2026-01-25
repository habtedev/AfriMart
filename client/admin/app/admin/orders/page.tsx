"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Package, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download,
  MoreVertical
} from 'lucide-react';
import OrderStatusUpdate from '../../../components/shared/order-status/OrderStatusUpdate';
import { getOrderStatusConfig, ORDER_STATUS_OPTIONS } from '../../../components/shared/order-status';
import { format } from 'date-fns';

interface Order {
  _id: string;
  orderId: string;
  tx_ref: string;
  userId: string;
  items: any[];
  shippingAddress: any;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  customerEmail?: string;
  customerName?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const fetchOrders = async (): Promise<Order[]> => {
  const url = `${API_BASE_URL}/order`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Cache-Control': 'no-cache'
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.orders)) {
    return data.orders;
  } else {
    return [];
  }
};


const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const url = `${API_BASE_URL}/orders/${orderId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update order: ${res.status}`);
  }
  return await res.json();
};

const exportOrdersToCSV = (orders: Order[]) => {
  const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Total', 'Payment', 'Items'];
  const csvContent = [
    headers.join(','),
    ...orders.map(order => [
      order.orderId || order._id.slice(-8),
      format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm'),
      order.customerName || order.shippingAddress?.fullName || 'N/A',
      order.status,
      '', // Hide price
      order.paymentStatus,
      order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const OrdersPage: React.FC = () => {
  // Normalize order data to handle legacy and new formats
  const normalizeOrder = (order: any): Order => ({
    _id: order._id || order.id || order.orderId || order.tx_ref || `order-${Date.now()}`,
    orderId: order.orderId || order._id || order.id || order.tx_ref,
    tx_ref: order.tx_ref || order.orderId || order._id || order.id,
    createdAt: order.createdAt || order.date || new Date().toISOString(),
    status: (order.status || order.paymentStatus || 'pending').toLowerCase(),
    totalAmount: order.totalAmount ?? order.total ?? 0,
    customerName: order.customerName || order.shippingAddress?.fullName || '',
    customerEmail: order.customerEmail || order.email || '',
    items: Array.isArray(order.items) ? order.items : [],
    shippingAddress: order.shippingAddress,
    ...order
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');

  // Calculate statistics
  const stats = useMemo((): OrderStats => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return safeOrders.reduce((acc, order) => {
      acc.total++;
      acc[order.status as keyof OrderStats] = (acc[order.status as keyof OrderStats] || 0) + 1;
      return acc;
    }, {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    });
  }, [orders]);

  // Fetch orders with error handling
  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchOrders();
      // If backend returns { success, orders, ... }, use data.orders, else fallback to data
      const ordersArray = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
      // Normalize all orders for consistent display
      const normalizedOrders = ordersArray.map(normalizeOrder);
      setOrders(normalizedOrders);
      setFilteredOrders(normalizedOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      // Debug log removed
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  // Apply filters and search
  useEffect(() => {
    let result = Array.isArray(orders) ? [...orders] : [];
    
    // Apply search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(order => 
        (order.orderId || order._id).toLowerCase().includes(query) ||
        (order.customerName || order.shippingAddress?.fullName || '').toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query) ||
        order.tx_ref?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount':
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });
    
    setFilteredOrders(result);
  }, [orders, search, statusFilter, sortBy]);

  const handleUpdate = async (orderId: string, status: string) => {
    try {
      // Always send status in uppercase to match backend enum
      const patchRes = await updateOrderStatus(orderId, status.toUpperCase());
      console.debug('[Admin] PATCH /order status response:', patchRes);
      // If the response has an 'order' field, use it; otherwise fallback
      const updatedOrder = patchRes && patchRes.order ? patchRes.order : patchRes;
      console.debug('[Admin] Updated order object:', updatedOrder);
      setOrders(prev => {
        const newOrders = prev.map(o => o._id === orderId ? updatedOrder : o);
        console.debug('[Admin] Orders state after update:', newOrders);
        return newOrders;
      });
      if (selected && selected._id === orderId) {
        setSelected(updatedOrder);
        console.debug('[Admin] Selected order after update:', updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
      console.error('[Admin] Status update error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!dateString || isNaN(date.getTime())) return 'N/A';
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const getStatusColor = (status: string) => {
    const config = getOrderStatusConfig(status);
    return config.color || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and track customer orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportOrdersToCSV(orders)}
                className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Clock size={12} /> Pending
              </div>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Package size={12} /> Processing
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Package size={12} /> Shipped
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <CheckCircle size={12} /> Delivered
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <AlertCircle size={12} /> Cancelled
              </div>
              <div className="text-2xl font-bold text-rose-600">{stats.cancelled}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-zinc-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {ORDER_STATUS_OPTIONS.map(status => {
                    const config = getOrderStatusConfig(status);
                    return (
                      <option key={status} value={status}>
                        {config.label}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount">Highest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Orders ({filteredOrders.length})
                </h2>
              </div>
              <AnimatePresence>
                {(!Array.isArray(filteredOrders) || filteredOrders.length === 0) ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center"
                  >
                    <Package className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-zinc-700 max-h-[600px] overflow-y-auto">
                    {(Array.isArray(filteredOrders) ? filteredOrders : []).map((order, idx) => (
                      <motion.div
                        key={order._id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/50 ${
                          selected?._id === order._id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                            : ''
                        }`}
                        onClick={() => setSelected(order)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {order.orderId || (order._id && typeof order._id === 'string' ? `ORD-${order._id.slice(-8).toUpperCase()}` : 'UNKNOWN')}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {getOrderStatusConfig(order.status).label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {order.customerName || order.shippingAddress?.fullName || 'Customer'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatDate(order.createdAt)}</span>
                              <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                          <ChevronRight 
                            size={20} 
                            className={`text-gray-400 transition-transform ${
                              selected?._id === order._id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <OrderStatusUpdate order={selected} onUpdate={handleUpdate} />
                  {/* Tracking Link */}
                  <div className="mt-6 text-center">
                    <a
                      href={`https://afrimart.com/track/${selected.tx_ref || selected.orderId || selected._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Track Order
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-8 text-center"
                >
                  <Package className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Order Selected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Select an order from the list to view details and update status
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Click on any order to view details</p>
                    <p>• Use filters to find specific orders</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;