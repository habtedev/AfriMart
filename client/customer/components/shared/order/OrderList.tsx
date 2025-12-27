import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Calendar, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

export interface OrderItem {
  id?: string;
  productId: string;
  title?: string;
  name?: string;
  image?: string;
  price: number;
  quantity: number;
  product?: {
    title?: string;
    name?: string;
    image?: string;
  };
}

export interface Order {
  id: string;
  _id?: string;
  orderId?: string;
  date: string;
  createdAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  paymentStatus?: string;
  total: number;
  totalAmount?: number;
  items: OrderItem[];
  itemCount?: number;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    phone: string;
  };
}

interface OrderListProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { 
  color: string; 
  bgColor: string; 
  icon: React.ReactNode;
  label: string;
}> = {
  pending: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending'
  },
  processing: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <Package className="w-4 h-4" />,
    label: 'Processing'
  },
  shipped: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: <Truck className="w-4 h-4" />,
    label: 'Shipped'
  },
  delivered: {
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Delivered'
  },
  cancelled: {
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Cancelled'
  }
};

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  onOrderClick,
  isLoading = false 
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No orders found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You haven't placed any orders yet.
        </p>
      </div>
    );
  }

  // Helper function to normalize order data
  const normalizeOrder = (order: Order): Order => {
    return {
      id: order.id || order._id || order.orderId || `order-${Date.now()}`,
      date: order.date || order.createdAt || new Date().toISOString(),
      status: order.status || order.paymentStatus || 'pending',
      total: order.total ?? order.totalAmount ?? 0,
      items: Array.isArray(order.items) ? order.items : [],
      itemCount: order.itemCount || (Array.isArray(order.items) ? order.items.length : 0),
      shippingAddress: order.shippingAddress,
      ...order
    };
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const handleOrderClick = (order: Order) => {
    if (onOrderClick) {
      onOrderClick(order);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      {orders.map((orderData) => {
        const order = normalizeOrder(orderData);
        const statusConfig = STATUS_CONFIG[order.status.toLowerCase()] || {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          icon: <Package className="w-4 h-4" />,
          label: order.status
        };
        const isExpanded = expandedOrderId === order.id;
        const hasShippingInfo = !!order.shippingAddress;

        return (
          <div
            key={order.id}
            className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-zinc-900"
          >
            {/* Order Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => toggleOrderExpand(order.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor} border ${statusConfig.color}`}>
                    {statusConfig.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(order.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ETB {order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-200 dark:border-zinc-700 p-4 space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.items.length > 0 ? (
                          order.items.map((item, idx) => {
                            const productName = item.title || item.name || item.product?.title || item.product?.name || 'Product';
                            const productImage = item.image || item.product?.image;
                            
                            return (
                              <div
                                key={item.productId || idx}
                                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800"
                              >
                                {productImage && (
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="w-16 h-16 object-cover rounded-lg"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="flex-grow">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {productName}
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <span>Qty: {item.quantity}</span>
                                    <span>•</span>
                                    <span>Price: ETB {typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</span>
                                    <span>•</span>
                                    <span className="font-medium">
                                      Subtotal: ETB {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No items found in this order
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Information */}
                    {hasShippingInfo && order.shippingAddress && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Shipping Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Recipient</div>
                            <div className="font-medium">{order.shippingAddress.fullName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
                            <div className="font-medium">{order.shippingAddress.phone}</div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Address</div>
                            <div className="font-medium">
                              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </button>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Total: ETB {order.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Including all taxes and fees
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;

// Note: You'll need to install framer-motion for animations:
// npm install framer-motion

// Import at top of file:
