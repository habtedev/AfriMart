"use client";

import { useState } from "react";
import { getUserIdFromToken } from "../../../utils/auth";
import { useCart } from "@/context/CartContext";
import { Check, CreditCard, Smartphone, Wallet, MapPin, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Payment methods data
const paymentOptions = [
  { 
    id: "telebirr", 
    label: "Telebirr", 
    icon: Smartphone,
    color: "bg-gradient-to-r from-blue-600 to-blue-800",
    description: "Pay via Telebirr mobile wallet",
    inputLabel: "Telebirr Phone Number",
    pattern: "^[0-9]{10}$",
    placeholder: "09xxxxxxxx"
  },
  { 
    id: "mpesa", 
    label: "m-Pesa (Coming Soon)", 
    icon: Wallet,
    color: "bg-gradient-to-r from-green-500 to-green-700 opacity-60",
    description: "Coming soon",
    inputLabel: "",
    pattern: "",
    placeholder: "",
    disabled: true
  },
  { 
    id: "cbe_birr", 
    label: "CBE Birr (Coming Soon)", 
    icon: CreditCard,
    color: "bg-gradient-to-r from-red-500 to-red-700 opacity-60",
    description: "Coming soon",
    inputLabel: "",
    pattern: "",
    placeholder: "",
    disabled: true
  },
  { 
    id: "cash", 
    label: "Cash on Delivery (Coming Soon)", 
    icon: Package,
    color: "bg-gradient-to-r from-gray-600 to-gray-800 opacity-60",
    description: "Coming soon",
    inputLabel: "",
    placeholder: "",
    disabled: true
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ModernCheckout2025() {
  const { items: cartItems, clearCart } = useCart();
  // Calculate totals from real cart
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  // Form states
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState("");

  // Address form states
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ethiopia",
    phone: ""
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^[0-9]{10}$/.test(address.phone)) newErrors.phone = "Valid 10-digit phone number required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    if (!paymentMethod) {
      setErrors({ ...errors, payment: "Please select a payment method" });
      return false;
    }
    
    if (paymentMethod === "telebirr" && !accountNumber.trim()) {
      setErrors({ ...errors, accountNumber: "Telebirr phone number is required" });
      return false;
    }
    
    if (paymentMethod === "telebirr" && !/^[0-9]{10}$/.test(accountNumber)) {
      setErrors({ ...errors, accountNumber: "Valid 10-digit phone number required" });
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateAddress()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setPaymentMethod(methodId);
    setAccountNumber("");
    setErrors({ ...errors, accountNumber: "", payment: "" });
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "cash") {
      setIsComplete(true);
      return;
    }

    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      const userId = userToken ? getUserIdFromToken(userToken) : null;
      
      if (!userId) {
        setErrors({ ...errors, general: "User not authenticated. Please log in again." });
        setLoading(false);
        return;
      }

      // Generate order ID
      const generatedOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setOrderId(generatedOrderId);

      // 1. Create order in backend
      const orderRes = await fetch(`${API_BASE_URL}/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userToken ? { "Authorization": `Bearer ${userToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: generatedOrderId,
          userId,
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: address,
          totalAmount: total,
          paymentMethod: paymentMethod,
          paymentStatus: "pending"
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderRes.json();

      // 2. Initiate ArifPay payment (for Telebirr)
      if (paymentMethod === "telebirr") {
        const payRes = await fetch(`${API_BASE_URL}/arifpay/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userToken ? { "Authorization": `Bearer ${userToken}` } : {})
          },
          credentials: "include",
          body: JSON.stringify({
            orderId: order.orderId || generatedOrderId,
            phone: "2519" + accountNumber.slice(-8),
            description: `Order for ${address.fullName}, ${address.street}, ${address.city}`,
            amount: total
          }),
        });

        if (!payRes.ok) {
          throw new Error("Payment initiation failed");
        }

        const payData = await payRes.json();
        if (payData.paymentUrl) {
          // Clear cart before redirecting
          clearCart();
          window.location.href = payData.paymentUrl;
        } else {
          throw new Error("No payment URL received");
        }
      } else {
        // For other payment methods, mark as complete
        setIsComplete(true);
        clearCart();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setErrors({ 
        ...errors, 
        general: "Payment failed. Please try again or contact support." 
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentOptions.find(m => m.id === paymentMethod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
            Secure Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-lg">
            Complete your purchase in just a few steps
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Progress Steps - Mobile */}
            <div className="lg:hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-4 border dark:border-zinc-700 mb-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm
                      ${stepNumber < step ? 'bg-green-500 text-white' : 
                        stepNumber === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                        'bg-gray-200 text-gray-400'}
                      transition-all duration-300 font-semibold
                    `}>
                      {stepNumber < step ? <Check size={16} /> : stepNumber}
                    </div>
                    <div className="text-xs mt-2 text-center">
                      <div className={`font-semibold ${stepNumber <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stepNumber === 1 ? 'Address' : 
                         stepNumber === 2 ? 'Payment' : 'Review'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Steps - Desktop */}
            <div className="hidden lg:block bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border dark:border-zinc-700">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${stepNumber < step ? 'bg-green-500 text-white' : 
                        stepNumber === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                        'bg-gray-200 text-gray-400'}
                      transition-all duration-300 font-semibold
                    `}>
                      {stepNumber < step ? <Check size={20} /> : stepNumber}
                    </div>
                    <div className="ml-4">
                      <div className={`font-semibold ${stepNumber <= step ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                        {stepNumber === 1 ? 'Shipping Address' : 
                         stepNumber === 2 ? 'Payment Method' : 'Review Order'}
                      </div>
                    </div>
                    {stepNumber < 3 && (
                      <div className={`
                        w-24 h-1 mx-4
                        ${stepNumber < step ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-4 md:p-6 border dark:border-zinc-700">
              <AnimatePresence mode="wait">
                {/* Step 1: Address Form */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4 md:space-y-6"
                  >
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                      <MapPin className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
                      Shipping Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {Object.entries({
                        fullName: "Full Name",
                        phone: "Phone Number",
                        street: "Street Address",
                        city: "City",
                        state: "State/Region",
                        zipCode: "ZIP Code"
                      }).map(([key, label]) => (
                        <div key={key} className="space-y-1 md:space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </label>
                          <input
                            type={key === "phone" ? "tel" : "text"}
                            name={key}
                            value={address[key as keyof typeof address]}
                            onChange={handleAddressChange}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className={`
                              w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border
                              focus:outline-none focus:ring-2 focus:ring-blue-500
                              transition-all duration-200 text-sm md:text-base
                              ${errors[key] 
                                ? 'border-red-500 dark:border-red-500' 
                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}
                              bg-white dark:bg-zinc-800
                            `}
                          />
                          {errors[key] && (
                            <p className="text-red-500 text-xs md:text-sm">{errors[key]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-1 md:space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <div className="px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm md:text-base">
                        Ethiopia
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Payment Methods */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4 md:space-y-6"
                  >
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                      <CreditCard className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
                      Select Payment Method
                    </h2>
                    
                    {errors.payment && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 md:p-4">
                        <p className="text-red-600 dark:text-red-400 text-sm md:text-base">{errors.payment}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {paymentOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = paymentMethod === option.id;
                        const isDisabled = option.disabled;
                        return (
                          <motion.button
                            key={option.id}
                            type="button"
                            onClick={() => !isDisabled && handlePaymentMethodSelect(option.id)}
                            whileHover={isDisabled ? {} : { scale: 1.02 }}
                            whileTap={isDisabled ? {} : { scale: 0.98 }}
                            className={`
                              p-4 md:p-6 rounded-xl md:rounded-2xl border text-left transition-all duration-300
                              ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                              ${isSelected && !isDisabled 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-900' 
                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800'}
                            `}
                            disabled={isDisabled}
                          >
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${option.color} text-white`}>
                                <Icon size={20} className="w-4 h-4 md:w-6 md:h-6" />
                              </div>
                              {isSelected && !isDisabled && (
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                  <Check size={12} className="text-white w-3 h-3 md:w-4 md:h-4" />
                                </div>
                              )}
                            </div>
                            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-gray-900 dark:text-gray-100">
                              {option.label}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                              {option.description}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Account Number Input for Mobile Payment */}
                    {selectedPaymentMethod && selectedPaymentMethod.inputLabel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1 md:space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedPaymentMethod.inputLabel}
                        </label>
                        <input
                          type="tel"
                          value={accountNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setAccountNumber(value);
                            if (errors.accountNumber) {
                              setErrors({ ...errors, accountNumber: "" });
                            }
                          }}
                          placeholder={selectedPaymentMethod.placeholder}
                          className={`
                            w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            transition-all duration-200 text-sm md:text-base
                            ${errors.accountNumber 
                              ? 'border-red-500 dark:border-red-500' 
                              : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}
                            bg-white dark:bg-zinc-800
                          `}
                        />
                        {errors.accountNumber && (
                          <p className="text-red-500 text-xs md:text-sm">{errors.accountNumber}</p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Review and Place Order */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4 md:space-y-6"
                  >
                    <h2 className="text-xl md:text-2xl font-bold">Review Your Order</h2>
                    
                    {/* Address Summary */}
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 md:p-6">
                      <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
                        Shipping Address
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                        {address.fullName}<br />
                        {address.street}<br />
                        {address.city}, {address.state} {address.zipCode}<br />
                        {address.country}<br />
                        📱 {address.phone}
                      </p>
                    </div>

                    {/* Payment Method Summary */}
                    {selectedPaymentMethod && (
                      <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 md:p-6">
                        <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2">
                          <CreditCard size={18} className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
                          Payment Method
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 md:p-3 rounded-lg ${selectedPaymentMethod.color} text-white`}>
                            <selectedPaymentMethod.icon size={18} className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm md:text-base">{selectedPaymentMethod.label}</p>
                            {accountNumber && (
                              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                                Account: {accountNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6 md:space-y-8">
            {/* Order Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-4 md:p-6 lg:sticky lg:top-8 border dark:border-zinc-700">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-48 md:max-h-64 overflow-y-auto pr-2">
                {cartItems.length === 0 ? (
                  <div className="text-gray-500 text-center py-4 text-sm md:text-base">
                    Your cart is empty.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">{item.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                          Qty: {item.quantity} × Br{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm md:text-base whitespace-nowrap ml-2">
                        Br{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Subtotal</span>
                  <span className="text-sm md:text-base">Br{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Shipping</span>
                  <span className="text-sm md:text-base">Br{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Tax (8%)</span>
                  <span className="text-sm md:text-base">Br{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-3">
                  <div className="flex justify-between text-base md:text-lg font-bold">
                    <span>Total</span>
                    <span className="text-xl md:text-2xl text-blue-600 dark:text-blue-400">
                      Br{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {errors.general && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 space-y-2 md:space-y-3">
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={step === 2 && !paymentMethod}
                    className={`
                      w-full py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-white
                      transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                      text-sm md:text-base
                      ${step === 2 && !paymentMethod
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'}
                    `}
                  >
                    {step === 1 ? 'Continue to Payment' : 'Review Order'}
                  </button>
                ) : (
                  <motion.button
                    onClick={handlePlaceOrder}
                    disabled={loading || isComplete}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`
                      w-full py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-white
                      transition-all duration-300 text-sm md:text-base
                      ${loading || isComplete
                        ? 'bg-green-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg'}
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </span>
                    ) : isComplete ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check size={16} className="w-4 h-4 md:w-5 md:h-5" />
                        Order Placed!
                      </span>
                    ) : (
                      `Pay Br${total.toFixed(2)}`
                    )}
                  </motion.button>
                )}

                {step > 1 && !isComplete && (
                  <button
                    onClick={handlePrevStep}
                    className="w-full py-2 md:py-3 rounded-lg md:rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm md:text-base"
                  >
                    ← Back to {step === 2 ? 'Address' : 'Payment'}
                  </button>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-zinc-700 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={8} className="text-white w-2 h-2 md:w-3 md:h-3" />
                  </div>
                  <span>Secure SSL Encryption • 100% Safe Payment</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-4 md:p-6 border border-green-200 dark:border-green-800"
              >
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Check size={24} className="text-white w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-3 md:mb-4">
                    Your order has been placed successfully. You will receive a confirmation email shortly.
                  </p>
                  {orderId && (
                    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-white dark:bg-zinc-800 rounded-lg">
                      <p className="text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300">
                        Order ID: {orderId}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                    <p className="flex items-center justify-center gap-1">
                      <span>📧</span> Confirmation sent to your email
                    </p>
                    <p className="flex items-center justify-center gap-1">
                      <span>📱</span> SMS notification will be sent
                    </p>
                    <p className="flex items-center justify-center gap-1">
                      <span>🚚</span> Estimated delivery: 2-3 business days
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}