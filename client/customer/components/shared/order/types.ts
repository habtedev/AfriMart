// Order type for customer orders
export interface Order {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
  items: Array<{
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city?: string;
    phone?: string;
  };
  total?: number;
  shippingFee?: number;
  shipping?: number;
  tax?: number;
  date?: string | { seconds: number };
  createdAt?: string;
  orderedAt?: string;
  estimatedArrival?: string;
  [key: string]: any;
}
