import React, { useState } from 'react';
import { ORDER_STATUS_OPTIONS, getOrderStatusConfig } from './index';

// Import shadcn/ui components from their specific paths
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Order {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    product: {
      title: string;
      id: string;
    };
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    fullName: string;
    city: string;
    phone: string;
  };
  paymentStatus?: string;
}

interface OrderStatusUpdateProps {
  order: Order;
  onUpdate: (orderId: string, status: string) => Promise<void>;
}

const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({ order, onUpdate }) => {
  const [status, setStatus] = useState(order.status || 'pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const statusConfig = getOrderStatusConfig(status);
  const currentStatusConfig = getOrderStatusConfig(order.status);

  const handleUpdate = async () => {
    // Prevent updating to the same status (case-insensitive)
    if (status.toLowerCase() === (order.status || '').toLowerCase()) {
      setError("Status is already set to this value");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onUpdate(order._id, status);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      // Log full error object and message for debugging
      console.error('[OrderStatusUpdate] Status update error:', err);
      setError(err?.message || (typeof err === 'string' ? err : 'Failed to update status'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const config = getOrderStatusConfig(status);
    switch (config.variant) {
      case 'default': return 'bg-gray-100 text-gray-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      case 'destructive': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalItems = () => {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Order #{order.orderId ? order.orderId : (typeof order._id === 'string' && order._id ? `ORD-${order._id.slice(-6)}` : 'UNKNOWN')}
              <Badge variant={currentStatusConfig.variant as any} className="ml-2">
                {currentStatusConfig.label}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-muted-foreground">
              {calculateTotalItems()} items
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Update Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-base">Update Order Status</h3>
              <p className="text-sm text-muted-foreground">
                Current: <span className="font-medium">{currentStatusConfig.label}</span>
              </p>
            </div>
            
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Order Details - #{order.orderId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <OrderDetailsPanel order={order} />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="status-select">New Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.map((opt) => {
                      const config = getOrderStatusConfig(opt);
                      return (
                        <SelectItem key={opt} value={opt}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(opt).split(' ')[0]}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {status !== order.status && (
                <div className="flex items-center gap-2 text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Changing from <strong>{currentStatusConfig.label}</strong> to <strong>{statusConfig.label}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Status Preview</Label>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">New status will be:</span>
                  <Badge variant={statusConfig.variant as any}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {statusConfig.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Order status updated successfully to {statusConfig.label}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpdate}
              disabled={loading || status === order.status}
              className="flex-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setStatus(order.status)}
              disabled={status === order.status}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
          <div className="text-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-primary">{calculateTotalItems()}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground">Amount</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).toLowerCase() : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Payment</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {order.items?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Products</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Separate component for order details
const OrderDetailsPanel: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div>
        <h4 className="font-semibold mb-2">Customer Information</h4>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="font-medium">{order.shippingAddress?.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{order.shippingAddress?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{order.shippingAddress?.city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h4 className="font-semibold mb-2">Order Items</h4>
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-700 rounded flex items-center justify-center">
                    <span className="text-sm font-medium">{item.quantity}x</span>
                  </div>
                  <div>
                    <p className="font-medium">{item.product?.title || `Item ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">SKU: {item.product?.id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Raw Data (Collapsible) */}
      <div>
        <details className="group">
          <summary className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg cursor-pointer">
            <span className="font-medium">View Raw Data</span>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-lg">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(order, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;