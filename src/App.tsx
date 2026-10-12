import React, { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  Collection, 
  Order, 
  BrandSettings, 
  HeroSlide, 
  DiscountCoupon, 
  Currency, 
  CartItem, 
  UserAccount 
} from './types';
import { storeService } from './services/storeService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CollectionsView } from './views/CollectionsView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { AccountView } from './views/AccountView';
import { OurStoryView, ContactView, FAQView, ShippingReturnsView, PrivacyTermsView } from './views/ContentPages';
import { CartView } from './views/CartView';
import { AdminView } from './views/AdminView';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Store Entities State
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [collections, setCollections] = useState<Collection[]>(() => storeService.getCollections());
  const [orders, setOrders] = useState<Order[]>(() => storeService.getOrders());
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => storeService.getBrandSettings());
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => storeService.getHeroSlides());
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(() => storeService.getCoupons());

  // Interactive Global State
  const [cart, setCart] = useState<CartItem[]>(() => storeService.getCart());
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => storeService.getWishlist());
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => storeService.getCurrency());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storeService.getCurrentUser());

  // Drawer / Modal Visibility
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Synchronize data listener
  const refreshAllData = useCallback(() => {
    setProducts(storeService.getProducts());
    setCollections(storeService.getCollections());
    setOrders(storeService.getOrders());
    setBrandSettings(storeService.getBrandSettings());
    setHeroSlides(storeService.getHeroSlides());
    setCoupons(storeService.getCoupons());
    setCart(storeService.getCart());
    setWishlistIds(storeService.getWishlist());
    setCurrentCurrency(storeService.getCurrency());
    setCurrentUser(storeService.getCurrentUser());
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => setCart(storeService.getCart());
    const handleWishlistUpdate = () => setWishlistIds(storeService.getWishlist());
    const handleCurrencyUpdate = () => setCurrentCurrency(storeService.getCurrency());
    const handleAuthUpdate = () => setCurrentUser(storeService.getCurrentUser());
    const handleStoreUpdate = () => refreshAllData();

    window.addEventListener('maison_cart_updated', handleCartUpdate);
    window.addEventListener('maison_wishlist_updated', handleWishlistUpdate);
    window.addEventListener('maison_currency_updated', handleCurrencyUpdate);
    window.addEventListener('maison_auth_updated', handleAuthUpdate);
    window.addEventListener('maison_store_updated', handleStoreUpdate);

    return () => {
      window.removeEventListener('maison_cart_updated', handleCartUpdate);
      window.removeEventListener('maison_wishlist_updated', handleWishlistUpdate);
      window.removeEventListener('maison_currency_updated', handleCurrencyUpdate);
      window.removeEventListener('maison_auth_updated', handleAuthUpdate);
      window.removeEventListener('maison_store_updated', handleStoreUpdate);
    };
  }, [refreshAllData]);

  // Navigate Handler with scroll-to-top
  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    setViewParam(param);

    if (view === 'product' && param) {
      const prod = storeService.getProductBySlug(param) || storeService.getProductById(param);
      if (prod) setSelectedProduct(prod);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    setViewParam(product.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, variantId: string, qty = 1) => {
    storeService.addToCart(product, variantId, qty);
    setCart(storeService.getCart());
    setCartOpen(true);
  };

  const handleBuyNow = (product: Product, variantId: string, qty = 1) => {
    storeService.addToCart(product, variantId, qty);
    setCart(storeService.getCart());
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string, qty: number) => {
    storeService.updateCartQuantity(productId, variantId, qty);
    setCart(storeService.getCart());
  };

  const handleRemoveFromCart = (productId: string, variantId: string) => {
    storeService.removeFromCart(productId, variantId);
    setCart(storeService.getCart());
  };

  // Wishlist Handler
  const handleToggleWishlist = (productId: string) => {
    storeService.toggleWishlist(productId);
    setWishlistIds(storeService.getWishlist());
  };

  // Currency Handler
  const handleCurrencyChange = (c: Currency) => {
    storeService.setCurrency(c);
    setCurrentCurrency(c);
  };

  // Order Handlers
  const handleOrderCompleted = (order: Order) => {
    setConfirmedOrder(order);
    setOrders(storeService.getOrders());
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3ED] text-[#49332D]">
      
      {/* Global Header */}
      <Header
        brandSettings={brandSettings}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            slides={heroSlides}
            products={products}
            collections={collections}
            currency={currentCurrency}
            brandSettings={brandSettings}
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={products}
            collections={collections}
            currency={currentCurrency}
            initialFilter={viewParam}
            onSelectProduct={handleSelectProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        )}

        {currentView === 'product' && (
          selectedProduct ? (
            <ProductDetailView
              product={selectedProduct}
              currency={currentCurrency}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={wishlistIds.includes(selectedProduct.id)}
              onNavigateToProduct={handleSelectProduct}
              onNavigateBackToShop={() => handleNavigate('shop')}
              relatedProducts={products.filter(p => p.id !== selectedProduct.id && p.silhouette === selectedProduct.silhouette)}
            />
          ) : (
            <div className="py-20 text-center">
              <p className="font-serif-editorial text-2xl text-[#49332D]">Silhouette not located</p>
              <button 
                onClick={() => handleNavigate('shop')} 
                className="mt-4 bg-[#49332D] text-[#F7F3ED] text-xs uppercase py-3 px-6"
              >
                Return to Shop
              </button>
            </div>
          )
        )}

        {currentView === 'collections' && (
          <CollectionsView
            collections={collections}
            products={products}
            currency={currentCurrency}
            initialCollectionSlug={viewParam}
            onSelectCollection={(c) => handleNavigate('collections', c.slug)}
            onSelectProduct={handleSelectProduct}
            onNavigateToShop={(f) => handleNavigate('shop', f)}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            cart={cart}
            currency={currentCurrency}
            brandSettings={brandSettings}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onProceedToCheckout={() => handleNavigate('checkout')}
            onContinueShopping={() => handleNavigate('shop')}
            onNavigateToProduct={(prodId) => {
              const p = storeService.getProductById(prodId);
              if (p) handleSelectProduct(p);
            }}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            currency={currentCurrency}
            brandSettings={brandSettings}
            onOrderCompleted={handleOrderCompleted}
            onNavigateBack={() => handleNavigate('cart')}
          />
        )}

        {currentView === 'confirmation' && confirmedOrder && (
          <OrderConfirmationView
            order={confirmedOrder}
            currency={currentCurrency}
            onTrackOrder={(orderId) => {
              setViewParam(orderId);
              setCurrentView('track-order');
            }}
            onContinueShopping={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'track-order' && (
          <OrderTrackingView
            initialOrderId={viewParam}
            currency={currentCurrency}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            currentUser={currentUser}
            currency={currentCurrency}
            onNavigateToTracking={(orderId) => {
              setViewParam(orderId);
              setCurrentView('track-order');
            }}
            onNavigateToAdmin={() => setCurrentView('admin')}
            onUserChanged={(u) => setCurrentUser(u)}
          />
        )}

        {currentView === 'story' && (
          <OurStoryView
            brandSettings={brandSettings}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'contact' && (
          <ContactView
            brandSettings={brandSettings}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'faq' && (
          <FAQView
            brandSettings={brandSettings}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'shipping' && (
          <ShippingReturnsView
            brandSettings={brandSettings}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyTermsView
            brandSettings={brandSettings}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            products={products}
            collections={collections}
            orders={orders}
            brandSettings={brandSettings}
            heroSlides={heroSlides}
            coupons={coupons}
            currency={currentCurrency}
            currentUser={currentUser}
            onRefreshData={refreshAllData}
            onNavigateToStorefront={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        currency={currentCurrency}
        brandSettings={brandSettings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setCartOpen(false);
          handleNavigate('checkout');
        }}
        onViewFullCart={() => {
          setCartOpen(false);
          handleNavigate('cart');
        }}
        onNavigateToShop={() => handleNavigate('shop')}
      />

      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        currency={currentCurrency}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p, vId) => {
          handleAddToCart(p, vId);
          setWishlistOpen(false);
        }}
        onSelectProduct={handleSelectProduct}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        currency={currentCurrency}
        onSelectProduct={handleSelectProduct}
        onNavigateToCategory={(cat) => handleNavigate('shop', cat)}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        currency={currentCurrency}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onViewFullDetails={handleSelectProduct}
      />

      {/* Global Footer (shown on all public views, discreet on admin) */}
      {currentView !== 'admin' && (
        <Footer
          brandSettings={brandSettings}
          currentCurrency={currentCurrency}
          onCurrencyChange={handleCurrencyChange}
          onNavigate={handleNavigate}
        />
      )}

    </div>
  );
}
