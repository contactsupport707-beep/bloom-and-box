/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GlobalSettings, 
  Hamper, 
  HomepageSection, 
  BannerConfig, 
  ThemeConfig, 
  BoutiqueOrder, 
  BoutiqueCustomer, 
  ContentConfig, 
  WhatsAppConfig, 
  PaymentConfig 
} from "./types";

export const DEFAULT_SETTINGS: GlobalSettings = {
  businessName: "Bloom & Box",
  whatsappNumber: "+919876543210",
  contactEmail: "hello@bloomandbox.com",
  upiId: "bloombox@okaxis",
  upiQrText: "upi://pay?pa=bloombox@okaxis&pn=Bloom%20and%20Box%20Hampers",
  deliveryCharges: 150,
  freeShippingThreshold: 1500,
  gstPercentage: 18,
  instagramUrl: "https://instagram.com/bloomandbox",
  facebookUrl: "https://facebook.com/bloomandbox",
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: "hero", name: "Hero Banner", visible: true, order: 1 },
  { id: "categories", name: "Browse Dynamic Categories", visible: true, order: 2 },
  { id: "featured", name: "Featured Luxury Hampers", visible: true, order: 3 },
  { id: "corporate", name: "Corporate Gifting Suite", visible: true, order: 4 },
  { id: "testimonials", name: "Bespoke Patrons' Words", visible: true, order: 5 },
  { id: "newsletter", name: "Newsletter Letterbox", visible: true, order: 6 },
  { id: "instagram", name: "Instagram Gallery Feed", visible: true, order: 7 },
  { id: "footer", name: "Website Footer", visible: true, order: 8 }
];

export const DEFAULT_BANNER: BannerConfig = {
  imageUrl: "/src/assets/images/premium_gifts_hamper_flowers_1780911344512.png",
  mobileImageUrl: "/src/assets/images/premium_gifts_hamper_flowers_1780911344512.png",
  title: "Blooming Moments, Beautifully Boxed.",
  subtitle: "Masterfully crafted luxury hampers, direct trade confectioneries, and royal heritage essentials tailored for esteemed celebrations.",
  ctaText: "EXPLORE ALL COLLECTIONS",
  ctaLink: "catalog",
  startDate: "2026-06-01",
  endDate: "2026-08-31"
};

export const DEFAULT_THEME: ThemeConfig = {
  brandColorPrimary: "#0d0d0e",
  brandColorAccent: "#c5a059",
  textColor: "#f3f4f6",
  fontFamily: "Playfair",
  buttonStyle: "gradient",
  headerStyle: "glass",
  footerStyle: "detailed",
  buttonRoundedness: "xl"
};

export const DEFAULT_WHATSAPP: WhatsAppConfig = {
  whatsappNumber: "+919876543210",
  messageTemplate: "Hi Bloom & Box! I would like to order: {ORDER_ITEMS}. Grand Total: {TOTAL}. Please verify shipment.",
  enableChatWidget: true,
  floatingButtonText: "Connect with Designer"
};

export const DEFAULT_PAYMENT: PaymentConfig = {
  upiId: "bloombox@okaxis",
  accountName: "Bloom & Box Luxury Gifting",
  upiQrImage: "", // Handled dynamically via API-QR Generator
  enableUpiPayments: true,
  enableCod: true,
  paymentInstructions: "1. Scan the QR code or copy the UPI ID using Google Pay, PhonePe, Paytm, or any banking app.\n2. Complete the transaction for the exact Grand Total.\n3. Snapshot the success receipt and upload it below.\n4. Complete checkout and check alignment with our elite concierge!"
};

export const DEFAULT_CONTENT: ContentConfig = {
  websiteLogoText: "Bloom & Box",
  websiteTagline: "Curated with Love, Delivered with Care.",
  contactNumber: "+91 98765 43210",
  businessAddress: "Luxury Gifting Arcade, Imperial Plaza, New Delhi, India",
  privacyPolicy: "We protect your data. Your order details and billing coordinates are securely held and never traded. Checked and certified secure.",
  termsConditions: "Prices are inclusive of local taxes where indexed. Grand total includes active GST representation. Shipments are handled via premium air cargo courier partners."
};

