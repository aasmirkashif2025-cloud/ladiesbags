export type Currency = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export type Silhouette = 
  | 'tote' 
  | 'shoulder' 
  | 'crossbody' 
  | 'top-handle' 
  | 'mini' 
  | 'evening';

export interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  frenchSubtitle: string;
  silhouette: Silhouette;
  pricePKR: number;
  salePricePKR?: number;
  collectionId: string;
  isNewArrival: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  description: string;
  editorialQuote: string;
  materials: {
    leatherType: string;
    hardware: string;
    lining: string;
    origin: string;
  };
  dimensions: {
    widthCm: number;
    heightCm: number;
    depthCm: number;
    strapDropCm?: number;
  };
  careInstructions: string[];
  images: string[];
  variants: ProductVariant[];
  inStock: boolean;
  totalInventory: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  tags: string[];
  isPublished?: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  heroImage: string;
  productCount: number;
  featured: boolean;
  displayOrder?: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  selectedColor: string;
  product: Product;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  provinceState: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = 'cod' | 'raast_bank' | 'card';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'in_atelier' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItemSummary {
  productId: string;
  productName: string;
  variantColor: string;
  sku: string;
  priceCharged: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. ME-2026-9281
  customerId?: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItemSummary[];
  currency: Currency;
  currencyRate: number;
  subtotalPKR: number;
  shippingFeePKR: number;
  discountPKR: number;
  taxPKR?: number;
  totalPKR: number;
  subtotalCharged: number;
  shippingFeeCharged: number;
  discountCharged: number;
  taxCharged?: number;
  totalCharged: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: string;
  statusHistory: {
    timestamp: string;
    status: FulfillmentStatus | PaymentStatus;
    note: string;
  }[];
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

export interface DiscountCoupon {
  code: string;
  type: 'percent' | 'fixed_pkr';
  value: number;
  minOrderPKR?: number;
  expiryDate?: string;
  isActive: boolean;
  description: string;
}

export interface HomepageSectionVisibility {
  hero: boolean;
  manifesto: boolean;
  featuredCapsule: boolean;
  bestsellers: boolean;
  craftsmanship: boolean;
  reviews: boolean;
  newsletter: boolean;
}

export interface BrandSettings {
  brandName: string;
  brandTagline: string;
  atelierLocation: string;
  announcementActive: boolean;
  announcementText: string;
  primaryCurrency: Currency;
  contactEmail: string;
  contactPhone: string;
  whatsappConcierge: string;
  freeShippingThresholdPKR: number;
  
  // Shipping rates
  domesticShippingFeePKR?: number;
  expressDomesticShippingFeePKR?: number;
  internationalShippingFeePKR?: number;
  taxRatePercent?: number;

  // Regional Payment configuration
  codEnabled?: boolean;
  bankTransferEnabled?: boolean;
  cardEnabled?: boolean;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    iban: string;
    raastId: string;
  };

  // Payment gateway evaluation & credentials
  paymentGatewayConfig?: {
    provider: 'paymob_pk' | 'safepay' | 'stripe_intl' | 'pending';
    mode: 'sandbox' | 'live';
    merchantId?: string;
    publicKey?: string;
    isApproved: boolean;
    setupInstructionsPending: boolean;
  };

  // SEO metadata
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;

  // Homepage sections visibility & merchandising
  sectionVisibility?: HomepageSectionVisibility;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  accentQuote?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'admin';
  savedAddresses: ShippingAddress[];
  createdAt: string;
}
