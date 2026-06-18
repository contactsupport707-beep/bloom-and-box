/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShoppingBag, User } from "lucide-react";
import { GlobalSettings, BoutiqueUser } from "../types";
import { RedFlowerHamperLogo } from "./RedFlowerHamperLogo";

interface NavbarProps {
  settings: GlobalSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: BoutiqueUser | null;
}

export function Navbar({ settings, activeTab, setActiveTab, cartCount, onOpenCart, currentUser }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#080809]/95 backdrop-blur-md border-b border-white/5" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("home")} 
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo"
        >
          <RedFlowerHamperLogo size={42} className="hover:scale-110 transition-transform duration-300 flex-shrink-0" />
          <div>
            <span className="font-serif font-semibold tracking-wider text-xl text-white block group-hover:text-[#c5a059] transition-colors">
              {settings.businessName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold gold-text -mt-1 block">
              Luxury Hampers
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-4 sm:gap-8 text-[11px] sm:text-xs uppercase tracking-widest font-semibold" id="main-nav">
          <button
            id="nav-home"
            onClick={() => setActiveTab("home")}
            className={`transition-colors py-2 border-b-2 tracking-widest ${
              activeTab === "home" 
                ? "gold-text border-[#c5a059]" 
                : "text-stone-400 border-transparent hover:text-white"
            }`}
          >
            Home
          </button>
          
          <button
            id="nav-catalog"
            onClick={() => setActiveTab("catalog")}
            className={`transition-colors py-2 border-b-2 tracking-widest ${
              activeTab === "catalog" 
                ? "gold-text border-[#c5a059]" 
                : "text-stone-400 border-transparent hover:text-white"
            }`}
          >
            Curated Hampers
          </button>

          <button
            id="nav-member"
            onClick={() => setActiveTab("member")}
            className={`transition-colors py-2 border-b-2 tracking-widest flex items-center gap-1.5 ${
              activeTab === "member" 
                ? "gold-text border-[#c5a059]" 
                : "text-stone-400 border-transparent hover:text-[#c5a059]/80"
            }`}
          >
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden xs:inline">{currentUser ? "Patron Room" : "Join Circular / Login"}</span>
            <span className="inline xs:hidden">{currentUser ? "Patron" : "Login"}</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4" id="header-actions">
          <button
            id="btn-cart-toggle"
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center border border-white/5 active:scale-95 cursor-pointer"
            aria-label="Toggle Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 gold-text" />
            {cartCount > 0 && (
              <span 
                id="cart-badge-count"
                className="absolute -top-1.5 -right-1.5 gold-gradient text-black font-extrabold text-[10px] h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center border border-[#0d0d0e] shadow-md"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
