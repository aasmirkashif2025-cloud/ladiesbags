import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { CartItem, Currency, BrandSettings } from '../types';
import { storeService } from '../services/storeService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: Currency;
  brandSettings: BrandSettings;
  onUpdateQuantity: (productId: string, variantId: string, qty: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onCheckout: () => void;
  onNavigateToShop: () => void;
  onViewFullCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currency,
  brandSettings,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onNavigateToShop,
  onViewFullCart,
}) => {
  if (!isOpen) return null;

  const subtotalPKR = storeService.getCartSubtotalPKR();
  const thresholdPKR = brandSettings.freeShippingThresholdPKR;
  const progressPercent = Math.min(100, Math.round((subtotalPKR / thresholdPKR) * 100));
  const diffToFreePKR = Math.max(0, thresholdPKR - subtotalPKR);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#49332D]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#F7F3ED] shadow-2xl flex flex-col z-50">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E7DCCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#632F39]" />
            <h2 className="font-serif-editorial text-2xl text-[#49332D] tracking-tight">Shopping Bag</h2>
            <span className="text-xs text-[#49332D]/60 font-sans">
              ({cart.reduce((s, i) => s + i.quantity, 0)} {cart.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#49332D]/70 hover:text-[#632F39] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#E7DCCE]/40 p-4 border-b border-[#E7DCCE]">
          {diffToFreePKR > 0 ? (
            <p className="text-xs text-[#49332D] mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B49A72]" />
              <span>Add <strong className="font-medium text-[#632F39]">{storeService.formatPrice(diffToFreePKR, currency)}</strong> more for complimentary white-glove shipping</span>
            </p>
          ) : (
            <p className="text-xs text-[#632F39] font-medium mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B49A72]" />
              <span>Complimentary White-Glove Shipping unlocked</span>
            </p>
          )}
          <div className="w-full bg-[#E7DCCE] h-1.5 overflow-hidden">
            <div 
              className="bg-[#632F39] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="font-serif-editorial text-2xl text-[#49332D]/70 italic">Your bag is currently vacant</p>
              <p className="text-xs text-[#49332D]/60 max-w-xs mx-auto">
                Explore our masterwork silhouettes crafted from hand-curated Tuscan boxcalf and fine leathers.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToShop();
                }}
                className="mt-4 inline-block bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-wider py-3 px-6 hover:bg-[#632F39] transition-colors"
              >
                Discover Collection
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const activePricePKR = item.product.salePricePKR || item.product.pricePKR;
              return (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 pb-6 border-b border-[#E7DCCE]">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name}
                    className="w-20 h-24 object-cover object-center bg-white border border-[#E7DCCE]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-serif-editorial text-lg text-[#49332D] leading-tight">
                          {item.product.name}
                        </h4>
                        <button 
                          onClick={() => onRemoveItem(item.productId, item.variantId)}
                          className="text-[#49332D]/40 hover:text-[#632F39] transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#49332D]/60 mt-0.5">
                        Color: <span className="text-[#49332D] font-medium">{item.selectedColor}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#E7DCCE] bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#49332D] hover:bg-[#F7F3ED] text-xs font-semibold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-[#49332D]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#49332D] hover:bg-[#F7F3ED] text-xs font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-medium text-[#49332D]">
                        {storeService.formatPrice(activePricePKR * item.quantity, currency)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E7DCCE] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#49332D]/70">Subtotal</span>
              <span className="font-semibold text-lg text-[#49332D]">
                {storeService.formatPrice(subtotalPKR, currency)}
              </span>
            </div>

            <p className="text-[11px] text-[#49332D]/60">
              Shipping, luxury gift wrapping, and regional taxes calculated at checkout.
            </p>

            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full bg-[#632F39] text-[#F7F3ED] py-3.5 px-4 text-xs uppercase tracking-widest font-medium hover:bg-[#49332D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onViewFullCart && (
              <button
                onClick={() => {
                  onClose();
                  onViewFullCart();
                }}
                className="w-full text-center text-xs text-[#632F39] hover:underline font-medium cursor-pointer"
              >
                View Full Shopping Bag Dossier
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-[#49332D]/70 hover:text-[#49332D] hover:underline cursor-pointer"
            >
              Continue Browsing Atelier
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
