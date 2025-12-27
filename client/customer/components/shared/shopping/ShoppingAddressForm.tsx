"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserIdFromToken } from "../../../utils/auth";
import { useCart } from "@/context/CartContext";
import { Check, CreditCard, Smartphone, Wallet, MapPin, Package, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Payment methods data
const PAYMENT_OPTIONS = [
  { 
    id: "chapa", 
    label: "Chapa", 
    icon: Smartphone,
    color: "bg-gradient-to-r from-blue-600 to-blue-800",
    description: "Pay securely via Chapa gateway",
    inputLabel: "Email Address",
    pattern: "^.+@.+\..+$",
    placeholder: "your@email.com"
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
] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AddressForm {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ModernCheckout2025() {
    // Clear order_processed when starting a new checkout/payment
    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('order_processed');
      }
    }, []);
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  
  // Calculate totals from real cart
  const calculateTotals = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cartItems.length > 0 ? 9.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  }, [cartItems]);
  
  const { subtotal, shipping, tax, total } = calculateTotals();
  
  // Form states
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [orderId, setOrderId] = useState<string>("");

  // Address form states
  const [address, setAddress] = useState<AddressForm>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ethiopia",
    phone: ""
  });

  // Derived state
  const selectedPaymentMethod = PAYMENT_OPTIONS.find(m => m.id === paymentMethod);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validateAddress = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!address.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    
    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(address.phone)) {
      newErrors.phone = "Valid 10-digit phone number required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [address]);

  const validatePayment = useCallback((): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    
    if (!paymentMethod) {
      newErrors.payment = "Please select a payment method";
      setErrors(newErrors);
      return false;
    }

    // Chapa email validation
    if (paymentMethod === "chapa") {
      if (!accountNumber.trim()) {
        newErrors.accountNumber = "Email address is required for Chapa payment";
        setErrors(newErrors);
        return false;
      }
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(accountNumber.trim())) {
        newErrors.accountNumber = "Please enter a valid email address";
        setErrors(newErrors);
        return false;
      }
    }

    // Remove payment error if validation passes
    if (newErrors.payment) {
      delete newErrors.payment;
    }
    
    if (newErrors.accountNumber) {
      delete newErrors.accountNumber;
    }
    
    setErrors(newErrors);
    return true;
  }, [paymentMethod, accountNumber, errors]);

  const handleNextStep = useCallback(() => {
    if (step === 1 && validateAddress()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  }, [step, validateAddress, validatePayment]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) {
      setStep(step === 2 ? 1 : 2);
    }
  }, [step]);

  const handlePaymentMethodSelect = useCallback((methodId: string) => {
    setPaymentMethod(methodId);
    
    // If Chapa, default to user email; else clear
    if (methodId === "chapa") {
      setAccountNumber(user?.email || "");
    } else {
      setAccountNumber("");
    }
    
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.payment;
      delete newErrors.accountNumber;
      return newErrors;
    });
  }, [user?.email]);

  const handleAccountNumberChange = useCallback((value: string) => {
    if (paymentMethod !== "chapa") {
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      setAccountNumber(cleanedValue);
    }
    
    if (errors.accountNumber) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.accountNumber;
        return newErrors;
      });
    }
  }, [paymentMethod, errors.accountNumber]);

  const handlePlaceOrder = async () => {
    if (paymentMethod === "cash") {
      setIsComplete(true);
      return;
    }

    // Prepare valid cart items for order creation
    const validCartItems = cartItems.map((item: any) => ({
      productId: item._id || item.id,
      quantity: item.quantity,
      price: item.price
    }));

    // Get userId from token
    const userToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const userId = userToken ? getUserIdFromToken(userToken) : null;

    setLoading(true);
    
    try {
      if (!userId) {
        setErrors({ general: "User not authenticated. Please log in again." });
        setLoading(false);
        return;
      }

      if (paymentMethod === "chapa") {
        await initiateChapaPayment();
      } else {
        await createOrder();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setErrors({ 
        general: "Payment failed. Please try again or contact support." 
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateChapaPayment = async () => {
    const userToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const txRef = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const safeDescription = `Order for ${address.fullName} - ${address.street} - ${address.city}`
      .replace(/[^a-zA-Z0-9\-_ .]/g, " ");
    
    const chapaPayload = {
      amount: total,
      currency: "ETB",
      email: accountNumber,
      first_name: address.fullName.split(" ")[0] || address.fullName,
      last_name: address.fullName.split(" ")[1] || "Customer",
      tx_ref: txRef,
      callback_url: `${API_BASE_URL}/chapa/webhook`,
      return_url: window.location.origin + "/order-success",
      customization_title: "Order Payment",
      custom_description: safeDescription
    };

    const response = await fetch(`${API_BASE_URL}/chapa/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userToken ? { "Authorization": `Bearer ${userToken}` } : {})
      },
      credentials: "include",
      body: JSON.stringify(chapaPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chapa pay error response:", errorText);
      throw new Error("Payment initiation failed");
    }

    const data = await response.json();
    
    if (data.data?.checkout_url) {
      window.location.href = data.data.checkout_url;
    } else {
      throw new Error("No Chapa checkout URL received");
    }
  };

  const createOrder = async () => {
    const userToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    const generatedOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const validCartItems = cartItems.map((item: any) => ({
      productId: item.id || item._id,
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      orderId: generatedOrderId,
      userId: getUserIdFromToken(userToken || ''),
      items: validCartItems,
      shippingAddress: address,
      totalAmount: total,
      paymentMethod: paymentMethod,
      paymentStatus: "pending"
    };

    const response = await fetch(`${API_BASE_URL}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userToken ? { "Authorization": `Bearer ${userToken}` } : {})
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Order creation error:", errorText);
      throw new Error("Failed to create order");
    }

    setOrderId(generatedOrderId);
    setIsComplete(true);
    clearCart();
    
    // Redirect to orders page after successful non-Chapa payment
    if (typeof window !== 'undefined') {
      window.location.href = '/orders';
    }
  };

  // Clear general error when step changes
  useEffect(() => {
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  }, [step, errors.general]);

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
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
              {[
                { key: "fullName", label: "Full Name", type: "text" },
                { key: "phone", label: "Phone Number", type: "tel" },
                { key: "street", label: "Street Address", type: "text" },
                { key: "city", label: "City", type: "text" },
                { key: "state", label: "State/Region", type: "text" },
                { key: "zipCode", label: "ZIP Code", type: "text" }
              ].map(({ key, label, type }) => (
                <div key={key} className="space-y-1 md:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={key}
                    value={address[key as keyof AddressForm]}
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
        );

      case 2:
        return (
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
            
            <div className="space-y-4">
              {PAYMENT_OPTIONS.map((option) => {
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
              
              {selectedPaymentMethod?.inputLabel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1 md:space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedPaymentMethod.inputLabel}
                  </label>
                  <input
                    type={paymentMethod === "chapa" ? "email" : "tel"}
                    value={accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    placeholder={selectedPaymentMethod.placeholder}
                    readOnly={paymentMethod === "chapa"}
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
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <Check className="text-green-600 w-6 h-6" />
              Review Your Order
            </h2>
            
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity} × Br{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">Br{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-lg mb-4">Shipping Details</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {address.fullName}</p>
                <p><strong>Address:</strong> {address.street}, {address.city}, {address.state}</p>
                <p><strong>Phone:</strong> {address.phone}</p>
                <p><strong>Country:</strong> {address.country}</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

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
                {renderStepContent()}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-8 space-y-3">
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
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure SSL Encryption • 100% Safe Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border dark:border-zinc-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-zinc-700">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">Br{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>Br{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span>Br{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                    <span>Br{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-xl text-blue-600 dark:text-blue-400">
                        Br{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {errors.general && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsComplete(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-green-200 dark:border-green-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Your order has been placed successfully. You will receive a confirmation email shortly.
                </p>
                {orderId && (
                  <div className="mb-4 p-3 bg-white dark:bg-zinc-800 rounded-lg">
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      Order ID: {orderId}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => window.location.href = '/orders'}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  View Orders
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}