import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  ChevronLeft,
  FileText,
  HeadphonesIcon,
  Star,
  Download,
  Calendar,
  MoreVertical,
  ArrowRight
} from "lucide-react";

/* ---------------- TYPES & CONFIG ---------------- */

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_CONFIG = {
  pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Clock, label: "Pending", description: "Order is being verified" },
  processing: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: Package, label: "Processing", description: "Preparing your items" },
  shipped: { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", icon: Truck, label: "Shipped", description: "On the way to you" },
  delivered: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle, label: "Delivered", description: "Successfully arrived" },
  cancelled: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: AlertCircle, label: "Cancelled", description: "Order was cancelled" },
};

/* ---------------- SUB-COMPONENT: OPEN COMMENT ---------------- */

const OpenComment = ({ onSubmit, productId, userId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || !comment) return;
    setLoading(true);
    setError("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${baseUrl}/api/customer-reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userId,
          rating,
          comment,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      onSubmit();
      setComment("");
      setRating(0);
    } catch (err) {
      setError("Could not save your review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // console.log('Review payload:', { productId, userId, rating, comment });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button 
            key={s} 
            onClick={() => setRating(s)}
            className={`transition-all ${rating >= s ? 'text-amber-400 scale-110' : 'text-zinc-300'}`}
            disabled={loading}
          >
            <Star size={24} fill={rating >= s ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <textarea 
        className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        placeholder="How was your experience with this order?"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
      />
      {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
      <button 
        onClick={handleSubmit}
        disabled={rating === 0 || loading}
        className="px-6 py-2.5 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all self-end"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

/**
 * The main App component now acts as a wrapper that expects props.
 * You can pass your real data into this component when rendering it.
 */
export default function App({ order, onBack, onTrackOrder, onContactSupport }) {
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4 mx-auto" />
          <p className="text-zinc-400 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <OrderDetails 
      order={order} 
      onBack={onBack} 
      onTrackOrder={onTrackOrder} 
      onContactSupport={onContactSupport} 
    />
  );
}

function OrderDetails({ order, onBack, onTrackOrder, onContactSupport }) {
    const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const statusKey = (order.status?.toLowerCase() || "pending");
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const currentStepIndex = STATUS_STEPS.indexOf(statusKey);

  const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const total = subtotal + (order.shippingFee || 0) + (order.tax || 0);

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-blue-100 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-4">
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
            >
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:shadow group-hover:-translate-x-0.5 transition-all">
                <ChevronLeft size={18} />
              </div>
              <span className="text-sm font-semibold tracking-tight">Return to Dashboard</span>
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Order <span className="text-blue-600">#{order.id}</span>
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {order.date}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                <span className="flex items-center gap-1.5"><CreditCard size={14} /> {order.paymentMethod || "Payment Card"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              <Download size={16} /> Invoice
            </button>
            <button 
              onClick={onContactSupport}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <HeadphonesIcon size={16} /> Help Center
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT CONTENT: TRACKING & ITEMS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ENHANCED TRACKING CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 lg:p-10 shadow-sm relative overflow-hidden">
               {/* Background Decorative Element */}
               <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} blur-3xl rounded-full -mr-16 -mt-16 opacity-50`} />
               
               <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-1">Shipping Status</h2>
                  <p className="text-sm text-zinc-500 font-medium">{config.description}</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl border ${config.bg} ${config.border} ${config.color} flex items-center gap-2`}>
                   <config.icon size={16} strokeWidth={2.5} />
                   <span className="text-xs font-black uppercase tracking-widest">{config.label}</span>
                </div>
              </div>

              {/* MODERN STEPPER */}
              {statusKey !== 'cancelled' && (
                <div className="relative pt-4 pb-8">
                  <div className="absolute top-9 left-6 right-6 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                      style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const StepIcon = STATUS_CONFIG[step].icon;
                      
                      return (
                        <div key={step} className="flex flex-col items-center group">
                          <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 border-4 relative z-10 ${
                            isCompleted 
                              ? 'bg-blue-600 border-white dark:border-zinc-900 text-white shadow-xl shadow-blue-200 dark:shadow-none' 
                              : 'bg-white dark:bg-zinc-800 border-zinc-50 dark:border-zinc-900 text-zinc-300'
                          }`}>
                            <StepIcon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                          </div>
                          <div className="mt-4 text-center">
                            <span className={`block text-[10px] font-black uppercase tracking-wider mb-0.5 ${isCompleted ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                              {step}
                            </span>
                            {isCurrent && (
                              <span className="block text-[9px] text-blue-500 font-bold">Active</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="text-blue-600" size={20} />
                  Order Items
                </h3>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{order.items?.length || 0} items</span>
              </div>
              
              <div className="grid gap-4">
                {order.items?.map((item) => (
                  <div key={item.productId} className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-6 group hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                    <div className="relative flex-shrink-0 w-28 h-28 overflow-hidden rounded-3xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          ETB {item.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-black uppercase">Qty: {item.quantity}</span>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                          Buy Again <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEW CARD */}
            <div className="relative overflow-hidden bg-zinc-900 dark:bg-white rounded-[2.5rem] p-10 text-white dark:text-zinc-900 shadow-2xl shadow-zinc-300 dark:shadow-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 blur-[100px] -mr-32 -mt-32 opacity-20" />
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-black mb-3">Share the love?</h3>
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm leading-relaxed mb-6">
                    How was the delivery and item quality? Your honest feedback helps our community and small business partners grow.
                  </p>
                  {!submitted && (
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                       <CheckCircle size={14} className="text-blue-500" /> Verified Purchase
                    </div>
                  )}
                </div>
                <div>
                  {!submitted ? (
                    <div className="bg-white/5 dark:bg-zinc-50 backdrop-blur-md rounded-3xl p-6 border border-white/10 dark:border-zinc-200">
                      <OpenComment 
                        onSubmit={() => setSubmitted(true)} 
                        productId={order.items && order.items[0] ? order.items[0].productId : undefined}
                        userId={user?.id}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <CheckCircle size={32} />
                      </div>
                      <span className="font-bold text-xl">Feedback Received!</span>
                      <p className="text-zinc-400 text-center text-sm">Thank you for helping us improve our service.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: SUMMARY & DETAILS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ACTION CENTER */}
            <div className="grid gap-3">
              <button
                onClick={onTrackOrder}
                className="w-full py-4.5 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-[1.5rem] font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-200 dark:shadow-none"
              >
                <Truck size={18} />
                Live Tracking
              </button>
              <button className="w-full py-4.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                <AlertCircle size={18} />
                Report Issue
              </button>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm">
              <h3 className="font-black uppercase text-xs tracking-[0.2em] text-zinc-400 mb-8">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-zinc-900 dark:text-zinc-100">ETB {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-500">Express Delivery</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                    {order.shippingFee === 0 ? "Free" : `ETB ${order.shippingFee?.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pb-6 border-b border-zinc-50 dark:border-zinc-800">
                  <span className="text-zinc-500">Service Tax</span>
                  <span className="text-zinc-900 dark:text-zinc-100">ETB {order.tax?.toLocaleString() || 0}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-zinc-400 text-sm">Total Paid</span>
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                      ETB {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO CARDS */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-white/20">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-black tracking-tight">Delivery Point</h3>
               </div>
               {order.shippingAddress && (
                 <div className="text-sm font-medium text-blue-100 space-y-1 leading-relaxed">
                   <div className="text-white font-bold text-base mb-2">{order.shippingAddress.fullName}</div>
                   <div>{order.shippingAddress.street}</div>
                   <div>{order.shippingAddress.city}, {order.shippingAddress.country}</div>
                   <div className="pt-4 mt-4 border-t border-white/10 text-white flex items-center justify-between">
                      <span>{order.shippingAddress.phone}</span>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ExternalLink size={16} />
                      </button>
                   </div>
                 </div>
               )}
            </div>

            {/* SMALL HELPER CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-6 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-zinc-400" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estimated Arrival</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {order.estimatedArrival || "Updating..."}
                  </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}