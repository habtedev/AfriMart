// types/order.types.ts
export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled'
  | 'refunded'
  | 'on_hold';

export interface OrderStatusConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  description: string;
  icon?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
  progress?: number;
  nextSteps?: string[];
}

// Utility and config for order status display and logic
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered'
];

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'on_hold'
];

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    label: 'Pending',
    description: 'Order received, awaiting processing',
    icon: '⏳',
    variant: 'warning',
    progress: 20,
    nextSteps: ['Payment verification', 'Inventory check']
  },
  processing: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: 'Processing',
    description: 'Preparing your order for shipment',
    icon: '⚙️',
    variant: 'secondary',
    progress: 50,
    nextSteps: ['Packaging', 'Label generation', 'Quality check']
  },
  shipped: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    label: 'Shipped',
    description: 'Order is on its way to you',
    icon: '🚚',
    variant: 'secondary',
    progress: 80,
    nextSteps: ['Out for delivery', 'Delivery attempt']
  },
  delivered: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    label: 'Delivered',
    description: 'Order successfully delivered',
    icon: '✅',
    variant: 'success',
    progress: 100,
    nextSteps: ['Feedback requested', 'Review opportunity']
  },
  cancelled: {
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    label: 'Cancelled',
    description: 'Order has been cancelled',
    icon: '❌',
    variant: 'destructive',
    progress: 0,
    nextSteps: ['Refund initiated', 'Feedback requested']
  },
  refunded: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    label: 'Refunded',
    description: 'Order refund has been processed',
    icon: '💸',
    variant: 'default',
    progress: 100,
    nextSteps: ['Transaction complete', 'Feedback requested']
  },
  on_hold: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    label: 'On Hold',
    description: 'Order temporarily paused for review',
    icon: '⏸️',
    variant: 'warning',
    progress: 30,
    nextSteps: ['Additional verification', 'Customer contact']
  }
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS_CONFIG;

// Utility functions
export function getOrderStatusConfig(status: string): OrderStatusConfig {
  const key = status as OrderStatusKey;
  return ORDER_STATUS_CONFIG[key] || ORDER_STATUS_CONFIG.pending;
}

export function getOrderStatusBadgeVariant(status: string): string {
  const config = getOrderStatusConfig(status);
  return config.variant || 'default';
}

export function isStatusTransitionAllowed(current: OrderStatus, next: OrderStatus): boolean {
  // Define allowed transitions
  const transitionRules: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled', 'on_hold'],
    processing: ['shipped', 'cancelled', 'on_hold'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
    on_hold: ['processing', 'cancelled']
  };

  return transitionRules[current]?.includes(next) || false;
}

export function getNextPossibleStatuses(current: OrderStatus): OrderStatus[] {
  const transitionRules: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled', 'on_hold'],
    processing: ['shipped', 'cancelled', 'on_hold'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
    on_hold: ['processing', 'cancelled']
  };

  return transitionRules[current] || [];
}

export function getStatusTimeline(status: OrderStatus): Array<{
  status: OrderStatus;
  label: string;
  completed: boolean;
  current: boolean;
}> {
  const flow = ORDER_STATUS_FLOW;
  const currentIndex = flow.indexOf(status);
  
  return flow.map((flowStatus, index) => ({
    status: flowStatus,
    label: ORDER_STATUS_CONFIG[flowStatus].label,
    completed: index <= currentIndex,
    current: index === currentIndex
  }));
}

export function calculateOrderProgress(status: OrderStatus): number {
  const config = getOrderStatusConfig(status);
  return config.progress || 0;
}

export function getStatusIcon(status: OrderStatus): string {
  const config = getOrderStatusConfig(status);
  return config.icon || '📦';
}

// Status grouping for filtering
export const ORDER_STATUS_GROUPS = {
  active: ['pending', 'processing', 'shipped', 'on_hold'] as OrderStatus[],
  completed: ['delivered', 'refunded'] as OrderStatus[],
  cancelled: ['cancelled'] as OrderStatus[],
  all: ORDER_STATUS_OPTIONS
} as const;

export type OrderStatusGroup = keyof typeof ORDER_STATUS_GROUPS;

export function filterOrdersByStatusGroup<T extends { status: OrderStatus }>(
  orders: T[],
  group: OrderStatusGroup
): T[] {
  const statuses = ORDER_STATUS_GROUPS[group];
  return orders.filter(order => statuses.includes(order.status));
}

// Color utilities for different UI contexts
export function getStatusColorClass(status: OrderStatus, context: 'text' | 'bg' | 'border' = 'text'): string {
  const config = getOrderStatusConfig(status);
  
  switch (context) {
    case 'text':
      return config.color;
    case 'bg':
      return config.bgColor;
    case 'border':
      return config.borderColor;
    default:
      return config.color;
  }
}

// For data visualization
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b',      // amber-500
  processing: '#3b82f6',   // blue-500
  shipped: '#8b5cf6',      // purple-500
  delivered: '#10b981',    // emerald-500
  cancelled: '#ef4444',    // rose-500
  refunded: '#6b7280',     // gray-500
  on_hold: '#f97316'       // orange-500
};

// Export for easy imports
export default {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_CONFIG,
  getOrderStatusConfig,
  isStatusTransitionAllowed,
  getNextPossibleStatuses,
  getStatusTimeline,
  calculateOrderProgress,
  getStatusIcon,
  filterOrdersByStatusGroup,
  getStatusColorClass,
  ORDER_STATUS_COLORS
};