import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  Check, 
  Truck 
} from 'lucide-react';
import { CartItem, Currency, BrandSettings } from '../types';
import { storeService } from '../services/storeService';

interface CartViewProps {
  cart: CartItem[];
  currency: Currency;
  brandSettings: BrandSettings;
  onUpdateQuantity: (productId: string, variantId: string, qty: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onNavigateToProduct: (productId: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  currency,
  brandSettings,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
  onNavigateToProduct,
}) => {
  const [giftWrapping, setGiftWrapping] = useState(true);
  const [giftNote, setGiftNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPKR, setCouponDiscountPKR] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotalPKR = storeService.getCartSubtotalPKR();
  const thresholdPKR = brandSettings.freeShippingThresholdPKR;
  const progressPercent = Math.min(100, Math.round((subtotalPKR / thresholdPKR) * 100));
  const diffToFreePKR = Math.max(0, thresholdPKR - subtotalPKR);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = storeService.validateCoupon(couponCode, subtotalPKR);
    if (res.valid) {
      setAppliedCoupon(res.coupon?.code || couponCode.toUpperCase());
      setCouponDiscountPKR(res.discountPKR);
      setCouponError(null);
    } else {
      setCouponError(res.error || 'Invalid privilege code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountPKR(0);
    setCouponCode('');
    setCouponError(null);
  };

  const finalTotalPKR = Math.max(0, subtotalPKR - couponDiscountPKR);

  if (cart.length === 0) {
    return (
      <div className="w-full bg-[#F7F3ED] py-24 px-6 sm:px-12 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#E7DCCE]/50 flex items-center justify-center mx-auto text-[#632F39]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D]">Your Shopping Bag is Vacant</h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 max-w-md mx-auto leading-relaxed">
          Explore our permanent silhouettes sculpted from single-origin Tuscan boxcalf and French bullcalf leathers.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={onContinueShopping}
            className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3.5 px-8 transition-colors cursor-pointer"
          >
            Explore Atelier Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F7F3ED] py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E7DCCE] gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold block">
            Maison Bag Dossier
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] mt-1 font-light">
            Your Selected Pieces
          </h1>
        </div>
        <button
          onClick={onContinueShopping}
          className="text-xs uppercase tracking-wider text-[#49332D]/70 hover:text-[#632F39] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Browsing Atelier</span>
        </button>
      </div>

      {/* Free Shipping Threshold Banner */}
      <div className="bg-white border border-[#E7DCCE] p-4 sm:p-5 mb-8 shadow-2xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B49A72]" />
            {diffToFreePKR > 0 ? (
              <span className="text-[#49332D]">
                Add <strong className="font-semibold text-[#632F39]">{storeService.formatPrice(diffToFreePKR, currency)}</strong> more to receive <strong>Complimentary White-Glove Delivery</strong> across Pakistan & Worldwide
              </span>
            ) : (
              <span className="text-[#632F39] font-medium">
                Complimentary White-Glove Courier Delivery unlocked for this commission
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-[#49332D]/60 hidden sm:inline">
            Threshold: Rs. {thresholdPKR.toLocaleString()} PKR
          </span>
        </div>
        <div className="w-full bg-[#E7DCCE] h-1.5 overflow-hidden">
          <div 
            className="bg-[#632F39] h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Cart Items (7 cols) + Order Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Items List & Gifting (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#E7DCCE] shadow-xs divide-y divide-[#E7DCCE]">
            {cart.map((item) => {
              const activePricePKR = item.product.salePricePKR || item.product.pricePKR;
              const itemTotalPKR = activePricePKR * item.quantity;
              const variant = item.product.variants.find(v => v.id === item.variantId) || item.product.variants[0];

              return (
                <div key={`${item.productId}-${item.variantId}`} className="p-6 flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <img
                    src={variant.image || item.product.images[0]}
                    alt={item.product.name}
                    onClick={() => onNavigateToProduct(item.productId)}
                    className="w-full sm:w-28 aspect-4/5 object-cover bg-[#F7F3ED] border border-[#E7DCCE] cursor-pointer shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-[#49332D]/60 uppercase tracking-wider block">
                            {item.product.silhouette} Archetype
                          </span>
                          <h3 
                            onClick={() => onNavigateToProduct(item.productId)}
                            className="font-serif-editorial text-xl sm:text-2xl text-[#49332D] hover:text-[#632F39] cursor-pointer"
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-[#49332D]/60 italic font-serif-editorial mt-0.5">
                            {item.product.frenchSubtitle}
                          </p>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.productId, item.variantId)}
                          className="text-[#49332D]/40 hover:text-[#632F39] transition-colors p-1"
                          title="Remove piece"
                          aria-label="Remove piece from bag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant shade specification */}
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" 
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <span className="text-[#49332D]/70">Selected Shade:</span>
                        <strong className="text-[#49332D] font-medium">{item.selectedColor}</strong>
                        <span className="text-[#49332D]/30">·</span>
                        <span className="font-mono text-[11px] text-[#49332D]/60">SKU: {variant.sku}</span>
                      </div>
                    </div>

                    {/* Stepper & Price Row */}
                    <div className="mt-6 pt-4 border-t border-[#E7DCCE]/60 flex items-center justify-between">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#E7DCCE] bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#49332D] hover:bg-[#F7F3ED] text-xs font-semibold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-xs font-semibold text-[#49332D]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#49332D] hover:bg-[#F7F3ED] text-xs font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <span className="text-base font-semibold text-[#49332D]">
                          {storeService.formatPrice(itemTotalPKR, currency)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[10px] text-[#49332D]/50">
                            {storeService.formatPrice(activePricePKR, currency)} each
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Bespoke Gifting & Monogramming Option */}
          <div className="bg-white border border-[#E7DCCE] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-[#B49A72]" />
              <div>
                <h4 className="font-serif-editorial text-lg text-[#49332D]">Bespoke Hard-Box Packaging & Calligraphy</h4>
                <p className="text-xs text-[#49332D]/70 font-light">
                  Each creation is enclosed in our champagne-trimmed hard gift box with custom satin ribbon at no additional fee.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-[#49332D] cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={giftWrapping}
                onChange={(e) => setGiftWrapping(e.target.checked)}
                className="accent-[#632F39] w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Include handwritten atelier gift card with bespoke message</span>
            </label>

            {giftWrapping && (
              <div className="pt-2">
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Enter recipient name and brief personal greeting..."
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                />
              </div>
            )}
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#49332D]/70">
            <div className="flex items-center gap-2.5 p-3 bg-white/60 border border-[#E7DCCE]">
              <Truck className="w-4 h-4 text-[#B49A72] shrink-0" />
              <span>Insured TCS & Leopards Delivery with COD option</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-white/60 border border-[#E7DCCE]">
              <ShieldCheck className="w-4 h-4 text-[#B49A72] shrink-0" />
              <span>14-day return privilege & Certificate of Origin</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E7DCCE] p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-serif-editorial text-2xl text-[#49332D] pb-3 border-b border-[#E7DCCE]">
              Commission Summary
            </h3>

            {/* Privilege Promo Code */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#F7F3ED] p-3 text-xs text-[#632F39] border border-[#E7DCCE]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-[#B49A72]" />
                    <span>Privilege Code: <strong>{appliedCoupon}</strong> (-{storeService.formatPrice(couponDiscountPKR, currency)})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[#49332D]/60 hover:text-[#632F39] text-xs underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Privilege Code (e.g. MAISON10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-[#632F39] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600">{couponError}</p>
                  )}
                  <p className="text-[10px] text-[#49332D]/50">
                    Use <strong>MAISON10</strong> for 10% off or <strong>ATELIERVIP</strong> for Rs. 10,000 credit.
                  </p>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-3 border-t border-[#E7DCCE] text-xs">
              <div className="flex justify-between text-[#49332D]/80">
                <span>Items Subtotal</span>
                <span>{storeService.formatPrice(subtotalPKR, currency)}</span>
              </div>

              {couponDiscountPKR > 0 && (
                <div className="flex justify-between text-[#632F39] font-medium">
                  <span>Privilege Reduction</span>
                  <span>-{storeService.formatPrice(couponDiscountPKR, currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#49332D]/80">
                <span>Estimated Courier Logistics</span>
                <span>
                  {diffToFreePKR === 0 ? 'COMPLIMENTARY' : 'Calculated at checkout'}
                </span>
              </div>

              <div className="flex justify-between text-[#49332D]/80">
                <span>Bespoke Gifting Presentation</span>
                <span className="text-emerald-800 font-medium">Included</span>
              </div>

              <div className="pt-4 border-t border-[#E7DCCE] flex justify-between items-baseline text-base font-semibold text-[#49332D]">
                <span>Authoritative Subtotal</span>
                <span className="text-2xl text-[#632F39]">
                  {storeService.formatPrice(finalTotalPKR, currency)}
                </span>
              </div>

              <p className="text-[10px] text-[#49332D]/50 text-right">
                PKR base: Rs. {finalTotalPKR.toLocaleString()} · Regional taxes included
              </p>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={onProceedToCheckout}
              className="w-full bg-[#632F39] text-[#F7F3ED] py-4 px-6 text-xs uppercase tracking-widest font-medium hover:bg-[#49332D] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-[#49332D]/60 text-center leading-relaxed">
              White-glove courier dispatch across Pakistan (Karachi, Lahore, Islamabad, etc.) & worldwide express via DHL.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};
