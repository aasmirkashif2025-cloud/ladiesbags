import { 
  Product, 
  Collection, 
  HeroSlide, 
  BrandSettings, 
  DiscountCoupon, 
  Review, 
  Order, 
  CartItem, 
  Currency, 
  PaymentMethod, 
  ShippingAddress,
  UserAccount
} from '../types';
import { 
  INITIAL_BRAND_SETTINGS, 
  INITIAL_COLLECTIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_HERO_SLIDES, 
  INITIAL_COUPONS, 
  INITIAL_REVIEWS, 
  INITIAL_ORDERS,
  CURRENCY_RATES 
} from '../data/initialData';
import { firebaseStore } from './firebaseStore';

const STORAGE_KEYS = {
  PRODUCTS: 'maison_elan_products_v1',
  COLLECTIONS: 'maison_elan_collections_v1',
  ORDERS: 'maison_elan_orders_v1',
  REVIEWS: 'maison_elan_reviews_v1',
  COUPONS: 'maison_elan_coupons_v1',
  BRAND_SETTINGS: 'maison_elan_brand_settings_v1',
  HERO_SLIDES: 'maison_elan_hero_slides_v1',
  CART: 'maison_elan_cart_v1',
  WISHLIST: 'maison_elan_wishlist_v1',
  CURRENT_USER: 'maison_elan_current_user_v1',
  CURRENCY: 'maison_elan_currency_v1',
};

// In-memory fallback map for Node/testing or non-browser environments
const inMemoryStore = new Map<string, string>();

// Helper for local storage with fallback
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    }
    const memItem = inMemoryStore.get(key);
    if (!memItem) return defaultValue;
    return JSON.parse(memItem) as T;
  } catch (err) {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      inMemoryStore.set(key, JSON.stringify(value));
    }
    emitEvent('maison_store_updated', { key });
  } catch {
    // Graceful silent fallback
  }
}

function emitEvent(eventName: string, detail: any = {}): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    } catch {
      // Ignore
    }
  }
}

class StoreService {
  private firestoreInitialized = false;

  constructor() {
    this.initFirebase();
  }

  // FIREBASE INITIALIZATION & HYDRATION
  async initFirebase(): Promise<void> {
    if (this.firestoreInitialized) return;
    this.firestoreInitialized = true;

    try {
      await firebaseStore.init();

      // Listen for Firebase Auth state changes
      firebaseStore.subscribeAuth((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      });

      // Fetch Firestore products in background and sync
      const remoteProducts = await firebaseStore.getProducts();
      if (remoteProducts.length > 0) {
        saveToStorage(STORAGE_KEYS.PRODUCTS, remoteProducts);
      } else {
        // First-run: auto-seed catalog to Firestore if admin or silently skip
        try {
          await firebaseStore.seedInitialCatalog();
        } catch {
          // Handled gracefully if writes are restricted to authenticated admins
        }
      }

      // Sync collections
      const remoteCollections = await firebaseStore.getCollections();
      if (remoteCollections.length > 0) {
        saveToStorage(STORAGE_KEYS.COLLECTIONS, remoteCollections);
      }

      // Sync settings
      const remoteSettings = await firebaseStore.getBrandSettings();
      if (remoteSettings) {
        saveToStorage(STORAGE_KEYS.BRAND_SETTINGS, remoteSettings);
      }
    } catch (err) {
      console.info('Firestore offline or seeding in background:', err);
    }
  }

