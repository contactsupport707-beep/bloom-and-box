/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Phone, 
  Copy, 
  Check, 
  QrCode, 
  AlertCircle, 
  ShoppingBag, 
  Plus, 
  Minus, 
  UploadCloud, 
  Image as ImageIcon, 
  CreditCard, 
  Truck, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";
import { CartItem, GlobalSettings, BoutiqueUser, PaymentConfig, BoutiqueOrder } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  settings: GlobalSettings;
  payment: PaymentConfig;
  onPlaceOrder: (paymentMode: 'UPI' | 'COD', paymentScreenshot?: string) => BoutiqueOrder;
  onUpdateQuantity: (id: string, isCustom: boolean, quantity: number) => void;
  onRemoveItem: (id: string, isCustom: boolean) => void;
  onClearCart: () => void;
  currentUser?: BoutiqueUser | null;
  onUpdateUser?: (updatedUser: BoutiqueUser) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  settings,
  payment,
  onPlaceOrder,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onUpdateUser
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "confirmation">("cart");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [codAlert, setCodAlert] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>("");
  const [placedOrder, setPlacedOrder] = useState<BoutiqueOrder | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Loyalty rewards / Coupon state values
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isOpen) return null;

  // Calculators
  const subtotal = cartItems.reduce((acc, item) => acc + item.hamper.price * item.quantity, 0);
  const gstAmount = subtotal * (settings.gstPercentage / 100);
  const isFreeDelivery = subtotal >= settings.freeShippingThreshold;
  const delivery = subtotal > 0 ? (isFreeDelivery ? 0 : settings.deliveryCharges) : 0;
  
  // Deduct coupon discount if applied
  const grandTotal = Math.max(0, subtotal + gstAmount + delivery - appliedDiscount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    setApplyingCoupon(true);

    try {
      const response = await fetch("/api/auth/loyalty/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponInput })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid coupon code");

      setAppliedDiscount(data.discountAmount);
      setAppliedCoupon(couponInput.toUpperCase().trim());
      setCouponSuccess(`Success! ₹${data.discountAmount} discount applied to your gift curations.`);
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCoupon("");
    setCouponInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(payment.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSelectCod = () => {
    setPaymentMethod("COD");
    setCodAlert("Cash on Delivery is currently unavailable. Please choose UPI Payment to complete your order.");
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrderSubmission = () => {
    setSubmittingOrder(true);
    try {
      // Process coupon spend on checkout completion
      if (appliedCoupon) {
        fetch("/api/auth/loyalty/use-coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponCode: appliedCoupon })
        })
          .then(res => res.json())
          .then(() => {
            if (onUpdateUser) {
              fetch("/api/auth/me")
                .then(res => res.json())
                .then(resData => {
                  if (resData.success) onUpdateUser(resData.user);
                });
            }
          })
          .catch(err => console.error("Error using coupon code server side:", err));
      }

      // Earn points based on current purchase subtotal spend (1pt per ₹100 spent)
      const earnedPoints = Math.floor(subtotal / 100);
      if (currentUser && earnedPoints > 0) {
        fetch("/api/auth/loyalty/earn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: earnedPoints })
        })
          .then(res => res.json())
          .then(() => {
            fetch("/api/auth/me")
              .then(res => res.json())
              .then(resData => {
                if (resData.success && onUpdateUser) onUpdateUser(resData.user);
              });
          })
          .catch(err => console.error("Error earning loyalty points during order:", err));
      }

      // Complete order creation via App parent function
      const order = onPlaceOrder(paymentMethod, screenshot || undefined);
      setPlacedOrder(order);
      setCheckoutStep("confirmation");
    } catch (err) {
      console.error("Error creating boutique order:", err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleReturnToShopping = () => {
    onClearCart();
    setCheckoutStep("cart");
    setPaymentMethod("UPI");
    setScreenshot(null);
    setScreenshotName("");
    setPlacedOrder(null);
    handleRemoveCoupon();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#040405]/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10" id="cart-drawer-body">
        <div className="w-screen max-w-md bg-[#0c0c0d] shadow-2xl flex flex-col h-full border-l border-white/5">
          
          {/* Header */}
          <div className="px-6 py-5 bg-[#080809] border-b border-white/5 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 gold-text" />
              {checkoutStep === "confirmation" ? "Order Complete" : "Your Gifting Selection"}
            </h3>
            {checkoutStep !== "confirmation" && (
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full hover:bg-white/5 text-stone-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Core Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {cartItems.length === 0 && checkoutStep !== "confirmation" ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12" id="cart-empty-message">
                <span className="text-4xl">🎁</span>
                <p className="text-sm font-serif text-white">Your selection bag is empty</p>
                <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                  Browse our exquisite, pre-curated collection or trigger our AI Gifting Advisor to generate high-end, dynamic curations.
                </p>
                <button 
                  onClick={onClose} 
                  className="mt-2 py-2.5 px-6 gold-gradient text-black font-extrabold rounded-xl text-xs tracking-widest uppercase hover:gold-gradient-hover transition-colors active:scale-95 cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : checkoutStep === "cart" ? (
              // STEP 1: CART LIST
              <div className="space-y-4" id="checkout-cart-step">
                {cartItems.map((item) => {
                  const itemIsCustom = !!item.hamper.isCustom;
                  return (
                    <div 
                      key={`${item.hamper.id}-${itemIsCustom}`} 
                      className="bg-[#080809]/50 p-4 rounded-xl border border-white/5 shadow-lg flex gap-4 animate-fadeIn"
                      id={`cart-item-${item.hamper.id}`}
                    >
                      {item.hamper.image ? (
                        <img 
                          src={item.hamper.image} 
                          alt={item.hamper.name} 
                          className="w-16 h-16 rounded-lg object-cover bg-stone-900 border border-white/5"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-white/5 text-[#c5a059] flex items-center justify-center text-xl border border-white/5">
                          🎁
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-serif text-white leading-tight">
                            {item.hamper.name}
                          </h4>
                          <button 
                            onClick={() => onRemoveItem(item.hamper.id, itemIsCustom)}
                            className="text-stone-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <p className="font-mono text-xs gold-text font-bold">
                          ₹{item.hamper.price.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 border border-white/10 bg-[#0d0d0e]/65 rounded-lg p-0.5" id="qty-stepper">
                            <button
                              onClick={() => {
                                if(item.quantity > 1) {
                                  onUpdateQuantity(item.hamper.id, itemIsCustom, item.quantity - 1);
                                }
                              }}
                              className="p-1 hover:bg-white/5 rounded text-stone-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold px-2 text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.hamper.id, itemIsCustom, item.quantity + 1)}
                              className="p-1 hover:bg-white/5 rounded text-stone-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {itemIsCustom && (
                            <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 rounded-sm px-1.5 py-0.5 font-bold uppercase tracking-wider">
                              AI Curated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : checkoutStep === "payment" ? (
              // STEP 2: PREMIUM PAYMENT METHODS SELECTOR
              <div className="space-y-6" id="checkout-payment-step">
                <div>
                  <label className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold font-mono">Select Payment Method</label>
                  <p className="text-stone-400 text-[10px] mb-3">Choose from our secure verified checkouts.</p>
                  
                  <div className="grid grid-cols-2 gap-3" id="payment-options-grid">
                    {/* Pay via UPI Option Card */}
                    <div 
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer relative ${
                        paymentMethod === "UPI" 
                          ? "border-[#c5a059] bg-[#c5a059]/5 shadow-lg shadow-[#c5a059]/5" 
                          : "border-white/5 bg-black/40 hover:bg-white/5 text-stone-400"
                      }`}
                      id="opt-pay-upi"
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <QrCode className={`w-5 h-5 ${paymentMethod === "UPI" ? "text-[#c5a059]" : "text-stone-500"}`} />
                        <span className="text-xs font-serif font-bold text-white">Pay via UPI</span>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">Instant</span>
                      </div>
                      {paymentMethod === "UPI" && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                      )}
                    </div>

                    {/* Cash on Delivery (COD) Card */}
                    <div 
                      onClick={handleSelectCod}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer relative ${
                        paymentMethod === "COD" 
                          ? "border-red-500/50 bg-red-500/5" 
                          : "border-white/5 bg-black/20 opacity-60 hover:opacity-100 text-stone-500"
                      }`}
                      id="opt-pay-cod"
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Truck className="w-5 h-5 text-stone-500" />
                        <span className="text-xs font-serif font-bold text-stone-400">Cash on Delivery</span>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-sm">Unavailable</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPI EXPANDED MODE */}
                {paymentMethod === "UPI" ? (
                  <div className="space-y-5 animate-fadeIn" id="upi-details-container">
                    <div className="bg-[#080809]/60 p-5 rounded-xl border border-[#c5a059]/10 shadow-2xl space-y-4">
                      <div className="text-center">
                        <span className="text-[10px] bg-[#c5a059]/10 text-[#c5a059] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold inline-block border border-[#c5a059]/25 mb-3">
                          Instant UPI Scan
                        </span>
                        <h4 className="font-serif text-white text-xs uppercase tracking-wider">Beneficiary: {payment.accountName || "Bloom & Box Gifting"}</h4>
                      </div>

                      {/* QR Barcode */}
                      <div className="w-44 h-44 bg-white border border-[#c5a059]/20 rounded-2xl p-2.5 mx-auto flex items-center justify-center relative shadow-2xl overflow-hidden animate-fadeIn">
                        {payment.upiQrImage ? (
                          <img 
                            id="upi-payment-qrcode"
                            src={payment.upiQrImage} 
                            alt="Bespoke Account QR" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <img 
                            id="upi-payment-qrcode"
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=120f0c&data=${encodeURIComponent(
                              `upi://pay?pa=${payment.upiId}&pn=${encodeURIComponent(payment.accountName || "Bloom & Box")}&am=${grandTotal}&cu=INR`
                            )}`} 
                            alt="Generated UPI QR code" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      {/* Beneficiary Details */}
                      <div className="space-y-2 pt-1">
                        {/* Copy UPI Address ID */}
                        <div className="bg-[#060607] p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs hover:bg-[#0c0c0d] transition-colors">
                          <div className="font-mono text-[10px] truncate text-stone-300 max-w-[200px]">
                            {payment.upiId}
                          </div>
                          <button 
                            onClick={handleCopyUpi} 
                            className="flex items-center gap-1 py-1 px-2.5 rounded-md bg-white/5 border border-white/10 hover:bg-[#c5a059]/15 text-stone-300 hover:text-white transition-colors text-[9px] uppercase font-bold cursor-pointer"
                            title="Copy Beneficiary UPI Address"
                          >
                            {copiedUpi ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[9px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Account Name */}
                        <div className="bg-[#060607] p-2.5 rounded-lg border border-white/5 flex justify-between text-[10px]">
                          <span className="text-stone-400">Account Name:</span>
                          <span className="font-serif text-white font-semibold">{payment.accountName || "Bloom & Box Gifting"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot File Upload module */}
                    <div className="space-y-1.5" id="screenshot-upload-module">
                      <label className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold font-mono flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Payment Screenshot *</span>
                      </label>
                      <p className="text-[9px] text-stone-400">Please snapshot your transaction receipt for verification.</p>

                      {screenshot ? (
                        <div className="bg-[#080809] border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3 relative animate-fadeIn" id="screenshot-preshow">
                          <div className="w-10 h-10 rounded bg-stone-900 border border-white/10 overflow-hidden relative">
                            <img src={screenshot} alt="Receipt thumbnail" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-white text-xs font-mono font-bold truncate">{screenshotName || "uploaded_screenshot.png"}</p>
                            <span className="text-[9px] text-emerald-400 font-bold font-mono">Attachment Secured</span>
                          </div>
                          <button 
                            onClick={() => {
                              setScreenshot(null);
                              setScreenshotName("");
                            }}
                            className="text-[10px] text-stone-400 hover:text-red-400 underline font-mono uppercase cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <label className="border border-white/10 border-dashed hover:border-[#c5a059]/40 bg-black/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-white/5 py-6">
                          <ImageIcon className="w-7 h-7 text-stone-500" />
                          <span className="text-white text-xs font-bold font-mono mt-1">Select Receipt File</span>
                          <span className="text-[9px] text-stone-500">Supports PNG, JPG, WebP</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleScreenshotChange} 
                          />
                        </label>
                      )}
                    </div>

                    {/* Instructions segment */}
                    <div className="bg-[#c5a059]/5 p-4 rounded-xl border border-[#c5a059]/15 text-stone-300 text-xs leading-relaxed space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 gold-text font-bold uppercase text-[9px] tracking-wider mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Checkout Instructions</span>
                      </div>
                      {payment.paymentInstructions ? (
                        <div className="whitespace-pre-line text-stone-400 text-[10.5px]">
                          {payment.paymentInstructions}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p>1. Scan the QR code or copy the UPI ID using GPay, Paytm, or any banking app.</p>
                          <p>2. Complete the transaction for the exact Grand Total: <strong className="font-mono text-white">₹{grandTotal.toLocaleString()}</strong></p>
                          <p>3. Take a screenshot of the successful receipt and upload it above.</p>
                          <p>4. Click "Submit Order" below - our secure concierge team will verify and dispatch.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // COD ACTIVE WARNING (BLOCKED)
                  <div className="space-y-4 animate-fadeIn" id="cod-blocked-pane">
                    <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-5 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto border border-rose-500/20">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-rose-400 font-mono">Cash on Delivery Locked</h4>
                        <p className="text-stone-300 text-[10.5px] leading-relaxed max-w-xs mx-auto mt-1">
                          Cash on Delivery is currently unavailable due to transport logistics. Please select UPI payment on the card above to authorize instant boutique dispatch.
                        </p>
                      </div>
                      <button 
                        onClick={() => setPaymentMethod("UPI")}
                        className="py-1.5 px-4 bg-white/5 border border-white/10 hover:bg-[#c5a059]/10 text-[#c5a059] font-bold font-mono text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        Activate Highlighted UPI option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // STEP 3: ELEGANT PREMIUM CONFIRMATION SCREEN
              <div className="space-y-6 text-center animate-fadeIn" id="checkout-confirmation-step">
                <div className="py-8 space-y-4">
                  {/* Glowing success seal */}
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl shadow-emerald-500/5 pulse-amber">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#c5a059] font-mono uppercase tracking-[0.25em] font-semibold block">Curation Reserved</span>
                    <h2 className="font-serif font-extrabold text-white text-xl tracking-wide">Elite Order Initiated!</h2>
                  </div>
                </div>

                {/* Main Order card */}
                <div className="bg-[#080809] border border-white/5 rounded-2xl p-5 text-left space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[9px] text-stone-500 font-mono uppercase">Receipt Reference</span>
                      <p className="text-sm font-mono font-bold text-white tracking-widest">{placedOrder?.id || "BB-PENDING"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-stone-400 font-mono uppercase tracking-wider block">Verification State</span>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-amber-400 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 animate-pulse inline-block mt-0.5">
                        Payment Verification Pending
                      </span>
                    </div>
                  </div>

                  {/* Purchased items list */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#c5a059] font-mono uppercase tracking-wider block">Reserved Selected Hampers</span>
                    <div className="space-y-2 font-serif text-[11.5px] text-stone-300">
                      {placedOrder?.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <span>{it.hamperName} <span className="font-sans font-normal text-stone-500 text-[10px] font-mono">x{it.quantity}</span></span>
                          <span className="font-mono text-white">₹{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Total */}
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-sans">Payment Channel / Total:</span>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-stone-400 block">{placedOrder?.paymentMode} Settlement</span>
                      <span className="font-mono text-sm font-bold gold-text">₹{placedOrder?.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Concierge details */}
                <div className="bg-[#c5a059]/5 border border-[#c5a059]/10 rounded-xl p-4 text-left leading-relaxed text-[11px] text-stone-400 space-y-1.5 flex gap-3">
                  <span className="text-xl">✨</span>
                  <p>
                    Your transaction receipt has been safely locked for verification. Our luxury concierge team is reviewing the screenshot attachment. Delivery tracking handles and WhatsApp coordinates will sync to <strong className="text-white font-sans">{placedOrder?.customerEmail || "registered address"}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Checkout Footer (Hidden in Confirmation Page) */}
          {cartItems.length > 0 && checkoutStep !== "confirmation" && (
            <div className="px-6 py-5 bg-[#080809] border-t border-white/5 space-y-4" id="cart-drawer-footer">
              
              {/* Promo code block */}
              {currentUser ? (
                <div className="border-b border-white/5 pb-3 mb-1 space-y-2 animate-fadeIn" id="cart-coupon-form">
                  <span className="text-[9px] text-[#c5a059] font-mono uppercase tracking-widest block">Gilded Reward Promo Code</span>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-950/25 border border-emerald-500/20 p-2 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-mono text-emerald-300 font-bold truncate uppercase">{appliedCoupon} (-₹{appliedDiscount})</span>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon} 
                        className="text-stone-400 hover:text-white transition-colors underline text-[10px] uppercase font-mono font-bold cursor-pointer pr-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="BB-REWARD-XXX" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white flex-1 focus:outline-none focus:border-[#c5a059] uppercase"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="py-2 px-4 rounded-lg text-xs font-mono font-bold uppercase tracking-widest bg-[#c5a059]/20 hover:bg-[#c5a059] hover:text-black text-stone-200 border border-[#c5a059]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[10px] text-red-400 leading-normal font-sans pt-0.5">{couponError}</p>
                  )}
                  {couponSuccess && (
                     <p className="text-[10px] text-emerald-400 leading-normal font-sans pt-0.5">{couponSuccess}</p>
                  )}
                </div>
              ) : (
                <div className="bg-[#c5a059]/5 border border-[#c5a059]/10 rounded-lg p-2.5 text-center text-[9px] text-stone-400 mb-1 font-sans">
                  💡 <span className="text-[#c5a059] font-semibold uppercase font-mono text-[8.5px] tracking-wider">Member Exclusive:</span> Sign in to member dashboard to earn points and apply custom voucher saving codes!
                </div>
              )}

              {/* Financial Breakdowns */}
              <div className="space-y-2 text-stone-400 text-xs">
                
                <div className="flex justify-between">
                  <span>Selected Luxury Base</span>
                  <span className="font-mono text-stone-300">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST Liability ({settings.gstPercentage}%)</span>
                  <span className="font-mono text-stone-300">₹{gstAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Boutique Express Delivery</span>
                  <span className="font-mono text-stone-300">
                    {delivery === 0 ? (
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">FREE OF CHARGE</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Reward Voucher Applied ({appliedCoupon})</span>
                    <span className="font-mono font-bold">-₹{appliedDiscount.toLocaleString()}</span>
                  </div>
                )}

                {/* Free shipping booster bar if positive */}
                {!isFreeDelivery && subtotal > 0 && (
                  <div className="bg-[#c5a059]/5 text-[10px] text-stone-300 border border-[#c5a059]/15 p-2 rounded-md leading-relaxed font-sans">
                    ✨ Add <strong className="font-mono">₹{(settings.freeShippingThreshold - subtotal).toLocaleString()}</strong> more to get <strong>Free Express Delivery</strong>!
                  </div>
                )}

                <div className="flex justify-between text-white font-serif text-sm border-t border-white/5 pt-3 mt-1">
                  <span>Grand Total Payable</span>
                  <span className="font-mono gold-text text-base">₹{grandTotal.toLocaleString()}</span>
                </div>

              </div>

              {/* Step Navigation Button */}
              {checkoutStep === "cart" ? (
                <button
                  id="checkout-next-btn"
                  onClick={() => setCheckoutStep("payment")}
                  className="w-full py-3 gold-gradient text-black font-extrabold rounded-xl text-xs tracking-widest uppercase hover:gold-gradient-hover transition-all shadow-lg active:scale-98 text-center inline-block cursor-pointer"
                >
                  PROCEED TO PAYMENT SELECT
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    id="checkout-back-cart-btn"
                    onClick={() => setCheckoutStep("cart")}
                    className="py-3 px-4 border border-white/10 hover:bg-white/5 rounded-xl text-stone-300 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase cursor-pointer"
                  >
                    Back
                  </button>
                  
                  {paymentMethod === "COD" ? (
                    <button
                      type="button"
                      disabled
                      className="flex-grow py-3 bg-red-950/20 text-rose-500 border border-rose-500/20 rounded-xl font-mono text-[10px] uppercase tracking-widest cursor-not-allowed opacity-90 transition-all text-center flex items-center justify-center"
                      id="disabled-cod-btn"
                    >
                      COD IS UNAVAILABLE
                    </button>
                  ) : !screenshot ? (
                    <button
                      type="button"
                      disabled
                      className="flex-grow py-3 bg-white/5 border border-white/15 text-stone-500 rounded-xl font-mono text-[9.5px] uppercase tracking-widest cursor-not-allowed transition-all text-center flex items-center justify-center"
                      id="disabled-receipt-submit-btn"
                    >
                      UPLOAD SCREENSHOT TO SUBMIT
                    </button>
                  ) : (
                    <button
                      id="submit-order-checkout-btn"
                      onClick={handleOrderSubmission}
                      disabled={submittingOrder}
                      className="flex-grow py-3 gold-gradient hover:gold-gradient-hover text-black rounded-xl font-extrabold text-xs tracking-widest uppercase transition-all shadow-lg text-center flex items-center justify-center gap-1.5 px-4 cursor-pointer"
                    >
                      {submittingOrder ? "INITIATING..." : "SUBMIT ORDER"}
                    </button>
                  )}
                </div>
              )}

              <p className="text-[9px] text-stone-500 text-center uppercase tracking-[0.2em] font-mono">
                Locked & Safe SSL Curations
              </p>
            </div>
          )}

          {/* Pricing & Checkout Footer on Confirmation Page */}
          {checkoutStep === "confirmation" && (
            <div className="px-6 py-5 bg-[#080809] border-t border-white/5 space-y-4">
              <button
                onClick={handleReturnToShopping}
                className="w-full py-3.5 gold-gradient text-black font-extrabold rounded-xl text-xs tracking-widest uppercase hover:gold-gradient-hover transition-all shadow-lg text-center inline-block cursor-pointer font-sans"
                id="confirmation-return-btn"
              >
                Return to Boutique Shopping
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Cash on Delivery (COD) unavailable Alert Modal Backdrop/Popup */}
      {codAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn" id="cod-alert-modal">
          <div className="bg-[#0b0b0c] border border-red-500/25 rounded-2xl p-6 max-w-sm text-center shadow-2xl relative max-w-xs scale-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-serif font-bold text-white text-base mb-2">Service Restriction</h3>
            <p className="text-stone-300 text-[11px] leading-relaxed mb-6 font-sans">
              {codAlert}
            </p>
            <button
              onClick={() => {
                setCodAlert(null);
                setPaymentMethod("UPI");
              }}
              className="w-full py-2.5 bg-[#c5a059]/20 hover:bg-[#c5a059] hover:text-black text-stone-200 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition-all border border-[#c5a059]/40 cursor-pointer"
              id="cod-alert-dismiss"
            >
              Choose UPI Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
