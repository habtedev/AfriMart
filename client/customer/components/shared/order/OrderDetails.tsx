import React from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  DollarSign,
  Hash,
  User,
  Phone,
  Mail,
  Home,
  ChevronRight
} from 'lucide-react';
import { Order, OrderItem } from './OrderList';
import { motion } from 'framer-motion';

interface OrderDetailsProps {
  order: Order;
  onBack?: () => void;
  onTrackOrder?: (orderId: string) => void;
  onContactSupport?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Clock,
    label: 'Pending',
    description: 'Your order is being processed'
  },
  processing: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Package,
    label: 'Processing',
    description: 'Preparing your order'
  },
  shipped: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Truck,
    label: 'Shipped',
    description: 'Your order is on the way'
  },
  delivered: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Delivered',
    description: 'Order delivered successfully'
  },
  cancelled: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'Cancelled',
    description: 'Order has been cancelled'
  }
} as const;

const PAYMENT_STATUS_CONFIG = {
  paid: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Paid'
  },
  pending: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending'
  },
  failed: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Failed'
  }
} as const;

const OrderDetails: React.FC<OrderDetailsProps> = ({ 
  order, 
  onBack,
  onTrackOrder,
  onContactSupport 
}) => {
  // Normalize order data
  const normalizedOrder: Order = {
    ...order,
    id: order.id || order._id || order.orderId || 'N/A',
    date: order.date || order.createdAt || 'N/A',
    status: order.status || order.paymentStatus || 'pending',
    total: order.total ?? order.totalAmount ?? 0,
    items: Array.isArray(order.items) ? order.items : []
  };

  const statusKey = normalizedOrder.status.toLowerCase() as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const paymentStatus = normalizedOrder.paymentStatus?.toLowerCase() as keyof typeof PAYMENT_STATUS_CONFIG || 'pending';
  const paymentConfig = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.pending;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        full: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        short: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch {
      return { full: dateString, short: dateString.slice(0, 10), time: '' };
    }
  };

  const formattedDate = formatDate(normalizedOrder.date);

  // Calculate totals
  const subtotal = normalizedOrder.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  const shipping = normalizedOrder.shippingFee || 0;
  const tax = normalizedOrder.tax || subtotal * 0.08;
  const total = normalizedOrder.total || subtotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header with Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-700"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Order #{normalizedOrder.id.slice(-8).toUpperCase()}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Placed on {formattedDate.full}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                  <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                  <span className={`font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${paymentConfig.bgColor} ${paymentConfig.borderColor} border`}>
                  <CreditCard className={`w-4 h-4 ${paymentConfig.color}`} />
                  <span className={`font-semibold ${paymentConfig.color}`}>
                    Payment {paymentConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Description */}
            <div className={`p-4 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                <div>
                  <p className={`font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-700"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items ({normalizedOrder.items.length})
            </h2>

            <div className="space-y-4">
              {normalizedOrder.items.length > 0 ? (
                normalizedOrder.items.map((item, index) => {
                  const productName = item.title || item.name || item.product?.title || item.product?.name || 'Product';
                  const productImage = item.image || item.product?.image;
                  
                  return (
                    <div
                      key={item.productId || index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {productImage && (
                        <div className="relative flex-shrink-0">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {productName}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>SKU: {item.productId?.slice(-6) || 'N/A'}</span>
                              <span>•</span>
                              <span>Quantity: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              ETB {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ETB {typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items found in this order</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Shipping Information */}
          {normalizedOrder.shippingAddress && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recipient</div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{normalizedOrder.shippingAddress.fullName}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{normalizedOrder.shippingAddress.phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shipping Address</div>
                  <div className="flex items-start gap-2 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <Home className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{normalizedOrder.shippingAddress.street}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {normalizedOrder.shippingAddress.city}, {normalizedOrder.shippingAddress.state}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {normalizedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Order Summary & Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-700"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">ETB {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium">ETB {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium">ETB {tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-zinc-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600 dark:text-blue-400">ETB {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Number</span>
                <span className="font-mono font-semibold">{normalizedOrder.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Date</span>
                <span className="font-medium">{formattedDate.short}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Time</span>
                <span className="font-medium">{formattedDate.time}</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-700"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Actions</h3>
            
            <div className="space-y-3">
              {onTrackOrder && normalizedOrder.status !== 'cancelled' && (
                <button
                  onClick={() => onTrackOrder(normalizedOrder.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Truck className="w-4 h-4" />
                  Track Order
                </button>
              )}

              {onContactSupport && (
                <button
                  onClick={onContactSupport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                >
                  <Phone className="w-4 h-4" />
                  Contact Support
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Print Invoice
              </button>

              {normalizedOrder.status === 'delivered' && (
                <button
                  onClick={() => {
                    // Handle reorder logic
                    alert('Reorder functionality would be implemented here');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Reorder Items
                </button>
              )}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-700"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Timeline</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-500">{formattedDate.short} • {formattedDate.time}</p>
                </div>
              </div>

              {normalizedOrder.status === 'processing' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-gray-500">Preparing your items</p>
                  </div>
                </div>
              )}

              {normalizedOrder.status === 'shipped' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Shipped</p>
                    <p className="text-sm text-gray-500">On its way to you</p>
                  </div>
                </div>
              )}

              {normalizedOrder.status === 'delivered' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm text-gray-500">Successfully delivered</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>
          Need help? Contact our support team at{' '}
          <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
            support@example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;