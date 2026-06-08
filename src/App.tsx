/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  ArrowRight, 
  Gift, 
  Award, 
  CheckCircle, 
  Tag, 
  SlidersHorizontal,
  Instagram,
  Facebook,
  Info,
  Layers,
  Send,
  Lock,
  ShoppingBag,
  Clock,
  Heart,
  Star,
  Quote
} from "lucide-react";
import { 
  GlobalSettings, 
  Hamper, 
  CartItem, 
  BespokeSuggestion,
  HomepageSection,
  BannerConfig,
  ThemeConfig,
  BoutiqueOrder,
  BoutiqueCustomer,
  ContentConfig,
  WhatsAppConfig,
  PaymentConfig,
  BoutiqueUser
} from "./types";
import { 
  DEFAULT_SETTINGS, 
  INITIAL_HAMPERS,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_BANNER,
  DEFAULT_THEME,
  DEFAULT_WHATSAPP,
  DEFAULT_PAYMENT,
  DEFAULT_CONTENT,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS
} from "./data";
import { Navbar } from "./components/Navbar";
import { MemberAuth } from "./components/MemberAuth";
import { MemberDashboard } from "./components/MemberDashboard";
import { SettingsEditForm } from "./components/SettingsEditForm";
import { CartDrawer } from "./components/CartDrawer";
import { FloralThreeScene } from "./components/FloralThreeScene";
import { VisualEditor } from "./components/VisualEditor";

const BUTTON_ROUNDEDNESS_MAP = {
  none: "rounded-none",
  md: "rounded-md",
  xl: "rounded-xl",
  full: "rounded-full"
};

// Preset category list for quick matching
const PRESET_CATEGORIES = [
  "🌸 Birthday Hampers",
  "💍 Wedding Hampers",
  "❤️ Anniversary Hampers",
  "👶 Baby Shower Hampers",
  "🏢 Corporate Gifting",
  "🎄 Festive Hampers",
  "🍫 Chocolate Hampers",
  "🎁 Personalized Hampers",
  "🌹 Flower & Gift Combos",
  "✨ Luxury Signature Collection"
];