  async syncWithFirestore(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await firebaseStore.seedInitialCatalog();
      return {
        success: true,
        message: `Successfully synced ${result.products} products, ${result.collections} collections, and active promotions to Cloud Firestore.`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Firestore sync failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // BRAND SETTINGS
  getBrandSettings(): BrandSettings {
    return loadFromStorage(STORAGE_KEYS.BRAND_SETTINGS, INITIAL_BRAND_SETTINGS);
  }

  updateBrandSettings(newSettings: Partial<BrandSettings>): BrandSettings {
    const current = this.getBrandSettings();
    const updated = { ...current, ...newSettings };
    saveToStorage(STORAGE_KEYS.BRAND_SETTINGS, updated);
    
    // Background sync to Firestore
    firebaseStore.saveBrandSettings(updated).catch(err => console.warn('Firestore settings sync:', err));
    return updated;
  }

  // HERO SLIDES
  getHeroSlides(): HeroSlide[] {
    return loadFromStorage(STORAGE_KEYS.HERO_SLIDES, INITIAL_HERO_SLIDES);
  }

  updateHeroSlides(slides: HeroSlide[]): void {
    saveToStorage(STORAGE_KEYS.HERO_SLIDES, slides);
  }

  // PRODUCTS
  getProducts(): Product[] {
    return loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  getProductBySlug(slug: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Sync to Firestore
    firebaseStore.saveProduct(product).catch(err => console.warn('Firestore product sync:', err));
    return product;
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Sync to Firestore
    firebaseStore.deleteProduct(id).catch(err => console.warn('Firestore product delete:', err));
  }

  duplicateProduct(id: string): Product | undefined {
    const original = this.getProductById(id);
    if (!original) return undefined;

    const newProduct: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      name: `${original.name} (Copy)`,
      frenchSubtitle: `${original.frenchSubtitle} · Édition`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return this.saveProduct(newProduct);
  }

  // COLLECTIONS
  getCollections(): Collection[] {
    return loadFromStorage(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
  }

  getCollectionBySlug(slug: string): Collection | undefined {
    const collections = this.getCollections();
    return collections.find(c => c.slug === slug);
  }

  saveCollection(col: Collection): Collection {
    const collections = this.getCollections();
    const idx = collections.findIndex(c => c.id === col.id);
    if (idx >= 0) {
      collections[idx] = col;
    } else {
      collections.push(col);
    }
    saveToStorage(STORAGE_KEYS.COLLECTIONS, collections);

    // Sync to Firestore
    firebaseStore.saveCollection(col).catch(err => console.warn('Firestore collection sync:', err));
    return col;
  }

  deleteCollection(id: string): void {
    const collections = this.getCollections().filter(c => c.id !== id && c.slug !== id);
    saveToStorage(STORAGE_KEYS.COLLECTIONS, collections);
  }

  // CART
  getCart(): CartItem[] {
    return loadFromStorage<CartItem[]>(STORAGE_KEYS.CART, []);
  }

  addToCart(product: Product, variantId: string, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const liveProduct = this.getProductById(product.id) || product;
    const variant = liveProduct.variants.find(v => v.id === variantId) || liveProduct.variants[0];
    const availableStock = variant?.stock ?? 10;
    const existingIndex = cart.findIndex(item => item.productId === liveProduct.id && item.variantId === variant.id);

    if (existingIndex >= 0) {
      const targetQty = cart[existingIndex].quantity + quantity;
      cart[existingIndex].quantity = Math.min(targetQty, Math.max(1, availableStock));
    } else {
      cart.push({
        productId: liveProduct.id,
        variantId: variant.id,
        quantity: Math.min(quantity, Math.max(1, availableStock)),
        selectedColor: variant.colorName,
        product: liveProduct,
      });
    }

    saveToStorage(STORAGE_KEYS.CART, cart);
    emitEvent('maison_cart_updated', { count: this.getCartCount() });
    return cart;
  }

  updateCartQuantity(productId: string, variantId: string, quantity: number): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => !(item.productId === productId && item.variantId === variantId));
    } else {
      const item = cart.find(i => i.productId === productId && i.variantId === variantId);
      if (item) {
        const liveProduct = this.getProductById(productId);
        const variant = liveProduct?.variants.find(v => v.id === variantId);
        const availableStock = variant?.stock ?? 99;
        item.quantity = Math.min(quantity, Math.max(1, availableStock));
      }
    }
    saveToStorage(STORAGE_KEYS.CART, cart);
    emitEvent('maison_cart_updated', { count: this.getCartCount() });
    return cart;
  }

  removeFromCart(productId: string, variantId: string): CartItem[] {
    const cart = this.getCart().filter(item => !(item.productId === productId && item.variantId === variantId));
    saveToStorage(STORAGE_KEYS.CART, cart);
    emitEvent('maison_cart_updated', { count: this.getCartCount() });
    return cart;
  }

  clearCart(): void {
    saveToStorage(STORAGE_KEYS.CART, []);
    emitEvent('maison_cart_updated', { count: 0 });
  }

  getCartCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotalPKR(): number {
    const cart = this.getCart();
    return cart.reduce((sum, item) => {
      const price = item.product.salePricePKR || item.product.pricePKR;
      return sum + (price * item.quantity);
    }, 0);
  }

  // WISHLIST
  getWishlist(): string[] {
    return loadFromStorage<string[]>(STORAGE_KEYS.WISHLIST, ['prod-1', 'prod-5']);
  }

  toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const exists = list.includes(productId);
    let updated: string[];
    if (exists) {
      updated = list.filter(id => id !== productId);
    } else {
      updated = [...list, productId];
    }
    saveToStorage(STORAGE_KEYS.WISHLIST, updated);
    emitEvent('maison_wishlist_updated', { count: updated.length });
    return !exists;
  }

