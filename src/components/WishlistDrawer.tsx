import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, Currency } from '../types';
import { storeService } from '../services/storeService';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  currency: Currency;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variantId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  currency,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="fixed inset-0 bg-[#49332D]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#F7F3ED] shadow-2xl flex flex-col z-50">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E7DCCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#632F39] fill-[#632F39]" />
            <h2 className="font-serif-editorial text-2xl text-[#49332D] tracking-tight">Saved Compositions</h2>
            <span className="text-xs text-[#49332D]/60 font-sans">
              ({wishlistProducts.length})
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#49332D]/70 hover:text-[#632F39] transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="font-serif-editorial text-2xl text-[#49332D]/70 italic">Your wish collection is unpopulated</p>
              <p className="text-xs text-[#49332D]/60 max-w-xs mx-auto">
                Select the heart emblem on any piece to preserve it in your personal atelier portfolio.
              </p>
            </div>
          ) : (
            wishlistProducts.map((product) => {
              const activePricePKR = product.salePricePKR || product.pricePKR;
              const defaultVariant = product.variants[0];
              return (
                <div key={product.id} className="flex gap-4 pb-6 border-b border-[#E7DCCE]">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-20 h-24 object-cover object-center bg-white border border-[#E7DCCE] cursor-pointer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                          className="font-serif-editorial text-lg text-[#49332D] leading-tight cursor-pointer hover:text-[#632F39]"
                        >
                          {product.name}
                        </h4>
                        <button 
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-[#49332D]/40 hover:text-[#632F39] transition-colors p-1"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#632F39] font-medium mt-1">
                        {storeService.formatPrice(activePricePKR, currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          onAddToCart(product, defaultVariant.id);
                        }}
                        className="flex-1 bg-[#49332D] text-[#F7F3ED] py-2 px-3 text-[11px] uppercase tracking-wider hover:bg-[#632F39] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
