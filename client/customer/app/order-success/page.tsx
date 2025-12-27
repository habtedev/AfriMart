"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getUserIdFromToken } from "../../utils/auth";
import { CheckCircle, ShoppingBag, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface CheckoutData {
  cartItems: any[];
  address: any;
  paymentMethod: string;
  accountNumber: string;
  total: number;
}

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Retrieve checkout data from storage with extra logging
  const getCheckoutData = useCallback((): CheckoutData | null => {
    if (typeof window === "undefined") return null;

    try {
      const cartItems = JSON.parse(localStorage.getItem("afrimart_cart") || "[]");
      const address = JSON.parse(localStorage.getItem("checkout_address") || "{}");
      const paymentMethod = localStorage.getItem("checkout_paymentMethod") || "chapa";
      const accountNumber = localStorage.getItem("checkout_accountNumber") || "";
      let total = Number(localStorage.getItem("checkout_total"));
      if (!total || total <= 0) {
        total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      }
      console.log("[OrderSuccess] Checkout data loaded:", { cartItems, address, paymentMethod, accountNumber, total });
      return { cartItems, address, paymentMethod, accountNumber, total };
    } catch (err) {
      console.error("[OrderSuccess] Error reading checkout data:", err);
      return null;
    }
  }, []);

  // Cleanup checkout data from storage
  const cleanupCheckoutData = useCallback(() => {
    if (typeof window === "undefined") return;

    const keys = [
      "checkout_address",
      "checkout_paymentMethod",
      "checkout_accountNumber",
      "checkout_total",
      "order_created"
    ];

    keys.forEach(key => localStorage.removeItem(key));
  }, []);

  // Create order in backend
  const createOrder = useCallback(async (checkoutData: CheckoutData) => {
    const userToken = localStorage.getItem("token");
    const userId = userToken ? getUserIdFromToken(userToken) : null;

    if (!userId) {
      console.error("[OrderSuccess] User not authenticated");
      throw new Error("User not authenticated");
    }

    const generatedOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setOrderId(generatedOrderId);

    const orderPayload = {
      orderId: generatedOrderId,
      userId,
      items: checkoutData.cartItems.map((item: any) => ({
        productId: item._id || item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name || item.title,
        image: item.image
      })),
      shippingAddress: checkoutData.address,
      totalAmount: checkoutData.total,
      paymentMethod: checkoutData.paymentMethod,
      paymentStatus: "paid",
      orderDate: new Date().toISOString()
    };

    console.log("[OrderSuccess] Creating order with payload:", orderPayload);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userToken ? { "Authorization": `Bearer ${userToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(orderPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OrderSuccess] Order creation failed:", errorText);
      throw new Error(`Order creation failed: ${errorText}`);
    }

    const data = await response.json();
    console.log("[OrderSuccess] Order created successfully:", data);
    return data;
  }, []);

  const processOrder = async () => {
    // Check if already processed
    if (typeof window === "undefined" || localStorage.getItem("order_processed")) {
      console.log("[OrderSuccess] Order already processed or not in browser context.");
      setStatus('success');
      return;
    }

    const checkoutData = getCheckoutData();
    if (!checkoutData) {
      setError("No checkout data found");
      console.error("[OrderSuccess] No checkout data found in localStorage.");
      setStatus('error');
      return;
    }

    try {
      // Create order in backend
      await createOrder(checkoutData);

      // Mark as processed only after success
      localStorage.setItem("order_processed", "true");

      // Clear cart
      clearCart();

      // Cleanup temporary data
      cleanupCheckoutData();

      setStatus('success');
    } catch (err: any) {
      console.error("[OrderSuccess] Order processing error:", err);
      setError(err.message || "Failed to process order");
      setStatus('error');
    }
  };

  useEffect(() => {
    processOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearCart, createOrder, getCheckoutData, cleanupCheckoutData]);

  // Countdown for redirect
  // Countdown effect
  useEffect(() => {
    if (status !== 'success') return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Redirect when countdown reaches 0
  useEffect(() => {
    if (status === 'success' && countdown === 0) {
      router.replace("/orders");
    }
  }, [countdown, status, router]);

  // Manual redirect handler
  const handleManualRedirect = () => {
    router.replace("/orders");
  };

  // Render loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping"></div>
              <div className="absolute inset-4 rounded-full bg-blue-200 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Processing Your Order
          </h1>
          <p className="text-gray-600 mb-8">
            Please wait while we confirm your payment and create your order...
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm text-gray-500">
              This may take a few moments
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Processing Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "There was an issue processing your order."}
          </p>
          <div className="space-y-4">
            <button
              onClick={processOrder}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry Order
            </button>
            <button
              onClick={() => window.location.href = '/checkout'}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Checkout
            </button>
            <button
              onClick={() => window.location.href = '/cart'}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              View Cart
            </button>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact support at{" "}
                <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                  support@example.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render success state
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
            >
              <CheckCircle className="w-16 h-16 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-white/90 text-lg">
              Thank you for your purchase
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <ShoppingBag className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order Confirmed
              </h2>
              <p className="text-gray-600">
                Your order has been successfully placed and is being processed.
              </p>
            </div>

            {/* Order Details */}
            {orderId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Order Number</div>
                    <div className="font-mono font-bold text-lg text-gray-900">
                      #{orderId.slice(-8).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-semibold text-green-600">Confirmed</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Payment Status</div>
                      <div className="font-semibold text-green-600">Paid</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Estimated Delivery</div>
                      <div className="font-semibold">2-3 Business Days</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 mb-8"
            >
              <h3 className="font-bold text-gray-900">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order confirmation email sent</p>
                    <p className="text-sm text-gray-500">Check your inbox for details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Shipping updates via SMS</p>
                    <p className="text-sm text-gray-500">We'll notify you when it ships</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Track your order anytime</p>
                    <p className="text-sm text-gray-500">Visit your orders page for updates</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleManualRedirect}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Orders ({countdown}s)
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => window.print()}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Print Receipt
                </button>
              </div>
            </motion.div>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-8 border-t border-gray-200 text-center"
            >
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@afrimart.com" className="text-blue-600 hover:underline font-medium">
                  support@afrimart.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}