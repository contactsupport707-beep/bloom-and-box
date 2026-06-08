/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Layers, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Image as ImageIcon, 
  Type, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  Phone, 
  CreditCard, 
  Palette, 
  Monitor, 
  Tablet, 
  Smartphone, 
  CornerUpLeft, 
  CornerUpRight, 
  Save, 
  Edit, 
  Upload, 
  Award, 
  Compass, 
  Star, 
  Quote, 
  CheckCircle, 
  ShoppingBag, 
  Tag, 
  MessageSquare,
  Sparkles,
  Search,
  UploadCloud,
  FileText,
  Copy,
  FolderOpen
} from "lucide-react";
import { 
  GlobalSettings, 
  Hamper, 
  HomepageSection, 
  BannerConfig, 
  ThemeConfig, 
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

// Presets images list for beautiful replacement library
const LUXURY_IMAGE_LIBRARY = [
  { url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600", label: "Dynasty Tea Trunk" },
  { url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600", label: "Matrimonial Vault" },
  { url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=600", label: "Anniversary Champagne Box" },
  { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600", label: "Chocolate Mocha Box" },
  { url: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=600", label: "Birthday Surprises" },
  { url: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600", label: "Corporate Luxury Gift" },
  { url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600", label: "Floral Curation Bouquet" },
  { url: "https://images.unsplash.com/photo-1581375074612-d1fd0e661aeb?auto=format&fit=crop&q=80&w=600", label: "Premium Baby Cradle" },
  { url: "https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=600", label: "Organic Spa Hampers" },
  { url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80&w=600", label: "Festive Sweet Platter" }
];

interface VisualEditorProps {
  onClose: () => void;
  settings: GlobalSettings;
  onSaveSettings: (settings: GlobalSettings) => void;
  hampers: Hamper[];
  onUpdateHampers: (items: Hamper[]) => void;
  sections: HomepageSection[];
  onUpdateSections: (sections: HomepageSection[]) => void;
  banner: BannerConfig;
  onUpdateBanner: (banner: BannerConfig) => void;
  theme: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  content: ContentConfig;
  onUpdateContent: (content: ContentConfig) => void;
  whatsApp: WhatsAppConfig;
  onUpdateWhatsApp: (whatsApp: WhatsAppConfig) => void;
  payment: PaymentConfig;
  onUpdatePayment: (payment: PaymentConfig) => void;
}

export function VisualEditor({
  onClose,
  settings,
  onSaveSettings,
  hampers,
  onUpdateHampers,
  sections,
  onUpdateSections,
  banner,
  onUpdateBanner,
  theme,
  onUpdateTheme,
  content,
  onUpdateContent,
  whatsApp,
  onUpdateWhatsApp,
  payment,
  onUpdatePayment
}: VisualEditorProps) {
  // Device Preview Mode
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Left panel active tab
  const [sidebarTab, setSidebarTab] = useState<"sections" | "theme" | "catalog" | "communications" | "payments">("sections");
  
  // Undo / Redo Stacks for history
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [history, setHistory] = useState<{
    sections: HomepageSection[];
    theme: ThemeConfig;
    banner: BannerConfig;
    content: ContentConfig;
    hampers: Hamper[];
    whatsApp: WhatsAppConfig;
    payment: PaymentConfig;
    settings: GlobalSettings;
  }[]>([]);

  // Local editing states mirroring the current active values
  const [localSections, setLocalSections] = useState<HomepageSection[]>([...sections]);
  const [localTheme, setLocalTheme] = useState<ThemeConfig>({ ...theme });
  const [localBanner, setLocalBanner] = useState<BannerConfig>({ ...banner });
  const [localContent, setLocalContent] = useState<ContentConfig>({ ...content });
  const [localHampers, setLocalHampers] = useState<Hamper[]>([...hampers]);
  const [localWhatsApp, setLocalWhatsApp] = useState<WhatsAppConfig>({ ...whatsApp });
  const [localPayment, setLocalPayment] = useState<PaymentConfig>({ ...payment });
  const [localSettings, setLocalSettings] = useState<GlobalSettings>({ ...settings });

  // Notifications
  const [notify, setNotify] = useState({ show: false, text: "", type: "success" as "success" | "error" });
  
  // Image Replacement popup modal states
  const [imageSelectorModal, setImageSelectorModal] = useState<{
    show: boolean;
    currentUrl: string;
    onUrlChange: (newUrl: string) => void;
    imageTitle: string;
    repositionX?: number; // Reposition metrics
    repositionY?: number;
    cropScale?: number;
  } | null>(null);

  // Reposition editing state
  const [cropSlider, setCropSlider] = useState(1);
  const [posXSlider, setPosXSlider] = useState(50);
  const [posYSlider, setPosYSlider] = useState(50);

  // Add/Edit hamper overlay popup
  const [editingHamper, setEditingHamper] = useState<Hamper | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Drag handles for native HTML5 Drag and Drop reordering of sections
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);
  const [draggingProductIndex, setDraggingProductIndex] = useState<number | null>(null);

  // Initialize history on mount
  useEffect(() => {
    const initialState = {
      sections: JSON.parse(JSON.stringify(sections)),
      theme: { ...theme },
      banner: { ...banner },
      content: { ...content },
      hampers: JSON.parse(JSON.stringify(hampers)),
      whatsApp: { ...whatsApp },
      payment: { ...payment },
      settings: { ...settings }
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  // Update root CSS style custom properties for visual feedback within editor frame dynamically
  useEffect(() => {
    const iframeRoot = document.getElementById("editor-preview-frame");
    if (!iframeRoot) return;
    
    iframeRoot.style.setProperty('--custom-primary-bg', localTheme.brandColorPrimary);
    iframeRoot.style.setProperty('--custom-accent-gold', localTheme.brandColorAccent);
    iframeRoot.style.setProperty('--custom-text-color', localTheme.textColor);
    
    let fontStr = '"Inter", sans-serif';
    if (localTheme.fontFamily === 'Playfair') fontStr = '"Playfair Display", serif';
    else if (localTheme.fontFamily === 'Mono') fontStr = '"JetBrains Mono", monospace';
    else if (localTheme.fontFamily === 'Outfit') fontStr = '"Outfit", sans-serif';
    
    iframeRoot.style.setProperty('--font-custom-family', fontStr);
  }, [localTheme]);

  // Push new state to undo/redo history
  const pushToHistory = (newState: {
    sections: HomepageSection[];
    theme: ThemeConfig;
    banner: BannerConfig;
    content: ContentConfig;
    hampers: Hamper[];
    whatsApp: WhatsAppConfig;
    payment: PaymentConfig;
    settings: GlobalSettings;
  }) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newState)));
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotify({ show: true, text, type });
    setTimeout(() => {
      setNotify(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    restoreHistoryState(prevIdx);
    showNotification("Action undone successfully", "success");
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    restoreHistoryState(nextIdx);
    showNotification("Action redone successfully", "success");
  };

  const restoreHistoryState = (idx: number) => {
    const state = history[idx];
    setHistoryIndex(idx);
    
    setLocalSections([...state.sections]);
    setLocalTheme({ ...state.theme });
    setLocalBanner({ ...state.banner });
    setLocalContent({ ...state.content });
    setLocalHampers([...state.hampers]);
    setLocalWhatsApp({ ...state.whatsApp });
    setLocalPayment({ ...state.payment });
    setLocalSettings({ ...state.settings });
  };

  const saveAndPublish = () => {
    // Commit everything back to global states / localStorage
    onUpdateSections(localSections);
    onUpdateTheme(localTheme);
    onUpdateBanner(localBanner);
    onUpdateContent(localContent);
    onUpdateHampers(localHampers);
    onUpdateWhatsApp(localWhatsApp);
    onUpdatePayment(localPayment);
    onSaveSettings(localSettings);

    showNotification("Website changes successfully compiled & published live! ✨", "success");
  };

  // Section drag and drop
  const handleSectionDragStart = (idx: number) => {
    setDraggingSectionIndex(idx);
  };

  const handleSectionDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingSectionIndex === null || draggingSectionIndex === idx) return;
    
    const reordered = [...localSections];
    const dragged = reordered[draggingSectionIndex];
    
    reordered.splice(draggingSectionIndex, 1);
    reordered.splice(idx, 0, dragged);
    
    // Recalculate ordering property
    const finalReordered = reordered.map((sec, i) => ({ ...sec, order: i + 1 }));
    setLocalSections(finalReordered);
    setDraggingSectionIndex(idx);
  };

  const handleSectionDragEnd = () => {
    setDraggingSectionIndex(null);
    pushToHistory({
      sections: localSections,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
  };

  const toggleSectionVis = (id: string) => {
    const updated = localSections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setLocalSections(updated);
    pushToHistory({
      sections: updated,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
  };

  const duplicateSection = (sec: HomepageSection) => {
    const randomId = `${sec.id}-copy-${Math.floor(100 + Math.random() * 900)}`;
    const newSec: HomepageSection = {
      id: randomId,
      name: `${sec.name} (Copy)`,
      visible: true,
      order: localSections.length + 1
    };
    const updated = [...localSections, newSec];
    setLocalSections(updated);
    pushToHistory({
      sections: updated,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
    showNotification(`Section duplicated as ${newSec.name}`);
  };

  const deleteSection = (id: string) => {
    if (localSections.length <= 1) {
      showNotification("You must have at least one active section!", "error");
      return;
    }
    const updated = localSections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    setLocalSections(updated);
    pushToHistory({
      sections: updated,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
    showNotification("Section deleted successfully");
  };

  const createNewSection = () => {
    const secId = `custom-block-${Math.floor(100+Math.random()*900)}`;
    const newSec: HomepageSection = {
      id: secId,
      name: `Custom Promotional Block #${localSections.length + 1}`,
      visible: true,
      order: localSections.length + 1
    };
    const updated = [...localSections, newSec];
    setLocalSections(updated);
    pushToHistory({
      sections: updated,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
    showNotification("Added new blank promotional layout block. Custom edit in page.");
  };

  // Inline editable text callback
  const handleTextChange = (field: string, text: string) => {
    let stateUpdateArgs: any = {};
    if (field === "logoText") {
      const nextContent = { ...localContent, websiteLogoText: text };
      setLocalContent(nextContent);
      stateUpdateArgs.content = nextContent;
    } else if (field === "logoTagline") {
      const nextContent = { ...localContent, websiteTagline: text };
      setLocalContent(nextContent);
      stateUpdateArgs.content = nextContent;
    } else if (field === "bannerTitle") {
      const nextBanner = { ...localBanner, title: text };
      setLocalBanner(nextBanner);
      stateUpdateArgs.banner = nextBanner;
    } else if (field === "bannerSubtitle") {
      const nextBanner = { ...localBanner, subtitle: text };
      setLocalBanner(nextBanner);
      stateUpdateArgs.banner = nextBanner;
    } else if (field === "bannerCtaText") {
      const nextBanner = { ...localBanner, ctaText: text };
      setLocalBanner(nextBanner);
      stateUpdateArgs.banner = nextBanner;
    } else if (field.startsWith("hamper-name-")) {
      const hId = field.replace("hamper-name-", "");
      const nextHampers = localHampers.map(h => h.id === hId ? { ...h, name: text } : h);
      setLocalHampers(nextHampers);
      stateUpdateArgs.hampers = nextHampers;
    } else if (field.startsWith("hamper-tag-")) {
      const hId = field.replace("hamper-tag-", "");
      const nextHampers = localHampers.map(h => h.id === hId ? { ...h, tagline: text } : h);
      setLocalHampers(nextHampers);
      stateUpdateArgs.hampers = nextHampers;
    } else if (field.startsWith("hamper-desc-")) {
      const hId = field.replace("hamper-desc-", "");
      const nextHampers = localHampers.map(h => h.id === hId ? { ...h, description: text } : h);
      setLocalHampers(nextHampers);
      stateUpdateArgs.hampers = nextHampers;
    } else if (field.startsWith("hamper-price-")) {
      const hId = field.replace("hamper-price-", "");
      const rawPrice = Number(text.replace(/[^0-9]/g, "")) || 0;
      const nextHampers = localHampers.map(h => h.id === hId ? { ...h, price: rawPrice } : h);
      setLocalHampers(nextHampers);
      stateUpdateArgs.hampers = nextHampers;
    } else if (field === "footerAddress") {
      const nextContent = { ...localContent, businessAddress: text };
      setLocalContent(nextContent);
      stateUpdateArgs.content = nextContent;
    } else if (field === "footerPrivacy") {
      const nextContent = { ...localContent, privacyPolicy: text };
      setLocalContent(nextContent);
      stateUpdateArgs.content = nextContent;
    } else if (field === "footerTerms") {
      const nextContent = { ...localContent, termsConditions: text };
      setLocalContent(nextContent);
      stateUpdateArgs.content = nextContent;
    }

    pushToHistory({
      sections: localSections,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings,
      ...stateUpdateArgs
    });
  };

  const handleImageReposition = () => {
    if (!imageSelectorModal) return;
    
    // Simulating cropping / positioning values
    showNotification("Image resized and repositioned perfectly!");
    setImageSelectorModal(null);
  };

  // Hamper catalog drag & drop reordering
  const handleHamperDragStart = (idx: number) => {
    setDraggingProductIndex(idx);
  };

  const handleHamperDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingProductIndex === null || draggingProductIndex === idx) return;

    const reordered = [...localHampers];
    const dragged = reordered[draggingProductIndex];

    reordered.splice(draggingProductIndex, 1);
    reordered.splice(idx, 0, dragged);

    setLocalHampers(reordered);
    setDraggingProductIndex(idx);
  };

  const handleHamperDragEnd = () => {
    setDraggingProductIndex(null);
    pushToHistory({
      sections: localSections,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: localHampers,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
  };

  // Add / Edit Hamper
  const saveHamperForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHamper) return;

    let updatedHampersList: Hamper[];
    const isNew = !localHampers.some(h => h.id === editingHamper.id);

    if (isNew) {
      updatedHampersList = [editingHamper, ...localHampers];
      showNotification(`Product "${editingHamper.name}" added to catalog.`);
    } else {
      updatedHampersList = localHampers.map(h => h.id === editingHamper.id ? editingHamper : h);
      showNotification(`Product "${editingHamper.name}" settings updated.`);
    }

    setLocalHampers(updatedHampersList);
    setEditingHamper(null);

    pushToHistory({
      sections: localSections,
      theme: localTheme,
      banner: localBanner,
      content: localContent,
      hampers: updatedHampersList,
      whatsApp: localWhatsApp,
      payment: localPayment,
      settings: localSettings
    });
  };

  // Delete product
  const deleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
      const updated = localHampers.filter(h => h.id !== id);
      setLocalHampers(updated);
      pushToHistory({
        sections: localSections,
        theme: localTheme,
        banner: localBanner,
        content: localContent,
        hampers: updated,
        whatsApp: localWhatsApp,
        payment: localPayment,
        settings: localSettings
      });
      showNotification(`Deleted ${name} successfully.`);
    }
  };

  // Category creations list helper
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const existing = new Set<string>();
    hampers.forEach(h => { if (h.category) existing.add(h.category); });
    PRESET_CATEGORIES.forEach(c => existing.add(c));
    return Array.from(existing);
  });
  const [newCatInput, setNewCatInput] = useState("");

  const handleAddCategoryStr = () => {
    const clean = newCatInput.trim();
    if (!clean) return;
    if (categoriesList.includes(clean)) {
      showNotification("This category model already exists!", "error");
      return;
    }
    setCategoriesList([...categoriesList, clean]);
    setNewCatInput("");
    showNotification("New category compiled into dropdown register.");
  };

  // Helpers for text classes based on custom fonts
  const getFontFamilyClass = (f: string) => {
    if (f === "Playfair") return "font-serif italic";
    if (f === "Mono") return "font-mono text-xs";
    if (f === "Outfit") return "font-sans font-bold tracking-tight outfit-font";
    return "font-sans";
  };

  // Dynamic filter lists for hampers
  const filteredCatalogForEdit = localHampers.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        h.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "All" || h.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0c0c0d] text-stone-200" id="visual-editor-container">
      
      {/* Editor top-status overlays */}
      {notify.show && (
        <div 
          className={`fixed top-4 right-4 z-[99] p-4 rounded-xl flex items-center gap-3 border shadow-2xl animate-slideUp ${
            notify.type === 'success' 
              ? "bg-[#0c140f] border-[#2e5a40]/30 text-emerald-300"
              : "bg-[#140c0c] border-[#5a2e2e]/30 text-rose-300"
          }`}
          id="editor-toast-message"
        >
          {notify.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-semibold">{notify.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR CONTROLS (380px) */}
      <aside className="w-[380px] bg-[#09090a] border-r border-white/5 flex flex-col justify-between h-full relative" id="editor-sidebar">
        
        {/* Top Header & exit */}
        <div className="p-4 border-b border-white/5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-[#c5a059] flex items-center justify-center font-serif text-black font-extrabold text-xs">
                B
              </div>
              <span className="font-serif font-black text-xs uppercase text-white tracking-widest leading-none">
                Boutique Live OS
              </span>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-1 px-2.5 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white hover:bg-white/10 text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center gap-1"
              id="exit-editor-btn"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Builder</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400">Live Website Builder</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className="p-1.5 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                id="undo-btn"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
                id="redo-btn"
              >
                <CornerUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Tabs */}
        <div className="grid grid-cols-5 border-b border-white/5 text-stone-400 text-[10px] leading-tight text-center bg-black/40" id="editor-sidebar-tabs">
          <button 
            onClick={() => setSidebarTab("sections")}
            className={`py-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${sidebarTab === 'sections' ? "text-[#c5a059] bg-[#c5a059]/5 border-b-2 border-[#c5a059]" : "hover:text-white hover:bg-white/5"}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sections</span>
          </button>
          <button 
            onClick={() => setSidebarTab("theme")}
            className={`py-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${sidebarTab === 'theme' ? "text-[#c5a059] bg-[#c5a059]/5 border-b-2 border-[#c5a059]" : "hover:text-white hover:bg-white/5"}`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
          <button 
            onClick={() => setSidebarTab("catalog")}
            className={`py-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${sidebarTab === 'catalog' ? "text-[#c5a059] bg-[#c5a059]/5 border-b-2 border-[#c5a059]" : "hover:text-white hover:bg-white/5"}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>
          <button 
            onClick={() => setSidebarTab("communications")}
            className={`py-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${sidebarTab === 'communications' ? "text-[#c5a059] bg-[#c5a059]/5 border-b-2 border-[#c5a059]" : "hover:text-white hover:bg-white/5"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button 
            onClick={() => setSidebarTab("payments")}
            className={`py-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${sidebarTab === 'payments' ? "text-[#c5a059] bg-[#c5a059]/5 border-b-2 border-[#c5a059]" : "hover:text-white hover:bg-white/5"}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>UPI Pay</span>
          </button>
        </div>

        {/* Sidebar Content Scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none" id="sidebar-scroller">
          
          {/* TAB 1: DRAG & DROP HOMEPAGE SECTIONS */}
          {sidebarTab === "sections" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-white uppercase tracking-wider text-xs">Arrangement Shelf</h3>
                <p className="text-[10px] text-stone-400 leading-normal">Drag and swap cards visually to reorder, and hide/toggle display on the preview frame.</p>
              </div>

              {/* DND sections list */}
              <div className="space-y-2">
                {localSections.map((sec, idx) => (
                  <div 
                    key={sec.id}
                    draggable
                    onDragStart={() => handleSectionDragStart(idx)}
                    onDragOver={(e) => handleSectionDragOver(e, idx)}
                    onDragEnd={handleSectionDragEnd}
                    className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing flex items-center justify-between transition-all select-none hover:translate-x-1 ${
                      sec.visible 
                        ? "bg-white/5 border-white/10 hover:border-[#c5a059]/30" 
                        : "bg-black/50 border-white/5 opacity-50 text-stone-500"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[9px] text-[#c5a059]">{idx + 1}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-serif font-bold text-white text-xs truncate uppercase tracking-wide">{sec.name}</span>
                        <span className="text-[9px] text-stone-500 font-mono">key: {sec.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleSectionVis(sec.id)}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${sec.visible ? "text-[#c5a059] bg-[#c5a059]/10 hover:bg-[#c5a059]/25" : "text-stone-500 bg-white/5 hover:text-white"}`}
                        title={sec.visible ? "Hide Section" : "Show Section"}
                      >
                        {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => duplicateSection(sec)}
                        className="p-1.5 rounded hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteSection(sec.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-stone-500 hover:text-red-400 cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={createNewSection}
                className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-lg text-[10px] uppercase font-bold text-stone-300 hover:text-white hover:bg-white/10 flex items-center justify-center gap-1.5 hover:border-[#c5a059]/30 transition-all"
                id="add-custom-section-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Promotion Block</span>
              </button>
            </div>
          )}

          {/* TAB 2: THEME CUSTOMIZER */}
          {sidebarTab === "theme" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-white uppercase tracking-wider text-xs">Aesthetic Settings</h3>
                <p className="text-[10px] text-stone-400 leading-normal">Customize global brand accents, font stacks, and custom buttons in real-time.</p>
              </div>

              {/* Color selectors */}
              <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block">Palette Controls</span>
                
                <div className="flex items-center justify-between">
                  <span>Primary Background:</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="color" 
                      value={localTheme.brandColorPrimary}
                      onChange={(e) => {
                        const updated = { ...localTheme, brandColorPrimary: e.target.value };
                        setLocalTheme(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: updated,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: localPayment,
                          settings: localSettings
                        });
                      }}
                      className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer bg-transparent overflow-hidden" 
                    />
                    <span className="font-mono text-[9px] uppercase font-bold">{localTheme.brandColorPrimary}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Crown Accents Gold:</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="color" 
                      value={localTheme.brandColorAccent}
                      onChange={(e) => {
                        const updated = { ...localTheme, brandColorAccent: e.target.value };
                        setLocalTheme(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: updated,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: localPayment,
                          settings: localSettings
                        });
                      }}
                      className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer bg-transparent overflow-hidden" 
                    />
                    <span className="font-mono text-[9px] uppercase font-bold text-[#c5a059]">{localTheme.brandColorAccent}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Typography Text:</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="color" 
                      value={localTheme.textColor}
                      onChange={(e) => {
                        const updated = { ...localTheme, textColor: e.target.value };
                        setLocalTheme(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: updated,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: localPayment,
                          settings: localSettings
                        });
                      }}
                      className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer bg-transparent overflow-hidden" 
                    />
                    <span className="font-mono text-[9px] uppercase font-bold">{localTheme.textColor}</span>
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold block">Font Stack Pairs</span>
                <select 
                  value={localTheme.fontFamily}
                  onChange={(e) => {
                    const updated = { ...localTheme, fontFamily: e.target.value as any };
                    setLocalTheme(updated);
                    pushToHistory({
                      sections: localSections,
                      theme: updated,
                      banner: localBanner,
                      content: localContent,
                      hampers: localHampers,
                      whatsApp: localWhatsApp,
                      payment: localPayment,
                      settings: localSettings
                    });
                  }}
                  className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 font-serif text-[11px] text-white"
                >
                  <option value="Playfair">Playfair Display (Editorial/Classic)</option>
                  <option value="Inter">Inter Sans (Modern/Swiss Minimal)</option>
                  <option value="Outfit">Outfit Bold (Avant-Garde Tech)</option>
                  <option value="Mono">JetBrains Mono (Post-Modern Heritage)</option>
                </select>
              </div>

              {/* Button Customizer */}
              <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block">Interactive Buttons</span>
                
                <div className="space-y-1">
                  <span>Button Roundedness:</span>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {(["none", "md", "xl", "full"] as const).map(shape => (
                      <button
                        key={shape}
                        onClick={() => {
                          const updated = { ...localTheme, buttonRoundedness: shape };
                          setLocalTheme(updated);
                          pushToHistory({
                            sections: localSections,
                            theme: updated,
                            banner: localBanner,
                            content: localContent,
                            hampers: localHampers,
                            whatsApp: localWhatsApp,
                            payment: localPayment,
                            settings: localSettings
                          });
                        }}
                        className={`py-1.5 text-[10px] uppercase font-semibold rounded cursor-pointer ${localTheme.buttonRoundedness === shape ? "bg-[#c5a059] text-black" : "bg-black/30 hover:bg-black/50 text-zinc-300"}`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span>Button Visual Style:</span>
                  <select
                    value={localTheme.buttonStyle}
                    onChange={(e) => {
                      const updated = { ...localTheme, buttonStyle: e.target.value as any };
                      setLocalTheme(updated);
                      pushToHistory({
                        sections: localSections,
                        theme: updated,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: localWhatsApp,
                        payment: localPayment,
                        settings: localSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-[11px] text-white"
                  >
                    <option value="gradient">Imperial Gold Gradient</option>
                    <option value="solid-accent">Solid Accent Gold</option>
                    <option value="gold-outline">Golden Delicate Outline</option>
                    <option value="minimalist">Minimalist Onyx Sanded</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RICH CATALOG MANAGEMENT (Drag Reordering + CRUD) */}
          {sidebarTab === "catalog" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-white uppercase tracking-wider text-xs">Catalog Manager</h3>
                  <p className="text-[10px] text-stone-400 leading-normal">Rearrange product grid, create items, adjust active discount levels.</p>
                </div>
                <button 
                  onClick={() => setEditingHamper({
                    id: `custom-hamper-${Math.floor(100+Math.random()*900)}`,
                    name: "Celestial Royal Hamper Box",
                    tagline: "Unopened paradise box of treats",
                    price: 2500,
                    description: "An exceptional luxury presentation containing premium select confections.",
                    items: ["Artisanal Chocolates", "Premium Tea infuser", "Fresh Peacock Flowers Decor"],
                    image: LUXURY_IMAGE_LIBRARY[6].url,
                    vibe: "Signature",
                    stockQuantity: 15,
                    isBestseller: false,
                    isFeatured: true,
                    category: "✨ Luxury Signature Collection"
                  })}
                  className="p-1 px-2 text-[9px] uppercase font-bold tracking-wider rounded bg-[#c5a059]/10 hover:bg-[#c5a059] text-[#c5a059] hover:text-black flex items-center gap-1 self-start transition-colors"
                  id="create-new-product-btn"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Product</span>
                </button>
              </div>

              {/* Custom category creator */}
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-lg space-y-2">
                <span className="text-[9px] text-[#c5a059] font-mono leading-none font-bold uppercase tracking-widest block">Register High-Tier Category</span>
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="e.g. 🎁 Birthday Cradles" 
                    value={newCatInput} 
                    onChange={e => setNewCatInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px]" 
                  />
                  <button 
                    onClick={handleAddCategoryStr}
                    className="p-1.5 rounded bg-white/10 hover:bg-[#c5a059] hover:text-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Local Products Shelf with filters */}
              <div className="space-y-2">
                <div className="flex gap-2.5 items-center">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-stone-500" />
                    <input 
                      type="text" 
                      placeholder="Search catalog products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-[10px] text-white"
                    />
                  </div>
                  
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#0b0b0c] border border-white/10 text-[9px] text-stone-300 rounded p-1"
                  >
                    <option value="All">All Categories</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat.substring(2)}</option>
                    ))}
                  </select>
                </div>

                {/* Rearrange products list drag-over */}
                <div className="space-y-1.5 pt-2 max-h-[300px] overflow-y-auto pr-1" id="catalog-products-list">
                  {filteredCatalogForEdit.map((item, idx) => (
                    <div 
                      key={item.id}
                      draggable
                      onDragStart={() => handleHamperDragStart(idx)}
                      onDragOver={(e) => handleHamperDragOver(e, idx)}
                      onDragEnd={handleHamperDragEnd}
                      className="p-2 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-1 cursor-grab hover:bg-white/5 select-none transition-all hover:border-[#c5a059]/20"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-8 h-8 rounded object-cover flex-shrink-0 bg-stone-900" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-serif font-bold text-white text-[10px] truncate">{item.name}</span>
                          <span className="font-mono text-[9px] text-[#c5a059]">₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
                        <button 
                          onClick={() => setEditingHamper(item)}
                          className="p-1 text-stone-400 hover:text-white hover:bg-white/5 rounded transition-all"
                          title="Edit Details"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(item.id, item.name)}
                          className="p-1 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                          title="Delete product"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP CONCIERGE SETTINGS */}
          {sidebarTab === "communications" && (
            <div className="space-y-4 font-sans text-xs">
              <div>
                <h3 className="font-serif text-white uppercase tracking-wider text-xs">WhatsApp Settings</h3>
                <p className="text-[10px] text-stone-400 leading-normal">Configure floating client buttons, automated chat widgets, and templates.</p>
              </div>

              {/* Form fields */}
              <div className="space-y-3.5 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">Manager Phone Key</label>
                  <input 
                    type="text" 
                    value={localWhatsApp.whatsappNumber}
                    onChange={(e) => {
                      const updated = { ...localWhatsApp, whatsappNumber: e.target.value };
                      setLocalWhatsApp(updated);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: updated,
                        payment: localPayment,
                        settings: localSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">Floating Chat Caption</label>
                  <input 
                    type="text" 
                    value={localWhatsApp.floatingButtonText}
                    onChange={(e) => {
                      const updated = { ...localWhatsApp, floatingButtonText: e.target.value };
                      setLocalWhatsApp(updated);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: updated,
                        payment: localPayment,
                        settings: localSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">Prefilled Custom Template</label>
                  <textarea 
                    rows={4}
                    value={localWhatsApp.messageTemplate}
                    onChange={(e) => {
                      const updated = { ...localWhatsApp, messageTemplate: e.target.value };
                      setLocalWhatsApp(updated);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: updated,
                        payment: localPayment,
                        settings: localSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-white font-serif leading-relaxed text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <label className="font-bold text-stone-300">Enable Floating Chat Widget:</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={localWhatsApp.enableChatWidget}
                      onChange={(e) => {
                        const updated = { ...localWhatsApp, enableChatWidget: e.target.checked };
                        setLocalWhatsApp(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: localTheme,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: updated,
                          payment: localPayment,
                          settings: localSettings
                        });
                      }}
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c5a059] peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UPI MERCHANDISE PAYMENTS */}
          {sidebarTab === "payments" && (
            <div className="space-y-4 text-xs font-sans">
              <div>
                <h3 className="font-serif text-white uppercase tracking-wider text-xs">UPI Payment Gateway</h3>
                <p className="text-[10px] text-stone-400 leading-normal">Administer verified merchant QR strings, account names, and checkout toggles.</p>
              </div>

              {/* Form parameters */}
              <div className="space-y-3.5 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block">Merchant UPI ID Address</label>
                  <input 
                    type="text" 
                    value={localPayment.upiId}
                    onChange={(e) => {
                      const updated = { ...localPayment, upiId: e.target.value };
                      
                      // Also sync upiQrText dynamically
                      const cleanUpiId = e.target.value.trim();
                      const sanitizedBusinessName = encodeURIComponent(localSettings.businessName);
                      const computedQrText = `upi://pay?pa=${cleanUpiId}&pn=${sanitizedBusinessName}&cu=INR`;
                      const nextSettings = { ...localSettings, upiId: cleanUpiId, upiQrText: computedQrText };
                      
                      setLocalPayment(updated);
                      setLocalSettings(nextSettings);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: localWhatsApp,
                        payment: updated,
                        settings: nextSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 font-mono text-white text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">Registered Beneficiary Name</label>
                  <input 
                    type="text" 
                    value={localPayment.accountName}
                    onChange={(e) => {
                      const updated = { ...localPayment, accountName: e.target.value };
                      setLocalPayment(updated);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: localWhatsApp,
                        payment: updated,
                        settings: localSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-white font-serif tracking-wide"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">UPI QR Custom QR String Code (System generated QR)</label>
                  <input 
                    type="text" 
                    value={localSettings.upiQrText}
                    onChange={(e) => {
                      const nextSettings = { ...localSettings, upiQrText: e.target.value };
                      setLocalSettings(nextSettings);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: localWhatsApp,
                        payment: localPayment,
                        settings: nextSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-[10px] text-zinc-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block">UPI QR Code Image Override (Upload or Paste URL)</label>
                  <div className="flex flex-col gap-1.5">
                    <input 
                      type="text" 
                      value={localPayment.upiQrImage || ""}
                      onChange={(e) => {
                        const updated = { ...localPayment, upiQrImage: e.target.value };
                        setLocalPayment(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: localTheme,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: updated,
                          settings: localSettings
                        });
                      }}
                      placeholder="Paste image URL address"
                      className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-[10px] text-zinc-300 font-mono"
                    />
                    <label className="cursor-pointer text-center py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase bg-white/5 border border-white/10 text-stone-300 hover:bg-[#c5a059]/15 hover:text-white transition-colors">
                      <span>Upload QR File</span>
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
                                const updated = { ...localPayment, upiQrImage: event.target!.result as string };
                                setLocalPayment(updated);
                                pushToHistory({
                                  sections: localSections,
                                  theme: localTheme,
                                  banner: localBanner,
                                  content: localContent,
                                  hampers: localHampers,
                                  whatsApp: localWhatsApp,
                                  payment: updated,
                                  settings: localSettings
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {localPayment.upiQrImage && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...localPayment, upiQrImage: "" };
                        setLocalPayment(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: localTheme,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: updated,
                          settings: localSettings
                        });
                      }}
                      className="text-[9px] text-red-400 hover:underline cursor-pointer block mt-1"
                    >
                      Reset to System QR
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">Payment Instructions</label>
                  <textarea 
                    rows={3}
                    value={localPayment.paymentInstructions || ""}
                    onChange={(e) => {
                      const updated = { ...localPayment, paymentInstructions: e.target.value };
                      setLocalPayment(updated);
                      pushToHistory({
                        sections: localSections,
                        theme: localTheme,
                        banner: localBanner,
                        content: localContent,
                        hampers: localHampers,
                        whatsApp: localWhatsApp,
                        payment: updated,
                        settings: localSettings
                      });
                    }}
                    className="w-full bg-[#0d0d0e] border border-white/10 rounded-lg p-2 text-zinc-300 text-[10px]"
                    placeholder="Instructions displayed to users..."
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <label className="font-bold text-stone-300 text-[10px]">Enable UPI Checkout:</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={localPayment.enableUpiPayments}
                      onChange={(e) => {
                        const updated = { ...localPayment, enableUpiPayments: e.target.checked };
                        setLocalPayment(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: localTheme,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: updated,
                          settings: localSettings
                        });
                      }}
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c5a059] peer-checked:after:bg-black peer-checked:after:border-transparent cursor-pointer"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <label className="font-bold text-stone-300 text-[10px]">Enable COD Checkout:</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!localPayment.enableCod}
                      onChange={(e) => {
                        const updated = { ...localPayment, enableCod: e.target.checked };
                        setLocalPayment(updated);
                        pushToHistory({
                          sections: localSections,
                          theme: localTheme,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: updated,
                          settings: localSettings
                        });
                      }}
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c5a059] peer-checked:after:bg-black peer-checked:after:border-transparent cursor-pointer"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Compile / Publish bottom panel */}
        <div className="p-4 border-t border-white/5 bg-[#050506]" id="editor-sidebar-actions">
          <button 
            onClick={saveAndPublish}
            className="w-full py-3.5 gold-gradient rounded-xl text-black font-serif font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#c5a059]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="publish-all-btn"
          >
            <Save className="w-4 h-4 text-black" />
            <span>Publish Website</span>
          </button>
        </div>

      </aside>

      {/* CENTER & RIGHT REAL-TIME PREVIEW WORKSPACE */}
      <main className="flex-1 bg-[#101012] flex flex-col justify-between h-full relative overflow-hidden" id="editor-preview-workspace">
        
        {/* Workspace status bar */}
        <header className="bg-[#09090a] border-b border-white/5 p-3 px-6 flex items-center justify-between z-10" id="preview-workspace-header">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] font-bold uppercase">EDITORIAL MODE (Real-Time Visual Playground)</span>
          </div>

          {/* Screen-size simulator buttons */}
          <div className="flex bg-black/45 rounded-lg border border-white/5 p-0.5" id="simulator-viewport-toggles">
            <button 
              onClick={() => setViewport("desktop")}
              className={`p-1.5 px-3 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewport === 'desktop' ? "bg-white/10 text-white font-extrabold" : "text-stone-500 hover:text-white"}`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button 
              onClick={() => setViewport("tablet")}
              className={`p-1.5 px-3 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewport === 'tablet' ? "bg-white/10 text-white font-extrabold" : "text-stone-500 hover:text-white"}`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button 
              onClick={() => setViewport("mobile")}
              className={`p-1.5 px-3 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewport === 'mobile' ? "bg-white/10 text-white font-extrabold" : "text-stone-500 hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
          </div>

          <div className="text-[10px] text-stone-500 leading-none">
            💡 <span className="text-[#c5a059] font-semibold">Tip:</span> Hover & click any text block directly on-stage to write! Click pictures to change.
          </div>
        </header>

        {/* Live Device Simulator Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent select-none relative" id="preview-frame-area">
          
          <div 
            id="editor-preview-frame"
            className={`transition-all duration-500 bg-[#0c0c0d] h-full shadow-2xl overflow-y-auto flex flex-col relative custom-preview-scroll ${
              viewport === 'desktop' 
                ? "w-full border-t border-b border-white/5" 
                : viewport === 'tablet'
                ? "w-[768px] max-h-[95%] border-8 border-stone-800 rounded-[2.2rem]"
                : "w-[390px] max-h-[92%] border-8 border-stone-800 rounded-[2.5rem]"
            }`}
          >
            
            {/* Header / Nav simulated block */}
            <div className="sticky top-0 z-30 bg-[#0a0a0b]/80 backdrop-blur-md p-4 px-6 sm:px-8 border-b border-white/5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#c5a059] text-black font-black flex items-center justify-center text-xs">
                  {localContent.websiteLogoText ? localContent.websiteLogoText.charAt(0) : "B"}
                </div>
                <div className="flex flex-col">
                  {/* Inline editable header */}
                  <span 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("logoText", e.target.innerText)}
                    className="font-serif font-black text-xs text-white uppercase tracking-widest outline-none hover:bg-white/10 p-0.5 rounded border border-transparent hover:border-[#c5a059]/40 cursor-text leading-none select-text"
                  >
                    {localContent.websiteLogoText}
                  </span>
                  
                  <span 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("logoTagline", e.target.innerText)}
                    className="text-[8px] tracking-wide text-stone-500 select-text outline-none focus:bg-white/10"
                  >
                    {localContent.websiteTagline}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">
                <span>Discover</span>
                <span>My Orders</span>
                <div className="flex items-center gap-1 text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <ShoppingBag className="w-3 h-3 text-[#c5a059]" />
                  <span>Bag (0)</span>
                </div>
              </div>
            </div>

            {/* Simulated Dynamic Homepage Sections list */}
            <div className="space-y-16 pb-24" style={{ fontFamily: "var(--font-custom-family)" }}>
              {localSections.filter(s => s.visible).map((sec) => {
                
                // 1. HERO BANNER PREVIEW BLOCK
                if (sec.id === "hero") {
                  return (
                    <section key={sec.id} className="p-6 sm:p-12 border-b border-white/5 bg-[#0a0a0b]/40 relative group/sec overflow-hidden">
                      {/* Reposition action overlay for visual imagery */}
                      <div className="absolute inset-x-0 bottom-3 z-10 flex lg:hidden justify-center group-hover/sec:flex animate-fadeIn">
                        <button className="text-[10px] bg-black/80 text-[#c5a059] font-mono border border-[#c5a059]/30 rounded-full px-4 py-1 flex items-center gap-1 hover:bg-[#c5a059] hover:text-black shadow-xl">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Reposition & Crop Overlay Background</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="md:col-span-7 space-y-4">
                          <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-mono block">Premium Curation Suite</span>
                          
                          {/* Inline title */}
                          <h1 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextChange("bannerTitle", e.target.innerText)}
                            className="text-2xl sm:text-4xl text-white outline-none hover:bg-white/5 border border-transparent hover:border-[#c5a059]/40 rounded p-1 cursor-text select-text"
                            style={{ fontFamily: localTheme.fontFamily === 'Playfair' ? 'Playfair Display' : 'inherit' }}
                          >
                            {localBanner.title}
                          </h1>

                          {/* Inline subtitle */}
                          <p 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextChange("bannerSubtitle", e.target.innerText)}
                            className="text-[11px] leading-relaxed text-stone-400 select-text outline-none max-w-lg hover:bg-white/5 rounded p-1 border border-transparent hover:border-[#c5a059]/40 cursor-text"
                          >
                            {localBanner.subtitle}
                          </p>

                          <div className="pt-2">
                            {/* Inline button */}
                            <button
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleTextChange("bannerCtaText", e.target.innerText)}
                              className={`px-6 py-3 font-mono text-[9px] tracking-widest uppercase font-bold text-center inline-block cursor-text border border-transparent outline-none focus:bg-stone-800 ${
                                localTheme.buttonStyle === 'gradient' ? 'gold-gradient text-black font-extrabold' :
                                localTheme.buttonStyle === 'solid-accent' ? 'bg-[#c5a059] text-black font-bold' :
                                localTheme.buttonStyle === 'gold-outline' ? 'border border-[#c5a059] text-[#c5a059]' :
                                'bg-stone-800 text-white'
                              } ${
                                localTheme.buttonRoundedness === 'none' ? 'rounded-none' :
                                localTheme.buttonRoundedness === 'md' ? 'rounded-md' :
                                localTheme.buttonRoundedness === 'xl' ? 'rounded-xl' : 'rounded-full'
                              }`}
                            >
                              {localBanner.ctaText}
                            </button>
                          </div>
                        </div>

                        {/* Replaceable image container */}
                        <div className="md:col-span-5 flex justify-center">
                          <div 
                            onClick={() => setImageSelectorModal({
                              show: true,
                              currentUrl: localBanner.imageUrl,
                              onUrlChange: (url) => setLocalBanner(prev => ({ ...prev, imageUrl: url, mobileImageUrl: url })),
                              imageTitle: "Hero Luxury Poster Photo"
                            })}
                            className="w-full max-w-[280px] h-[240px] rounded-xl overflow-hidden bg-stone-900 border border-white/5 relative group cursor-pointer shadow-lg"
                          >
                            <img 
                              src={localBanner.imageUrl} 
                              alt="Hero banner" 
                              className="w-full h-full object-cover opacity-80"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4">
                              <ImageIcon className="w-7 h-7 text-[#c5a059] mb-1 animate-pulse" />
                              <span className="text-[10px] text-white uppercase font-bold tracking-wider font-mono">📷 Swipe Picture</span>
                              <span className="text-[8px] text-stone-400 mt-1">Manage & Crop asset instantly</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                // 2. CATEGORIES PREVIEW BLOCK
                if (sec.id === "categories") {
                  return (
                    <section key={sec.id} className="px-6 sm:px-8 space-y-6">
                      <div className="text-center max-w-sm mx-auto">
                        <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-mono font-bold block mb-1">Occasions register</span>
                        <h2 className="text-lg font-serif text-white tracking-tight leading-none uppercase">SHOP BY COLLECTION</h2>
                        <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {categoriesList.slice(0, 5).map((cat, idx) => {
                          const icon = cat.substring(0, 2);
                          const title = cat.substring(2);
                          return (
                            <div key={idx} className="bg-white/5 p-4 rounded-xl text-center border border-white/5 cursor-pointer relative group">
                              <span className="text-2xl pt-1 block">{icon}</span>
                              <span className="text-[10px] text-stone-200 block pt-2 truncate leading-snug font-serif font-bold uppercase">{title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                }

                // 3. FEATURED PRODUCTS PREVIEW BLOCK
                if (sec.id === "featured") {
                  return (
                    <section key={sec.id} className="px-6 sm:px-8 space-y-6">
                      <div className="text-center max-w-sm mx-auto">
                        <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-mono block">Signature showcases</span>
                        <h2 className="text-lg font-serif text-white uppercase font-bold leading-normal">ROYAL MILDEW HAMPERS</h2>
                        <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {localHampers.filter(h => h.isFeatured).slice(0, 3).map((item) => (
                          <div key={item.id} className="bg-stone-900/40 p-4 border border-white/5 rounded-2xl flex flex-col justify-between group">
                            
                            {/* Product Replace image */}
                            <div 
                              onClick={() => setImageSelectorModal({
                                show: true,
                                currentUrl: item.image,
                                onUrlChange: (url) => setLocalHampers(prev => prev.map(h => h.id === item.id ? { ...h, image: url } : h)),
                                imageTitle: `Image asset for "${item.name}"`
                              })}
                              className="w-full h-36 rounded-xl overflow-hidden bg-stone-900/90 relative group cursor-pointer mb-3 border border-white/5"
                            >
                              <img 
                                src={item.image} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-2 text-center text-[10px] font-mono uppercase font-bold">
                                <ImageIcon className="w-5 h-5 text-[#c5a059] mb-1" />
                                <span>Modify image</span>
                              </div>
                            </div>

                            {/* Texts elements */}
                            <div className="space-y-2">
                              <h3 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange(`hamper-name-${item.id}`, e.target.innerText)}
                                className="font-serif font-black text-xs text-white leading-tight outline-none hover:bg-white/10 rounded p-0.5 select-text"
                              >
                                {item.name}
                              </h3>

                              <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange(`hamper-tag-${item.id}`, e.target.innerText)}
                                className="text-[8px] gold-text font-mono uppercase tracking-widest outline-none hover:bg-white/10 rounded p-0.5 select-text"
                              >
                                {item.tagline}
                              </p>

                              <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange(`hamper-desc-${item.id}`, e.target.innerText)}
                                className="text-[10px] text-stone-400 font-sans tracking-wide leading-relaxed line-clamp-2 outline-none hover:bg-white/10 rounded p-0.5 select-text"
                              >
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                              <div className="flex items-baseline gap-1 font-mono">
                                <span 
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleTextChange(`hamper-price-${item.id}`, e.target.innerText)}
                                  className="text-xs font-bold text-white select-text cursor-text border border-transparent hover:border-[#c5a059] hover:bg-white/10 rounded px-1"
                                >
                                  ₹{item.price.toLocaleString()}
                                </span>
                              </div>
                              
                              <button 
                                className={`p-1 px-3 bg-white/5 text-[9px] uppercase tracking-wider rounded font-bold border border-white/10 disabled:opacity-50`}
                                disabled
                              >
                                Bag it
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                // 4. CORPORATE GIFTING BLOCK
                if (sec.id === "corporate") {
                  return (
                    <section key={sec.id} className="p-6 sm:p-12 border-t border-b border-white/5 bg-zinc-950/30">
                      <div className="max-w-2xl mx-auto text-center space-y-4">
                        <span className="text-[9px] text-[#c5a059] uppercase tracking-widest font-mono block">Premium milestone hospitality</span>
                        
                        <h2 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleTextChange("bannerTitle", e.target.innerText)} // or proxy
                          className="text-xl sm:text-2xl font-serif text-white tracking-wider font-light uppercase text-center"
                        >
                          CORPORATE GIFT TRUNKS SUITE
                        </h2>
                        
                        <p className="text-[11px] text-stone-400 leading-relaxed font-sans max-w-md mx-auto">
                          Choose fully premium, personalized hampers for business partners, curated according to the business theme.
                        </p>

                        <button className="p-2 px-6 rounded-lg text-[9px] font-mono font-bold tracking-widest border border-[#c5a059] text-[#c5a059] pointer-events-none uppercase">
                          Reach Concierge Desk
                        </button>
                      </div>
                    </section>
                  );
                }

                // 5. TESTIMONIAL PREVIEW
                if (sec.id === "testimonials") {
                  return (
                    <section key={sec.id} className="px-6 sm:px-8 space-y-6">
                      <div className="text-center max-w-sm mx-auto">
                        <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-mono block font-bold">Patrons accounts</span>
                        <h2 className="text-lg font-serif text-white uppercase leading-none">TESTIMONIAL DIARIES</h2>
                        <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2" />
                      </div>

                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 max-w-md mx-auto relative text-center space-y-3">
                        <Quote className="w-5 h-5 mx-auto text-[#c5a059]/40" />
                        <p className="text-[11px] font-serif text-stone-300 italic">
                          "Absolutely spectacular presentation and elite service. The gold-etched boxes with customized Saffron logs left our clients totally speechless."
                        </p>
                        <span className="text-[10px] text-white block font-sans tracking-wide">Meera Sengupta — Delhi, India</span>
                      </div>
                    </section>
                  );
                }

                // CUSTOM PROM BLOCKS / FALLBACKS
                return (
                  <section key={sec.id} className="p-6 bg-white/5 border border-dashed border-white/10 rounded-xl max-w-sm mx-auto text-center">
                    <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold tracking-widest">{sec.name}</span>
                    <p className="text-[9px] text-stone-500 font-sans mt-1">This section ({sec.id}) is live! Drag items in the sidebar grid to sort or hide.</p>
                  </section>
                );

              })}
            </div>

            {/* Simulated footer */}
            <div className="bg-[#060607] border-t border-white/5 p-6 space-y-4 font-sans text-[10px]">
              <div className="flex justify-between items-baseline flex-wrap gap-2 text-stone-500">
                <span>© 2026 {localContent.websiteLogoText || "Bloom & Box"}. All premium legal rights reserved.</span>
                <span className="gold-text font-serif italic text-[11px]">"{localContent.websiteTagline}"</span>
              </div>
              
              <div className="pt-2 border-t border-white/5 text-stone-500 text-[9px] leading-relaxed">
                <span className="font-bold text-stone-400">Custom Business Address:</span>
                <p 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange("footerAddress", e.target.innerText)}
                  className="outline-none focus:bg-white/10 select-text font-mono inline p-1 hover:bg-white/5 rounded border border-transparent hover:border-[#c5a059]"
                >
                  {localContent.businessAddress}
                </p>
              </div>

              <div className="text-stone-600 text-[8px] space-y-1">
                <p 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange("footerPrivacy", e.target.innerText)}
                  className="outline-none select-text focus:bg-white/10 bg-transparent block"
                >
                  {localContent.privacyPolicy}
                </p>
                <p 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange("footerTerms", e.target.innerText)}
                  className="outline-none select-text focus:bg-white/10 bg-transparent block"
                >
                  {localContent.termsConditions}
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* MODAL overlay: IMAGE ASSET SELECTOR & CROPPING / REPOSITIONER */}
      {imageSelectorModal && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" id="image-selector-modal">
          <div className="bg-[#0f0f10] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-white text-sm uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <ImageIcon className="w-4 h-4 text-[#c5a059]" />
                <span>Replace {imageSelectorModal.imageTitle}</span>
              </h3>
              <button 
                onClick={() => setImageSelectorModal(null)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reposition, Cropping & scaling visual options */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Reposition controls */}
                <div className="space-y-2.5 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-[#c5a059] font-mono uppercase tracking-widest font-bold block">Reposition and Crop Controls</span>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Crop Zoom Scale</span>
                      <span>{cropSlider}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      step="0.1" 
                      value={cropSlider} 
                      onChange={e => setCropSlider(Number(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Horizontal Shift</span>
                      <span>{posXSlider}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={posXSlider} 
                      onChange={e => setPosXSlider(Number(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Vertical Shift</span>
                      <span>{posYSlider}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={posYSlider} 
                      onChange={e => setPosYSlider(Number(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>
                </div>

                {/* Simulated preview display */}
                <div className="flex flex-col justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono font-bold block">Reposition Preview</span>
                  <div className="w-full h-24 rounded-lg bg-stone-900 overflow-hidden relative border border-white/5">
                    <img 
                      src={imageSelectorModal.currentUrl} 
                      alt="" 
                      className="absolute max-w-none origin-center"
                      style={{
                        width: `${100 * cropSlider}%`,
                        height: `${100 * cropSlider}%`,
                        left: `${posXSlider - 50}%`,
                        top: `${posYSlider - 50}%`,
                        objectFit: "cover"
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button 
                    onClick={handleImageReposition}
                    className="w-full py-1.5 transition-colors bg-[#c5a059]/10 hover:bg-[#c5a059] hover:text-black text-[#c5a059] rounded-lg text-[9px] uppercase font-mono font-bold tracking-widest block"
                  >
                    Reposition Photo
                  </button>
                </div>

              </div>

              {/* URL String editor */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Paste Image Web URL Address</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/your-custom-peacock-flower" 
                    value={imageSelectorModal.currentUrl}
                    onChange={(e) => {
                      imageSelectorModal.onUrlChange(e.target.value);
                      setImageSelectorModal(prev => prev ? { ...prev, currentUrl: e.target.value } : null);
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white" 
                  />
                  <button 
                    onClick={() => {
                      showNotification("Image asset applied instantly.");
                      setImageSelectorModal(null);
                    }}
                    className="p-2.5 px-4 rounded-lg bg-[#c5a059] text-black text-xs font-serif font-black uppercase tracking-wider transition-all"
                  >
                    Apply url
                  </button>
                </div>
              </div>

              {/* Elegant default library preset selector */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] font-mono block">Choose beautiful Unsplash presets:</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="imagery-presets-grid">
                  {LUXURY_IMAGE_LIBRARY.map((asset, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        imageSelectorModal.onUrlChange(asset.url);
                        setImageSelectorModal(null);
                        showNotification(`Image replaced with curated preset: "${asset.label}"`);
                        
                        pushToHistory({
                          sections: localSections,
                          theme: localTheme,
                          banner: localBanner,
                          content: localContent,
                          hampers: localHampers,
                          whatsApp: localWhatsApp,
                          payment: localPayment,
                          settings: localSettings
                        });
                      }}
                      className="border border-white/5 hover:border-[#c5a059] hover:scale-105 rounded-lg overflow-hidden h-14 bg-stone-900 cursor-pointer relative group/p text-center flex flex-col justify-end transition-all"
                    >
                      <img 
                        src={asset.url} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover group-hover/p:opacity-50" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="z-10 bg-black/70 text-[7px] text-stone-200 block truncate p-0.5 font-bold uppercase leading-tight">{asset.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL overlay: RICH PRODUCT CREATE/EDIT DIAL */}
      {editingHamper && (
        <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" id="product-crud-modal">
          <form 
            onSubmit={saveHamperForm}
            className="bg-[#0f0f10] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden p-6 sm:p-8 space-y-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-serif text-white text-base font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#c5a059]" />
                <span>Configure Premium Hamper</span>
              </h3>
              <button 
                type="button"
                onClick={() => setEditingHamper(null)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans max-h-[350px] overflow-y-auto pr-1">
              
              <div className="space-y-1">
                <label className="text-stone-400">Full Product Name (Required)</label>
                <input 
                  type="text" 
                  required
                  value={editingHamper.name}
                  onChange={e => setEditingHamper({ ...editingHamper, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs font-serif font-bold font-serif" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Marketing Tagline (Optional)</label>
                <input 
                  type="text" 
                  value={editingHamper.tagline}
                  onChange={e => setEditingHamper({ ...editingHamper, tagline: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Regular Base Price (₹)</label>
                <input 
                  type="number" 
                  required
                  value={editingHamper.price}
                  onChange={e => setEditingHamper({ ...editingHamper, price: Number(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Discounted / Sale Price (₹ Optional)</label>
                <input 
                  type="number" 
                  value={editingHamper.discountPrice || ""}
                  onChange={e => setEditingHamper({ ...editingHamper, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Store Category Classification</label>
                <select 
                  value={editingHamper.category || ""}
                  onChange={e => setEditingHamper({ ...editingHamper, category: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-stone-300"
                >
                  <option value="">No classification status</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Available Stock Inventory Units</label>
                <input 
                  type="number" 
                  value={editingHamper.stockQuantity}
                  onChange={e => setEditingHamper({ ...editingHamper, stockQuantity: Number(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Motif Vibe Category Selector</label>
                <select 
                  value={editingHamper.vibe}
                  onChange={e => setEditingHamper({ ...editingHamper, vibe: e.target.value as any })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-stone-300"
                >
                  <option value="Royal">👑 Royal Heritage theme</option>
                  <option value="Modern">✨ Modern Tech minimal</option>
                  <option value="Festive">🌟 Festive Celebrations</option>
                  <option value="Cozy">🌸 Warm & Cozy Vibes</option>
                  <option value="Chocolate">🍫 Confectioneries Chocolate</option>
                  <option value="Flower">🌹 Beautiful Flower Decor Combos</option>
                  <option value="Signature">✨ Signature Curations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Replacer Image Link Address</label>
                <input 
                  type="text" 
                  value={editingHamper.image}
                  onChange={e => setEditingHamper({ ...editingHamper, image: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-[10px] font-mono" 
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-stone-400">Product Editorial Details (Description)</label>
                <textarea 
                  rows={3}
                  value={editingHamper.description}
                  onChange={e => setEditingHamper({ ...editingHamper, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-[11px]" 
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-2 pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingHamper.isBestseller}
                    onChange={e => setEditingHamper({ ...editingHamper, isBestseller: e.target.checked })}
                    className="accent-[#c5a059] h-4 w-4"
                  />
                  <span>Nominate as Best-Selling Highlight Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingHamper.isFeatured}
                    onChange={e => setEditingHamper({ ...editingHamper, isFeatured: e.target.checked })}
                    className="accent-[#c5a059] h-4 w-4"
                  />
                  <span>Promote in Featured Grid Carousel</span>
                </label>
              </div>

            </div>

            {/* Grid preview options */}
            <div className="border-t border-white/5 pt-4 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setEditingHamper(null)}
                className="px-5 py-2.5 rounded-xl border border-white/5 text-stone-400 text-xs font-serif hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-black text-xs font-serif font-black uppercase tracking-widest hover:scale-102 transition-all cursor-pointer"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
