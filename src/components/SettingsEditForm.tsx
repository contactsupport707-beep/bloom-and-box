/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Settings, 
  RefreshCw, 
  Check, 
  Globe, 
  HelpCircle, 
  Save, 
  Phone, 
  Mail, 
  Award, 
  Truck, 
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Layout,
  Palette,
  MessageSquare,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Download,
  Users,
  FileText,
  Image as ImageIcon,
  Calendar,
  Layers,
  ShoppingBag,
  List,
  Tag,
  Gift,
  Sparkles
} from "lucide-react";
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
} from "../types";

// Standard preset categories requested
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

const BUTTON_ROUNDEDNESS_MAP = {
  none: "rounded-none",
  md: "rounded-md",
  xl: "rounded-xl",
  full: "rounded-full"
};

interface SettingsEditFormProps {
  settings: GlobalSettings;
  onSaveSettings: (newSettings: GlobalSettings) => void;
  onResetToDefault: () => void;
  
  // App states for full integration
  hampers: Hamper[];
  onUpdateHampers: (items: Hamper[]) => void;
  sections: HomepageSection[];
  onUpdateSections: (sections: HomepageSection[]) => void;
  banner: BannerConfig;
  onUpdateBanner: (banner: BannerConfig) => void;
  theme: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  orders: BoutiqueOrder[];
  onUpdateOrders: (orders: BoutiqueOrder[]) => void;
  customers: BoutiqueCustomer[];
  onUpdateCustomers: (customers: BoutiqueCustomer[]) => void;
  content: ContentConfig;
  onUpdateContent: (content: ContentConfig) => void;
  whatsApp: WhatsAppConfig;
  onUpdateWhatsApp: (whatsApp: WhatsAppConfig) => void;
  payment: PaymentConfig;
  onUpdatePayment: (payment: PaymentConfig) => void;
  onLaunchVisualEditor?: () => void;
}

