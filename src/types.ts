/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GlobalSettings {
  businessName: string;
  whatsappNumber: string;
  contactEmail: string;
  upiId: string;
  upiQrText: string;
  deliveryCharges: number;
  freeShippingThreshold: number;
  gstPercentage: number;
  instagramUrl: string;
  facebookUrl: string;
  mailjetApiKey?: string;
  mailjetApiSecret?: string;
  mailjetSenderEmail?: string;
  otpExpiryMinutes?: number;
}

export interface Hamper {
  id: string;
  name: string;
  tagline: string;
  price: number;
  discountPrice?: number; // Optional discount/sale price
  description: string;
  items: string[];
  image: string;
  vibe: 'Royal' | 'Organic' | 'Modern' | 'Festive' | 'Cozy' | 'Birthday' | 'Wedding' | 'Anniversary' | 'Baby' | 'Festive' | 'Chocolate' | 'Personalized' | 'Flower' | 'Signature';
  category?: string; // New categorization field mapping
  stockQuantity: number;
  isBestseller: boolean;
  isFeatured: boolean;
  isCustom?: boolean;
}

export interface CartItem {
  hamper: Hamper;
  quantity: number;
  customInstructions?: string;
}

export interface CustomGiftingRequest {
  occasion: string;
  budget: number;
  recipient: string;
  vibe: string;
  additionalNotes: string;
}

export interface BespokeSuggestion {
  name: string;
  tagline: string;
  description: string;
  items: string[];
  packaging: string;
  estimatedPrice: number;
}

// === NEW eCOMMERCE BUILDER & DATABASE TYPES ===

export interface HomepageSection {
  id: string; // 'hero' | 'featured' | 'categories' | 'testimonials' | 'corporate' | 'newsletter' | 'instagram' | 'footer'
  name: string;
  visible: boolean;
  order: number;
}

export interface BannerConfig {
  imageUrl: string;
  mobileImageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  startDate?: string;
  endDate?: string;
}

export interface ThemeConfig {
  brandColorPrimary: string; // e.g. '#0d0d0e'
  brandColorAccent: string;  // e.g. '#c5a059'
  textColor: string;        // e.g. '#f3f4f6'
  fontFamily: 'Inter' | 'Playfair' | 'Mono' | 'Outfit';
  buttonStyle: 'gradient' | 'gold-outline' | 'solid-accent' | 'minimalist';
  headerStyle: 'sticky' | 'standard' | 'glass';
  footerStyle: 'detailed' | 'compact' | 'simple';
  buttonRoundedness: 'none' | 'md' | 'xl' | 'full';
}

export interface BoutiqueOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    hamperName: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  gstAmount: number;
  deliveryCharges: number;
  grandTotal: number;
  status: 'Payment Verification Pending' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  createdAt: string;
  paymentMode: 'UPI' | 'WhatsApp' | 'COD';
  paymentScreenshot?: string; // Base64 image data or file URL of screenshot
}

export interface BoutiqueCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  isBlocked: boolean;
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
}

export interface ContentConfig {
  logoUrl?: string;
  websiteLogoText: string;
  websiteTagline: string;
  contactNumber: string;
  businessAddress: string;
  privacyPolicy: string;
  termsConditions: string;
}

export interface WhatsAppConfig {
  whatsappNumber: string;
  messageTemplate: string;
  enableChatWidget: boolean;
  floatingButtonText: string;
}

export interface PaymentConfig {
  upiId: string;
  accountName: string;
  upiQrImage: string; // Image link or raw QR representation
  enableUpiPayments: boolean;
  enableCod?: boolean; // Enable or disable COD option
  paymentInstructions?: string; // Custom instructions displayed during checkout
}

export interface UserAddress {
  id: string;
  label: string; // "Home", "Office", etc.
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface BoutiqueUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  wishlist: string[]; // array of hamper ids
  savedAddresses: UserAddress[];
  createdAt: string;
  loyaltyPoints?: number;
  redeemedCoupons?: {
    code: string;
    discountAmount: number;
    pointsSpent: number;
    createdAt: string;
    isUsed: boolean;
  }[];
}