export default function App() {
  
  // === eCOMMERCE BUILDER & DATABASE COLLECTIONS STATES ===
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem("bloombox_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [hampers, setHampers] = useState<Hamper[]>(() => {
    const saved = localStorage.getItem("bloombox_hampers");
    return saved ? JSON.parse(saved) : INITIAL_HAMPERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("bloombox_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [sections, setSections] = useState<HomepageSection[]>(() => {
    const saved = localStorage.getItem("bloombox_sections");
    return saved ? JSON.parse(saved) : DEFAULT_HOMEPAGE_SECTIONS;
  });

  const [banner, setBanner] = useState<BannerConfig>(() => {
    const saved = localStorage.getItem("bloombox_banner");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.imageUrl && (parsed.imageUrl.includes("unsplash.com") || parsed.imageUrl.includes("photo-1544787219-7f47ccb76574"))) {
          parsed.imageUrl = DEFAULT_BANNER.imageUrl;
          parsed.mobileImageUrl = DEFAULT_BANNER.mobileImageUrl;
          localStorage.setItem("bloombox_banner", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return DEFAULT_BANNER;
      }
    }
    return DEFAULT_BANNER;
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem("bloombox_theme");
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [orders, setOrders] = useState<BoutiqueOrder[]>(() => {
    const saved = localStorage.getItem("bloombox_orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<BoutiqueCustomer[]>(() => {
    const saved = localStorage.getItem("bloombox_customers");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [content, setContent] = useState<ContentConfig>(() => {
    const saved = localStorage.getItem("bloombox_content");
    const parsed = saved ? JSON.parse(saved) : DEFAULT_CONTENT;
    if (parsed && (parsed.websiteLogoText === "B" || !parsed.websiteLogoText)) {
      parsed.websiteLogoText = "Bloom & Box";
    }
    return parsed;
  });

  const [whatsApp, setWhatsApp] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem("bloombox_whatsapp");
    return saved ? JSON.parse(saved) : DEFAULT_WHATSAPP;
  });

  const [payment, setPayment] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem("bloombox_payment");
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENT;
  });

  // User Authentication Context state hooks
  const [currentUser, setCurrentUser] = useState<BoutiqueUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auto load logged-in patron credentials on mount
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("unauthorized");
      })
      .then((data) => {
        if (active && data.success) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });
    return () => { active = false; };
  }, []);

  const [activeTab, setActiveTab ] = useState<string>("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVisualEditOpen, setIsVisualEditOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string>("All");
  
  // Newsletter local form subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Synchronize collections to browser localStorage
  useEffect(() => {
    localStorage.setItem("bloombox_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("bloombox_hampers", JSON.stringify(hampers));
  }, [hampers]);

  useEffect(() => {
    localStorage.setItem("bloombox_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("bloombox_sections", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem("bloombox_banner", JSON.stringify(banner));
  }, [banner]);

  useEffect(() => {
    localStorage.setItem("bloombox_theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("bloombox_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("bloombox_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("bloombox_content", JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem("bloombox_whatsapp", JSON.stringify(whatsApp));
  }, [whatsApp]);

  useEffect(() => {
    localStorage.setItem("bloombox_payment", JSON.stringify(payment));
  }, [payment]);

  // Inject current configuration variable keys into root style tree
  useEffect(() => {
    if (!theme) return;
    document.documentElement.style.setProperty('--custom-primary-bg', theme.brandColorPrimary);
    document.documentElement.style.setProperty('--custom-accent-gold', theme.brandColorAccent);
    document.documentElement.style.setProperty('--custom-text-color', theme.textColor);
    
    let fontStr = '"Inter", sans-serif';
    if (theme.fontFamily === 'Playfair') fontStr = '"Playfair Display", serif';
    else if (theme.fontFamily === 'Mono') fontStr = '"JetBrains Mono", monospace';
    else if (theme.fontFamily === 'Outfit') fontStr = '"Outfit", sans-serif';
    document.documentElement.style.setProperty('--custom-sans', fontStr);
  }, [theme]);

  // Handle Saves
  const handleSaveSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHampers(INITIAL_HAMPERS);
    setSections(DEFAULT_HOMEPAGE_SECTIONS);
    setBanner(DEFAULT_BANNER);
    setTheme(DEFAULT_THEME);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setContent(DEFAULT_CONTENT);
    setWhatsApp(DEFAULT_WHATSAPP);
    setPayment(DEFAULT_PAYMENT);
    
    localStorage.removeItem("bloombox_settings");
    localStorage.removeItem("bloombox_hampers");
    localStorage.removeItem("bloombox_sections");
    localStorage.removeItem("bloombox_banner");
    localStorage.removeItem("bloombox_theme");
    localStorage.removeItem("bloombox_orders");
    localStorage.removeItem("bloombox_customers");
    localStorage.removeItem("bloombox_content");
    localStorage.removeItem("bloombox_whatsapp");
    localStorage.removeItem("bloombox_payment");
    
    // Clear theme variables
    document.documentElement.style.removeProperty('--custom-primary-bg');
    document.documentElement.style.removeProperty('--custom-accent-gold');
    document.documentElement.style.removeProperty('--custom-text-color');
    document.documentElement.style.removeProperty('--custom-sans');

    alert("Boutique Database collections restored to original setups.");
    window.location.reload();
  };

  // Cart Mechanics
  const handleAddToCart = (hamper: Hamper, quantity = 1, customInstructions = "") => {
    setCart((prev) => {
      const existing = prev.find((it) => it.hamper.id === hamper.id && !!it.hamper.isCustom === !!hamper.isCustom);
      if (existing) {
        return prev.map((it) =>
          it.hamper.id === hamper.id && !!it.hamper.isCustom === !!hamper.isCustom
            ? { ...it, quantity: it.quantity + quantity }
            : it
        );
      }
      return [...prev, { hamper, quantity, customInstructions }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, isCustom: boolean, quantity: number) => {
    setCart((prev) =>
      prev.map((it) =>
        it.hamper.id === id && !!it.hamper.isCustom === isCustom
          ? { ...it, quantity }
          : it
      )
    );
  };

  const handleRemoveItem = (id: string, isCustom: boolean) => {
    setCart((prev) => prev.filter((it) => !(it.hamper.id === id && !!it.hamper.isCustom === isCustom)));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = (paymentMode: 'UPI' | 'COD', paymentScreenshot?: string): BoutiqueOrder => {
    const newOrderId = `BB-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotalCalc = cart.reduce((acc, c) => acc + c.hamper.price * c.quantity, 0);
    const gstCalc = subtotalCalc * (settings.gstPercentage / 100);
    const finalTotal = subtotalCalc + gstCalc + (subtotalCalc >= settings.freeShippingThreshold ? 0 : settings.deliveryCharges);

    const customerName = currentUser ? currentUser.name : "Guest Giver Account";
    const customerPhone = currentUser ? (currentUser.phone || settings.whatsappNumber) : settings.whatsappNumber;
    const customerEmail = currentUser ? currentUser.email : settings.contactEmail;
    
    const shippingAddress = currentUser && currentUser.savedAddresses.length > 0
      ? `${currentUser.savedAddresses[0].fullName} - ${currentUser.savedAddresses[0].addressLine1}, ${currentUser.savedAddresses[0].city}, ${currentUser.savedAddresses[0].state} - ${currentUser.savedAddresses[0].zipCode}`
      : "Hand-delivered via Express Channels";

    const orderStatus = paymentMode === "UPI" ? "Payment Verification Pending" : "Pending";

    const generatedOrder: BoutiqueOrder = {
      id: newOrderId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items: cart.map(c => ({
        hamperName: c.hamper.name,
        price: c.hamper.price,
        quantity: c.quantity
      })),
      subtotal: subtotalCalc,
      gstAmount: gstCalc,
      deliveryCharges: subtotalCalc >= settings.freeShippingThreshold ? 0 : settings.deliveryCharges,
      grandTotal: finalTotal,
      status: orderStatus,
      createdAt: new Date().toISOString(),
      paymentMode: paymentMode,
      paymentScreenshot: paymentScreenshot
    };

    setOrders(prev => [generatedOrder, ...prev]);

    // Track matching customer spendings/points
    const lookupEmail = customerEmail.toLowerCase().trim();
    const existingC = customers.find(c => c.email.toLowerCase().trim() === lookupEmail);
    
    if (existingC) {
      setCustomers(prev => prev.map(c => c.email.toLowerCase().trim() === lookupEmail ? {
        ...c,
        orderCount: (c.orderCount || 1) + 1,
        totalSpent: c.totalSpent + finalTotal,
        loyaltyPoints: c.loyaltyPoints + Math.floor(finalTotal / 100)
      } : c));
    } else {
      const gC: BoutiqueCustomer = {
        id: `CUST-G${Math.floor(100 + Math.random() * 900)}`,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        loyaltyPoints: Math.floor(finalTotal / 100),
        isBlocked: false,
        orderCount: 1,
        totalSpent: finalTotal,
        joinedAt: new Date().toISOString()
      };
      setCustomers(prev => [gC, ...prev]);
    }

    return generatedOrder;
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Sorting segments based on active admin configuration
  const activeHomepageSections = [...sections]
    .filter(s => s.visible)
    .sort((a,b) => a.order - b.order);

  // Quick navigation to category shelf helper
  const handleCategoryPillClick = (catName: string) => {
    setCatalogFilter(catName);
    setActiveTab("catalog");
    
    // Jump scroll to catalog container smoothly
    setTimeout(() => {
      const container = document.getElementById("catalog-view");
      if (container) {
        container.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if(newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 3000);
    }
  };

  return (
    <div 
      className="min-h-screen text-[#f3f4f6] font-sans flex flex-col justify-between selection:bg-[#c5a059] selection:text-black transition-colors duration-300" 
      id="bloom-box-root"
      style={{ 
        backgroundColor: theme.brandColorPrimary,
        fontFamily: theme.fontFamily === 'Playfair' ? '"Playfair Display", serif' : theme.fontFamily === 'Mono' ? '"JetBrains Mono", monospace' : theme.fontFamily === 'Outfit' ? '"Outfit", sans-serif' : '"Inter", sans-serif'
      }}
    >
      
      {/* Dynamic Notification booster on threshold */}
      <div id="top-promo-rail" className="bg-[#080809]/90 text-stone-300 text-[10px] sm:text-xs text-center py-2.5 px-4 border-b border-white/5 font-mono tracking-widest uppercase relative z-50 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-pulse" />
        <span>Free Boutique Delivery on orders above <span className="gold-text font-bold">₹{settings.freeShippingThreshold.toLocaleString()}</span> + Active Gifting Live 🎁</span>
      </div>

      {/* Main Navbar */}
      <Navbar 
        settings={{
          ...settings,
          businessName: content.websiteLogoText
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
      />

      {/* Primary Route Views */}
      <main className="flex-grow">
        
        {/* VIEW 1: DYNAMICAL HOMEPAGE MODULE */}
        {activeTab === "home" && (
          <div id="home-view" className="space-y-24 pb-24">
            
            {activeHomepageSections.map((sec) => {
              
              // 1. BILLBOARD BANNER HERO SEGMENT
              if (sec.id === "hero") {
                return (
                  <section 
                    key={sec.id}
                    className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-gradient-to-b from-[#09090a]/50 to-[#0d0d0e]/20" 
                    id="hero-section"
                  >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#c5a059]/10 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Hero Words */}
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left" id="hero-text-block">
                          <div className="inline-flex items-center gap-2 bg-[#c5a059]/10 border border-[#c5a059]/30 py-1.5 px-4 rounded-full text-[10px] tracking-widest gold-text uppercase font-bold">
                            <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Luxury Gifting Arcade • Online</span>
                          </div>
                          
                          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight text-white leading-tight">
                            {banner.title}
                          </h1>

                          <p className="text-stone-400 max-w-xl text-xs sm:text-sm leading-relaxed font-sans mx-auto text-center">
                            {banner.subtitle}
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center lg:justify-start">
                            <button
                              id="hero-go-catalog-btn"
                              onClick={() => {
                                if(banner.ctaLink === 'contact') {
                                  document.getElementById("option1-brand-outlets")?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  setCatalogFilter("All");
                                  setActiveTab("catalog");
                                }
                              }}
                              className={`px-8 py-4 font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:scale-102 flex items-center justify-center gap-2 cursor-pointer ${BUTTON_ROUNDEDNESS_MAP[theme.buttonRoundedness]} ${
                                theme.buttonStyle === 'gradient' ? 'gold-gradient text-black' :
                                theme.buttonStyle === 'solid-accent' ? 'bg-[#c5a059] text-black' :
                                theme.buttonStyle === 'gold-outline' ? 'border border-[#c5a059] text-[#c5a059] bg-transparent' :
                                'bg-stone-800 text-white hover:bg-stone-700'
                              }`}
                            >
                              <span>{banner.ctaText}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Highlights Grid */}
                          <div className="grid grid-cols-3 gap-4 max-w-md pt-8 border-t border-white/5 mx-auto lg:mx-0 text-stone-400" id="hero-badge-grid">
                            <div>
                              <span className="block text-2xl">✨</span>
                              <span className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Personalized Details</span>
                            </div>
                            <div>
                              <span className="block text-2xl">🎁</span>
                              <span className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Premium Hampers</span>
                            </div>
                            <div>
                              <span className="block text-2xl">🚚</span>
                              <span className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Pan-India Delivery</span>
                              <span className="block text-[9px] text-[#c5a059] font-mono mt-0.5" id="delivery-time-badge">3 to 4 days delivery</span>
                            </div>
                          </div>
                        </div>

                        {/* Hero Image Poster */}
                        <div className="lg:col-span-5 relative flex justify-center" id="hero-visual-card">
                          <div className="relative w-full max-w-sm h-[400px] rounded-2xl glass-panel p-6 flex flex-col justify-between text-white shadow-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#c5a059]/5 to-transparent opacity-80" />
                            
                            <div className="flex justify-between items-start relative z-10">
                              <div>
                                <span className="text-[9px] uppercase tracking-[0.2em] gold-text font-bold">Featured Curation</span>
                                <h3 className="font-serif italic font-semibold text-white text-base tracking-tight leading-tight mt-1">The Heritage Collection</h3>
                              </div>
                              <span className="text-lg">👑</span>
                            </div>

                            <div className="w-full h-48 rounded-xl overflow-hidden border border-white/5 my-4 bg-stone-900 flex items-center justify-center relative">
                              <img 
                                src={banner.imageUrl} 
                                alt="Gifting Collection Poster" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="flex justify-between items-center relative z-10 border-t border-white/5 pt-3">
                              <span className="text-[10px] text-stone-400 font-sans tracking-wide">Signature Crafted Trunks</span>
                              <span className="font-mono gold-text text-xs font-bold">Verified Luxury</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </section>
                );
              }

              // 2. NEWLY INTEGRATED CATEGORIES CARDS
              if (sec.id === "categories") {
                return (
                  <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="dynamic-categories-section">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a059] font-bold block mb-1">Explore Occasions</span>
                      <h2 className="text-3xl font-serif text-white tracking-tight">Browse Luxurious Categories</h2>
                      <p className="text-stone-405 text-xs font-sans mt-2">Choose the perfect, handcrafted motif suited for milestones, corporate relationships or seasonal festivities.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {PRESET_CATEGORIES.map((cat, idx) => {
                        // Extract icon and title cleanly
                        const baseTitle = cat.substring(2);
                        const emoji = cat.substring(0, 2);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => handleCategoryPillClick(cat)}
                            className="glass-panel p-5 rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:border-[#c5a059]/40 hover:-translate-y-1 relative overflow-hidden group"
                          >
                            <span className="text-3xl mb-3 block transform group-hover:scale-110 transition-transform">{emoji}</span>
                            <span className="text-xs font-bold font-serif text-white tracking-wide">{baseTitle}</span>
                            <span className="text-[9px] text-[#c5a059] font-mono mt-2 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              View <span>→</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              // 3. EXQUISITE HIGHLIGHTS TEASER
              if (sec.id === "featured") {
                return (
                  <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn" id="collections-teaser">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {hampers
                        .filter(h => h.isFeatured || h.isBestseller)
                        .slice(0, 3)
                        .map((item) => (
                          <div 
                            key={item.id} 
                            className="glass-panel p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 glass-panel-hover relative group border border-white/5"
                            id={`home-hamper-card-${item.id}`}
                          >
                            <div className="w-full h-52 rounded-xl overflow-hidden bg-stone-900 border border-white/5 relative mb-5">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-2.5 left-2.5 bg-black/80 gold-text text-[9px] uppercase tracking-[0.2em] font-bold py-1 px-3 rounded-md backdrop-blur-md border border-white/5">
                                {item.category || `${item.vibe} Vibe`}
                              </span>

                              {item.isBestseller && (
                                <span className="absolute top-2.5 right-2.5 bg-amber-500/90 text-black text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded">
                                  Bestseller
                                </span>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-serif font-bold text-white text-base leading-snug line-clamp-1">{item.name}</h3>
                                <p className="text-[10px] gold-text uppercase tracking-widest mt-1 font-bold italic line-clamp-1">"{item.tagline}"</p>
                              </div>

                              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 font-sans">{item.description}</p>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-5">
                              <div className="text-left">
                                <span className="font-mono text-base font-bold gold-text">₹{item.price.toLocaleString()}</span>
                                {item.discountPrice && (
                                  <span className="font-mono text-[9px] text-stone-500 line-through ml-1.5">₹{item.discountPrice.toLocaleString()}</span>
                                )}
                              </div>
                              
                              <button
                                id={`btn-add-bag-teaser-${item.id}`}
                                onClick={() => handleAddToCart(item)}
                                className={`py-2 px-4 border border-[#c5a059]/20 text-white rounded-lg text-[10px] tracking-widest uppercase font-bold transition-all cursor-pointer hover:bg-[#c5a059]/10 ${BUTTON_ROUNDEDNESS_MAP[theme.buttonRoundedness]}`}
                              >
                                Add to Bag
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // 4. DESIGNER WHATSAPP OUTLETS & CONTACT
              if (sec.id === "corporate") {
                return (
                  <section key={sec.id} className="py-20 border-t border-b border-white/5 bg-[#09090a]/50" id="option1-brand-outlets">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                      
                      <div className="md:col-span-5 space-y-6" id="boutique-outlet-contacts">
                        <span className="text-[#c5a059] text-[10px] uppercase font-bold tracking-[0.3em] block">Connect With Us</span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-tight leading-tight">
                          Connect with {content.websiteLogoText}
                        </h2>
                        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed font-sans" id="boutique-outlet-desc">
                          {content.websiteTagline}. {settings.businessName} carries custom hampers, corporate gifts, bulk orders, and personalized recoms designed directly with love and custom-delivered with utmost courier care.
                        </p>
                        
                        <div className="glass-panel p-5 rounded-xl border-dashed py-5 text-xs text-stone-300 space-y-2">
                          <span className="block gold-text font-serif italic text-sm mb-1 flex items-center gap-1.5 font-bold">
                            <Award className="w-4 h-4 text-[#c5a059]" />
                            Let's Create Something Beautiful Together
                          </span>
                          <p className="leading-relaxed">Have a custom gifting idea? Looking for the perfect premium hamper? Reach out to our design concierge team for premium recommendations customized to your budgets.</p>
                        </div>
                      </div>

                      <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4" id="outlet-action-links">
                        
                        <a 
                          id="link-whatsapp"
                          href={`https://wa.me/${whatsApp.whatsappNumber.replace(/[\s+]/g, "")}?text=Hi! I want to request custom premium hampers.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-5 glass-panel rounded-2xl hover:bg-white/5 transition-all flex items-center gap-4 shadow-xl"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/5 text-[#128c7e] flex items-center justify-center flex-shrink-0 border border-white/5">
                            <span className="text-xl">💬</span>
                          </div>
                          <div>
                            <span className="block font-serif text-xs text-white uppercase tracking-widest font-bold">💬 WhatsApp Us</span>
                            <span className="text-[10px] text-stone-400 tracking-wide">Instant Chat Curations</span>
                          </div>
                        </a>

                        <a 
                          id="link-email"
                          href={`mailto:${settings.contactEmail}`}
                          className="p-5 glass-panel rounded-2xl hover:bg-white/5 transition-all flex items-center gap-4 shadow-xl"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/5 text-stone-400 flex items-center justify-center flex-shrink-0 border border-white/5">
                            <Mail className="w-5 h-5 gold-text" />
                          </div>
                          <div>
                            <span className="block font-serif text-xs text-white uppercase tracking-widest font-bold">📧 Email Us</span>
                            <span className="text-[10px] text-[#c5a059] tracking-normal font-mono">{settings.contactEmail}</span>
                          </div>
                        </a>

                      </div>

                    </div>
                  </section>
                );
              }

              // 5. TESTIMONIALS APPRECIATION
              if (sec.id === "testimonials") {
                const indianReviews = [
                  {
                    name: "Aditi Rao",
                    city: "Bengaluru, Karnataka",
                    occasion: "Anniversary Custom Hamper",
                    content: "Stunning curation! The fresh red roses were absolutely pristine and the selection of artisanal luxury chocolates tasted divine. The bespoke customization tool made gifting for our anniversary so seamless.",
                    date: "May 2026"
                  },
                  {
                    name: "Devika Rajvansh",
                    city: "Mumbai, Maharashtra",
                    occasion: "Retail Launch VIP Orders",
                    content: "We ordered 150 customised Royal Crimson trunks for our luxury retail launch party. The gold-foil engraving, luxury satin bows, and fragrance notes of the fresh peonies left our VIP guests completely in awe.",
                    date: "June 2026"
                  },
                  {
                    name: "Aniruddh Mehra",
                    city: "New Delhi, Delhi NCR",
                    occasion: "Corporate VIP Gifting",
                    content: "Exceptional commitment to quality. Hand-delivered via express channel in Delhi within 4 hours. Absolute gold standard in luxury gifting. The level of personalization matches royal heritage houses.",
                    date: "April 2026"
                  }
                ];

                return (
                  <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="testimonials-section">
                    <div className="text-center max-w-2xl mx-auto">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059] font-extrabold block mb-2">
                        Words of Patrons
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wider uppercase font-light">
                        Esteemed Indian Appreciations
                      </h2>
                      <div className="h-[1px] w-16 bg-[#c5a059] mx-auto mt-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="indian-testimonials-grid">
                      {indianReviews.map((rev, rIdx) => (
                        <div 
                          key={rIdx}
                          className="bg-stone-900/40 p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-[#c5a059]/30 hover:bg-stone-950/60 transition-all duration-300 group"
                        >
                          <div className="space-y-4">
                            {/* Stars and rating */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
                                ))}
                              </div>
                              <Quote className="w-6 h-6 text-stone-700 group-hover:text-[#c5a059]/10 transition-colors" />
                            </div>

                            {/* Quote Text */}
                            <p className="text-stone-300 text-xs font-serif leading-relaxed italic relative z-10">
                              &ldquo;{rev.content}&rdquo;
                            </p>
                          </div>

                          {/* Client Details */}
                          <div className="border-t border-white/5 pt-4 mt-6">
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-white text-xs font-serif tracking-wider font-semibold">
                                {rev.name}
                              </h4>
                              <span className="text-[9px] text-[#c5a059] uppercase tracking-wider font-mono">
                                Verified Giver
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                              {rev.city} • <span className="text-[#c5a059]/80 font-medium">{rev.occasion}</span>
                            </p>
                            <span className="text-[9px] text-stone-600 block mt-1 font-mono">{rev.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // 6. NEWSLETTER REGISTRY
              if (sec.id === "newsletter") {
                return null;
              }

              // 7. INSTAGRAM FEED MODULE
              if (sec.id === "instagram") {
                return null;
              }

              return null;
            })}

          </div>
        )}

        {/* VIEW 2: FULL DISCOVER CATALOG */}
        {activeTab === "catalog" && (
          <div id="catalog-view" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="border-b border-white/5 pb-6" id="catalog-header">
              <span className="gold-text font-mono text-xs uppercase tracking-[0.2em] font-bold">Exquisite Collection Shelf</span>
              <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight mt-2">Our Premium Gift Hampers</h1>
              <p className="text-stone-400 text-xs sm:text-sm mt-2 max-w-xl">
                Choose from our pre-curated signature lines, featuring only the finest hand-harvested, gold-etched, and direct-trade treats. Perfect for esteemed milestone celebrations.
              </p>
            </div>

            {/* Scrolling categories layout selector */}
            <div className="space-y-3">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Filter Occasions & Collections</span>
              
              <div className="flex flex-wrap gap-2 items-center" id="catalog-filter-bar">
                <button
                  onClick={() => setCatalogFilter("All")}
                  className={`py-2 px-5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    catalogFilter === "All" 
                      ? "gold-gradient text-black font-extrabold shadow-md" 
                      : "bg-white/5 text-stone-300 border border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  All Collections
                </button>

                {PRESET_CATEGORIES.map((v) => (
                  <button
                    key={v}
                    id={`filter-pill-${v}`}
                    onClick={() => setCatalogFilter(v)}
                    className={`py-2 px-5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      catalogFilter === v 
                        ? "gold-gradient text-black font-extrabold shadow-md" 
                        : "bg-white/5 text-stone-300 border border-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Catalog listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8" id="catalog-products-grid">
              
              {hampers
                .filter((it) => catalogFilter === "All" || it.category === catalogFilter || it.vibe === catalogFilter)
                .map((item) => (
                  <div 
                    key={item.id} 
                    className="glass-panel p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 glass-panel-hover group"
                    id={`catalog-hamper-card-${item.id}`}
                  >
                    <div>
                      {/* Curation Theme and Tag */}
                      <div className="w-full h-56 rounded-xl bg-stone-900 overflow-hidden relative mb-5 border border-white/5">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-black/90 gold-text text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded border border-white/5 backdrop-blur-md">
                          {item.category || `${item.vibe} Vibe`}
                        </span>
                        {item.isBestseller && (
                          <span className="absolute top-2.5 right-2.5 bg-amber-500/90 text-black text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1.5 rounded">
                            Bestseller
                          </span>
                        )}
                        {item.isCustom && (
                          <span className="absolute top-2.5 right-2.5 bg-amber-500/90 text-black text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1.5 rounded">
                            Bespoke AI
                          </span>
                        )}

                        {/* Wishlist toggle anchor */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!currentUser) {
                              setActiveTab("member");
                              return;
                            }
                            try {
                              const res = await fetch("/api/auth/wishlist", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ hamperId: item.id })
                              });
                              if (res.ok) {
                                const meRes = await fetch("/api/auth/me");
                                const meData = await meRes.json();
                                if (meRes.ok) {
                                  setCurrentUser(meData.user);
                                }
                              }
                            } catch (err) {
                              console.error("Wishlist toggle error:", err);
                            }
                          }}
                          className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95 z-30 ${
                            currentUser?.wishlist.includes(item.id)
                              ? "bg-[#c5a059] border-[#c5a059] text-black shadow-lg shadow-yellow-950/20"
                              : "bg-black/70 border-white/10 text-stone-300 hover:text-white"
                          }`}
                          title="Bookmark to Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${currentUser?.wishlist.includes(item.id) ? "fill-current text-black" : "text-[#c5a059]"}`} />
                        </button>
                      </div>

                      {/* Header and taglines */}
                      <div className="space-y-1">
                        <h3 className="font-serif font-bold text-white text-base leading-snug">{item.name}</h3>
                        <p className="text-[10px] tracking-widest text-[#c5a059] uppercase italic font-bold">
                          &ldquo; {item.tagline} &rdquo;
                        </p>
                      </div>

                      <p className="text-stone-400 text-xs mt-3 leading-relaxed font-sans">{item.description}</p>

                      {/* Itemized goodies list inside */}
                      <div className="mt-5 pt-4 border-t border-white/5 space-y-2.5">
                        <span className="text-[10px] uppercase text-stone-500 font-bold tracking-[0.15em]">Pristine Box Contents:</span>
                        <ul className="space-y-1.5 animate-fadeIn">
                          {item.items.map((it, idx) => (
                            <li key={idx} className="text-xs text-stone-300 flex items-start gap-1.5">
                              <span className="gold-text mt-[2px] font-bold">•</span>
                              <span className="leading-relaxed font-sans">{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-stone-500 uppercase tracking-widest">Base Premium price</span>
                        <span className="font-mono text-base font-bold gold-text">₹{item.price.toLocaleString()}</span>
                        {item.discountPrice && (
                          <span className="font-mono text-[9px] text-stone-500 line-through">₹{item.discountPrice.toLocaleString()}</span>
                        )}
                      </div>

                      <button
                        id={`btn-catalog-add-bag-${item.id}`}
                        onClick={() => handleAddToCart(item)}
                        className={`py-3 px-5 gold-gradient text-black font-extrabold rounded-xl text-xs uppercase flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all hover:scale-102 ${BUTTON_ROUNDEDNESS_MAP[theme.buttonRoundedness]}`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Add to bag</span>
                      </button>
                    </div>

                  </div>
                ))}

              {hampers.filter((it) => catalogFilter === "All" || it.category === catalogFilter || it.vibe === catalogFilter).length === 0 && (
                <div id="catalog-no-results" className="col-span-full py-20 text-center border border-white/10 rounded-3xl bg-[#080809] space-y-4">
                  <span className="text-4xl">☕</span>
                  <p className="text-base font-semibold text-white">No matching boutique collections found</p>
                  <p className="text-xs text-stone-403 max-w-xs mx-auto">
                    We can curate this vibe custom for you! Reach out to our master designers directly via WhatsApp to build your bespoke masterwork.
                  </p>
                  <a 
                    href={`https://wa.me/${whatsApp.whatsappNumber.replace(/[\s+]/g, "")}?text=Hi! I want to inquire about custom curating a ${catalogFilter} vibe luxury gift hamper.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-2.5 px-6 bg-[#128c7e] hover:bg-[#0f7c6f] text-white font-bold text-xs tracking-widest uppercase rounded-xl transition-all active:scale-95 shadow-md cursor-pointer"
                  >
                    Inquire over WhatsApp
                  </a>
                </div>
              )}

            </div>

          </div>
        )}

        {/* VIEW 5: CUSTOMER / PATRON MEMBER GILDED PORTAL */}
        {activeTab === "member" && (
          currentUser ? (
            <MemberDashboard 
              currentUser={currentUser}
              onLogout={async () => {
                try {
                  const res = await fetch("/api/auth/logout", { method: "POST" });
                  if (res.ok) {
                    setCurrentUser(null);
                    setActiveTab("home");
                  }
                } catch (err) {
                  console.error("Logout error:", err);
                }
              }}
              hampers={hampers}
              orders={orders}
              onAddToCart={handleAddToCart}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                
                // Keep backoffice synced
                const updatedCustomersList = customers.map(c => 
                  c.email.toLowerCase() === updated.email.toLowerCase()
                    ? { ...c, name: updated.name, phone: updated.phone || "" }
                    : c
                );
                setCustomers(updatedCustomersList);
              }}
            />
          ) : (
            <MemberAuth 
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                
                // Enroll automatically if new patron
                const exists = customers.some(c => c.email.toLowerCase() === user.email.toLowerCase());
                if (!exists) {
                  const newPatron: BoutiqueCustomer = {
                    id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || "",
                    loyaltyPoints: 100, // 100 welcome reward points
                    joinedAt: user.createdAt,
                    totalSpent: 0,
                    orderCount: 0,
                    isBlocked: false
                  };
                  setCustomers([newPatron, ...customers]);
                }
              }}
              brandColorAccent={theme.brandColorAccent}
              buttonRoundedness={theme.buttonRoundedness}
              buttonStyle={theme.buttonStyle || "gradient"}
            />
          )
        )}

        {/* VIEW 4: ADMIN SETTINGS DYNAMIC PORTAL */}
        {activeTab === "admin" && (
          <SettingsEditForm 
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetToDefault={handleResetSettings}
            hampers={hampers}
            onUpdateHampers={setHampers}
            sections={sections}
            onUpdateSections={setSections}
            banner={banner}
            onUpdateBanner={setBanner}
            theme={theme}
            onUpdateTheme={setTheme}
            orders={orders}
            onUpdateOrders={setOrders}
            customers={customers}
            onUpdateCustomers={setCustomers}
            content={content}
            onUpdateContent={setContent}
            whatsApp={whatsApp}
            onUpdateWhatsApp={setWhatsApp}
            payment={payment}
            onUpdatePayment={setPayment}
            onLaunchVisualEditor={() => setIsVisualEditOpen(true)}
          />
        )}

      </main>

      {/* FOOTER CHANNELS (Reflecting customizable configurations) */}
      <footer className="bg-[#080809] text-stone-400 border-t border-white/5" id="global-footer">
        {theme.footerStyle !== 'simple' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/5 pb-12">
              
              <div className="md:col-span-4 space-y-4" id="footer-branding-column">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg gold-gradient text-black font-extrabold flex items-center justify-center text-sm shadow-md">
                    {content.websiteLogoText ? content.websiteLogoText.charAt(0) : "B"}
                  </div>
                  <span className="font-serif font-bold text-white tracking-widest text-lg uppercase">
                    {content.websiteLogoText || "Bloom & Box"}
                  </span>
                </div>
                <p className="text-stone-400 font-serif italic text-xs leading-relaxed">
                  &ldquo;{content.websiteTagline}&rdquo;
                </p>
                <p className="text-stone-500 text-xs leading-relaxed font-sans mt-2">
                  Premium luxury gift specialists crafting unforgettable bespoke milestone, heritage festival, and corporate grand gifting experiences.
                </p>
              </div>

              {theme.footerStyle === 'detailed' && (
                <>
                  <div className="md:col-span-4 space-y-4" id="footer-contact-column">
                    <h4 className="text-white text-[10px] uppercase font-bold tracking-[0.25em] gold-text">Connect with {content.websiteLogoText}</h4>
                    <ul className="space-y-3 text-xs text-stone-400 font-sans">
                      <li className="flex items-center gap-2">
                        <span>📞 Phone Support:</span>
                        <a href={`tel:${whatsApp.whatsappNumber}`} className="gold-text hover:text-white font-mono transition-colors">{whatsApp.whatsappNumber}</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>💬 WhatsApp:</span>
                        <a href={`https://wa.me/${whatsApp.whatsappNumber.replace(/[\s+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="gold-text hover:text-white font-mono transition-colors">{whatsApp.whatsappNumber}</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📧 Email:</span>
                        <a href={`mailto:${settings.contactEmail}`} className="gold-text hover:text-white transition-colors font-mono">{settings.contactEmail}</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📍 Visit Store:</span>
                        <span>{content.businessAddress ? "Boutique Arcade" : "Delhi & Mumbai Lounges"}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="md:col-span-4 space-y-4" id="footer-gifting-guidance">
                    <h4 className="text-white text-[10px] uppercase font-bold tracking-[0.25em] gold-text">Dynamic Settlement Rules</h4>
                    <p className="text-stone-500 text-xs leading-relaxed font-sans">
                      Standard tax setup: <strong className="font-mono text-[#c5a059]">{settings.gstPercentage}% GST</strong> rate applies on final checkouts. Shipping is fully waived on all orders exceeding <strong className="font-mono text-[#c5a059]">₹{settings.freeShippingThreshold.toLocaleString()}</strong>.
                    </p>

                    <div className="flex gap-2" id="footer-social-panel">
                      <a 
                        id="foot-instagram"
                        href={settings.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2.5 bg-white/5 hover:bg-[#c5a059] hover:text-black rounded-lg text-stone-400 transition-colors border border-white/5"
                        title="Follow us on Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a 
                        id="foot-facebook"
                        href={settings.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2.5 bg-white/5 hover:bg-[#c5a059] hover:text-black rounded-lg text-stone-400 transition-colors border border-white/5"
                        title="Join us on Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </>
              )}

              {theme.footerStyle === 'compact' && (
                <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                  <p className="text-stone-400 text-xs">{content.businessAddress}</p>
                  <p className="text-[11px] text-[#c5a059] font-mono">GST percentage setup: {settings.gstPercentage}% • Free shipping above: ₹{settings.freeShippingThreshold.toLocaleString()}</p>
                </div>
              )}

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 text-stone-500 text-[11px]" id="footer-legal-bar">
              <span>© 2026 {content.websiteLogoText || "Bloom & Box"}. All Reserved Luxury Rights.</span>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab("admin")} 
                  className="hover:text-[#c5a059] transition-colors font-medium cursor-pointer"
                  id="footer-admin-link"
                >
                  🔒 Administrative Portal
                </button>
                <span>|</span>
                <span className="gold-text font-semibold text-[10px] tracking-wider uppercase">💬 WhatsApp Verified Merchant</span>
              </div>
            </div>

          </div>
        ) : (
          // Simple layout footer
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-stone-600 flex items-center justify-between">
            <span>© 2026 {content.websiteLogoText || "Bloom & Box"}</span>
            <button onClick={() => setActiveTab("admin")} className="hover:text-white transition-colors cursor-pointer">🔒 Admin Console</button>
          </div>
        )}
      </footer>

      {/* Cart Drawer overlay slider */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        settings={{
          ...settings,
          businessName: content.websiteLogoText,
          whatsappNumber: whatsApp.whatsappNumber,
          upiId: payment.upiId,
          deliveryCharges: settings.deliveryCharges,
          freeShippingThreshold: settings.freeShippingThreshold
        }}
        payment={payment}
        onPlaceOrder={handlePlaceOrder}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
      />

      {/* IMMERSIVE LIVE VISUAL WEBSITE BUILDER OVERLAY */}
      {isVisualEditOpen && (
        <VisualEditor 
          onClose={() => setIsVisualEditOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          hampers={hampers}
          onUpdateHampers={setHampers}
          sections={sections}
          onUpdateSections={setSections}
          banner={banner}
          onUpdateBanner={setBanner}
          theme={theme}
          onUpdateTheme={setTheme}
          content={content}
          onUpdateContent={setContent}
          whatsApp={whatsApp}
          onUpdateWhatsApp={setWhatsApp}
          payment={payment}
          onUpdatePayment={setPayment}
        />
      )}

      <SpeedInsights />
    </div>
  );
}