export function SettingsEditForm({
  settings,
  onSaveSettings,
  onResetToDefault,
  hampers,
  onUpdateHampers,
  sections,
  onUpdateSections,
  banner,
  onUpdateBanner,
  theme,
  onUpdateTheme,
  orders,
  onUpdateOrders,
  customers,
  onUpdateCustomers,
  content,
  onUpdateContent,
  whatsApp,
  onUpdateWhatsApp,
  payment,
  onUpdatePayment,
  onLaunchVisualEditor
}: SettingsEditFormProps) {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveAdminTab] = useState<string>("builder");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  
  // Notification states
  const [saveNotify, setSaveNotify] = useState(false);
  
  // Undo/Redo stacks for Website state history
  const [undoStack, setUndoStack] = useState<{ sections: HomepageSection[]; theme: ThemeConfig; banner: BannerConfig }[]>([]);
  const [redoStack, setRedoStack] = useState<{ sections: HomepageSection[]; theme: ThemeConfig; banner: BannerConfig }[]>([]);

  // Local state copy for easy editing
  const [localSettings, setLocalSettings] = useState<GlobalSettings>({ ...settings });
  const [localWhatsApp, setLocalWhatsApp] = useState<WhatsAppConfig>({ ...whatsApp });
  const [localPayment, setLocalPayment] = useState<PaymentConfig>({ ...payment });
  const [localContent, setLocalContent] = useState<ContentConfig>({ ...content });
  const [localBanner, setLocalBanner] = useState<BannerConfig>({ ...banner });
  const [localTheme, setLocalTheme] = useState<ThemeConfig>({ ...theme });

  // Product state management inside form
  const [editingProduct, setEditingProduct] = useState<Hamper | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Order selection state inside view
  const [selectedOrder, setSelectedOrder] = useState<BoutiqueOrder | null>(null);

  // Server-side Mailjet & OTP config
  const [mailjetApiKey, setMailjetApiKey] = useState("");
  const [mailjetApiSecret, setMailjetApiSecret] = useState("");
  const [mailjetSenderEmail, setMailjetSenderEmail] = useState("hello@bloomandbox.com");
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(5);
  const [mailjetSaveStatus, setMailjetSaveStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMailjetApiKey(data.mailjetApiKey || "");
          setMailjetApiSecret(data.mailjetApiSecret || "");
          setMailjetSenderEmail(data.mailjetSenderEmail || "hello@bloomandbox.com");
          setOtpExpiryMinutes(data.otpExpiryMinutes || 5);
        }
      })
      .catch((err) => console.error("Error loading Mailjet settings:", err));
  }, []);

  // Default passcode lock
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "bloombox2026") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid passcode. Tip: Use 'bloombox2026'");
    }
  };

  // Sync back state
  useEffect(() => {
    setLocalSettings({ ...settings });
    setLocalWhatsApp({ ...whatsApp });
    setLocalPayment({ ...payment });
    setLocalContent({ ...content });
    setLocalBanner({ ...banner });
    setLocalTheme({ ...theme });
  }, [settings, whatsApp, payment, content, banner, theme]);

  // History Helper for Undo / Redo
  const saveStateToHistory = () => {
    setUndoStack(prev => [...prev, { 
      sections: JSON.parse(JSON.stringify(sections)), 
      theme: { ...localTheme }, 
      banner: { ...localBanner } 
    }]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, { 
      sections: JSON.parse(JSON.stringify(sections)), 
      theme: { ...localTheme }, 
      banner: { ...localBanner } 
    }]);

    // Restore previously saved components
    onUpdateSections(previous.sections);
    onUpdateTheme(previous.theme);
    onUpdateBanner(previous.banner);
    setLocalTheme(previous.theme);
    setLocalBanner(previous.banner);
    triggerGlobalSave(previous.theme, previous.banner, previous.sections);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, { 
      sections: JSON.parse(JSON.stringify(sections)), 
      theme: { ...localTheme }, 
      banner: { ...localBanner } 
    }]);

    onUpdateSections(next.sections);
    onUpdateTheme(next.theme);
    onUpdateBanner(next.banner);
    setLocalTheme(next.theme);
    setLocalBanner(next.banner);
    triggerGlobalSave(next.theme, next.banner, next.sections);
  };

  const triggerReset = () => {
    if (window.confirm("This will erase custom products, orders, and styles. Reset database parameters to original setups?")) {
      onResetToDefault();
    }
  };

  // Sections management helper (Up/Down/Visible)
  const moveSection = (index: number, direction: 'up' | 'down') => {
    saveStateToHistory();
    const newSections = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Normalize order field
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    onUpdateSections(newSections);
    triggerGlobalSave(localTheme, localBanner, newSections);
  };

  const toggleSectionVisibility = (id: string) => {
    saveStateToHistory();
    const newSections = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    onUpdateSections(newSections);
    triggerGlobalSave(localTheme, localBanner, newSections);
  };

  const triggerGlobalSave = (themeToUse = localTheme, bannerToUse = localBanner, sectionsToUse = sections) => {
    // Sync client-side elements
    onUpdateTheme(themeToUse);
    onUpdateBanner(bannerToUse);
    onSaveSettings({
      ...localSettings,
      businessName: localContent.websiteLogoText,
      contactEmail: localSettings.contactEmail,
      whatsappNumber: localWhatsApp.whatsappNumber,
      upiId: localPayment.upiId
    });
    onUpdateWhatsApp(localWhatsApp);
    onUpdatePayment(localPayment);
    onUpdateContent(localContent);
    
    // Inject active theme settings into global Document Variables instantly
    document.documentElement.style.setProperty('--custom-primary-bg', themeToUse.brandColorPrimary);
    document.documentElement.style.setProperty('--custom-accent-gold', themeToUse.brandColorAccent);
    document.documentElement.style.setProperty('--custom-text-color', themeToUse.textColor);
    
    let fontStr = '"Inter", sans-serif';
    if (themeToUse.fontFamily === 'Playfair') fontStr = '"Playfair Display", serif';
    else if (themeToUse.fontFamily === 'Mono') fontStr = '"JetBrains Mono", monospace';
    else if (themeToUse.fontFamily === 'Outfit') fontStr = '"Outfit", sans-serif';
    document.documentElement.style.setProperty('--custom-sans', fontStr);

    setSaveNotify(true);
    setTimeout(() => setSaveNotify(false), 2000);
  };

  // Product Manager CRUD Functions
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    let newHampers = [...hampers];
    const isNew = !hampers.some(h => h.id === editingProduct.id);
    
    if (isNew) {
      newHampers = [editingProduct, ...newHampers];
    } else {
      newHampers = hampers.map(h => h.id === editingProduct.id ? editingProduct : h);
    }
    
    onUpdateHampers(newHampers);
    setShowProductForm(false);
    setEditingProduct(null);
    triggerGlobalSave();
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to remove this gift collection?")) {
      const filtered = hampers.filter(h => h.id !== id);
      onUpdateHampers(filtered);
      triggerGlobalSave();
    }
  };

  const createBlankProduct = () => {
    const blank: Hamper = {
      id: `hamper-${Date.now()}`,
      name: "New Premium Velvet Hamper",
      tagline: "Sensory notes of celebration & grand grace",
      price: 3500,
      description: "An elegant, bespoke linen box enclosed with gold leaf and featuring artisanal local preserves.",
      items: ["Single-Estate Tea", "Gourmet Chocolates", "Soy Candle"],
      image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=500",
      vibe: "Royal",
      category: "🌸 Birthday Hampers",
      stockQuantity: 15,
      isBestseller: false,
      isFeatured: true
    };
    setEditingProduct(blank);
    setShowProductForm(true);
  };

  // Order Operations
  const handleUpdateOrderStatus = (orderId: string, status: BoutiqueOrder['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    onUpdateOrders(updated);
    if(selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleUpdateOrderTracking = (orderId: string, trackingNumber: string) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, trackingNumber } : o);
    onUpdateOrders(updated);
    if(selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, trackingNumber } : null);
    }
  };

  // Customer blockage & points
  const handleToggleBlockCustomer = (id: string) => {
    const updated = customers.map(c => c.id === id ? { ...c, isBlocked: !c.isBlocked } : c);
    onUpdateCustomers(updated);
  };

  const handleUpdateCustomerPoints = (id: string, loyaltyPoints: number) => {
    const updated = customers.map(c => c.id === id ? { ...c, loyaltyPoints } : c);
    onUpdateCustomers(updated);
  };

  // CSV Exporter for Orders
  const exportOrdersToCSV = () => {
    const headers = ["Order ID", "Customer Name", "Phone", "Email", "Items", "Subtotal", "GST", "Total", "Status", "Date"];
    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.customerPhone,
      o.customerEmail,
      o.items.map(i => `${i.hamperName}(x${i.quantity})`).join("; "),
      o.subtotal,
      o.gstAmount,
      o.grandTotal,
      o.status,
      o.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BloomBox_Orders_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Password authenticate barrier
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-auth-screen">
        <div className="glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl text-center border border-white/5 bg-[#0a0a0b]">
          <div className="w-16 h-16 rounded-full bg-white/5 text-[#c5a059] flex items-center justify-center mx-auto mb-6 border border-[#c5a059]/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Shopify Developer Suite</h2>
          <p className="text-stone-400 font-sans text-xs pb-6 leading-relaxed">
            Configure layout segments, direct checkout paths, design models, active catalog items, and view custom logs.
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4" id="passcode-form">
            <div className="relative">
              <input
                id="admin-passcode-input"
                type="password"
                placeholder="Enter passcode (bloombox2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center tracking-widest text-sm py-3 px-4 rounded-xl bg-[#080809]/80 border border-white/10 focus:outline-none focus:border-[#c5a059]/40 text-white font-mono"
              />
            </div>
            {authError && <p className="text-red-400 text-xs mt-1 font-medium">{authError}</p>}
            
            <button
              id="admin-auth-submit-btn"
              type="submit"
              className="w-full py-3 px-4 gold-gradient text-black rounded-xl font-bold text-xs tracking-widest uppercase hover:gold-gradient-hover active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              LAUNCH VISUAL DESIGN STUDIO
            </button>
          </form>
          <span className="block mt-6 text-[10px] text-stone-500 font-mono tracking-widest uppercase">bloombox2026</span>
        </div>
      </div>
    );
  }

  // Active sandbox settle payload link representation
  const cleanBusinessName = encodeURIComponent(localContent.websiteLogoText || "Bloom & Box");
  const cleanUpiId = localPayment.upiId || "bloombox@okaxis";
  const sandboxUri = `upi://pay?pa=${cleanUpiId}&pn=${cleanBusinessName}&am=4900&tn=Bespoke+Gifting+Checkout&cu=INR`;

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 lg:py-12 animate-fadeIn" id="visual-editor-container">
      
      {/* Visual Editor Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-md bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 text-[10px] tracking-widest uppercase font-extrabold flex items-center gap-1">
              <Settings className="w-3 h-3 animate-spin" />
              Shopify Visual Admin
            </span>
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-md p-0.5 text-[10px]">
              <button 
                onClick={handleUndo} 
                disabled={undoStack.length === 0}
                className="p-1.5 hover:bg-white/5 border border-transparent rounded text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Undo Change"
              >
                ↩️ Undo
              </button>
              <button 
                onClick={handleRedo} 
                disabled={redoStack.length === 0}
                className="p-1.5 hover:bg-white/5 border border-transparent rounded text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Redo Change"
              >
                ↪️ Redo
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-serif text-white mt-1.5">Bloom & Box Live Website Builder</h1>
          <p className="text-stone-400 text-xs mt-0.5">Edit homepage sections, products, themes, payment settings, WhatsApp details and instant database changes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={triggerReset}
            className="px-4 py-2 bg-gradient-to-r from-red-950 to-stone-900 border border-red-500/20 hover:border-red-500/40 text-red-100 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            ⚠️ Reset DB Defaults
          </button>
          
          <button
            onClick={() => triggerGlobalSave()}
            className="px-7 py-3 gold-gradient text-black hover:gold-gradient-hover rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Publish Changes Instantly</span>
          </button>
        </div>
      </div>

      {saveNotify && (
        <div className="fixed bottom-6 right-6 z-[99] bg-emerald-600 border border-emerald-500/20 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-200" />
          <div>
            <p className="text-xs font-bold">MONGODB INSTANT WRITTEN SUCCEEDED</p>
            <p className="text-[10px] text-emerald-200">Catalog, Payments, and Layout variables updated instantly.</p>
          </div>
        </div>
      )}

      {/* Main Builder Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BUILDER TABS & FORMS (Col Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Editor Module Select Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#080809] border border-white/5 p-1 rounded-2xl overflow-x-auto">
            {[
              { id: "builder", label: "Homepage Segments", icon: <Layout className="w-3.5 h-3.5" /> },
              { id: "products", label: "Hampers & Products", icon: <Gift className="w-3.5 h-3.5" /> },
              { id: "theme", label: "Theme Customizer", icon: <Palette className="w-3.5 h-3.5" /> },
              { id: "payments", label: "UPI Settings", icon: <CreditCard className="w-3.5 h-3.5" /> },
              { id: "whatsapp", label: "WhatsApp Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: "banner", label: "Hero Banner Config", icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { id: "content", label: "General Content", icon: <FileText className="w-3.5 h-3.5" /> },
              { id: "orders", label: "eCommerce Orders", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
              { id: "customers", label: "Patrons Database", icon: <Users className="w-3.5 h-3.5" /> },
              { id: "auth", label: "Auth & Mailjet", icon: <Lock className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20" 
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-white/5 min-h-[550px] overflow-hidden">
            
            {/* TAB 1: WEBSITE HOMEPAGE SECTIONS BUILDER */}
            {activeTab === "builder" && (
              <div className="space-y-6">
                
                {/* Visual Editor Supercharger Launch Callout */}
                <div className="bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn" id="builder-visual-launcher">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a059] font-bold block">✨ Supercharged Store Backoffice</span>
                    <h4 className="text-base font-serif text-white uppercase font-bold">Immersive Live Visual Designer</h4>
                    <p className="text-[11px] text-stone-400 max-w-md">Launch our Shopify-like visual builder. Drag-and-drop sections, click and replace photos instantly, write text inline, and adjust theme styling live with a multi-device viewport.</p>
                  </div>
                  <button
                    onClick={onLaunchVisualEditor}
                    type="button"
                    className="py-3 px-6 gold-gradient rounded-xl text-black text-xs font-serif font-bold uppercase tracking-[0.15em] hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer shrink-0 flex items-center gap-1.5"
                    id="launch-visual-builder-btn"
                  >
                    <Sparkles className="w-4 h-4 text-black animate-pulse" />
                    <span>Launch Visual Editor</span>
                  </button>
                </div>

                <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-serif text-white">1. Drag-and-Drop Homepage Sections</h3>
                    <p className="text-stone-400 text-xs">Instantly reorder sections using up/down shortcuts or hide visibility toggle.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sections.map((sec, idx) => (
                    <div 
                      key={sec.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        sec.visible 
                          ? "bg-white/5 border-[#c5a059]/10 hover:border-[#c5a059]/25" 
                          : "bg-black/40 border-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-stone-500">#{idx + 1}</span>
                        <div className="p-1.5 rounded-lg bg-[#c5a059]/10 text-[#c5a059]">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-serif">{sec.name}</p>
                          <p className="text-[10px] text-stone-400">Section Identification Key: {sec.id}</p>
                        </div>
                      </div>

                      {/* Section Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleSectionVisibility(sec.id)}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                            sec.visible 
                              ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/25 hover:bg-[#c5a059]/20" 
                              : "bg-white/5 text-stone-500 border-white/5 hover:text-white"
                          }`}
                          title={sec.visible ? "Hide Section" : "Show Section"}
                        >
                          {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move Section Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === sections.length - 1}
                          className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move Section Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#c5a059]/5 p-4 rounded-xl border border-[#c5a059]/10 space-y-1">
                  <p className="text-xs gold-text font-bold">✨ Pro-tip: Instant Publishing</p>
                  <p className="text-[10px] text-stone-400">Order layout and section structures apply immediately to client storefront interfaces. Rearrange the rows to alter how customers navigate the collections on scroll.</p>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCT MANAGEMENT LIST & FORMS */}
            {activeTab === "products" && (
              <div className="space-y-6">
                {!showProductForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-lg font-serif text-white">2. Product Catalog Management</h3>
                        <p className="text-stone-400 text-xs">Direct database listing. Add, modify pricing thresholds, categories, images and stock quantities.</p>
                      </div>
                      <button
                        onClick={createBlankProduct}
                        className="py-2 px-3.5 gold-gradient text-black rounded-xl text-[10px] tracking-widest uppercase font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5 font-bold" />
                        NEW PREMIUM GIFT
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {hampers.map(item => (
                        <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-900 flex-shrink-0" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="text-xs font-serif text-white leading-tight">{item.name}</h4>
                              <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-2">
                                <span className="text-[#c5a059] font-semibold">{item.category}</span>
                                <span>•</span>
                                <span>Qty: <strong className="text-white font-mono">{item.stockQuantity}</strong></span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                            <div className="text-right">
                              <span className="font-mono text-xs font-bold gold-text block">₹{item.price.toLocaleString()}</span>
                              {item.discountPrice && (
                                <span className="font-mono text-[9px] text-stone-500 line-through">₹{item.discountPrice.toLocaleString()}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.isBestseller && <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded px-1.5 py-0.5 uppercase font-bold">Bestseller</span>}
                              {item.isFeatured && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5 uppercase font-bold">Featured</span>}
                              
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...item });
                                  setShowProductForm(true);
                                }}
                                className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-stone-300 cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(item.id)}
                                className="p-2 bg-white/5 border border-white/5 hover:bg-red-500/20 text-stone-300 hover:text-red-400 rounded-lg cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Product Sub-Form
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                      <h4 className="text-sm font-serif text-white uppercase tracking-widest gold-text">
                        {hampers.some(h => h.id === editingProduct?.id) ? "Edit Gift Selection" : "Insert Premium Gift Curation"}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                        className="text-stone-400 hover:text-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-stone-300">Gifting Name</label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.name || ""}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300">Tagline / Aesthetic Hook</label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.tagline || ""}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300">Base Price (INR)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editingProduct?.price || 0}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300">Discount/Sale Price (Optional)</label>
                        <input
                          type="number"
                          value={editingProduct?.discountPrice || ""}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, discountPrice: e.target.value ? Number(e.target.value) : undefined } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40 font-mono"
                          placeholder="e.g. 2900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300">Category Tag Collection</label>
                        <select
                          value={editingProduct?.category || PRESET_CATEGORIES[0]}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40"
                        >
                          {PRESET_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300">Available Stock Quantity</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={editingProduct?.stockQuantity || 0}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stockQuantity: Number(e.target.value) } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40 font-mono"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-stone-300">Gifting Image URL Link</label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.image || ""}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, image: e.target.value } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40 font-mono text-[11px]"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-stone-300">Bespoke Editorial Description</label>
                        <textarea
                          required
                          rows={3}
                          value={editingProduct?.description || ""}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-stone-300">Pristine Box Contents (Comma separated items)</label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.items.join(", ") || ""}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, items: e.target.value.split(",").map(i => i.trim()) } : null)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white focus:outline-none focus:border-[#c5a059]/40"
                          placeholder="Kashmiri Saffron, Soy Candle, Belgian Chocolate"
                        />
                      </div>

                      <div className="flex gap-4 items-center pt-2">
                        <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct?.isBestseller || false}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, isBestseller: e.target.checked } : null)}
                            className="rounded bg-[#080809] border-white/10 text-[#c5a059] focus:ring-0"
                          />
                          <span>Mark as Bestseller</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct?.isFeatured || false}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                            className="rounded bg-[#080809] border-white/10 text-[#c5a059] focus:ring-0"
                          />
                          <span>Mark as Featured</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                        className="py-2.5 px-6 border border-white/10 rounded-xl text-stone-300 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-2.5 px-6 gold-gradient text-black rounded-xl text-xs font-extrabold uppercase tracking-widest hover:gold-gradient-hover cursor-pointer"
                      >
                        SAVE PRODUCT TO MONGODB
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: THEME CUSTOMIZER CONFIG */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">3. Brand Theme Customizer</h3>
                  <p className="text-stone-400 text-xs">Transform typography layouts and palette accents dynamically with no code redeployment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Brand Primary Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localTheme.brandColorPrimary}
                        onChange={(e) => setLocalTheme(prev => ({ ...prev, brandColorPrimary: e.target.value }))}
                        className="w-10 h-10 rounded border border-white/10 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={localTheme.brandColorPrimary}
                        onChange={(e) => setLocalTheme(prev => ({ ...prev, brandColorPrimary: e.target.value }))}
                        className="flex-1 text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Brand Highlight Accent (Gold Tint)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localTheme.brandColorAccent}
                        onChange={(e) => setLocalTheme(prev => ({ ...prev, brandColorAccent: e.target.value }))}
                        className="w-10 h-10 rounded border border-white/10 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={localTheme.brandColorAccent}
                        onChange={(e) => setLocalTheme(prev => ({ ...prev, brandColorAccent: e.target.value }))}
                        className="flex-1 text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Global Text Color Tint</label>
                    <input
                      type="text"
                      value={localTheme.textColor}
                      onChange={(e) => setLocalTheme(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Main Font Typography Pairing</label>
                    <select
                      value={localTheme.fontFamily}
                      onChange={(e) => setLocalTheme(prev => ({ ...prev, fontFamily: e.target.value as any }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                    >
                      <option value="Inter">🧑‍💼 Modern Sans ("Inter")</option>
                      <option value="Playfair">🏛️ Literary Serif ("Playfair Display")</option>
                      <option value="Mono">💻 Coding Monospace ("JetBrains Mono")</option>
                      <option value="Outfit">🔥 Geometric Tech ("Outfit")</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Primary Button Shapes</label>
                    <select
                      value={localTheme.buttonStyle}
                      onChange={(e) => setLocalTheme(prev => ({ ...prev, buttonStyle: e.target.value as any }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                    >
                      <option value="gradient">✨ Metallic Gold Gradient</option>
                      <option value="solid-accent">🟨 Solid Accent Gold</option>
                      <option value="gold-outline">🔲 Luxury Gold Wireframe</option>
                      <option value="minimalist">⬛ Low-Contrast Stone Block</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Header Navigation Style</label>
                    <select
                      value={localTheme.headerStyle}
                      onChange={(e) => setLocalTheme(prev => ({ ...prev, headerStyle: e.target.value as any }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                    >
                      <option value="glass">🌫️ Blurred Frosted Canvas (Translucent)</option>
                      <option value="sticky">📌 Sticky Solid Board (No Alpha)</option>
                      <option value="standard">⏳ Standard Fluid scroll (Fades out)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Button Corner Roundedness</label>
                    <select
                      value={localTheme.buttonRoundedness}
                      onChange={(e) => setLocalTheme(prev => ({ ...prev, buttonRoundedness: e.target.value as any }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                    >
                      <option value="none">Sharp Architectural (0px Corner)</option>
                      <option value="md">Slightly Curved Cozy (6px Corner)</option>
                      <option value="xl">Organic Curated Luxury (12px Corner)</option>
                      <option value="full">Perfect Capsule Pill (999px Rounded)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Boutique Footer Layout</label>
                    <select
                      value={localTheme.footerStyle}
                      onChange={(e) => setLocalTheme(prev => ({ ...prev, footerStyle: e.target.value as any }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                    >
                      <option value="detailed">📋 Four-Column Master Index (Detailed)</option>
                      <option value="compact">📁 Compact Legal Rail (Balanced)</option>
                      <option value="simple">📝 Minimal copyright text line (Simplistic)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => triggerGlobalSave(localTheme)}
                    className="py-2.5 px-6 gold-gradient text-black rounded-xl text-xs font-extrabold uppercase tracking-widest hover:gold-gradient-hover cursor-pointer"
                  >
                    APPLY BRAND THEME CUSTOMS
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: UPI PAYMENT GATEWAY CONFIG */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">4. UPI Gateway & QR Scanner Configurations</h3>
                  <p className="text-stone-400 text-xs">Authorize digital settlement paths and configure real checkout behaviors instantly.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-stone-300">Merchant UPI Account Name</label>
                      <input
                        type="text"
                        value={localPayment.accountName}
                        onChange={(e) => setLocalPayment(prev => ({ ...prev, accountName: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                        placeholder="e.g. Bloom & Box Royal Gifting"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-stone-300">Designated UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={localPayment.upiId}
                        onChange={(e) => setLocalPayment(prev => ({ ...prev, upiId: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                        placeholder="bloombox@okaxis"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs text-stone-300 block mb-1">UPI QR Code Image (Upload File or Paste Image URL)</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={localPayment.upiQrImage || ""}
                          onChange={(e) => setLocalPayment(prev => ({ ...prev, upiQrImage: e.target.value }))}
                          className="flex-1 text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono text-[11px]"
                          placeholder="Paste image address link or upload a custom QR"
                        />
                        <label className="flex-shrink-0 cursor-pointer h-10 px-4 flex items-center justify-center rounded-lg text-xs font-mono font-bold uppercase bg-white/5 border border-white/10 text-stone-300 hover:bg-[#c5a059]/15 hover:text-white transition-colors">
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setLocalPayment(prev => ({ ...prev, upiQrImage: event.target!.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {localPayment.upiQrImage && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-emerald-400 font-mono">Custom QR Active</span>
                          <button
                            type="button"
                            onClick={() => setLocalPayment(prev => ({ ...prev, upiQrImage: "" }))}
                            className="text-[10px] text-red-400 hover:underline cursor-pointer font-bold uppercase font-mono"
                          >
                            Reset to System QR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Payment & Checkout Instructions</label>
                    <textarea
                      rows={3}
                      value={localPayment.paymentInstructions || ""}
                      onChange={(e) => setLocalPayment(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white leading-relaxed"
                      placeholder="Write exact payment guidelines (step-by-step) displayed for clients under UPI checkout"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        id="enable-upi"
                        type="checkbox"
                        checked={localPayment.enableUpiPayments}
                        onChange={(e) => setLocalPayment(prev => ({ ...prev, enableUpiPayments: e.target.checked }))}
                        className="rounded bg-[#080809] border-white/10 text-[#c5a059] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="enable-upi" className="text-xs text-stone-300 cursor-pointer select-none">
                        Enable active Instant UPI Checkouts with dynamic QR overlays
                      </label>
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        id="enable-cod"
                        type="checkbox"
                        checked={!!localPayment.enableCod}
                        onChange={(e) => setLocalPayment(prev => ({ ...prev, enableCod: e.target.checked }))}
                        className="rounded bg-[#080809] border-white/10 text-[#c5a059] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="enable-cod" className="text-xs text-stone-300 cursor-pointer select-none">
                        Enable Cash on Delivery (COD) Checkout Option
                      </label>
                    </div>
                  </div>
                  
                  {/* UPI QR Active Sandbox Test Bench */}
                  <div className="border border-[#c5a059]/20 bg-[#0e0c09] p-5 rounded-2xl relative overflow-hidden space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <p className="text-xs font-serif text-[#c5a059] uppercase tracking-wider">Active UPI QR Sandbox</p>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 font-mono py-0.5 px-2 rounded">ONLINE TESTING</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Scan this test benchmark code with dynamic payload to verify values. Any edits above will alter payload bytes instantly.</p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-around pt-2">
                      <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0a0a0b&data=${encodeURIComponent(sandboxUri)}`}
                          alt="Sandbox Live Barcode" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1 text-center sm:text-left text-xs">
                        <p className="text-stone-300 text-xs">Payload String:</p>
                        <code className="text-[10px] text-[#c5a059] font-mono break-all max-w-xs block leading-tight">{sandboxUri}</code>
                        <p className="text-stone-500 text-[10px] mt-2">Tested on BHIM, Google Pay, and PhonePe protocols.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => triggerGlobalSave()}
                    className="py-2.5 px-6 gold-gradient text-black rounded-xl text-xs font-extrabold uppercase tracking-widest hover:gold-gradient-hover cursor-pointer"
                  >
                    SAVE UPI PAYMENTS CONFIG
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: WHATSAPP SERVICE OVERLAYS */}
            {activeTab === "whatsapp" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">5. WhatsApp Services & Chat Widgets</h3>
                  <p className="text-stone-400 text-xs">Wire custom order dispatching templates and interactive floating assistance tokens.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-stone-300">Primary WhatsApp Sales Line (+Country Code)</label>
                      <input
                        type="text"
                        value={localWhatsApp.whatsappNumber}
                        onChange={(e) => setLocalWhatsApp(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                        placeholder="+919876543210"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-stone-300">Floating Button Dialog Text</label>
                      <input
                        type="text"
                        value={localWhatsApp.floatingButtonText}
                        onChange={(e) => setLocalWhatsApp(prev => ({ ...prev, floatingButtonText: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                        placeholder="Inquire over WhatsApp"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs text-stone-300">Checkout Dispatch Template (WhatsApp message text body)</label>
                      <textarea
                        rows={4}
                        value={localWhatsApp.messageTemplate}
                        onChange={(e) => setLocalWhatsApp(prev => ({ ...prev, messageTemplate: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono leading-relaxed"
                        placeholder="Write dynamic message layout. Tip: Use tags like {ORDER_ITEMS}, {TOTAL} to import checkout results."
                      />
                      <span className="text-[10px] text-stone-500 block">Available Tags: <strong className="text-white font-mono">{`{ORDER_ITEMS}`}</strong>, <strong className="text-white font-mono">{`{TOTAL}`}</strong>, <strong className="text-white font-mono">{`{GST}`}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      id="enable-widget"
                      type="checkbox"
                      checked={localWhatsApp.enableChatWidget}
                      onChange={(e) => setLocalWhatsApp(prev => ({ ...prev, enableChatWidget: e.target.checked }))}
                      className="rounded bg-[#080809] border-white/10 text-[#c5a059] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="enable-widget" className="text-xs text-stone-300 cursor-pointer select-none">
                      Enable floating WhatsApp Designer chat support widget bubble on customer viewport
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => triggerGlobalSave()}
                    className="py-2.5 px-6 gold-gradient text-black rounded-xl text-xs font-extrabold uppercase tracking-widest hover:gold-gradient-hover cursor-pointer"
                  >
                    SAVE WHATSAPP COORDINATES
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: BANNER ASSETS SCHEDULER */}
            {activeTab === "banner" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">6. Hero Billboard & Banners Management</h3>
                  <p className="text-stone-400 text-xs">Alter text hooks, scheduled campaign brackets and replacement artwork.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Banner Core Title Heading</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-serif"
                      value={localBanner.title}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Billboard Subtitle Text</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localBanner.subtitle}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Call-To-Action (CTA) Label</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localBanner.ctaText}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, ctaText: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">CTA Target Link Action</label>
                    <select
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localBanner.ctaLink}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, ctaLink: e.target.value }))}
                    >
                      <option value="catalog">Browse Full Catalog</option>
                      <option value="contact">Connect Section</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-stone-300">Desktop Background Artwork (1200x800 URL)</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono text-[11px]"
                      value={localBanner.imageUrl}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-stone-300">Mobile Aspect Portrait Artwork (600x800 URL)</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono text-[11px]"
                      value={localBanner.mobileImageUrl}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, mobileImageUrl: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 gold-text" />
                      Campaign Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                      value={localBanner.startDate || ""}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 gold-text" />
                      Campaign End Date
                    </label>
                    <input
                      type="date"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white font-mono"
                      value={localBanner.endDate || ""}
                      onChange={(e) => setLocalBanner(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      saveStateToHistory();
                      triggerGlobalSave(localTheme, localBanner);
                    }}
                    className="py-2.5 px-6 gold-gradient text-black rounded-xl text-xs font-extrabold uppercase tracking-widest hover:gold-gradient-hover cursor-pointer"
                  >
                    COMPILE BILLBOARD CAMPAIGN
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: GENERAL BUSINESS CONTENT settings */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">7. Website Text Assets & Legal Copies</h3>
                  <p className="text-stone-400 text-xs">Alter brand slogans, address locations, legal directories and guidelines seamlessly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Website Header Slogan Brand Logo</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localContent.websiteLogoText}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, websiteLogoText: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Website Brand Tagline</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localContent.websiteTagline}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, websiteTagline: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Office Contact Settle Coordinate</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localContent.contactNumber}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, contactNumber: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-300">Warehouse / Store Physical Address</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white"
                      value={localContent.businessAddress}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, businessAddress: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-stone-300">Privacy Policy Disclaimer</label>
                    <textarea
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white leading-relaxed"
                      value={localContent.privacyPolicy}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-stone-300">Terms & Trading Conditions</label>
                    <textarea
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg bg-[#080809] border border-white/10 text-white leading-relaxed"
                      value={localContent.termsConditions}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, termsConditions: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => triggerGlobalSave()}
                    className="py-2.5 px-6 gold-gradient text-black rounded-xl text-xs font-extrabold uppercase tracking-widest hover:gold-gradient-hover cursor-pointer"
                  >
                    APPLY LEGAL & ADDRESS REVISION
                  </button>
                </div>
              </div>
            )}

            {/* TAB 8: eCommerce ORDERS LOGGING */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-serif text-white">8. eCommerce Client Orders Feed</h3>
                    <p className="text-stone-400 text-xs">Direct checkout tracking. Manage delivery statuses, tracking AWB details, and print logs.</p>
                  </div>
                  <button
                    onClick={exportOrdersToCSV}
                    className="py-2 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    EXPORT DATA LOG (CSV)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Side: Order List */}
                  <div className="md:col-span-5 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {orders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selectedOrder?.id === order.id 
                            ? "bg-[#c5a059]/10 border-[#c5a059]/40" 
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-baseline">
                          <strong className="text-xs font-mono text-white">{order.id}</strong>
                          <span className={`text-[8px] uppercase tracking-widest font-bold py-0.5 px-2 rounded-full ${
                            order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
                            order.status === "Shipped" ? "bg-blue-500/10 text-blue-400" :
                            order.status === "Cancelled" ? "bg-red-500/10 text-red-450" :
                            "bg-amber-500/10 text-[#c5a059]"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-white/80 font-serif mt-1">{order.customerName}</p>
                        <p className="text-[10px] text-stone-500 font-mono mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                        <p className="text-xs gold-text font-mono mt-2 font-bold">₹{order.grandTotal.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Side: Order Detail Viewer */}
                  <div className="md:col-span-7 bg-[#050506]/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    {selectedOrder ? (
                      <div className="space-y-4 text-xs animate-fadeIn">
                        <div className="border-b border-white/5 pb-2">
                          <p className="text-[9px] text-[#c5a059] font-mono uppercase tracking-widest">Active Invoice Record</p>
                          <h4 className="text-sm font-serif text-white">{selectedOrder.id} ({selectedOrder.paymentMode} Checkout)</h4>
                        </div>

                        <div className="space-y-3 text-stone-300">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block mb-1">Customer Logistics</span>
                            <p className="text-white font-serif">{selectedOrder.customerName}</p>
                            <p className="font-mono text-xs">{selectedOrder.customerPhone}</p>
                            <p className="text-stone-400">{selectedOrder.customerEmail}</p>
                            <p className="text-stone-400 italic mt-1 bg-black/40 p-2 rounded border border-white/5">Address: {selectedOrder.shippingAddress}</p>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block mb-1">Enclosed Treasures</span>
                            <ul className="space-y-1">
                              {selectedOrder.items.map((it, idx) => (
                                <li key={idx} className="flex justify-between font-serif text-white">
                                  <span>{it.hamperName} <strong className="text-stone-500 font-sans">x{it.quantity}</strong></span>
                                  <span className="font-mono text-xs text-[#c5a059]">₹{(it.price * it.quantity).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t border-white/5 pt-2 flex justify-between font-mono font-bold text-white text-xs">
                            <span>Grand Total Payable</span>
                            <span className="gold-text">₹{selectedOrder.grandTotal.toLocaleString()}</span>
                          </div>

                          <div className="space-y-2 border-t border-white/5 pt-3">
                            <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block">Update Merchant Shipment Status</span>
                            
                            <div className="flex flex-wrap gap-1">
                              {(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                                  className={`py-1.5 px-3 rounded text-[10px] font-bold uppercase cursor-pointer ${
                                    selectedOrder.status === st 
                                      ? "gold-gradient text-black font-extrabold" 
                                      : "bg-white/5 text-stone-300 hover:bg-white/10"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block">Air Cargo tracking number (AWB)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="flex-1 p-2 bg-stone-950 border border-white/10 rounded font-mono text-xs text-white"
                                placeholder="AWB-7729831"
                                defaultValue={selectedOrder.trackingNumber || ""}
                                onBlur={(e) => handleUpdateOrderTracking(selectedOrder.id, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-stone-500">
                        <ShoppingBag className="w-8 h-8 text-[#c5a059]/40 mb-2 animate-pulse" />
                        <p className="text-xs">Select any incoming invoice coordinate from the index ledger on the left to edit shipping coordinates.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 9: PATRONS & CUSTOMERS DIRECTORY */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-white">9. Boutique Client & Patrons Database</h3>
                  <p className="text-stone-400 text-xs">Manage customer privileges, check loyalty credits, and review loyalty levels.</p>
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {customers.map(cust => (
                    <div 
                      key={cust.id} 
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        cust.isBlocked 
                          ? "bg-red-950/10 border-red-500/20 opacity-60" 
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center font-bold font-serif shadow-inner">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-serif">{cust.name} {cust.isBlocked && <span className="text-[8px] bg-red-600 text-white rounded px-1.5 font-sans whitespace-nowrap uppercase">Blocked</span>}</h4>
                          <p className="text-[10px] text-stone-400 mt-0.5">{cust.email} • {cust.phone}</p>
                          <p className="text-[9px] text-[#c5a059] font-mono mt-1">Enrolled since {new Date(cust.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] uppercase tracking-widest text-stone-500 block">Total Spent</span>
                          <span className="font-mono text-xs font-bold text-white">₹{cust.totalSpent.toLocaleString()}</span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest text-[#c5a059] block">Loyalty Points</label>
                          <input
                            type="number"
                            className="w-16 p-1 text-center bg-stone-900 border border-white/10 rounded font-mono text-xs text-white"
                            value={cust.loyaltyPoints}
                            onChange={(e) => handleUpdateCustomerPoints(cust.id, Number(e.target.value))}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleBlockCustomer(cust.id)}
                            className={`py-1.5 px-3.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              cust.isBlocked 
                                ? "bg-emerald-600 text-white" 
                                : "bg-red-950/40 text-red-200 border border-red-500/20 hover:bg-red-900"
                            }`}
                          >
                            {cust.isBlocked ? "Unblock Patron" : "Block Patron"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "auth" && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setMailjetSaveStatus("Saving server configuration...");
                try {
                  const res = await fetch("/api/admin/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mailjetApiKey,
                      mailjetApiSecret,
                      mailjetSenderEmail,
                      otpExpiryMinutes: Number(otpExpiryMinutes)
                    })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setMailjetSaveStatus("Credentials stored successfully on server!");
                    setTimeout(() => setMailjetSaveStatus(""), 3000);
                  } else {
                    setMailjetSaveStatus("Error saving: " + data.error);
                    setTimeout(() => setMailjetSaveStatus(""), 3000);
                  }
                } catch(err: any) {
                  setMailjetSaveStatus("Connection aborted: " + err.message);
                  setTimeout(() => setMailjetSaveStatus(""), 3000);
                }
              }} className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-serif text-white">10. Premium Member Registry & Mailjet SMTP Config</h3>
                  <p className="text-stone-400 text-xs mt-1">Configure API routes to verify customer identities during signups and log-ins.</p>
                </div>

                {mailjetSaveStatus && (
                  <div className="p-3 bg-white/5 border border-[#c5a059]/40 text-[#c5a059] font-mono text-xs rounded-xl flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#c5a059]" />
                    <span>{mailjetSaveStatus}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] text-xs leading-relaxed font-sans space-y-1.5">
                  <span className="font-bold block uppercase tracking-wide">Developer Sandbox Notice</span>
                  <p>If Mailjet credentials are omitted, the system defaults into <strong>Local Backdoor Mode</strong>: the generated OTP is instantly output in the console and feedback warnings in the login card. This ensures frictionless playability without requiring keys!</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">Mailjet Public API Key</label>
                      <input
                        type="text"
                        placeholder="e.g. 5b93d01fd..."
                        value={mailjetApiKey}
                        onChange={(e) => setMailjetApiKey(e.target.value)}
                        className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059] font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">Mailjet Private Secret Key</label>
                      <input
                        type="password"
                        placeholder="e.g. d7691ae2..."
                        value={mailjetApiSecret}
                        onChange={(e) => setMailjetApiSecret(e.target.value)}
                        className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">Sender Verified Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. hello@bloomandbox.com"
                        value={mailjetSenderEmail}
                        onChange={(e) => setMailjetSenderEmail(e.target.value)}
                        className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059] font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">OTP Expiration Limit (Minutes)</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={otpExpiryMinutes}
                        onChange={(e) => setOtpExpiryMinutes(Number(e.target.value))}
                        className="w-full text-xs p-3.5 bg-[#0d0d0e] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#c5a059] font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#c5a059] text-black font-semibold text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 shadow-lg shadow-yellow-950/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Auth Credentials ✓</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE SIMULATED PHONE (Col Span 5) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
          
          {/* Preview Toggle Bench */}
          <div className="flex items-center justify-between bg-[#080809] border border-white/5 p-2 rounded-2xl">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-widest pl-2">📱 Visual Customizer Peek</span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  previewMode === "mobile" 
                    ? "gold-gradient text-black font-extrabold shadow-md" 
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                📱 Mobile Screen
              </button>
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  previewMode === "desktop" 
                    ? "gold-gradient text-black font-extrabold shadow-md" 
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🖥️ Desktop View
              </button>
            </div>
          </div>

          {/* Device Mock Framing */}
          <div className="flex justify-center items-center">
            
            {previewMode === "mobile" ? (
              // MOBILE DEVICE MOCK
              <div className="relative w-[340px] h-[670px] rounded-[42px] border-[12px] border-stone-800 bg-[#0c0c0d] shadow-2xl flex flex-col overflow-hidden relative" style={{ borderColor: "#1A1A1C" }}>
                
                {/* Smartphone Speaker/Camera notch notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-stone-900 rounded-b-xl z-[9] flex items-center justify-center p-0.5" style={{ backgroundColor: "#1A1A1C" }}>
                  <div className="w-10 h-1 bg-stone-700 rounded-full mb-1" />
                </div>

                {/* Simulated Content Body */}
                <div className="flex-1 overflow-y-auto pt-8 pb-4 space-y-6" style={{ fontFamily: localTheme.fontFamily === 'Playfair' ? '"Playfair Display", serif' : localTheme.fontFamily === 'Mono' ? '"JetBrains Mono", monospace' : localTheme.fontFamily === 'Outfit' ? '"Outfit", sans-serif' : '"Inter", sans-serif' }}>
                  
                  {/* Dynamic sections render based on order */}
                  {sections
                    .filter(s => s.visible)
                    .map(sec => {
                      if (sec.id === "hero") {
                        return (
                          <div key={sec.id} className="relative p-5 border-b border-white/5 bg-gradient-to-b from-[#080809] to-[#0c0c0d] text-center space-y-3">
                            <span className="text-[8px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 rounded-full px-2 py-0.5 tracking-widest font-bold uppercase inline-block">Bespoke Gifting House</span>
                            <h4 className="text-xl font-serif text-white tracking-tight leading-snug">{localBanner.title}</h4>
                            <p className="text-[10px] text-stone-400 leading-relaxed max-w-xs mx-auto">{localBanner.subtitle}</p>
                            <button className={`w-full py-2.5 text-[9px] tracking-widest uppercase font-extrabold ${BUTTON_ROUNDEDNESS_MAP[localTheme.buttonRoundedness]} ${
                              localTheme.buttonStyle === 'gradient' ? 'gold-gradient text-black' :
                              localTheme.buttonStyle === 'solid-accent' ? 'bg-[#c5a059] text-black' :
                              localTheme.buttonStyle === 'gold-outline' ? 'border border-[#c5a059] text-[#c5a059]' :
                              'bg-stone-700 text-white'
                            }`}>
                              {localBanner.ctaText}
                            </button>
                            <div className="w-full h-24 rounded-lg overflow-hidden bg-stone-950 mt-2 relative">
                              <img src={localBanner.mobileImageUrl} alt="Hero illustration" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "categories") {
                        return (
                          <div key={sec.id} className="p-4 space-y-2 border-b border-white/5">
                            <span className="text-[8px] text-[#c5a059] font-bold tracking-widest uppercase">Quick Explorer</span>
                            <h5 className="text-xs font-serif text-white font-bold leading-none">Aesthetic Mood Presets</h5>
                            <div className="flex gap-1.5 overflow-x-auto py-1 whitespace-nowrap">
                              {["All", "Royal", "Organic", "Modern", "Festive", "Cozy"].map(c => (
                                <span key={c} className="p-1 px-3 bg-white/5 border border-white/10 text-[9px] rounded-full text-stone-300 inline-block font-mono">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "featured") {
                        return (
                          <div key={sec.id} className="p-4 space-y-3 border-b border-white/5">
                            <h5 className="text-xs text-white tracking-widest uppercase gold-text font-bold">Preview: Exquisite Gifts</h5>
                            
                            <div className="space-y-4">
                              {hampers.slice(0, 2).map(h => (
                                <div key={h.id} className="bg-[#050506]/80 p-3 rounded-xl border border-white/5 flex gap-2">
                                  <img src={h.image} className="w-10 h-10 rounded object-cover bg-stone-900" referrerPolicy="no-referrer" />
                                  <div className="flex-grow space-y-0.5">
                                    <h6 className="text-[10px] text-white font-serif tracking-tight leading-tight block">{h.name}</h6>
                                    <span className="text-[8px] text-[#c5a059] font-mono font-bold block">₹{h.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "corporate") {
                        return (
                          <div key={sec.id} className="p-4 bg-[#c5a059]/5 border-y border-[#c5a059]/15 text-center space-y-1.5">
                            <h5 className="text-[10px] font-serif text-white tracking-widest uppercase">Office & Event Grandees</h5>
                            <p className="text-[9px] text-stone-400 max-w-xs mx-auto leading-relaxed">Leverage custom velvet crates stamped with corporate signatures. Bulk orders processed seamlessly.</p>
                            <button className={`px-4 py-1.5 text-[8px] tracking-widest bg-white/10 border border-white/10 text-white font-bold uppercase transition-all ${BUTTON_ROUNDEDNESS_MAP[localTheme.buttonRoundedness]}`}>
                              Get Custom Proposal
                            </button>
                          </div>
                        );
                      }

                      if (sec.id === "testimonials") {
                        return (
                          <div key={sec.id} className="p-4 bg-[#080809]/40 rounded-xl space-y-2 border-b border-white/5">
                            <span className="text-[8px] text-[#c5a059] tracking-widest font-bold uppercase block text-center">Bespoke Patrons' Words</span>
                            <div className="text-[9px] italic text-stone-300 text-center leading-relaxed">
                              &ldquo;The Saffron Dynasty Trunk was an absolute showstopper for our wedding events.&rdquo;
                              <p className="text-[8px] text-[#c5a059] font-sans font-bold uppercase mt-2">— Malhotra Family Estates</p>
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "newsletter") {
                        return (
                          <div key={sec.id} className="p-4 bg-[#0c0c0d] rounded-xl text-center border-b border-white/5 space-y-2">
                            <p className="text-[10px] font-serif text-white">Join the Imperial Registry</p>
                            <input type="text" placeholder="Enter guest email coord..." className="w-full text-[9px] p-1.5 rounded bg-[#080809] border border-white/5 text-center text-white" disabled />
                            <button className="w-full py-1.5 bg-[#c5a059]/10 border border-[#c5a059]/25 text-[#c5a059] font-bold text-[8px] tracking-widest uppercase">REGISTER NOW</button>
                          </div>
                        );
                      }

                      if (sec.id === "instagram") {
                        return (
                          <div key={sec.id} className="p-4 border-b border-white/5 space-y-1.5">
                            <p className="text-[8px] text-[#c5a059] tracking-widest font-bold uppercase">Patron Circle @bloomandbox</p>
                            <div className="grid grid-cols-3 gap-1">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square rounded bg-[#171719] flex items-center justify-center text-xs text-stone-600">📸</div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (sec.id === "footer") {
                        return (
                          <div key={sec.id} className="p-4 bg-[#080809] text-center space-y-3 border-t border-white/5">
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="w-5 h-5 rounded gold-gradient text-black text-[10px] font-extrabold flex items-center justify-center">B</span>
                              <span className="text-[10px] text-white font-serif uppercase tracking-wider">{localContent.websiteLogoText}</span>
                            </div>
                            <p className="text-[8px] text-stone-500 leading-normal mb-1">{localContent.websiteTagline}</p>
                            <div className="text-[7.5px] text-stone-600 space-y-0.5 font-mono">
                              <p>{localContent.contactNumber}</p>
                              <p className="line-clamp-1">{localContent.businessAddress}</p>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}

                </div>

                {/* Simulated Sticky Assist widget overlay */}
                {localWhatsApp.enableChatWidget && (
                  <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 bg-[#128c7e] text-white p-1.5 px-3 rounded-full text-[8.5px] font-bold shadow-lg">
                    <span>💬</span>
                    <span>{localWhatsApp.floatingButtonText || "Let's Chat"}</span>
                  </div>
                )}
              </div>
            ) : (
              // DESKTOP PREVIEW FRAME
              <div className="w-full max-w-lg h-[450px] rounded-2xl border border-white/10 bg-[#0c0c0d] shadow-2xl overflow-y-auto p-6 space-y-8" style={{ fontFamily: localTheme.fontFamily === 'Playfair' ? '"Playfair Display", serif' : localTheme.fontFamily === 'Mono' ? '"JetBrains Mono", monospace' : localTheme.fontFamily === 'Outfit' ? '"Outfit", sans-serif' : '"Inter", sans-serif' }}>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 gold-gradient text-black font-extrabold flex items-center justify-center text-[10px] rounded">B</span>
                    <span className="text-xs text-white tracking-widest uppercase font-serif">{localContent.websiteLogoText}</span>
                  </div>
                  <nav className="flex items-center gap-2 text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                    <span className="text-white border-b border-[#c5a059] pb-0.5">Pre-curated</span>
                    <span>Customizer</span>
                  </nav>
                </div>

                {/* Section components container */}
                {sections
                  .filter(s => s.visible)
                  .map(sec => {
                    if (sec.id === "hero") {
                      return (
                        <div key={sec.id} className="grid grid-cols-12 gap-3 items-center border-b border-white/5 pb-6">
                          <div className="col-span-7 space-y-2">
                            <span className="text-[7px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/25 rounded px-2 tracking-widest font-bold uppercase inline-block">Bespoke Gifting House</span>
                            <h4 className="text-xl font-serif text-white tracking-tight leading-snug">{localBanner.title}</h4>
                            <p className="text-[9px] text-stone-400 leading-relaxed">{localBanner.subtitle}</p>
                            <button className={`py-1.5 px-4 text-[8px] tracking-widest uppercase font-extrabold ${BUTTON_ROUNDEDNESS_MAP[localTheme.buttonRoundedness]} ${
                              localTheme.buttonStyle === 'gradient' ? 'gold-gradient text-black' : 'bg-[#c5a059] text-black'
                            }`}>
                              {localBanner.ctaText}
                            </button>
                          </div>
                          <div className="col-span-5 h-28 rounded-lg overflow-hidden relative bg-stone-950">
                            <img src={localBanner.imageUrl} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      );
                    }

                    if (sec.id === "featured") {
                      return (
                        <div key={sec.id} className="space-y-3 border-b border-white/5 pb-6">
                          <span className="text-[7px] text-[#c5a059] tracking-widest font-bold uppercase">Dynamic Collections Suite</span>
                          <div className="grid grid-cols-2 gap-4">
                            {hampers.slice(0, 2).map(h => (
                              <div key={h.id} className="p-3 bg-[#080809]/40 border border-white/5 rounded-xl space-y-1">
                                <img src={h.image} className="w-full h-16 rounded object-cover" referrerPolicy="no-referrer" />
                                <h6 className="text-[9px] text-white font-serif tracking-tight line-clamp-1 block">{h.name}</h6>
                                <span className="text-[8px] text-[#c5a059] font-mono block">₹{h.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (sec.id === "corporate") {
                      return (
                        <div key={sec.id} className="p-4 bg-[#c5a059]/5 border border-[#c5a059]/15 text-center space-y-2 rounded-xl">
                          <h5 className="text-[10px] text-white tracking-widest uppercase font-serif">Bulk Corporate Proposals</h5>
                          <p className="text-[9px] text-stone-400 leading-relaxed">Request customizable wood-stamped storage chests suited for brand distributions across India.</p>
                        </div>
                      );
                    }

                    return null;
                  })}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
