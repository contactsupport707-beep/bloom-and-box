/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  LogOut, 
  Map, 
  Package, 
  Truck, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Search,
  Check,
  Clipboard,
  X,
  AlertCircle,
  Sparkles,
  Crown,
  Award,
  Gift,
  Copy
} from "lucide-react";
import { BoutiqueUser, Hamper, BoutiqueOrder, UserAddress } from "../types";

interface MemberDashboardProps {
  currentUser: BoutiqueUser;
  onLogout: () => void;
  hampers: Hamper[];
  orders: BoutiqueOrder[];
  onAddToCart: (hamper: Hamper) => void;
  onUpdateUser: (updatedUser: BoutiqueUser) => void;
}

export function MemberDashboard({
  currentUser,
  onLogout,
  hampers,
  orders,
  onAddToCart,
  onUpdateUser
}: MemberDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "orders" | "track" | "wishlist" | "addresses" | "loyalty">("profile");
  
  // Local profile edits
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Local address states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZipCode, setAddrZipCode] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Status Check Tracking Lookups
  const [trackSearchId, setTrackSearchId] = useState("");
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<BoutiqueOrder | null>(null);
  const [trackError, setTrackError] = useState("");

  // Local Loyalty rewards states
  const [redeemingReward, setRedeemingReward] = useState(false);
  const [loyaltySuccess, setLoyaltySuccess] = useState("");
  const [loyaltyError, setLoyaltyError] = useState("");
  const [copiedCouponCode, setCopiedCouponCode] = useState("");

  // Sync edit states when user changes
  useEffect(() => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone || "");
  }, [currentUser]);

  // Orders matching the customer email
  const myOrdersList = orders.filter(
    (o) => o.customerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
  );

  // Dynamic calculations for Patron Gilded Loyalty
  const nonCancelledOrders = myOrdersList.filter(o => o.status !== "Cancelled");
  const totalSpend = nonCancelledOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // Spent based loyalty points increment
  const calculatedPointsFromSpend = Math.floor(totalSpend / 100);
  
  // Current points (which server stores on backend but client defaults safely if undefined)
  const currentPoints = currentUser.loyaltyPoints !== undefined ? currentUser.loyaltyPoints : (500 + calculatedPointsFromSpend);

  // Tier criteria
  let currentTierName = "Bronze";
  let tierColorClass = "text-stone-300 border-stone-500/30";
  let tierBadgeBg = "bg-stone-500/10";
  let nextTierName = "Gold";
  let targetRequired = 5000 - totalSpend;
  let progressPercent = Math.min(100, (totalSpend / 5000) * 100);

  if (totalSpend >= 20000) {
    currentTierName = "Diamond";
    tierColorClass = "text-cyan-300 border-cyan-500/40 shadow-cyan-950/20";
    tierBadgeBg = "bg-cyan-500/10";
    nextTierName = "None (Max Tier Reach!)";
    targetRequired = 0;
    progressPercent = 100;
  } else if (totalSpend >= 5000) {
    currentTierName = "Gold";
    tierColorClass = "text-yellow-400 border-[#c5a059]/40 shadow-yellow-950/10";
    tierBadgeBg = "bg-yellow-500/10";
    nextTierName = "Diamond";
    targetRequired = 20000 - totalSpend;
    progressPercent = Math.min(100, (totalSpend / 20000) * 100);
  }

  const handleRedeemReward = async (type: string) => {
    setRedeemingReward(true);
    setLoyaltySuccess("");
    setLoyaltyError("");

    try {
      const res = await fetch("/api/auth/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardType: type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Points redemption failed");

      setLoyaltySuccess(`Prestigious Coupon ${data.coupon.code} unlocked! Copy it below and enter in checkout key fields.`);
      onUpdateUser(data.user);
    } catch (err: any) {
      setLoyaltyError(err.message);
    } finally {
      setRedeemingReward(false);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(""), 3000);
  };

  // Profile Save handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) {
      setProfileError("Name cannot be left blank.");
      return;
    }

    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile update failed.");

      setProfileSuccess("Member registry coordinate updated successfully!");
      onUpdateUser(data.user);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Address Save Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrZipCode) {
      setAddressError("Please complete all mandatory location coordinates.");
      return;
    }

    setSavingAddress(true);
    setAddressError("");

    try {
      const res = await fetch("/api/auth/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addrLabel,
          fullName: addrFullName,
          phone: addrPhone,
          addressLine1: addrLine1,
          addressLine2: addrLine2,
          city: addrCity,
          state: addrState,
          zipCode: addrZipCode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Address registration failed.");

      onUpdateUser(data.user);
      setShowAddressForm(false);
      
      // Reset form fields
      setAddrFullName("");
      setAddrPhone("");
      setAddrLine1("");
      setAddrLine2("");
      setAddrCity("");
      setAddrState("");
      setAddrZipCode("");
      setAddrLabel("Home");
    } catch (err: any) {
      setAddressError(err.message);
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete Address handler
  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/address/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
      }
    } catch (err) {
      console.error("Failed to delete address coordinates:", err);
    }
  };

  // Quick select dynamic tracker action helper
  const handleTrackerLink = (order: BoutiqueOrder) => {
    setSelectedTrackOrder(order);
    setTrackSearchId(order.id);
    setActiveSubTab("track");
  };

  // Generic Search Track Trigger
  const handleSearchTrackId = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setSelectedTrackOrder(null);

    const term = trackSearchId.trim().toUpperCase();
    if (!term) return;

    // Search in overall system orders
    const found = orders.find((o) => o.id.toUpperCase() === term);
    if (found) {
      setSelectedTrackOrder(found);
    } else {
      setTrackError("No record matching this Reference ID has been indexed yet.");
    }
  };

  // Wishlist item toggle in member-dashboard
  const handleToggleWishlistItem = async (hamperId: string) => {
    try {
      const res = await fetch("/api/auth/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hamperId })
      });
      const data = await res.json();
      if (res.ok) {
        // Fetch updated user status
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meRes.ok) {
          onUpdateUser(meData.user);
        }
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
    }
  };

  // Wishlist list
  const wishlistHampers = hampers.filter((h) => currentUser.wishlist.includes(h.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="member-gilded-dashboard">
      
      {/* Upper Welcome Header banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 mb-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6" id="dashboard-welcome-banner">
        <div className="absolute inset-0 bg-[#c5a059]/5 pointer-events-none opacity-40" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-serif text-[#c5a059] text-xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a059]">Patron Gilded Room</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-serif text-white tracking-widest uppercase">{currentUser.name}</h1>
            <p className="text-xs text-stone-400 font-mono mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-center">
            <span className="block text-[8px] uppercase tracking-widest text-[#c5a059] font-bold">Joined In</span>
            <span className="text-xs font-serif font-semibold text-white">{new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-center">
            <span className="block text-[8px] uppercase tracking-widest text-[#c5a059] font-bold">Orders Placed</span>
            <span className="text-xs font-serif font-semibold text-white">{myOrdersList.length}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="p-3 bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-white border border-red-925/20 hover:border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            id="btn-logout-sign"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout Key</span>
          </button>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="dashboard-core-structure">
        
        {/* Left Side Sub-Navigation sidebar */}
        <div className="lg:col-span-1 space-y-2" id="dashboard-side-menu">
          
          <button
            id="subtab-profile-btn"
            onClick={() => setActiveSubTab("profile")}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-3 transition-colors ${
              activeSubTab === "profile"
                ? "bg-[#c5a059]/10 border border-[#c5a059]/40 text-white"
                : "border border-transparent hover:bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4 text-[#c5a059]" />
            <span>My Profile</span>
          </button>

          <button
            id="subtab-loyalty-btn"
            onClick={() => setActiveSubTab("loyalty")}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-3 transition-all ${
              activeSubTab === "loyalty"
                ? "bg-[#c5a059]/15 border border-[#c5a059]/50 text-white shadow-lg"
                : "border border-transparent hover:bg-white/5 text-[#c5a059] hover:text-white"
            }`}
          >
            <Crown className="w-4 h-4 text-[#c5a059]" />
            <span className="flex items-center gap-1.5">
              Patron Rewards
              <span className="text-[8px] bg-red-500/80 text-white px-1 py-0.5 rounded font-sans antialiased animate-pulse font-normal tracking-normal uppercase">New</span>
            </span>
          </button>

          <button
            id="subtab-orders-btn"
            onClick={() => setActiveSubTab("orders")}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-3 transition-colors ${
              activeSubTab === "orders"
                ? "bg-[#c5a059]/10 border border-[#c5a059]/40 text-white"
                : "border border-transparent hover:bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#c5a059]" />
            <span>Order History</span>
          </button>

          <button
            id="subtab-track-btn"
            onClick={() => setActiveSubTab("track")}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-3 transition-colors ${
              activeSubTab === "track"
                ? "bg-[#c5a059]/10 border border-[#c5a059]/40 text-white"
                : "border border-transparent hover:bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4 text-[#c5a059]" />
            <span>Track Orders</span>
          </button>

          <button
            id="subtab-wishlist-btn"
            onClick={() => setActiveSubTab("wishlist")}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-3 transition-colors ${
              activeSubTab === "wishlist"
                ? "bg-[#c5a059]/10 border border-[#c5a059]/40 text-white"
                : "border border-transparent hover:bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4 text-[#c5a059]" />
            <span>My Wishlist</span>
          </button>

          <button
            id="subtab-addresses-btn"
            onClick={() => setActiveSubTab("addresses")}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-3 transition-colors ${
              activeSubTab === "addresses"
                ? "bg-[#c5a059]/10 border border-[#c5a059]/40 text-white"
                : "border border-transparent hover:bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            <MapPin className="w-4 h-4 text-[#c5a059]" />
            <span>Saved Addresses</span>
          </button>

        </div>

        {/* Right Side Main Viewport */}
        <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 min-h-[420px]" id="dashboard-viewport">
          
          {/* TAB 0: LOYALTY REWARDS */}
          {activeSubTab === "loyalty" && (
            <div className="space-y-6 animate-fadeIn" id="subtab-loyalty-pane">
              <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif text-white uppercase tracking-widest flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#c5a059]" />
                    <span>Gilded Loyalty Circle</span>
                  </h2>
                  <p className="text-xs text-stone-400">Unlock sovereign rewards, track status, and convert points to checkout discounts</p>
                </div>
                <div className="px-4 py-2 bg-[#c5a059]/10 rounded-xl border border-[#c5a059]/20 flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">My Balance</span>
                  <span className="text-lg font-serif font-black text-white">{currentPoints} <span className="text-[#c5a059] text-xs font-sans font-normal">pts</span></span>
                </div>
              </div>

              {loyaltySuccess && (
                <div className="p-3.5 bg-emerald-950/45 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <span>{loyaltySuccess}</span>
                </div>
              )}

              {loyaltyError && (
                <div className="p-3.5 bg-red-950/45 border border-red-500/30 text-red-200 text-xs rounded-xl flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                  <span>{loyaltyError}</span>
                </div>
              )}

              {/* Status & progress bento block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Current stats */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#c5a059]">Active Member Level</span>
                      <h4 className="text-lg font-serif font-bold text-white tracking-wide uppercase flex items-center gap-1.5 pt-0.5">
                        <Award className="w-4 h-4 text-[#c5a059]" />
                        {currentTierName} Tier
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-stone-300 font-mono text-[9px] font-bold uppercase tracking-widest">
                      Spends Verified
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-400">Total Account Spend</span>
                      <span className="text-stone-200">₹{totalSpend.toLocaleString("en-IN")}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-stone-905 rounded-full overflow-hidden border border-white/5 bg-stone-900">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-[#c5a059] transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-stone-500 leading-normal pt-1">
                      <span>Bronze (₹0)</span>
                      <span>Gold (₹5,000)</span>
                      <span>Diamond (₹20,000)</span>
                    </div>
                  </div>

                  {nextTierName !== "None" && (
                    <p className="text-[10px] text-[#c5a059] leading-relaxed font-sans pt-1">
                      ✨ Spend another <strong className="font-mono">₹{targetRequired.toLocaleString()}</strong> soon to unlock the prestigious <strong className="uppercase">{nextTierName}</strong> level!
                    </p>
                  )}
                </div>

                {/* Tier Perks Details card */}
                <div className="p-5 rounded-2xl bg-[#09090a] border border-[#c5a059]/10 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400">Level Benefits</span>
                    <h5 className="font-serif text-white font-medium text-xs uppercase tracking-wider pt-0.5">Tier Privileges</h5>
                    <ul className="text-[10px] text-stone-400 space-y-1.5 pt-3 leading-relaxed list-disc list-inside">
                      <li><strong>Bronze</strong>: 500pt welcome, ₹100 spend codes.</li>
                      <li><strong>Gold</strong>: 5% lower redeem rate on codes, Priority packaging.</li>
                      <li><strong>Diamond</strong>: 20% lower redeem rate, Exclusive concierge gift support.</li>
                    </ul>
                  </div>
                  <span className="text-[8px] text-[#c5a059] bg-[#c5a059]/5 text-center py-1 rounded font-mono uppercase tracking-wider block">
                    Level Upwards through checkouts
                  </span>
                </div>

              </div>

              {/* Points Redemption Catalog */}
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-sm font-serif text-white uppercase tracking-wider">Unseal Gilded Discount Vouchers</h3>
                  <p className="text-[11px] text-stone-400">Debit points to instantly compile copyable discount coupons</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Reward 1: Bronze voucher */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3 relative overflow-hidden group flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-[#c5a059] font-mono">100 Points Cost</span>
                      <h4 className="text-white font-serif text-sm">₹100 Gilded Giver Coupon</h4>
                      <p className="text-[10px] text-stone-400">Valid on any luxury gift order in the boutique store.</p>
                    </div>
                    <button
                      disabled={currentPoints < 100 || redeemingReward}
                      onClick={() => handleRedeemReward("BRONZE-100")}
                      className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                        currentPoints >= 100 
                          ? "bg-white/10 hover:bg-[#c5a059] hover:text-black text-white" 
                          : "bg-stone-900 text-stone-600 border border-white/5 cursor-not-allowed"
                      }`}
                    >
                      {currentPoints >= 100 ? "Redeem for 100 pts" : "Locked (100 pts)"}
                    </button>
                  </div>

                  {/* Reward 2: Gold voucher */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3 relative overflow-hidden group flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-[#c5a059] font-mono">250 Points Cost</span>
                      <h4 className="text-white font-serif text-sm">₹250 Sovereign Crown Coupon</h4>
                      <p className="text-[10px] text-stone-400">Unlock high-tier luxury savings for special custom hampers.</p>
                    </div>
                    <button
                      disabled={currentPoints < 250 || redeemingReward}
                      onClick={() => handleRedeemReward("GOLD-250")}
                      className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                        currentPoints >= 250 
                          ? "bg-white/10 hover:bg-[#c5a059] hover:text-black text-white" 
                          : "bg-stone-900 text-stone-600 border border-white/5 cursor-not-allowed"
                      }`}
                    >
                      {currentPoints >= 250 ? "Redeem for 250 pts" : "Locked (250 pts)"}
                    </button>
                  </div>

                  {/* Reward 3: Diamond voucher */}
                  <div className="p-5 rounded-xl bg-[#0e0e11] border border-[#c5a059]/20 space-y-3 relative overflow-hidden group flex flex-col justify-between" id="diamond-voucher-card">
                    <div className="absolute top-0 right-0 bg-[#c5a059]/10 border-l border-b border-[#c5a059]/20 px-2 py-0.5 rounded-bl-lg text-[8px] uppercase font-bold text-[#c5a059] tracking-widest font-mono">
                      Best Value!
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-[#c5a059] font-mono">400 Points Cost <span className="line-through text-stone-600 font-mono">500</span></span>
                      <h4 className="text-white font-serif text-sm">₹500 Master Imperial Coupon</h4>
                      <p className="text-[10px] text-stone-400">Supreme Royal Gifting tier discount for absolute patrons.</p>
                    </div>
                    <button
                      disabled={currentPoints < 400 || redeemingReward}
                      onClick={() => handleRedeemReward("DIAMOND-500")}
                      className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                        currentPoints >= 400 
                          ? "bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 font-bold" 
                          : "bg-stone-900 text-stone-600 border border-white/5 cursor-not-allowed"
                      }`}
                    >
                      {currentPoints >= 400 ? "Redeem for 400 pts" : "Locked (400 pts)"}
                    </button>
                  </div>

                </div>
              </div>

              {/* List of active/redeemed coupons */}
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-sm font-serif text-white uppercase tracking-wider">Unused Redeemed Vouchers</h3>
                  <p className="text-[11px] text-stone-400">Copy unused voucher codes to key-in on checkout cart drawers</p>
                </div>

                {!currentUser.redeemedCoupons || currentUser.redeemedCoupons.filter(c => !c.isUsed).length === 0 ? (
                  <div className="text-center py-6 bg-white/5 border border-dashed border-white/5 rounded-xl text-stone-500 text-xs">
                    <p>No unused voucher codes available in your circular. Redeem points above to generate.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentUser.redeemedCoupons.filter(c => !c.isUsed).map((coupon) => (
                      <div 
                        key={coupon.code} 
                        className="p-4 bg-stone-950/45 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn"
                        id={`loyalty-coupon-${coupon.code}`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-serif text-white uppercase tracking-wider font-semibold">₹{coupon.discountAmount} Luxury Discount Code</p>
                          <p className="text-[9px] text-[#c5a059] font-mono">Redeemed {new Date(coupon.createdAt).toLocaleString()} for {coupon.pointsSpent} pts</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="font-mono text-center text-xs text-white bg-[#0d0d0e] border border-white/10 px-3 py-2 rounded-xl">
                            {coupon.code}
                          </div>
                          
                          <button
                            onClick={() => handleCopyCoupon(coupon.code)}
                            className="p-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none transition-all flex items-center gap-1"
                          >
                            {copiedCouponCode === coupon.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History of used coupons */}
              {currentUser.redeemedCoupons && currentUser.redeemedCoupons.some(c => c.isUsed) && (
                <div className="space-y-2 opacity-60">
                  <div className="border-b border-white/5 pb-1">
                    <h3 className="text-xs font-serif text-zinc-400 uppercase tracking-wider">Archived Spent Vouchers</h3>
                  </div>
                  <div className="space-y-2 animate-fadeIn">
                    {currentUser.redeemedCoupons.filter(c => c.isUsed).map((coupon) => (
                      <div 
                        key={coupon.code} 
                        className="p-3 bg-stone-900/30 rounded-xl border border-white/5 flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="text-stone-300 font-serif leading-tight">₹{coupon.discountAmount} Spent Voucher</p>
                          <p className="text-[9px] text-stone-500 font-mono">{coupon.code} (Debited {coupon.pointsSpent} pts)</p>
                        </div>
                        <span className="text-[9px] text-[#c5a059] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5">
                          Swiped & Used ✓
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeSubTab === "profile" && (
            <div className="space-y-6 animate-fadeIn" id="subtab-profile-pane">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-serif text-white uppercase tracking-widest">Profile Configuration</h2>
                <p className="text-xs text-stone-400">Review your Gilded Circular member profile registry info</p>
              </div>

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-950/45 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 bg-red-950/45 border border-red-500/30 text-red-200 text-xs rounded-xl flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">Email Coordinate</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full text-xs p-3.5 bg-neutral-900 border border-white/5 rounded-xl text-stone-500 font-mono focus:outline-none cursor-not-allowed select-none"
                  />
                  <span className="text-[9px] text-stone-500 block">Contact email is linked permanently to your verification logs.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">Full Patron Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">Contact Mobile Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-[#c5a059] hover:bg-[#c5a059]/90 text-black font-semibold text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 shadow-lg shadow-yellow-950/10"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingProfile ? "Saving changes..." : "Save Coordinates ✓"}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeSubTab === "orders" && (
            <div className="space-y-6 animate-fadeIn" id="subtab-orders-pane">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-serif text-white uppercase tracking-widest">Order Vault</h2>
                <p className="text-xs text-stone-400">Track current and historic fine gift hampers purchased</p>
              </div>

              {myOrdersList.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-14 bg-white/5 border border-white/5 rounded-2xl mx-auto flex items-center justify-center text-stone-600 font-serif font-semibold text-lg select-none">
                    BB
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="font-serif text-white">No custom transactions recorded</p>
                    <p className="text-stone-400 text-xs">All custom hampers ordered with your email will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrdersList.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      id={`order-card-${order.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs text-[#c5a059] font-bold">{order.id}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="space-y-0.5 pt-1.5">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-xs text-stone-200">
                              🎁 {item.hamperName} <span className="text-[10px] text-stone-400">x{item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t border-white/5 pt-3 md:border-none md:pt-0">
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-[#c5a059] text-right">Grand Total</span>
                          <span className="text-sm font-serif font-bold text-white">₹{order.grandTotal.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide border ${
                            order.status === "Delivered" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300" :
                            order.status === "Shipped" ? "bg-cyan-950/40 border-cyan-500/20 text-cyan-300" :
                            order.status === "Cancelled" ? "bg-stone-900 border-white/10 text-stone-500Line" :
                            "bg-orange-950/40 border-orange-500/20 text-orange-300"
                          }`}>
                            {order.status}
                          </span>

                          <button
                            onClick={() => handleTrackerLink(order)}
                            className="p-1 px-3 bg-white/5 hover:bg-white/10 text-[#c5a059] hover:text-white border border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                            id={`track-order-btn-${order.id}`}
                          >
                            Track Live
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRACK ORDERS */}
          {activeSubTab === "track" && (
            <div className="space-y-6 animate-fadeIn" id="subtab-track-pane">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-serif text-white uppercase tracking-widest">Logistics Tracker</h2>
                <p className="text-xs text-stone-400">Verify dynamic shipment and preparation states</p>
              </div>

              {/* Tracker input helper */}
              <form onSubmit={handleSearchTrackId} className="flex gap-2 max-w-md">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-stone-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter Order/AWB Code (e.g. BB-9831)"
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    className="w-full text-xs py-3.5 pl-10 pr-3 bg-[#0d0d0e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a059] font-mono text-center"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-[#c5a059]/20 text-[#c5a059] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Lookup
                </button>
              </form>

              {trackError && (
                <div className="p-3 bg-red-950/25 border border-red-500/20 rounded-xl text-xs text-red-300 max-w-md">
                  {trackError}
                </div>
              )}

              {/* Live tracking stepper visualizer */}
              {selectedTrackOrder ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6 animate-fadeIn" id="tracker-visualizer">
                  <div className="flex justify-between items-baseline flex-wrap gap-2 pb-2 border-b border-white/5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#c5a059] font-bold font-mono">Reference ID: {selectedTrackOrder.id}</span>
                      <h4 className="text-lg font-serif text-white pt-0.5">Custom Gift Delivery</h4>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 font-mono text-right block">Payment Mode: {selectedTrackOrder.paymentMode}</span>
                      {selectedTrackOrder.trackingNumber && (
                        <span className="text-[10px] text-stone-400 font-mono text-right block">AWB: {selectedTrackOrder.trackingNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Steps */}
                  <div id="tracker-stepper" className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 select-none">
                    
                    {/* Step 1: Requested */}
                    <div className="flex md:flex-col items-center gap-3 md:text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        ["Pending", "Processing", "Shipped", "Delivered"].includes(selectedTrackOrder.status)
                          ? "bg-stone-900 border-[#c5a059] text-[#c5a059]"
                          : "bg-stone-900 border-white/10 text-stone-600"
                      }`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-serif text-white md:mt-2">Order Cataloged</span>
                        <span className="block text-[9px] text-stone-400">Creation received</span>
                      </div>
                    </div>

                    {/* Step 2: Gilded Curation */}
                    <div className="flex md:flex-col items-center gap-3 md:text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        ["Processing", "Shipped", "Delivered"].includes(selectedTrackOrder.status)
                          ? "bg-stone-900 border-[#c5a059] text-[#c5a059]"
                          : "bg-stone-900 border-white/10 text-stone-600"
                      }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-serif text-white md:mt-2">Master Curation</span>
                        <span className="block text-[9px] text-stone-400">Premium ribbon wrapping</span>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex md:flex-col items-center gap-3 md:text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        ["Shipped", "Delivered"].includes(selectedTrackOrder.status)
                          ? "bg-stone-900 border-[#c5a059] text-[#c5a059]"
                          : "bg-stone-900 border-white/10 text-stone-600"
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-serif text-white md:mt-2">Handed to Courier</span>
                        <span className="block text-[9px] text-stone-400">Premium cargo delivery</span>
                      </div>
                    </div>

                    {/* Step 4: Delight */}
                    <div className="flex md:flex-col items-center gap-3 md:text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        selectedTrackOrder.status === "Delivered"
                          ? "bg-stone-900 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10"
                          : "bg-stone-900 border-white/10 text-stone-600"
                      }`}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-serif text-white md:mt-2">Successfully Delivered</span>
                        <span className="block text-[9px] text-stone-400">Hand-delivered bliss</span>
                      </div>
                    </div>

                  </div>

                  {/* Summary info */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs">
                    <p className="text-white font-serif">Delivery Address coordinates:</p>
                    <p className="text-stone-400 font-sans leading-relaxed">{selectedTrackOrder.shippingAddress}</p>
                  </div>
                </div>
              ) : (
                <div className="text-stone-400 text-xs py-2">
                  <p>Or select one of your order records listed under <strong>Order History</strong> to trace its logistics immediately.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY WISHLIST */}
          {activeSubTab === "wishlist" && (
            <div className="space-y-6 animate-fadeIn" id="subtab-wishlist-pane">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-serif text-white uppercase tracking-widest">My Gilded Wishlist</h2>
                <p className="text-xs text-stone-400 font-sans">Curations favorited to explore and access over time</p>
              </div>

              {wishlistHampers.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl mx-auto flex items-center justify-center text-stone-600">
                    <Heart className="w-5 h-5 text-stone-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-white text-sm">No curated hampers in wishlist yet</p>
                    <p className="text-stone-400 text-xs">Explore the Curated Hampers suite to add masterpieces to your book.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistHampers.map((hamper) => (
                    <div 
                      key={hamper.id} 
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 hover:bg-white/10 transition-colors"
                      id={`wishlist-row-${hamper.id}`}
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-900 border border-white/5 flex-shrink-0">
                        <img src={hamper.image} alt={hamper.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-[#c5a059] font-bold block">{hamper.vibe} Vibe</span>
                          <h4 className="text-xs font-serif font-bold text-white leading-tight">{hamper.name}</h4>
                          <span className="text-xs font-serif font-bold text-[#c5a059] mt-1 block">₹{hamper.price.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 mt-2">
                          <button
                            onClick={() => onAddToCart(hamper)}
                            className="bg-white/5 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/20 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Add To Bag
                          </button>
                          
                          <button
                            onClick={() => handleToggleWishlistItem(hamper.id)}
                            className="text-stone-400 hover:text-red-400 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SAVED ADDRESSES */}
          {activeSubTab === "addresses" && (
            <div className="space-y-6 animate-fadeIn" id="subtab-addresses-pane">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif text-white uppercase tracking-widest">Saved Addresses</h2>
                  <p className="text-xs text-stone-400 font-sans">Induct delivery locations for swift, frictionless checkout</p>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="p-2 px-3 bg-white/5 hover:bg-white/10 border border-[#c5a059]/20 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* New Address Creation Form */}
              {showAddressForm && (
                <div className="p-5 rounded-2xl bg-[#09090a] border border-white/10 space-y-4 animate-fadeIn" id="add-address-form-box">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider font-mono">Location coordinates</span>
                    <button onClick={() => setShowAddressForm(false)} className="text-stone-400 hover:text-white cursor-pointer p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {addressError && (
                    <p className="text-xs text-red-300 font-mono">{addressError}</p>
                  )}

                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">Label</label>
                        <select 
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        >
                          <option value="Home">Home 🏠</option>
                          <option value="Office">Office 🏢</option>
                          <option value="Celebration Point">Celebration Point 🎉</option>
                          <option value="Partner Destination">Partner House ❤️</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">Recipient Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aditya Sharma"
                          value={addrFullName}
                          onChange={(e) => setAddrFullName(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">Recipient Phone</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +91 91234 56789"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">Postal Pin Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 110021"
                          value={addrZipCode}
                          onChange={(e) => setAddrZipCode(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">Address Line 1</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sector-45, Signature Towers, Penthouse C"
                          value={addrLine1}
                          onChange={(e) => setAddrLine1(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Landmark, Near Imperial Plaza"
                          value={addrLine2}
                          onChange={(e) => setAddrLine2(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">City / Lounge</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. New Delhi"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059] mb-1 block">State / Region</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Delhi"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 bg-stone-900 border border-white/5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={savingAddress}
                        className="px-5 py-2 bg-[#c5a059] text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:bg-[#c5a059]/90 active:scale-95 cursor-pointer"
                      >
                        {savingAddress ? "Cataloging..." : "Save Address ✓"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Render List of saved addresses */}
              {currentUser.savedAddresses.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  <p>You have not established any postal coordinates yet. Add one above to begin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.savedAddresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 flex flex-col justify-between"
                      id={`address-vault-card-${addr.id}`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="px-2 py-0.5 rounded bg-[#c5a059]/10 text-[#c5a059] font-mono text-[9px] font-bold uppercase tracking-widest">{addr.label}</span>
                          <span className="text-[10px] text-stone-500 font-mono">ID: {addr.id}</span>
                        </div>
                        
                        <p className="text-sm font-serif font-semibold text-white leading-tight pt-1">{addr.fullName}</p>
                        <p className="text-xs text-[#c5a059] font-mono">{addr.phone}</p>
                        
                        <p className="text-xs text-stone-400 font-sans leading-relaxed pt-1.5">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                          <br />
                          {addr.city}, {addr.state} - <span className="font-mono">{addr.zipCode}</span>
                        </p>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-925/20 text-red-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