export const INITIAL_HAMPERS: Hamper[] = [
  {
    id: "dynasty-tea",
    name: "Saffron & Tea Dynasty Trunk",
    tagline: "A majestic curation of heritage grandeur and royal gold.",
    price: 3800,
    discountPrice: 3400,
    description: "An elegant, handcrafted premium wooden trunk featuring second-flush Darjeeling tea leaves, silver-embossed brass tea strainer, organic raw wild forest honey, and export-grade Kashmiri saffron threads.",
    items: [
      "Kashmiri Saffron Grade A++ (2g)",
      "Brass Gold-finish Heritage Tea Infuser",
      "Single-estate Darjeeling Second-Flush Leaf Tea (100g)",
      "Organic Wild Raw Forest Honey in Stoneware Jar",
      "Gilded Royal Cardamom-Almond Brittle (150g)"
    ],
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600",
    vibe: "Royal",
    category: "✨ Luxury Signature Collection",
    stockQuantity: 24,
    isBestseller: true,
    isFeatured: true
  },
  {
    id: "wedding-vault",
    name: "Eternal Union Wedding Vault",
    tagline: "The absolute crown jewel for matrimonies.",
    price: 8500,
    description: "A colossal hand-carved mahogany treasure chest carrying customized solid silver coin, pure almond cookies, gourmet dates stuffed with macadamia nuts, brass incense diffusers, and luxury silk scarves.",
    items: [
      "Customized Solid Silver Celebration Coin (10g)",
      "Gourmet Macadamia Stuffed Medjool Dates (250g)",
      "Brass Handcrafted Filigree Incense Vessel",
      "Two Premium Mulberry Silk Neckwear Scarves",
      "Hand-pulled Rosewater Scented Reed Diffuser"
    ],
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600",
    vibe: "Festive",
    category: "💍 Wedding Hampers",
    stockQuantity: 12,
    isBestseller: true,
    isFeatured: true
  },
  {
    id: "anniversary-duo",
    name: "Pure Love Anniversary Duo",
    tagline: "Elegant custom keepsakes for double heartbeats.",
    price: 4500,
    discountPrice: 4100,
    description: "Wrapped in classic champagne textured fabric boxes, this collection comes with premium non-alcoholic sparkling grape elixir, two lead-crystal etched chalices, and local artisan luxury truffles.",
    items: [
      "Premium Non-Alcoholic Grape Sparkling Elixir (750ml)",
      "Trio of Single-Origin Madagascar Chocolate Truffles",
      "Two Hand-Etched Crystal Vintage Goblets",
      "Aromatic Cedar & Amber Fragrance Candle",
      "Dried Preserved White Baby's Breath bouquet"
    ],
    image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=600",
    vibe: "Cozy",
    category: "❤️ Anniversary Hampers",
    stockQuantity: 18,
    isBestseller: false,
    isFeatured: true
  },
  {
    id: "chocolate-velvet",
    name: "Gilded Mocha & Velvet Chest",
    tagline: "Modern luxury for the meticulous coffee and chocolate connoisseur.",
    price: 3200,
    description: "A gorgeous modern charcoal matte box wrapped in golden silk ribbon containing premium single-origin Arabica coffee beans, a textured artisan pottery mug, and artisanal dark chocolate ganache truffles.",
    items: [
      "Single-Origin Arabica Medium-Roast Coffee (250g)",
      "Artisanal Earth-Textured Ceramic Mug",
      "Ganache-Centered Coffee Truffles (Pack of 8)",
      "Direct-Trade Madagascan Vanilla Dark Chocolate Bar",
      "Modern Walnutwood Mug Coaster"
    ],
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
    vibe: "Modern",
    category: "🍫 Chocolate Hampers",
    stockQuantity: 42,
    isBestseller: true,
    isFeatured: false
  },
  {
    id: "birthday-gilded",
    name: "Golden Celebration Birthday Cradles",
    tagline: "Sensory surprises on their special day.",
    price: 3400,
    description: "Luxurious pastel-toned keepsake basket featuring golden foil birthday cake tea, hand-poured jasmine candle, premium salted sea-salt caramel bark, and customized crystal drink stirrers.",
    items: [
      "Foil-Printed Premium Happy Birthday Tea Blend (100g)",
      "Aromatic Hand-Poured Jasmine & Tea Tree Candle",
      "Decadent English Toffee Salted Caramel Bark (150g)",
      "Two Solid Brass Honey & Tea Stirrers",
      "Miniature Velvet-Bound Birthday Guest Journal"
    ],
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=600",
    vibe: "Festive",
    category: "🌸 Birthday Hampers",
    stockQuantity: 15,
    isBestseller: false,
    isFeatured: false
  }
];