  isInWishlist(productId: string): boolean {
    return this.getWishlist().includes(productId);
  }

  // COUPONS
  getCoupons(): DiscountCoupon[] {
    return loadFromStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }

  validateCoupon(code: string, subtotalPKR: number): { valid: boolean; coupon?: DiscountCoupon; discountPKR: number; error?: string } {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!coupon) {
      return { valid: false, discountPKR: 0, error: 'Invalid or inactive privilege code' };
    }

    if (coupon.minOrderPKR && subtotalPKR < coupon.minOrderPKR) {
      return { 
        valid: false, 
        discountPKR: 0, 
        error: `Order minimum of Rs. ${coupon.minOrderPKR.toLocaleString()} required for this code` 
      };
    }

    let discountPKR = 0;
    if (coupon.type === 'percent') {
      discountPKR = Math.round((subtotalPKR * coupon.value) / 100);
    } else {
      discountPKR = coupon.value;
    }

    return { valid: true, coupon, discountPKR };
  }

  saveCoupon(coupon: DiscountCoupon): void {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.code === coupon.code);
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    saveToStorage(STORAGE_KEYS.COUPONS, coupons);

    // Sync to Firestore
    firebaseStore.saveCoupon(coupon).catch(err => console.warn('Firestore coupon sync:', err));
  }

  deleteCoupon(code: string): void {
    const coupons = this.getCoupons().filter(c => c.code.toUpperCase() !== code.toUpperCase());
    saveToStorage(STORAGE_KEYS.COUPONS, coupons);
  }

  // REVIEWS
  getReviews(productId?: string): Review[] {
    const reviews = loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (productId) {
      return reviews.filter(r => r.productId === productId);
    }
    return reviews;
  }

  addReview(review: Omit<Review, 'id' | 'date' | 'status'>): Review {
    const reviews = this.getReviews();
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending', // awaits admin moderation
    };
    reviews.unshift(newRev);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

    // Sync to Firestore
    firebaseStore.addReview(newRev).catch(err => console.warn('Firestore review sync:', err));
    return newRev;
  }

  updateReviewStatus(id: string, status: 'approved' | 'rejected' | 'pending'): void {
    const reviews = this.getReviews();
    const target = reviews.find(r => r.id === id);
    if (target) {
      target.status = status;
      saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

      // Sync to Firestore
      firebaseStore.updateReviewStatus(id, status).catch(err => console.warn('Firestore review status update:', err));
    }
  }

  deleteReview(id: string): void {
    const reviews = this.getReviews().filter(r => r.id !== id);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  }

  // ORDERS
  getOrders(): Order[] {
    return loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id || o.id.toLowerCase() === id.toLowerCase());
  }

  createOrder(payload: {
    customerId?: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    currency: Currency;
    shippingMethod?: 'standard' | 'express';
    couponCode?: string;
    notes?: string;
  }): Order {
    const cart = this.getCart();
    if (cart.length === 0) {
      throw new Error('Shopping bag is empty');
    }

    // Verify stock availability across all commissioned pieces
    const currentProducts = this.getProducts();
    for (const item of cart) {
      const liveProduct = currentProducts.find(p => p.id === item.productId);
      if (!liveProduct) {
        throw new Error(`Silhouettes "${item.product.name}" is currently unavailable in the atelier catalog.`);
      }
      const liveVariant = liveProduct.variants.find(v => v.id === item.variantId);
      if (liveVariant && liveVariant.stock < item.quantity) {
        throw new Error(`Insufficient atelier stock for "${liveProduct.name}" in ${item.selectedColor}. Available: ${liveVariant.stock}, Requested: ${item.quantity}.`);
      }
    }

    const brandSettings = this.getBrandSettings();
    const subtotalPKR = this.getCartSubtotalPKR();
    
    // Server-side authoritative coupon validation
    let discountPKR = 0;
    if (payload.couponCode) {
      const validation = this.validateCoupon(payload.couponCode, subtotalPKR);
      if (validation.valid) {
        discountPKR = validation.discountPKR;
      }
    }

    // Authoritative Shipping calculations based on country & selected method
    const isDomestic = payload.shippingAddress.country.toLowerCase() === 'pakistan';
    let shippingFeePKR = 0;
    if (isDomestic) {
      if (payload.shippingMethod === 'express') {
        shippingFeePKR = brandSettings.expressDomesticShippingFeePKR || 1500;
      } else {
        shippingFeePKR = subtotalPKR >= brandSettings.freeShippingThresholdPKR 
            ? 0 
            : (brandSettings.domesticShippingFeePKR || 850);
      }
    } else {
      shippingFeePKR = brandSettings.internationalShippingFeePKR || 12500; // International DHL flat fee
    }

    // Tax calculation where applicable (e.g. PRA/SRB sales tax if configured)
    const taxRatePercent = brandSettings.taxRatePercent || 0;
    const taxableBase = Math.max(0, subtotalPKR - discountPKR);
    const taxPKR = Math.round((taxableBase * taxRatePercent) / 100);

    const totalPKR = Math.max(0, taxableBase + shippingFeePKR + taxPKR);
    const rateInfo = CURRENCY_RATES[payload.currency] || CURRENCY_RATES['PKR'];
    const rate = rateInfo.rate;

    const orderRef = `ME-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentCustomer = this.getCurrentUser();

    const newOrder: Order = {
      id: orderRef,
      customerId: payload.customerId || currentCustomer?.id,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      shippingAddress: payload.shippingAddress,
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        variantColor: item.selectedColor,
        sku: item.product.variants.find(v => v.id === item.variantId)?.sku || 'ME-SKU',
        priceCharged: Math.round((item.product.salePricePKR || item.product.pricePKR) * rate),
        quantity: item.quantity,
        image: item.product.images[0],
      })),
      currency: payload.currency,
      currencyRate: rate,
      subtotalPKR,
      shippingFeePKR,
      discountPKR,
      taxPKR,
      totalPKR,
      subtotalCharged: Math.round(subtotalPKR * rate),
      shippingFeeCharged: Math.round(shippingFeePKR * rate),
      discountCharged: Math.round(discountPKR * rate),
      taxCharged: Math.round(taxPKR * rate),
      totalCharged: Math.round(totalPKR * rate),
      paymentMethod: payload.paymentMethod,
      // COD and Bank transfers require atelier verification or cash handover; sandbox cards mark verified
      paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : (payload.paymentMethod === 'raast_bank' ? 'pending' : 'verified'),
      fulfillmentStatus: 'in_atelier',
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          timestamp: new Date().toISOString(),
          status: payload.paymentMethod === 'cod' ? 'pending' : (payload.paymentMethod === 'raast_bank' ? 'pending' : 'verified'),
          note: payload.paymentMethod === 'cod' 
            ? 'Order registered with Cash on Delivery (COD). Courier will collect funds upon delivery.' 
            : payload.paymentMethod === 'raast_bank'
            ? 'Order registered via Raast / Direct Wire. Awaiting finance team settlement verification.'
            : 'Sandbox test card payment processed with 3D Secure verification.',
        },
        {
          timestamp: new Date().toISOString(),
          status: 'in_atelier',
          note: 'Craftsmen assigned in Atelier de Maroquinerie for inspection and monogramming.',
        },
      ],
    };

    // Decrement inventory in local store and sync to Firestore
    for (const item of cart) {
      const p = currentProducts.find(prod => prod.id === item.productId);
      if (p) {
        const v = p.variants.find(varItem => varItem.id === item.variantId);
        if (v) {
          v.stock = Math.max(0, v.stock - item.quantity);
        }
        p.totalInventory = p.variants.reduce((sum, vr) => sum + vr.stock, 0);
        p.inStock = p.totalInventory > 0;
        this.saveProduct(p);
      }
    }

    const orders = this.getOrders();
    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Persist to Cloud Firestore!
    firebaseStore.createOrder(newOrder).catch(err => {
      console.warn('Cloud Firestore order creation sync error:', err);
    });

    // Empty cart upon successful order
    this.clearCart();

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['fulfillmentStatus'], note: string, trackingNumber?: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.fulfillmentStatus = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      order.carrier = order.shippingAddress.country.toLowerCase() === 'pakistan' ? 'TCS Express White Glove' : 'DHL Express Worldwide';
    }
    order.statusHistory.push({
      timestamp: new Date().toISOString(),
      status,
      note,
    });

    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Sync to Firestore
    firebaseStore.updateOrder(order).catch(err => console.warn('Firestore order status sync:', err));
    return order;
  }

  updatePaymentStatus(orderId: string, status: Order['paymentStatus'], note: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.paymentStatus = status;
    order.statusHistory.push({
      timestamp: new Date().toISOString(),
      status,
      note,
    });

    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Sync to Firestore
    firebaseStore.updateOrder(order).catch(err => console.warn('Firestore payment status sync:', err));
    return order;
  }

  cancelOrder(orderId: string, reason: string): Order | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;

    // If order was not previously cancelled, restore item stocks
    if (order.fulfillmentStatus !== 'cancelled') {
      const products = this.getProducts();
      for (const item of order.items) {
        const p = products.find(prod => prod.id === item.productId);
        if (p) {
          const v = p.variants.find(vr => vr.sku === item.sku || vr.colorName.toLowerCase() === item.variantColor.toLowerCase());
          if (v) {
            v.stock += item.quantity;
          }
          p.totalInventory = p.variants.reduce((sum, vr) => sum + vr.stock, 0);
          p.inStock = p.totalInventory > 0;
          this.saveProduct(p);
        }
      }
    }

    return this.updateOrderStatus(orderId, 'cancelled', `Commission cancelled by atelier administration: ${reason}`);
  }

  getCustomerRecords(): {
    email: string;
    fullName: string;
    phone?: string;
    totalOrders: number;
    totalSpentPKR: number;
    lastOrderDate: string;
    city: string;
    country: string;
  }[] {
    const orders = this.getOrders();
    const map = new Map<string, {
      email: string;
      fullName: string;
      phone?: string;
      totalOrders: number;
      totalSpentPKR: number;
      lastOrderDate: string;
      city: string;
      country: string;
    }>();

    for (const o of orders) {
      const email = o.customerEmail.toLowerCase().trim();
      const existing = map.get(email);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpentPKR += o.totalPKR;
        if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = o.createdAt;
        }
      } else {
        map.set(email, {
          email: o.customerEmail,
          fullName: o.shippingAddress.fullName,
          phone: o.customerPhone,
          totalOrders: 1,
          totalSpentPKR: o.totalPKR,
          lastOrderDate: o.createdAt,
          city: o.shippingAddress.city,
          country: o.shippingAddress.country,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpentPKR - a.totalSpentPKR);
  }

  saveHeroSlide(slide: HeroSlide): void {
    const slides = this.getHeroSlides();
    const idx = slides.findIndex(s => s.id === slide.id);
    if (idx >= 0) {
      slides[idx] = slide;
    } else {
      slides.push(slide);
    }
    this.updateHeroSlides(slides);
  }

  deleteHeroSlide(id: string): void {
    const slides = this.getHeroSlides().filter(s => s.id !== id);
    this.updateHeroSlides(slides);
  }

  // USER / AUTH
  getCurrentUser(): UserAccount | null {
    return loadFromStorage<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, {
      id: 'admin-1',
      email: 'ksarwar78@gmail.com',
      fullName: 'Kamran Sarwar',
      role: 'admin',
      savedAddresses: [
        {
          fullName: 'Kamran Sarwar',
          email: 'ksarwar78@gmail.com',
          phone: '+92 321 445 1199',
          addressLine1: 'Plot 44, Phase 6, DHA',
          city: 'Lahore',
          provinceState: 'Punjab',
          postalCode: '54792',
          country: 'Pakistan',
        }
      ],
      createdAt: '2026-01-01',
    });
  }

  setCurrentUser(user: UserAccount | null): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    emitEvent('maison_auth_updated', { user });
  }

  async signInWithGoogle(): Promise<UserAccount> {
    const user = await firebaseStore.signInWithGoogle();
    this.setCurrentUser(user);
    return user;
  }

  async logout(): Promise<void> {
    try {
      await firebaseStore.signOut();
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    this.setCurrentUser(null);
  }

  loginAsGuest(email: string, name: string): UserAccount {
    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      email,
      fullName: name,
      role: 'customer',
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(user);
    return user;
  }

  // CURRENCY PREFERENCE
  getCurrency(): Currency {
    return loadFromStorage<Currency>(STORAGE_KEYS.CURRENCY, 'PKR');
  }

  setCurrency(currency: Currency): void {
    saveToStorage(STORAGE_KEYS.CURRENCY, currency);
    emitEvent('maison_currency_updated', { currency });
  }

  formatPrice(pkrAmount: number, targetCurrency?: Currency): string {
    const curr = targetCurrency || this.getCurrency();
    const config = CURRENCY_RATES[curr] || CURRENCY_RATES['PKR'];
    const converted = Math.round(pkrAmount * config.rate);

    if (config.prefix) {
      return `${config.symbol}${converted.toLocaleString()}`;
    }
    return `${converted.toLocaleString()} ${config.symbol}`;
  }
}

export const storeService = new StoreService();
