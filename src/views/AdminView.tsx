import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Sliders, 
  Ticket, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Truck, 
  ExternalLink,
  ShieldCheck,
  Save,
  AlertTriangle,
  RotateCcw,
  Users,
  Image as ImageIcon,
  Globe,
  SlidersHorizontal,
  Layers,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  Product, 
  Collection, 
  Order, 
  BrandSettings, 
  HeroSlide, 
  DiscountCoupon, 
  Review, 
  Currency,
  Silhouette,
  UserAccount,
  HomepageSectionVisibility 
} from '../types';
import { storeService } from '../services/storeService';

interface AdminViewProps {
  products: Product[];
  collections: Collection[];
  orders: Order[];
  brandSettings: BrandSettings;
  heroSlides: HeroSlide[];
  coupons: DiscountCoupon[];
  currency: Currency;
  currentUser: UserAccount | null;
  onRefreshData: () => void;
  onNavigateToStorefront: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  collections,
  orders,
  brandSettings,
  heroSlides,
  coupons,
  currency,
  currentUser,
  onRefreshData,
  onNavigateToStorefront,
}) => {
  // Authorization Check - Privilege Escalation Resistant
  const isAuthorized = useMemo(() => {
    if (!currentUser) return false;
    const email = currentUser.email?.toLowerCase().trim() || '';
    const isAuthorizedEmail = email === 'ksarwar78@gmail.com' || email.endsWith('@maisonelan.com');
    return isAuthorizedEmail && currentUser.role === 'admin';
  }, [currentUser]);

  // Main Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'collections' | 'orders' | 'customers' | 'coupons' | 'reviews' | 'homepage' | 'settings'
  >('overview');

  // Firebase Sync State
  const [syncingFirebase, setSyncingFirebase] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // PRODUCT CRUD & MODAL STATE
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSilhouetteFilter, setProductSilhouetteFilter] = useState('all');
  const [productCollectionFilter, setProductCollectionFilter] = useState('all');
  const [productPublishFilter, setProductPublishFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 8;
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // COLLECTION MODAL STATE
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isNewCollection, setIsNewCollection] = useState(false);
  const [deleteConfirmCollection, setDeleteConfirmCollection] = useState<Collection | null>(null);

  // ORDER MODAL & FILTER STATE
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusNote, setOrderStatusNote] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('TCS Express White Glove');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [orderCancelModalOpen, setOrderCancelModalOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // CUSTOMER STATE
  const [maskCustomerPii, setMaskCustomerPii] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');

  // HERO SLIDE MODAL STATE
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);

  // CMS & BRAND SETTINGS STATE
  const [cmsSettings, setCmsSettings] = useState<BrandSettings>(brandSettings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // COUPON FORM STATE
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed_pkr'>('percent');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(50000);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // REVIEWS
  const reviews = storeService.getReviews();

  // REAL DATABASE METRICS
  const totalRevenuePKR = useMemo(() => {
    return orders
      .filter(o => o.paymentStatus === 'verified' || o.fulfillmentStatus === 'delivered' || o.paymentMethod === 'cod')
      .reduce((sum, o) => sum + o.totalPKR, 0);
  }, [orders]);

  const activeOrdersCount = orders.filter(o => o.fulfillmentStatus !== 'delivered' && o.fulfillmentStatus !== 'cancelled').length;
  const lowStockProducts = products.filter(p => p.totalInventory <= 8);
  const customerRecords = useMemo(() => storeService.getCustomerRecords(), [orders]);

  // SYNC HANDLER
  const handleSyncFirebase = async () => {
    setSyncingFirebase(true);
    setSyncMessage(null);
    try {
      const res = await storeService.syncWithFirestore();
      setSyncMessage(res.message);
      onRefreshData();
    } catch (err) {
      setSyncMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSyncingFirebase(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  // PRODUCT ACTIONS
  const handleOpenNewProduct = () => {
    const blankProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: `piece-${Date.now().toString().slice(-4)}`,
      name: 'New Atelier Silhouette',
      frenchSubtitle: 'Création de Haute Maroquinerie',
      silhouette: 'top-handle',
      pricePKR: 85000,
      collectionId: collections[0]?.slug || 'automne-eternel',
      isNewArrival: true,
      isBestseller: false,
      isFeatured: true,
      isPublished: true,
      description: 'Crafted from full-grain Tuscan calfskin with hand-brushed satin hardware.',
      editorialQuote: 'A masterwork in classical symmetry.',
      materials: {
        leatherType: 'Tuscan Full-Grain Boxcalf',
        hardware: 'Solid brass with satin champagne gold finish',
        lining: 'Beige lambskin & microfiber',
        origin: 'Lahore & Paris Atelier',
      },
      dimensions: {
        widthCm: 26,
        heightCm: 18,
        depthCm: 9,
        strapDropCm: 48,
      },
      careInstructions: [
        'Store in dry temperate space inside dust bag',
        'Clean with soft dry microfiber cloth',
      ],
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
      ],
      variants: [
        {
          id: `var-${Date.now()}-1`,
          colorName: 'Bordeaux Profond',
          colorHex: '#632F39',
          sku: `ME-NEW-01`,
          stock: 6,
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
        },
      ],
      inStock: true,
      totalInventory: 6,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tags: ['New Edition', 'Handcrafted'],
    };
    setEditingProduct(blankProduct);
    setIsNewProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      storeService.saveProduct(editingProduct);
      setEditingProduct(null);
      setIsNewProduct(false);
      onRefreshData();
    }
  };

  const handleTogglePublish = (p: Product) => {
    const updated = { ...p, isPublished: p.isPublished === false ? true : false };
    storeService.saveProduct(updated);
    onRefreshData();
  };

  const handleDuplicateProduct = (id: string) => {
    storeService.duplicateProduct(id);
    onRefreshData();
  };

  const handleConfirmDeleteProduct = () => {
    if (deleteConfirmProduct) {
      storeService.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      onRefreshData();
    }
  };

  // IMAGE UPLOADER SIMULATOR
  const handleAddProductImage = () => {
    if (!newImageUrl.trim() || !editingProduct) return;
    setIsUploadingImage(true);
    setTimeout(() => {
      setEditingProduct({
        ...editingProduct,
        images: [...editingProduct.images, newImageUrl.trim()],
      });
      setNewImageUrl('');
      setIsUploadingImage(false);
    }, 600);
  };

  const handleRemoveProductImage = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: editingProduct.images.filter((_, i) => i !== index),
    });
  };

  // COLLECTION ACTIONS
  const handleOpenNewCollection = () => {
    const blank: Collection = {
      id: `col-${Date.now()}`,
      slug: `collection-${Date.now().toString().slice(-4)}`,
      name: 'New Editorial Chapter',
      subtitle: 'Saison 2026',
      description: 'An exploration in noble leathers and architectural silhouettes.',
      heroImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2000&q=85',
      productCount: 0,
      featured: true,
      displayOrder: collections.length + 1,
    };
    setEditingCollection(blank);
    setIsNewCollection(true);
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection) {
      storeService.saveCollection(editingCollection);
      setEditingCollection(null);
      setIsNewCollection(false);
      onRefreshData();
    }
  };

  const handleConfirmDeleteCollection = () => {
    if (deleteConfirmCollection) {
      storeService.deleteCollection(deleteConfirmCollection.id);
      setDeleteConfirmCollection(null);
      onRefreshData();
    }
  };

  // ORDER ACTIONS
  const handleUpdateFulfillment = (status: Order['fulfillmentStatus']) => {
    if (selectedOrder) {
      storeService.updateOrderStatus(
        selectedOrder.id,
        status,
        orderStatusNote || `Fulfillment transitioned to ${status}`,
        trackingNumberInput || undefined
      );
      setSelectedOrder(storeService.getOrderById(selectedOrder.id) || null);
      setOrderStatusNote('');
      setTrackingNumberInput('');
      onRefreshData();
    }
  };

  const handleUpdatePayment = (status: Order['paymentStatus']) => {
    if (selectedOrder) {
      storeService.updatePaymentStatus(
        selectedOrder.id,
        status,
        orderStatusNote || `Payment status updated to ${status}`
      );
      setSelectedOrder(storeService.getOrderById(selectedOrder.id) || null);
      setOrderStatusNote('');
      onRefreshData();
    }
  };

  const handleConfirmCancelOrder = () => {
    if (selectedOrder && cancelReasonInput.trim()) {
      storeService.cancelOrder(selectedOrder.id, cancelReasonInput.trim());
      setSelectedOrder(storeService.getOrderById(selectedOrder.id) || null);
      setOrderCancelModalOpen(false);
      setCancelReasonInput('');
      onRefreshData();
    }
  };

  // HERO SLIDE ACTIONS
  const handleOpenNewSlide = () => {
    const blank: HeroSlide = {
      id: `slide-${Date.now()}`,
      eyebrow: 'NOUVELLE ÉDITION',
      title: 'The Poise of Quiet Majesty',
      subtitle: 'Crafted without haste, sculpted from full-grain Tuscan calfskin.',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=2000&q=85',
      ctaText: 'Discover Creation',
      ctaLink: '/shop',
      isActive: true,
      displayOrder: heroSlides.length + 1,
    };
    setEditingSlide(blank);
    setIsNewSlide(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      storeService.saveHeroSlide(editingSlide);
      setEditingSlide(null);
      setIsNewSlide(false);
      onRefreshData();
    }
  };

  const handleDeleteSlide = (id: string) => {
    storeService.deleteHeroSlide(id);
    onRefreshData();
  };

  // BRAND SETTINGS & HOMEPAGE MERCHANDISING SAVE
  const handleSaveBrandSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.updateBrandSettings(cmsSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
    onRefreshData();
  };

  // COUPON ACTIONS
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    storeService.saveCoupon({
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: newCouponValue,
      minOrderPKR: newCouponMin,
      isActive: true,
      description: newCouponDesc || `${newCouponCode.toUpperCase()} promotional code`,
    });
    setNewCouponCode('');
    setNewCouponDesc('');
    onRefreshData();
  };

  const handleDeleteCoupon = (code: string) => {
    storeService.deleteCoupon(code);
    onRefreshData();
  };

  // REVIEW MODERATION
  const handleReviewStatus = (id: string, status: Review['status']) => {
    storeService.updateReviewStatus(id, status);
    onRefreshData();
  };

  const handleDeleteReview = (id: string) => {
    storeService.deleteReview(id);
    onRefreshData();
  };

  // UNAUTHORIZED SHIELD
  if (!isAuthorized) {
    return (
      <div className="w-full bg-[#F7F3ED] min-h-screen py-24 px-6 sm:px-12 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#632F39]/10 text-[#632F39] flex items-center justify-center mx-auto border border-[#632F39]/20">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold block">
          Haute Maroquinerie Security Gate
        </span>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D]">
          Restricted Atelier Administration
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/75 leading-relaxed font-light">
          This portal governs luxury catalog records, customer orders, inventory allocation, and financial privileges. Access requires authenticated credentials associated with <strong>ksarwar78@gmail.com</strong> or the official Maison Élan domain.
        </p>

        <div className="pt-4 space-y-3">
          <button
            onClick={async () => {
              try {
                await storeService.signInWithGoogle();
                onRefreshData();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3.5 px-6 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#B49A72]" />
            <span>Authenticate via Firebase Google Login</span>
          </button>

          <button
            onClick={onNavigateToStorefront}
            className="w-full bg-white border border-[#E7DCCE] text-[#49332D] hover:border-[#632F39] text-xs uppercase tracking-wider py-3 transition-colors cursor-pointer"
          >
            Return to Public Storefront
          </button>
        </div>
      </div>
    );
  }

  // Filtered Products
  const filteredProducts = products.filter(p => {
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.silhouette.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (productSilhouetteFilter !== 'all' && p.silhouette !== productSilhouetteFilter) return false;
    if (productCollectionFilter !== 'all' && p.collectionId !== productCollectionFilter) return false;
    if (productPublishFilter === 'published' && p.isPublished === false) return false;
    if (productPublishFilter === 'draft' && p.isPublished !== false) return false;
    return true;
  });

  const totalProductPages = Math.ceil(filteredProducts.length / productPageSize) || 1;
  const paginatedProducts = filteredProducts.slice((productPage - 1) * productPageSize, productPage * productPageSize);

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const match = o.id.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q) || o.shippingAddress.fullName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (orderFulfillmentFilter !== 'all' && o.fulfillmentStatus !== orderFulfillmentFilter) return false;
    if (orderPaymentFilter !== 'all' && o.paymentStatus !== orderPaymentFilter) return false;
    return true;
  });

  // Filtered Customers
  const filteredCustomers = customerRecords.filter(c => {
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return c.email.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full bg-[#F7F3ED] min-h-screen py-10 px-6 sm:px-12 max-w-7xl mx-auto space-y-8">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7DCCE] gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-brand-display text-xl tracking-[0.2em] text-[#49332D]">
              {brandSettings.brandName}
            </span>
            <span className="bg-[#632F39] text-[#F7F3ED] text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold">
              Atelier Control Room
            </span>
            <span className="bg-[#B49A72]/20 text-[#49332D] text-[10px] tracking-wider px-2 py-0.5 border border-[#B49A72]/40 font-mono">
              Firestore: Connected
            </span>
          </div>
          <p className="text-xs text-[#49332D]/70 mt-1 font-light">
            Authorized session · {currentUser?.email} · Central inventory & logistics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSyncFirebase}
            disabled={syncingFirebase}
            className="bg-white border border-[#E7DCCE] hover:border-[#632F39] text-[#49332D] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Seed and synchronize catalog to Cloud Firestore"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#B49A72] ${syncingFirebase ? 'animate-spin' : ''}`} />
            <span>{syncingFirebase ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>

          <button
            onClick={onNavigateToStorefront}
            className="bg-white border border-[#E7DCCE] text-[#49332D] hover:border-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B49A72]" />
            <span>Exit to Storefront</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="bg-white border-l-2 border-[#632F39] p-4 text-xs text-[#49332D] shadow-xs flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-[#49332D]/50 hover:text-[#49332D] ml-4 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#E7DCCE] pb-3 text-xs uppercase tracking-wider font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'collections', label: `Collections (${collections.length})`, icon: Layers },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'customers', label: `Patrons (${customerRecords.length})`, icon: Users },
          { id: 'coupons', label: `Privileges (${coupons.length})`, icon: Ticket },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
          { id: 'homepage', label: 'Homepage & Merchandising', icon: ImageIcon },
          { id: 'settings', label: 'Brand & Regional Config', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive ? 'bg-[#49332D] text-[#F7F3ED]' : 'bg-white text-[#49332D] border border-[#E7DCCE] hover:border-[#632F39]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B49A72]' : 'text-[#49332D]/70'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW METRICS ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60 block mb-1">
                Authoritative Gross Revenue
              </span>
              <p className="font-serif-editorial text-3xl text-[#49332D]">
                {storeService.formatPrice(totalRevenuePKR, currency)}
              </p>
              <p className="text-[11px] text-[#49332D]/70 mt-1">
                {orders.length > 0 ? `Computed across ${orders.length} real order documents` : 'No orders recorded in database yet'}
              </p>
            </div>

            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60 block mb-1">
                Active Atelier Commissions
              </span>
              <p className="font-serif-editorial text-3xl text-[#632F39]">
                {activeOrdersCount}
              </p>
              <p className="text-[11px] text-[#49332D]/70 mt-1">
                Orders undergoing crafting or courier transit
              </p>
            </div>

            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60 block mb-1">
                Catalog Silhouettes
              </span>
              <p className="font-serif-editorial text-3xl text-[#49332D]">
                {products.length}
              </p>
              <p className="text-[11px] text-[#49332D]/70 mt-1">
                Across {collections.length} editorial collections
              </p>
            </div>

            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60 block mb-1">
                Inventory Alerts
              </span>
              <p className="font-serif-editorial text-3xl text-[#B49A72]">
                {lowStockProducts.length}
              </p>
              <p className="text-[11px] text-[#49332D]/70 mt-1">
                Pieces with ≤ 8 units in Lahore workshop
              </p>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white border border-[#E7DCCE] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7DCCE]">
              <div>
                <h2 className="font-serif-editorial text-2xl text-[#49332D]">Recent Atelier Commissions</h2>
                <p className="text-xs text-[#49332D]/70 font-light">Real order records from database storage</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs uppercase tracking-wider text-[#632F39] font-medium hover:underline flex items-center gap-1"
              >
                <span>View Full Order Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#49332D]/60 font-light">
                No orders have been recorded in the database yet. Real order placements will automatically stream here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E7DCCE] text-[#49332D]/60 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-2">Order Reference</th>
                      <th className="py-3 px-2">Patron & Destination</th>
                      <th className="py-3 px-2">Total Charged</th>
                      <th className="py-3 px-2">Payment</th>
                      <th className="py-3 px-2">Fulfillment</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DCCE]/60">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-[#F7F3ED]/40 transition-colors">
                        <td className="py-3 px-2 font-mono font-medium text-[#49332D]">{o.id}</td>
                        <td className="py-3 px-2">
                          <p className="font-medium text-[#49332D]">{o.shippingAddress.fullName}</p>
                          <p className="text-[11px] text-[#49332D]/60">{o.shippingAddress.city}, {o.shippingAddress.country}</p>
                        </td>
                        <td className="py-3 px-2 font-semibold text-[#49332D]">
                          {storeService.formatPrice(o.totalPKR, currency)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${
                            o.paymentStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#E7DCCE] text-[#49332D]">
                            {o.fulfillmentStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setActiveTab('orders');
                            }}
                            className="text-xs text-[#632F39] hover:underline font-medium cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRODUCTS CRUD ================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Handbag Catalog & Inventory</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Manage silhouettes, variants, prices, boxcalf origins, and publish statuses.
              </p>
            </div>
            <button
              onClick={handleOpenNewProduct}
              className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#B49A72]" />
              <span>Create New Silhouette</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-[#E7DCCE] p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search by silhouette name, slug, tag..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductPage(1);
                }}
                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 pl-8 pr-3 focus:outline-none focus:border-[#632F39]"
              />
              <Search className="w-3.5 h-3.5 text-[#49332D]/50 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={productSilhouetteFilter}
              onChange={(e) => {
                setProductSilhouetteFilter(e.target.value);
                setProductPage(1);
              }}
              className="bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 px-3 focus:outline-none"
            >
              <option value="all">All Silhouettes</option>
              <option value="top-handle">Top-Handle</option>
              <option value="tote">Everyday Tote</option>
              <option value="shoulder">Shoulder Bag</option>
              <option value="crossbody">Crossbody</option>
              <option value="evening">Evening Minaudière</option>
              <option value="mini">Architectural Mini</option>
            </select>

            <select
              value={productCollectionFilter}
              onChange={(e) => {
                setProductCollectionFilter(e.target.value);
                setProductPage(1);
              }}
              className="bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 px-3 focus:outline-none"
            >
              <option value="all">All Collections</option>
              {collections.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              value={productPublishFilter}
              onChange={(e) => {
                setProductPublishFilter(e.target.value as any);
                setProductPage(1);
              }}
              className="bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 px-3 focus:outline-none"
            >
              <option value="all">All Publish States</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          {/* Product Table */}
          <div className="bg-white border border-[#E7DCCE] overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7DCCE] text-[#49332D]/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Piece</th>
                  <th className="py-3 px-2">Silhouette</th>
                  <th className="py-3 px-2">Collection</th>
                  <th className="py-3 px-2">Price (PKR)</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]/60">
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F3ED]/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-[#F7F3ED] border border-[#E7DCCE]"
                        />
                        <div>
                          <p className="font-medium text-[#49332D]">{p.name}</p>
                          <p className="text-[11px] text-[#49332D]/60 italic font-serif-editorial">{p.frenchSubtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 capitalize">{p.silhouette}</td>
                    <td className="py-3 px-2 text-[#49332D]/80">
                      {collections.find(c => c.slug === p.collectionId)?.name || p.collectionId}
                    </td>
                    <td className="py-3 px-2 font-semibold text-[#49332D]">
                      {storeService.formatPrice(p.pricePKR, currency)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`font-mono ${p.totalInventory <= 8 ? 'text-amber-700 font-bold' : 'text-[#49332D]'}`}>
                        {p.totalInventory} units
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold cursor-pointer transition-colors ${
                          p.isPublished !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                        }`}
                        title="Click to toggle published / draft state"
                      >
                        {p.isPublished !== false ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsNewProduct(false);
                          }}
                          className="p-1.5 text-[#49332D]/70 hover:text-[#632F39] hover:bg-[#F7F3ED] transition-colors"
                          title="Edit Silhouette"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(p.id)}
                          className="p-1.5 text-[#49332D]/70 hover:text-[#B49A72] hover:bg-[#F7F3ED] transition-colors"
                          title="Duplicate Piece"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProduct(p)}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Silhouette"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#49332D]/70 pt-2">
              <span>Showing page {productPage} of {totalProductPages}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={productPage <= 1}
                  onClick={() => setProductPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-[#E7DCCE] disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={productPage >= totalProductPages}
                  onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-[#E7DCCE] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: COLLECTIONS & MERCHANDISING ================= */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Editorial Chapters & Collections</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Configure curated capsule narratives, hero photography, and merchandising sequences.
              </p>
            </div>
            <button
              onClick={handleOpenNewCollection}
              className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#B49A72]" />
              <span>New Collection Chapter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => {
              const colPiecesCount = products.filter(p => p.collectionId === col.slug || p.collectionId === col.id).length;
              return (
                <div key={col.id} className="bg-white border border-[#E7DCCE] p-5 shadow-2xs space-y-4">
                  <div className="aspect-16/9 bg-[#F7F3ED] overflow-hidden relative">
                    <img src={col.heroImage} alt={col.name} className="w-full h-full object-cover" />
                    {col.featured && (
                      <span className="absolute top-2 left-2 bg-[#632F39] text-[#F7F3ED] text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">
                        Featured Capsule
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-[#B49A72] uppercase tracking-wider font-semibold block">
                      {col.subtitle}
                    </span>
                    <h3 className="font-serif-editorial text-xl text-[#49332D] mt-0.5">{col.name}</h3>
                    <p className="text-xs text-[#49332D]/70 font-light mt-1.5 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                    <p className="text-[11px] font-mono text-[#49332D]/60 mt-2">
                      Contains {colPiecesCount} catalog pieces · Slug: /{col.slug}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingCollection(col);
                        setIsNewCollection(false);
                      }}
                      className="text-xs text-[#632F39] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Capsule</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmCollection(col)}
                      className="text-xs text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ORDERS & FULFILLMENT ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Atelier Order Management & Logistics</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Monitor live commissions, manage TCS & DHL tracking, verify payments, and handle order adjustments.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-[#E7DCCE] p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search by Order ID (ME-2026-...), email, or recipient..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 pl-8 pr-3 focus:outline-none focus:border-[#632F39]"
              />
              <Search className="w-3.5 h-3.5 text-[#49332D]/50 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={orderFulfillmentFilter}
              onChange={(e) => setOrderFulfillmentFilter(e.target.value)}
              className="bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 px-3 focus:outline-none"
            >
              <option value="all">All Fulfillment Stages</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="in_atelier">In Atelier</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={orderPaymentFilter}
              onChange={(e) => setOrderPaymentFilter(e.target.value)}
              className="bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 px-3 focus:outline-none"
            >
              <option value="all">All Payment States</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-[#E7DCCE] overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7DCCE] text-[#49332D]/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order Code</th>
                  <th className="py-3 px-2">Patron & Contact</th>
                  <th className="py-3 px-2">Items</th>
                  <th className="py-3 px-2">Total Charged</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Fulfillment</th>
                  <th className="py-3 px-2">Courier Tracking</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[#49332D]/60 font-light">
                      No matching order records found in database.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F7F3ED]/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-[#49332D]">
                        {o.id}
                        <span className="block text-[10px] text-[#49332D]/50 font-sans">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-[#49332D]">{o.shippingAddress.fullName}</p>
                        <p className="text-[11px] text-[#49332D]/60">{o.customerEmail}</p>
                        <p className="text-[10px] text-[#49332D]/50">{o.shippingAddress.city}, {o.shippingAddress.country}</p>
                      </td>
                      <td className="py-3 px-2 font-mono">
                        {o.items.reduce((s, i) => s + i.quantity, 0)} pc ({o.items[0]?.productName})
                      </td>
                      <td className="py-3 px-2 font-semibold text-[#49332D]">
                        {storeService.formatPrice(o.totalPKR, currency)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${
                          o.paymentStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                          o.fulfillmentStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          o.fulfillmentStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-[#E7DCCE] text-[#49332D]'
                        }`}>
                          {o.fulfillmentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px]">
                        {o.trackingNumber ? (
                          <span className="text-[#632F39] font-medium">{o.trackingNumber}</span>
                        ) : (
                          <span className="text-[#49332D]/40">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-[11px] uppercase tracking-wider py-1 px-3 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PATRON RECORDS & PRIVACY ================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Patron Directory & Privacy Protections</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Authoritative customer purchase histories with sensitive PII masking controls.
              </p>
            </div>
            <button
              onClick={() => setMaskCustomerPii(!maskCustomerPii)}
              className="bg-white border border-[#E7DCCE] text-[#49332D] hover:border-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {maskCustomerPii ? <Eye className="w-3.5 h-3.5 text-[#B49A72]" /> : <EyeOff className="w-3.5 h-3.5 text-[#632F39]" />}
              <span>{maskCustomerPii ? 'Unmask Phone & PII' : 'Mask Sensitive PII'}</span>
            </button>
          </div>

          <div className="bg-white border border-[#E7DCCE] p-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search patrons by name, email, or city..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs py-2 pl-8 pr-3 focus:outline-none focus:border-[#632F39]"
              />
              <Search className="w-3.5 h-3.5 text-[#49332D]/50 absolute left-2.5 top-2.5" />
            </div>
            <span className="text-xs text-[#49332D]/70">
              Showing <strong>{filteredCustomers.length}</strong> patrons
            </span>
          </div>

          <div className="bg-white border border-[#E7DCCE] overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7DCCE] text-[#49332D]/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Patron Name</th>
                  <th className="py-3 px-2">Email Address</th>
                  <th className="py-3 px-2">Phone Contact</th>
                  <th className="py-3 px-2">Primary City</th>
                  <th className="py-3 px-2">Orders Placed</th>
                  <th className="py-3 px-2">Cumulative Spent</th>
                  <th className="py-3 px-3 text-right">Last Interaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-[#49332D]/60 font-light">
                      No customer order records logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust, idx) => {
                    const maskedPhone = cust.phone ? `${cust.phone.slice(0, 4)} *** **** ${cust.phone.slice(-2)}` : 'Unrecorded';
                    return (
                      <tr key={idx} className="hover:bg-[#F7F3ED]/30 transition-colors">
                        <td className="py-3 px-3 font-medium text-[#49332D]">{cust.fullName}</td>
                        <td className="py-3 px-2 font-mono text-[#49332D]/80">{cust.email}</td>
                        <td className="py-3 px-2 font-mono text-[#49332D]/70">
                          {maskCustomerPii ? maskedPhone : cust.phone || 'N/A'}
                        </td>
                        <td className="py-3 px-2">{cust.city}, {cust.country}</td>
                        <td className="py-3 px-2 font-mono font-medium">{cust.totalOrders} commissions</td>
                        <td className="py-3 px-2 font-semibold text-[#632F39]">
                          {storeService.formatPrice(cust.totalSpentPKR, currency)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-[#49332D]/60">
                          {new Date(cust.lastOrderDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PRIVILEGE CODES & PROMOTIONS ================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Privilege Discount Codes & Promotions</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Create promotional discount incentives, minimum order limits, and seasonal privilege keys.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Coupon Form */}
            <div className="lg:col-span-4 bg-white border border-[#E7DCCE] p-6 shadow-2xs space-y-4">
              <h3 className="font-serif-editorial text-xl text-[#49332D]">Issue New Privilege Key</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAISON20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none uppercase font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#49332D]/70 mb-1 font-medium">Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed_pkr">Fixed PKR (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#49332D]/70 mb-1 font-medium">Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Minimum Order (PKR)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Privilege Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Inaugural Season Patron Privilege"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-wider py-3 transition-colors cursor-pointer mt-2"
                >
                  Authorize Code
                </button>
              </form>
            </div>

            {/* Existing Coupons Table */}
            <div className="lg:col-span-8 bg-white border border-[#E7DCCE] overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E7DCCE] text-[#49332D]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-2">Privilege Discount</th>
                    <th className="py-3 px-2">Min. Order</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DCCE]/60">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-[#F7F3ED]/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#49332D]">{c.code}</td>
                      <td className="py-3 px-2">
                        {c.type === 'percent' ? `${c.value}% Off Subtotal` : `Rs. ${c.value.toLocaleString()} Off`}
                        <span className="block text-[10px] text-[#49332D]/60">{c.description}</span>
                      </td>
                      <td className="py-3 px-2 font-mono">
                        {c.minOrderPKR ? `Rs. ${c.minOrderPKR.toLocaleString()}` : 'No threshold'}
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => {
                            storeService.saveCoupon({ ...c, isActive: !c.isActive });
                            onRefreshData();
                          }}
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                          title="Remove coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: REVIEWS MODERATION ================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Patron Review Moderation</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Verify customer commendations before they appear on product pages and homepage storytelling.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E7DCCE] overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7DCCE] text-[#49332D]/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Patron & Product</th>
                  <th className="py-3 px-2">Rating & Feedback</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]/60">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-xs text-[#49332D]/60 font-light">
                      No review submissions awaiting moderation.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => {
                    const prod = products.find(p => p.id === r.productId);
                    return (
                      <tr key={r.id} className="hover:bg-[#F7F3ED]/30 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-medium text-[#49332D]">{r.customerName}</p>
                          <p className="text-[11px] text-[#49332D]/60 font-mono">
                            Silhouette: {prod ? prod.name : r.productId}
                          </p>
                          <p className="text-[10px] text-[#49332D]/40">{r.date}</p>
                        </td>
                        <td className="py-3 px-2 max-w-md">
                          <div className="flex items-center gap-1 text-[#B49A72] mb-1">
                            {[...Array(r.rating)].map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <p className="font-semibold text-[#49332D]">{r.title}</p>
                          <p className="text-xs text-[#49332D]/75 font-light leading-relaxed mt-0.5">{r.comment}</p>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                            r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.status !== 'approved' && (
                              <button
                                onClick={() => handleReviewStatus(r.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-emerald-800"
                              >
                                Approve
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button
                                onClick={() => handleReviewStatus(r.id, 'rejected')}
                                className="px-2.5 py-1 bg-amber-700 text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-amber-800"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 8: HOMEPAGE CMS & MERCHANDISING ================= */}
      {activeTab === 'homepage' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Homepage Campaign & Section Ordering</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Configure hero slides, links, and enable or disable individual storefront storytelling chapters.
              </p>
            </div>
            <button
              onClick={handleOpenNewSlide}
              className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#B49A72]" />
              <span>Add Campaign Slide</span>
            </button>
          </div>

          {/* Section Visibility Toggles */}
          <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif-editorial text-xl text-[#49332D]">Storefront Section Visibility</h3>
            <p className="text-xs text-[#49332D]/70 font-light">
              Toggle specific sections on or off. Changes reflect immediately on the customer-facing homepage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[
                { key: 'hero', label: '1. Cinematic Hero Carousel' },
                { key: 'manifesto', label: '2. L’Esprit Manifesto' },
                { key: 'featuredCapsule', label: '3. Featured Capsule Feature' },
                { key: 'bestsellers', label: '4. Silhouettes & Bestsellers' },
                { key: 'craftsmanship', label: '5. Craftsmanship Pillars' },
                { key: 'reviews', label: '6. Patron Commendations' },
                { key: 'newsletter', label: '7. Concierge Privilege Banner' },
              ].map(({ key, label }) => {
                const isVis = cmsSettings.sectionVisibility?.[key as keyof HomepageSectionVisibility] !== false;
                return (
                  <div key={key} className="p-3 bg-[#F7F3ED]/40 border border-[#E7DCCE] flex items-center justify-between">
                    <span className="text-xs text-[#49332D] font-medium">{label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentVis = cmsSettings.sectionVisibility || {
                          hero: true, manifesto: true, featuredCapsule: true, bestsellers: true, craftsmanship: true, reviews: true, newsletter: true
                        };
                        const updated = {
                          ...cmsSettings,
                          sectionVisibility: {
                            ...currentVis,
                            [key]: !isVis,
                          }
                        };
                        setCmsSettings(updated);
                        storeService.updateBrandSettings(updated);
                        onRefreshData();
                      }}
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                        isVis ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isVis ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hero Slides Cards */}
          <div className="space-y-4">
            <h3 className="font-serif-editorial text-xl text-[#49332D]">Active Campaign Slides ({heroSlides.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id} className="bg-white border border-[#E7DCCE] p-5 shadow-2xs space-y-3">
                  <div className="aspect-16/9 overflow-hidden bg-[#F7F3ED] relative">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-[#49332D] text-[#F7F3ED] text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">
                      Slide #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#B49A72] uppercase tracking-wider font-semibold block">
                      {slide.eyebrow}
                    </span>
                    <h4 className="font-serif-editorial text-lg text-[#49332D]">{slide.title}</h4>
                    <p className="text-xs text-[#49332D]/70 font-light line-clamp-2 mt-1 leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <p className="text-[10px] font-mono text-[#632F39] mt-2">
                      CTA: “{slide.ctaText}” → {slide.ctaLink}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingSlide(slide);
                        setIsNewSlide(false);
                      }}
                      className="text-xs text-[#632F39] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>
                    {heroSlides.length > 1 && (
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 9: BRAND, REGIONAL SHIPPING, PAYMENTS & SEO ================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveBrandSettings} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DCCE]">
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#49332D]">Brand Identity & Regional Commerce Configuration</h2>
              <p className="text-xs text-[#49332D]/70 font-light">
                Configure brand labels, white-glove shipping rates, Raast bank transfer IBAN, and SEO tags.
              </p>
            </div>
            <button
              type="submit"
              className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-wider py-2.5 px-6 flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Save className="w-4 h-4 text-[#B49A72]" />
              <span>Save Changes</span>
            </button>
          </div>

          {settingsSavedToast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs">
              Brand and regional commerce settings saved and synchronized to Firestore successfully.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Column 1: Brand & Communication */}
            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs space-y-4">
              <h3 className="font-serif-editorial text-xl text-[#49332D]">Brand & Communication</h3>
              
              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Brand Working Name</label>
                <input
                  type="text"
                  required
                  value={cmsSettings.brandName}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, brandName: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none focus:border-[#632F39]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Brand Tagline</label>
                <input
                  type="text"
                  value={cmsSettings.brandTagline}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, brandTagline: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Concierge Email</label>
                  <input
                    type="email"
                    value={cmsSettings.contactEmail}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, contactEmail: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Concierge WhatsApp</label>
                  <input
                    type="text"
                    value={cmsSettings.whatsappConcierge}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, whatsappConcierge: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#49332D]/70 font-medium">Top Announcement Strip</label>
                  <button
                    type="button"
                    onClick={() => setCmsSettings({ ...cmsSettings, announcementActive: !cmsSettings.announcementActive })}
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 cursor-pointer ${
                      cmsSettings.announcementActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cmsSettings.announcementActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <input
                  type="text"
                  value={cmsSettings.announcementText}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, announcementText: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Column 2: Regional Shipping & Tariffs */}
            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs space-y-4">
              <h3 className="font-serif-editorial text-xl text-[#49332D]">Regional Shipping & Logistics</h3>
              
              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">
                  Free White-Glove Shipping Threshold (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={cmsSettings.freeShippingThresholdPKR}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, freeShippingThresholdPKR: Number(e.target.value) })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Domestic TCS Standard (PKR)</label>
                  <input
                    type="number"
                    value={cmsSettings.domesticShippingFeePKR || 850}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, domesticShippingFeePKR: Number(e.target.value) })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">International DHL Flat (PKR)</label>
                  <input
                    type="number"
                    value={cmsSettings.internationalShippingFeePKR || 12500}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, internationalShippingFeePKR: Number(e.target.value) })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Regional Payment Gateways & Raast Bank Routing */}
            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs space-y-4">
              <h3 className="font-serif-editorial text-xl text-[#49332D]">Pakistani & International Payment Channels</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-[#F7F3ED]/40 border border-[#E7DCCE]">
                  <span className="text-xs text-[#49332D] font-medium">Cash on Delivery (COD · Pakistan Domestic)</span>
                  <input
                    type="checkbox"
                    checked={cmsSettings.codEnabled !== false}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, codEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#632F39]"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#F7F3ED]/40 border border-[#E7DCCE]">
                  <span className="text-xs text-[#49332D] font-medium">Raast & Direct Bank Wire Processing</span>
                  <input
                    type="checkbox"
                    checked={cmsSettings.bankTransferEnabled !== false}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, bankTransferEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#632F39]"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#F7F3ED]/40 border border-[#E7DCCE]">
                  <span className="text-xs text-[#49332D] font-medium">Direct International Card Processing</span>
                  <input
                    type="checkbox"
                    checked={cmsSettings.cardEnabled !== false}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, cardEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#632F39]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7DCCE] space-y-2">
                <label className="block text-xs text-[#49332D] font-semibold">Official Bank Transfer Wire Details</label>
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={cmsSettings.bankDetails?.bankName || 'Habib Bank Limited (HBL) Prestige'}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    bankDetails: {
                      ...cmsSettings.bankDetails,
                      bankName: e.target.value,
                      accountTitle: cmsSettings.bankDetails?.accountTitle || '',
                      iban: cmsSettings.bankDetails?.iban || '',
                      raastId: cmsSettings.bankDetails?.raastId || '',
                    }
                  })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Account Title"
                  value={cmsSettings.bankDetails?.accountTitle || 'MAISON ELAN LUXURY MAROQUINERIE'}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    bankDetails: {
                      ...cmsSettings.bankDetails,
                      accountTitle: e.target.value,
                      bankName: cmsSettings.bankDetails?.bankName || '',
                      iban: cmsSettings.bankDetails?.iban || '',
                      raastId: cmsSettings.bankDetails?.raastId || '',
                    }
                  })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Official IBAN Number"
                  value={cmsSettings.bankDetails?.iban || 'PK36HABB0001234567890123'}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    bankDetails: {
                      ...cmsSettings.bankDetails,
                      iban: e.target.value,
                      bankName: cmsSettings.bankDetails?.bankName || '',
                      accountTitle: cmsSettings.bankDetails?.accountTitle || '',
                      raastId: cmsSettings.bankDetails?.raastId || '',
                    }
                  })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2 focus:outline-none font-mono"
                />
              </div>

              {/* Online Payment Gateway Provider Evaluation for Pakistan */}
              <div className="pt-3 border-t border-[#E7DCCE] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-[#49332D] font-semibold">Online Gateway Evaluation (Pakistan & Global)</label>
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-medium ${
                    cmsSettings.paymentGatewayConfig?.isApproved 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cmsSettings.paymentGatewayConfig?.isApproved ? 'Live Authorized' : 'Pending Merchant Approval'}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F3ED]/50 border border-[#E7DCCE] text-[11px] text-[#49332D]/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#49332D]">Evaluated Gateway:</span>
                    <select
                      value={cmsSettings.paymentGatewayConfig?.provider || 'paymob_pk'}
                      onChange={(e) => setCmsSettings({
                        ...cmsSettings,
                        paymentGatewayConfig: {
                          provider: e.target.value as any,
                          mode: cmsSettings.paymentGatewayConfig?.mode || 'sandbox',
                          merchantId: cmsSettings.paymentGatewayConfig?.merchantId || 'PK-MERC-9821',
                          publicKey: cmsSettings.paymentGatewayConfig?.publicKey || 'pk_test_maisonelan_pk9821_sandbox',
                          isApproved: false,
                          setupInstructionsPending: true,
                        }
                      })}
                      className="bg-white border border-[#E7DCCE] text-[11px] p-1 text-[#49332D]"
                    >
                      <option value="paymob_pk">Paymob Pakistan (State Bank SBP Approved · 2.49% + PKR 10)</option>
                      <option value="safepay">Safepay Pakistan (PKR Settlement · 2.9% + PKR 15)</option>
                      <option value="stripe_intl">Stripe (International Entity / USD Settlement · 2.9% + 30¢)</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-[#49332D]/70 leading-relaxed">
                    <strong>Merchant Eligibility Notice:</strong> Pakistani entities require NTN (National Tax Number), SECP registration, and corporate bank account with 1Link / Raast integration. Stripe is unavailable for Pakistan domestic incorporation without a US/UK holding structure. Paymob PK & Safepay support direct PKR local settlement.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-[#49332D]/60 block">Gateway Mode</span>
                      <select
                        value={cmsSettings.paymentGatewayConfig?.mode || 'sandbox'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          paymentGatewayConfig: {
                            ...cmsSettings.paymentGatewayConfig!,
                            mode: e.target.value as any,
                          }
                        })}
                        className="w-full bg-white border border-[#E7DCCE] text-[11px] p-1"
                      >
                        <option value="sandbox">Sandbox Testing (Simulated)</option>
                        <option value="live">Live Production (Requires Approval)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#49332D]/60 block">Merchant ID</span>
                      <input
                        type="text"
                        value={cmsSettings.paymentGatewayConfig?.merchantId || 'PK-MERC-9821'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          paymentGatewayConfig: {
                            ...cmsSettings.paymentGatewayConfig!,
                            merchantId: e.target.value,
                          }
                        })}
                        placeholder="PK-MERC-XXXX"
                        className="w-full bg-white border border-[#E7DCCE] text-[11px] p-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 text-[10px]">
                    <strong>Setup Instructions Pending:</strong> Merchant credentials are under SBP compliance review. Online card checkouts operate safely in sandboxed mode without charging actual payment instruments until live merchant keys are connected.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: SEO Metadata */}
            <div className="bg-white border border-[#E7DCCE] p-6 shadow-2xs space-y-4">
              <h3 className="font-serif-editorial text-xl text-[#49332D]">Global Search Engine Metadata (SEO)</h3>
              
              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Meta Title Tag</label>
                <input
                  type="text"
                  value={cmsSettings.seoTitle || 'MAISON ÉLAN | Haute Maroquinerie & Handbag Atelier'}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, seoTitle: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Meta Description</label>
                <textarea
                  rows={3}
                  value={cmsSettings.seoDescription || 'Handcrafted luxury leather handbags sculpted from single-origin Tuscan and French leathers with 24k satin champagne gold hardware.'}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, seoDescription: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">SEO Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={cmsSettings.seoKeywords || 'luxury handbags, haute maroquinerie, designer tote, pakistan luxury fashion, leather atelier'}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, seoKeywords: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
                />
              </div>
            </div>

          </div>
        </form>
      )}

      {/* ================= PRODUCT EDIT / CREATE MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E7DCCE] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7DCCE]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#B49A72] font-semibold block">
                  {isNewProduct ? 'Atelier Creation' : 'Editing Specification'}
                </span>
                <h3 className="font-serif-editorial text-2xl text-[#49332D]">{editingProduct.name}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-[#49332D]/60 hover:text-[#49332D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Piece Name*</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">French Subtitle*</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.frenchSubtitle}
                    onChange={(e) => setEditingProduct({ ...editingProduct, frenchSubtitle: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Silhouette*</label>
                  <select
                    value={editingProduct.silhouette}
                    onChange={(e) => setEditingProduct({ ...editingProduct, silhouette: e.target.value as any })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none capitalize"
                  >
                    <option value="top-handle">Top-Handle</option>
                    <option value="tote">Everyday Tote</option>
                    <option value="shoulder">Shoulder Bag</option>
                    <option value="crossbody">Curved Crossbody</option>
                    <option value="evening">Evening Minaudière</option>
                    <option value="mini">Architectural Mini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Collection</label>
                  <select
                    value={editingProduct.collectionId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collectionId: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                  >
                    {collections.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Price (PKR)*</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.pricePKR}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePKR: Number(e.target.value) })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Sale Price (PKR, Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.salePricePKR || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePricePKR: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">Total Inventory</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.totalInventory}
                    onChange={(e) => setEditingProduct({ ...editingProduct, totalInventory: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isPublished !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                      className="accent-[#632F39]"
                    />
                    <span className="font-medium text-[#49332D]">Published in Storefront</span>
                  </label>
                </div>
              </div>

              {/* Images Manager */}
              <div className="space-y-2 pt-2 border-t border-[#E7DCCE]">
                <label className="block text-[#49332D] font-semibold">High-Resolution Photography Gallery</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (Unsplash or CDN)..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddProductImage}
                    disabled={isUploadingImage}
                    className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] px-4 py-2 uppercase tracking-wider text-[11px] font-medium transition-colors"
                  >
                    {isUploadingImage ? 'Uploading...' : 'Add Image'}
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {editingProduct.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-20 bg-[#F7F3ED] border border-[#E7DCCE] shrink-0 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7DCCE]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 border border-[#E7DCCE] text-[#49332D] hover:bg-[#F7F3ED] uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] uppercase tracking-wider text-xs font-semibold"
                >
                  Save Silhouette
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= COLLECTION EDIT / CREATE MODAL ================= */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7DCCE] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7DCCE]">
              <h3 className="font-serif-editorial text-2xl text-[#49332D]">
                {isNewCollection ? 'New Editorial Collection' : 'Edit Capsule Chapter'}
              </h3>
              <button onClick={() => setEditingCollection(null)} className="text-[#49332D]/60 hover:text-[#49332D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Collection Title*</label>
                <input
                  type="text"
                  required
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Subtitle / Season</label>
                <input
                  type="text"
                  value={editingCollection.subtitle}
                  onChange={(e) => setEditingCollection({ ...editingCollection, subtitle: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Slug URL identifier</label>
                <input
                  type="text"
                  required
                  value={editingCollection.slug}
                  onChange={(e) => setEditingCollection({ ...editingCollection, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Hero Image URL</label>
                <input
                  type="url"
                  required
                  value={editingCollection.heroImage}
                  onChange={(e) => setEditingCollection({ ...editingCollection, heroImage: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Narrative Description</label>
                <textarea
                  rows={3}
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCol"
                  checked={editingCollection.featured}
                  onChange={(e) => setEditingCollection({ ...editingCollection, featured: e.target.checked })}
                  className="accent-[#632F39]"
                />
                <label htmlFor="featuredCol" className="text-xs text-[#49332D] font-medium cursor-pointer">
                  Feature in Homepage Primary Capsule Showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7DCCE]">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-4 py-2 border border-[#E7DCCE] text-[#49332D] hover:bg-[#F7F3ED] uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] uppercase tracking-wider text-xs font-semibold"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= HERO SLIDE EDIT MODAL ================= */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7DCCE] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7DCCE]">
              <h3 className="font-serif-editorial text-2xl text-[#49332D]">
                {isNewSlide ? 'New Campaign Slide' : 'Edit Slide'}
              </h3>
              <button onClick={() => setEditingSlide(null)} className="text-[#49332D]/60 hover:text-[#49332D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Eyebrow Tag</label>
                <input
                  type="text"
                  required
                  value={editingSlide.eyebrow}
                  onChange={(e) => setEditingSlide({ ...editingSlide, eyebrow: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Hero Headline*</label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none font-serif-editorial text-sm"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Subtitle Narrative</label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Hero Photography URL*</label>
                <input
                  type="url"
                  required
                  value={editingSlide.image}
                  onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">CTA Button Label</label>
                  <input
                    type="text"
                    value={editingSlide.ctaText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#49332D]/70 mb-1 font-medium">CTA Link Route</label>
                  <input
                    type="text"
                    value={editingSlide.ctaLink}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaLink: e.target.value })}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7DCCE]">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 border border-[#E7DCCE] text-[#49332D] hover:bg-[#F7F3ED] uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] uppercase tracking-wider text-xs font-semibold"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ORDER DETAILS & FULFILLMENT MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E7DCCE] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7DCCE]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#B49A72] font-semibold block">
                  Commission Management
                </span>
                <h3 className="font-serif-editorial text-2xl text-[#49332D] font-mono">{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#49332D]/60 hover:text-[#49332D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#49332D]/70 font-semibold block">
                Ordered Creations ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-[#E7DCCE]/60 border border-[#E7DCCE]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3">
                    <img src={item.image} alt={item.productName} className="w-12 h-14 object-cover bg-[#F7F3ED]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-[#49332D]">{item.productName}</p>
                      <p className="text-[11px] text-[#49332D]/60 font-light">Shade: {item.variantColor} · SKU: {item.sku}</p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-[#49332D]/60">{item.quantity} × </span>
                      <span className="font-semibold text-[#49332D]">Rs. {item.priceCharged.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#F7F3ED]/50 p-4 border border-[#E7DCCE] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#49332D]/70">Subtotal</span>
                <span>Rs. {selectedOrder.subtotalPKR.toLocaleString()}</span>
              </div>
              {selectedOrder.discountPKR > 0 && (
                <div className="flex justify-between text-[#632F39]">
                  <span>Privilege Discount</span>
                  <span>- Rs. {selectedOrder.discountPKR.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#49332D]/70">Shipping Logistics</span>
                <span>{selectedOrder.shippingFeePKR === 0 ? 'Complimentary' : `Rs. ${selectedOrder.shippingFeePKR.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E7DCCE] font-semibold text-[#49332D] text-sm">
                <span>Total Amount</span>
                <span>Rs. {selectedOrder.totalPKR.toLocaleString()}</span>
              </div>
            </div>

            {/* Destination & Contact */}
            <div className="text-xs space-y-1 border-t border-[#E7DCCE] pt-4">
              <span className="font-semibold text-[#49332D] block mb-1">Destination Address:</span>
              <p className="text-[#49332D]">{selectedOrder.shippingAddress.fullName}</p>
              <p className="text-[#49332D]/70">{selectedOrder.shippingAddress.addressLine1}</p>
              <p className="text-[#49332D]/70">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.provinceState} {selectedOrder.shippingAddress.postalCode}</p>
              <p className="text-[#49332D]/70">{selectedOrder.shippingAddress.country} · Tel: {selectedOrder.customerPhone}</p>
              <p className="text-[#49332D]/70 font-mono">Email: {selectedOrder.customerEmail}</p>
            </div>

            {/* Status Modification Controls */}
            <div className="border-t border-[#E7DCCE] pt-4 space-y-4 text-xs">
              <span className="font-semibold text-[#49332D] block">Update Logistics & Fulfillment:</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#49332D]/70 mb-1">Assign Tracking Number</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS-77291048"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#49332D]/70 mb-1">Carrier Courier</label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1">Logistics Progress Note</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched via TCS White Glove Courier in sealed velvet gift packaging."
                  value={orderStatusNote}
                  onChange={(e) => setOrderStatusNote(e.target.value)}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateFulfillment('in_atelier')}
                  className="px-3 py-1.5 bg-[#49332D] text-[#F7F3ED] text-[10px] uppercase tracking-wider font-semibold hover:bg-[#632F39]"
                >
                  Set: In Atelier
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateFulfillment('dispatched')}
                  className="px-3 py-1.5 bg-[#B49A72] text-[#49332D] text-[10px] uppercase tracking-wider font-semibold hover:bg-[#49332D] hover:text-[#F7F3ED]"
                >
                  Set: Dispatched
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateFulfillment('delivered')}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-emerald-800"
                >
                  Set: Delivered
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdatePayment(selectedOrder.paymentStatus === 'verified' ? 'pending' : 'verified')}
                  className="px-3 py-1.5 border border-[#E7DCCE] text-[#49332D] text-[10px] uppercase tracking-wider font-semibold hover:bg-[#F7F3ED]"
                >
                  Toggle Payment: {selectedOrder.paymentStatus === 'verified' ? 'Mark Pending' : 'Mark Verified'}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderCancelModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-100 text-rose-800 text-[10px] uppercase tracking-wider font-semibold hover:bg-rose-200"
                >
                  Cancel Commission
                </button>
              </div>
            </div>

            {/* Audit History Log */}
            <div className="border-t border-[#E7DCCE] pt-4 space-y-2 text-xs">
              <span className="font-semibold text-[#49332D] block">Commission Audit Log</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] text-[#49332D]/70">
                {selectedOrder.statusHistory.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#49332D]/40">[{new Date(h.timestamp).toLocaleTimeString()}]</span>
                    <span className="font-medium text-[#49332D]">{h.status}:</span>
                    <span>{h.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ORDER CANCELLATION MODAL ================= */}
      {orderCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7DCCE] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif-editorial text-xl">Cancel Commission Order</h3>
            </div>
            <p className="text-xs text-[#49332D]/75 leading-relaxed">
              Cancelling order <strong>{selectedOrder.id}</strong> will freeze fulfillment and record an official administrative cancellation reason.
            </p>
            <div>
              <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Cancellation Reason*</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Patron requested cancellation prior to leather cutting."
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7DCCE]">
              <button
                type="button"
                onClick={() => setOrderCancelModalOpen(false)}
                className="px-4 py-2 border border-[#E7DCCE] text-xs uppercase tracking-wider text-[#49332D]"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={!cancelReasonInput.trim()}
                onClick={handleConfirmCancelOrder}
                className="px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCT DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7DCCE] max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <AlertTriangle className="w-8 h-8 text-rose-700 mx-auto" />
            <h3 className="font-serif-editorial text-2xl text-[#49332D]">Confirm Silhouette Deletion</h3>
            <p className="text-xs text-[#49332D]/75 leading-relaxed">
              Are you certain you wish to remove <strong>{deleteConfirmProduct.name}</strong> from the catalog and database? This action is permanent.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 border border-[#E7DCCE] text-xs uppercase tracking-wider text-[#49332D]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteProduct}
                className="px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COLLECTION DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirmCollection && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7DCCE] max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <AlertTriangle className="w-8 h-8 text-rose-700 mx-auto" />
            <h3 className="font-serif-editorial text-2xl text-[#49332D]">Delete Collection Chapter</h3>
            <p className="text-xs text-[#49332D]/75 leading-relaxed">
              Remove editorial collection <strong>{deleteConfirmCollection.name}</strong>? Silhouettes assigned to this collection will remain safe.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmCollection(null)}
                className="px-4 py-2 border border-[#E7DCCE] text-xs uppercase tracking-wider text-[#49332D]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCollection}
                className="px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