export const INITIAL_ORDERS: BoutiqueOrder[] = [
  {
    id: "BB-9831",
    customerName: "Aditya Sharma",
    customerPhone: "+91 91234 56789",
    customerEmail: "aditya.sharma@noida.in",
    shippingAddress: "Penthouse C, Signature Towers, Sector 45, Noida, UP - 201301",
    items: [
      { hamperName: "Saffron & Tea Dynasty Trunk", price: 3800, quantity: 2 }
    ],
    subtotal: 7600,
    gstAmount: 1368,
    deliveryCharges: 0,
    grandTotal: 8968,
    status: "Processing",
    trackingNumber: "AWB-7783912",
    createdAt: "2026-06-07T12:30:14Z",
    paymentMode: "UPI"
  },
  {
    id: "BB-9832",
    customerName: "Meera Nair",
    customerPhone: "+91 98888 77777",
    customerEmail: "meera.nair@mumbai.co",
    shippingAddress: "Bungalow No. 12, Sea Breeze Lane, Bandra West, Mumbai, MH - 400050",
    items: [
      { hamperName: "Eternal Union Wedding Vault", price: 8500, quantity: 1 },
      { hamperName: "Gilded Mocha & Velvet Chest", price: 3200, quantity: 1 }
    ],
    subtotal: 11700,
    gstAmount: 2106,
    deliveryCharges: 0,
    grandTotal: 13806,
    status: "Shipped",
    trackingNumber: "AWB-4491023",
    createdAt: "2026-06-06T15:45:00Z",
    paymentMode: "UPI"
  },
  {
    id: "BB-9833",
    customerName: "Rohan Khanna",
    customerPhone: "+91 95400 11223",
    customerEmail: "rohan@khannacorp.com",
    shippingAddress: "40B, Shanti Niketan, New Delhi, DL - 110021",
    items: [
      { hamperName: "Pure Love Anniversary Duo", price: 4500, quantity: 1 }
    ],
    subtotal: 4500,
    gstAmount: 810,
    deliveryCharges: 0,
    grandTotal: 5310,
    status: "Pending",
    createdAt: "2026-06-08T06:10:22Z",
    paymentMode: "WhatsApp"
  }
];

export const INITIAL_CUSTOMERS: BoutiqueCustomer[] = [
  {
    id: "CUST-001",
    name: "Aditya Sharma",
    email: "aditya.sharma@noida.in",
    phone: "+91 91234 56789",
    loyaltyPoints: 120,
    isBlocked: false,
    orderCount: 1,
    totalSpent: 8968,
    joinedAt: "2026-06-07T12:25:00Z"
  },
  {
    id: "CUST-002",
    name: "Meera Nair",
    email: "meera.nair@mumbai.co",
    phone: "+91 98888 77777",
    loyaltyPoints: 340,
    isBlocked: false,
    orderCount: 4,
    totalSpent: 42100,
    joinedAt: "2026-01-15T09:12:00Z"
  },
  {
    id: "CUST-003",
    name: "Vikram Malhotra",
    email: "vikram@malhotratech.com",
    phone: "+91 99999 00000",
    loyaltyPoints: 0,
    isBlocked: true,
    orderCount: 2,
    totalSpent: 10400,
    joinedAt: "2026-04-20T14:30:11Z"
  }
];
