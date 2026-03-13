"use client";


import React, { useRef } from "react";
import { RefreshCw } from "lucide-react";
import { OrderList } from "../../components/shared/order/OrderList";


export default function OrdersPage() {
  const orderListRef = useRef(null);

  const handleRefresh = () => {
    if (orderListRef.current && typeof orderListRef.current.refresh === 'function') {
      orderListRef.current.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Track purchases and view order history
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </header>
        {/* Order List Component */}
        <OrderList ref={orderListRef} />
      </div>
    </div>
  );
}