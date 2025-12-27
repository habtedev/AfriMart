"use client";

import React, { useState, useEffect } from 'react';
import { useOrders } from '@/components/shared/order';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Package, 
  Filter, 
  Search, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock
} from 'lucide-react';

// Import components (adjust path as needed)
import OrderList from '@/components/shared/order/OrderList';
import OrderDetails from '@/components/shared/order/OrderDetails';

const OrdersPage = () => {
  const { orders, loading, error, refetch } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter and search orders
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        order.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Get unique statuses for filter
  const statuses = React.useMemo(() => {
    if (!orders) return [];
    const uniqueStatuses = new Set(orders.map(order => order.status).filter(Boolean));
    return Array.from(uniqueStatuses);
  }, [orders]);

  // Statistics
  const stats = React.useMemo(() => {
    if (!orders) return null;
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders,
      averageOrder: totalOrders > 0 ? totalSpent / totalOrders : 0
    };
  }, [orders]);

  // Error handling with retry
  const handleRetry = () => {
    refetch?.();
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedOrder(null);
  };

  // Handle order click
  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    // Scroll to top when viewing details
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Track order
  const handleTrackOrder = (orderId: string) => {
    // Implement tracking logic
    console.log('Tracking order:', orderId);
    // Could open a modal or redirect to tracking page
  };

  // Contact support
  const handleContactSupport = () => {
    // Implement support contact logic
    window.location.href = 'mailto:support@example.com';
  };

  // Print order
  const handlePrintOrder = (order: any) => {
    // Implement print logic
    console.log('Printing order:', order.id);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Skeleton Header */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>

          {/* Skeleton Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="h-12 flex-1 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton Orders */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Orders
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'There was an error loading your orders. Please try again.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedOrder ? (
            <motion.div
              key="orders-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <ShoppingBag className="w-8 h-8 text-blue-600" />
                      My Orders
                    </h1>
                    <p className="text-gray-600 mt-2">
                      View and manage all your purchases
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                    >
                      <Package className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                  >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.totalOrders}</div>
                          <div className="text-sm text-gray-500">Total Orders</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">ETB {stats.totalSpent.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Total Spent</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                          <div className="text-sm text-gray-500">Pending</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
                          <div className="text-sm text-gray-500">Delivered</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders by ID, name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <button className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    More Filters
                  </button>
                </div>

                {/* Orders Count */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                    </h2>
                    <button
                      onClick={() => refetch?.()}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length > 0 ? (
                <OrderList
                  orders={filteredOrders}
                  onOrderClick={handleOrderClick}
                  onTrackOrder={handleTrackOrder}
                  onContactSupport={handleContactSupport}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter to find what you\'re looking for.'
                      : 'You haven\'t placed any orders yet. Start shopping!'}
                  </p>
                  {searchTerm || statusFilter !== 'all' ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="order-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Orders
              </button>

              {/* Order Details */}
              <OrderDetails
                order={selectedOrder}
                onBack={handleBack}
                onTrackOrder={() => handleTrackOrder(selectedOrder.id)}
                onContactSupport={handleContactSupport}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/contact" className="hover:text-blue-600 transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-blue-600 transition-colors">
                    Order FAQ
                  </a>
                </li>
                <li>
                  <a href="/returns" className="hover:text-blue-600 transition-colors">
                    Returns & Refunds
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Order Management</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/track" className="hover:text-blue-600 transition-colors">
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a href="/cancel" className="hover:text-blue-600 transition-colors">
                    Cancel Order
                  </a>
                </li>
                <li>
                  <a href="/invoice" className="hover:text-blue-600 transition-colors">
                    Download Invoice
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Shopping</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-blue-600 transition-colors">
                    Continue Shopping
                  </a>
                </li>
                <li>
                  <a href="/wishlist" className="hover:text-blue-600 transition-colors">
                    Your Wishlist
                  </a>
                </li>
                <li>
                  <a href="/profile" className="hover:text-blue-600 transition-colors">
                    Account Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              For immediate assistance, call us at{' '}
              <a href="tel:+251911234567" className="text-blue-600 font-medium">
                +251 911 234 567
              </a>
              {' '}or email{' '}
              <a href="mailto:support@example.com" className="text-blue-600 font-medium">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;