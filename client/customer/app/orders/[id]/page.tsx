"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import OrderDetails from "@/components/shared/order/OrderDetails";
import { useOrders } from "@/components/shared/order/useOrders";

const OrderDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { orders, loading, error } = useOrders();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orders && id) {
      const found = orders.find(
        (o) => o.id === id || o._id === id || o.orderId === id
      );
      setOrder(found || null);
    }
  }, [orders, id]);

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading order details...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-12 text-center text-zinc-500">Order not found.</div>;

  return <OrderDetails order={order} onBack={() => router.push('/orders')} />;
};

export default OrderDetailsPage;
