/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface RedFlowerHamperLogoProps {
  className?: string;
  size?: number;
}

export function RedFlowerHamperLogo({ className = "", size = 44 }: RedFlowerHamperLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }} id="red-flower-hamper-logo-wrapper">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(220,38,38,0.15)]"
        id="red-flower-hamper-logo-svg"
      >
        <defs>
          {/* Deep crimson rose flower gradients */}
          <radialGradient id="roseGradMain" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>

          <radialGradient id="roseGradSecondary" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="70%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>

          <radialGradient id="roseGradAccent" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="30%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          {/* Gilded metal/gold box gradients */}
          <linearGradient id="gildedBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.05" />
            <stop offset="30%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="gildedSatinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="basketBackground" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>

          {/* Leaf Gradients */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>

        {/* 1. EMERALD LUXURY LEAVES (BACKGROUND SHELF) */}
        {/* Leaf Left */}
        <path d="M22 45 C15 35, 32 25, 42 40 C32 45, 25 50, 22 45 Z" fill="url(#leafGrad)" />
        <path d="M22 45 Q32 35 42 40" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
        
        {/* Leaf Right */}
        <path d="M78 45 C85 35, 68 25, 58 40 C68 45, 75 50, 78 45 Z" fill="url(#leafGrad)" />
        <path d="M78 45 Q68 35 58 40" stroke="#059669" strokeWidth="1" strokeLinecap="round" />

        {/* 2. CHUBBY BLOOMING RED FLOWERS (OVERFLOWING FROM HAMPER) */}
        
        {/* Outer/Back flower left */}
        <g transform="translate(35, 38)">
          <circle cx="0" cy="0" r="14" fill="url(#roseGradSecondary)" />
          {/* Petal overlapping layers */}
          <path d="M-8 -8 C-2 -14, 8 -14, 8 -8 C14 -2, 14 8, 8 8 C2 14, -8 14, -8 8 C-14 2, -14 -2, -8 -8 Z" fill="url(#roseGradSecondary)" opacity="0.9" />
          <path d="M-5 -5 C-1 -9, 5 -9, 5 -5 C9 -1, 9 5, 5 5 C1 9, -5 9, -5 5 C-9 1, -9 -1, -5 -5 Z" fill="url(#roseGradMain)" />
          <circle cx="0" cy="0" r="3" fill="#4c0519" />
        </g>

        {/* Outer/Back flower right */}
        <g transform="translate(65, 38)">
          <circle cx="0" cy="0" r="14" fill="url(#roseGradSecondary)" />
          <path d="M-8 -8 C-2 -14, 8 -14, 8 -8 C14 -2, 14 8, 8 8 C2 14, -8 14, -8 8 C-14 2, -14 -2, -8 -8 Z" fill="url(#roseGradSecondary)" opacity="0.9" />
          <path d="M-5 -5 C-1 -9, 5 -9, 5 -5 C9 -1, 9 5, 5 5 C1 9, -5 9, -5 5 C-9 1, -9 -1, -5 -5 Z" fill="url(#roseGradMain)" />
          <circle cx="0" cy="0" r="3" fill="#4c0519" />
        </g>

        {/* Center Main Majestic Rose */}
        <g transform="translate(50, 32)">
          {/* Highly detailed segmented petals */}
          <circle cx="0" cy="0" r="17" fill="url(#roseGradMain)" />
          
          {/* Main Petals */}
          <path d="M0 -17 C10 -17, 17 -10, 17 0 C17 10, 10 17, 0 17 C-10 17, -17 10, -17 0 C-17 -10, -10 -17, 0 -17 Z" fill="url(#roseGradAccent)" opacity="0.85" />
          
          {/* Inner Petal Arcs */}
          <path d="M-10 -10 C -5 -15, 5 -15, 10 -10" stroke="#fecdd3" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M-13 0 C -10 -8, 10 -8, 13 0" stroke="#fecdd3" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M-10 10 C -5 15, 5 15, 10 10" stroke="#fda4af" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          
          {/* Rose Bud Core Core */}
          <ellipse cx="0" cy="0" rx="6" ry="5" fill="url(#roseGradSecondary)" />
          <path d="M-4 -1 Q0 -5 4 -1 Q0 5 -4 -1" fill="#fee2e2" opacity="0.9" />
        </g>

        {/* 3. LUXURY ROUNDED SQUARE BOX HAMPER */}
        {/* Background Fill of Basket block */}
        <path
          d="M25 48 H75 L70 88 H30 Z"
          fill="url(#basketBackground)"
        />

        {/* Gilded Basket Texture Borders & Pattern Lines */}
        <path
          d="M25 48 H75 L70 88 H30 Z"
          fill="url(#gildedBoxGrad)"
          stroke="url(#gildedSatinGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Filigree Gilded Diagonal Weaving (Diamond lattice elegant pattern) */}
        <path d="M30 48 L40 88 M40 48 L50 88 M50 48 L60 88 M60 48 L70 88" stroke="#fbbf24" strokeWidth="0.8" opacity="0.25" />
        <path d="M70 48 L60 88 M60 48 L50 88 M50 48 L40 88 M40 48 L30 88" stroke="#fbbf24" strokeWidth="0.8" opacity="0.25" />

        {/* Gold Frame Highlight Rim */}
        <path d="M25 48 H75" stroke="url(#gildedSatinGrad)" strokeWidth="4" strokeLinecap="round" />

        {/* 4. SATIN BOW & RIBBON (CENTERED AROUND THE HAMPER) */}
        {/* Horizontal Ribbon wrapper on basket */}
        <rect x="27" y="62" width="46" height="7.5" fill="url(#gildedSatinGrad)" rx="1.5" />
        <line x1="27" y1="65.75" x2="73" y2="65.75" stroke="#fff" strokeWidth="0.5" opacity="0.3" />

        {/* Bow Left Loop */}
        <path d="M50 66 C35 55, 32 75, 50 66 Z" fill="url(#gildedSatinGrad)" stroke="#b45309" strokeWidth="0.5" />
        <path d="M50 66 C40 60, 38 70, 50 66 Z" fill="#f59e0b" opacity="0.3" />

        {/* Bow Right Loop */}
        <path d="M50 66 C65 55, 68 75, 50 66 Z" fill="url(#gildedSatinGrad)" stroke="#b45309" strokeWidth="0.5" />
        <path d="M50 66 C60 60, 62 70, 50 66 Z" fill="#f59e0b" opacity="0.3" />

        {/* Bow Satin Tail Left */}
        <path d="M50 66 C43 76, 38 82, 35 84 L38 85 L44 76 Z" fill="url(#gildedSatinGrad)" />
        {/* Bow Satin Tail Right */}
        <path d="M50 66 C57 76, 62 82, 65 84 L62 85 L56 76 Z" fill="url(#gildedSatinGrad)" />

        {/* Ribbon Central Golden Buckle */}
        <circle cx="50" cy="65.75" r="4.5" fill="url(#gildedSatinGrad)" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="50" cy="65.75" r="2.5" fill="#1e1b4b" />
        <circle cx="49" cy="64.75" r="0.75" fill="#fff" opacity="0.8" />
      </svg>
    </div>
  );
}
