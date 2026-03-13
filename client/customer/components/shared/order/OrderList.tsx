
import React, { useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from './types';
import useSWR, { mutate } from 'swr';
import {
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';



const STATUS_CONFIG = {
  pending: { color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Pending' },
  processing: { color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: Package, label: 'Processing' },
  shipped: { color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200', icon: Truck, label: 'Shipped' },
  delivered: { color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-200', icon: AlertCircle, label: 'Cancelled' }
};




export const OrderList = forwardRef(function OrderList(props, ref) {
  const [expandedOrderId, setExpandedOrderId] = React.useState(null);
  const router = useRouter();
  const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  });
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}/api/order`;
  const { data, error, isLoading } = useSWR(url, fetcher, { revalidateOnFocus: true });
  let orders: Order[] = [];
  if (Array.isArray(data)) {
    orders = data;
  } else if (data && Array.isArray(data.orders)) {
    orders = data.orders;
  }

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: () => mutate(url)
  }), [url]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-lg text-zinc-500">Loading orders...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-lg text-red-500">{error.message || 'Failed to load orders'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-blue-600" />
            Order History
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Manage and track your recent purchases</p>
        </header>

        <div className="space-y-4">
          {orders.length > 0 ? orders.map((order, index) => {
            const isExpanded = expandedOrderId === order.id;
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;

            // Fallback for date
            const orderDate = order.date || order.createdAt || order.orderedAt || '';
            // Fallback for total: sum items + shipping if not present
            let total = typeof order.total === 'number' ? order.total : 0;
            if (!total && Array.isArray(order.items)) {
              total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              if (typeof order.shippingFee === 'number') total += order.shippingFee;
              if (typeof order.shipping === 'number') total += order.shipping;
            }

            return (
              <div
                key={order.id || `${orderDate}-${index}`}
                className={`bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 ${
                  isExpanded ? 'ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-800' : 'border-zinc-200 dark:border-zinc-800 shadow-sm'
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${status.bgColor} ${status.color}`}>
                      <StatusIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-400 font-mono">{order.id}</span>
                        <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                        Placed on {formatDate(orderDate)}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-xl font-black text-zinc-900 dark:text-white">ETB {typeof total === 'number' ? total.toLocaleString() : '0.00'}</p>
                    </div>
                    <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-zinc-300'}`}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expandable Body */}
                {isExpanded && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Items List */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Package size={14} />
                          Order Items ({order.itemCount})
                        </h4>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                            <div className="flex-grow">
                              <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{item.title}</p>
                              <p className="text-xs font-medium text-zinc-500">Qty: {item.quantity} • ETB {item.price.toLocaleString()}</p>
                            </div>
                            <p className="text-sm font-black text-zinc-900 dark:text-white">ETB {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Actions */}
                      <div className="space-y-6">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                          <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MapPin size={14} />
                            Shipping Details
                          </h4>
                          <div className="text-sm">
                            <p className="font-bold text-zinc-900 dark:text-white">{order.shippingAddress.fullName}</p>
                            <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                              {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                              {order.shippingAddress.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            className="flex-grow py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            onClick={() => {
                              const orderId = order.id || order._id || order.orderId;
                              if (orderId) {
                                router.push(`/orders/${orderId}`);
                              } else {
                                alert('Order ID not found.');
                              }
                            }}
                          >
                            View Full Details
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <AlertCircle size={48} className="text-zinc-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">No orders found</h3>
              <p className="text-zinc-500 text-sm font-medium mt-1">When you make a purchase, it will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});