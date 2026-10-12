import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Product, Currency } from '../types';
import { storeService } from '../services/storeService';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  currency: Currency;
  onAddToCart: (product: Product, variantId: string) => void;
  onBuyNow: (product: Product, variantId: string) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  onViewFullDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  currency,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isInWishlist,
  onViewFullDetails,
}) => {
  if (!product) return null;

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const activeVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const activePricePKR = product.salePricePKR || product.pricePKR;

  const handleAdd = () => {
    onAddToCart(product, activeVariant.id);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-[#49332D]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:max-w-4xl sm:mx-auto sm:my-12 bg-[#F7F3ED] shadow-2xl border border-[#E7DCCE] z-50 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#49332D]/70 hover:text-[#632F39] bg-[#F7F3ED]/80 backdrop-blur-xs"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Images */}
          <div className="p-6 lg:p-8 bg-white border-b md:border-b-0 md:border-r border-[#E7DCCE] flex flex-col justify-between">
            <div className="aspect-4/5 w-full bg-[#F7F3ED] overflow-hidden relative">
              <img 
                src={product.images[selectedImageIndex] || product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="absolute top-3 left-3 p-2 bg-white/80 hover:bg-white text-[#49332D] shadow-xs transition-colors"
                title="Save to wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-16 border overflow-hidden transition-all ${
                      selectedImageIndex === idx ? 'border-[#632F39] ring-1 ring-[#632F39]' : 'border-[#E7DCCE] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Actions */}
          <div className="p-6 lg:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#49332D]/60 tracking-wider uppercase font-medium">
                <span className="capitalize">{product.silhouette}</span>
                <span>·</span>
                <span>{product.materials.origin}</span>
              </div>

              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#49332D] tracking-tight">
                {product.name}
              </h2>

              <p className="text-xs italic text-[#49332D]/70 -mt-1 font-serif-editorial">
                {product.frenchSubtitle}
              </p>

              {/* Price */}
              <div className="pt-2">
                <span className="text-xl font-medium text-[#49332D]">
                  {storeService.formatPrice(activePricePKR, currency)}
                </span>
                {product.salePricePKR && (
                  <span className="ml-2 text-sm text-[#49332D]/50 line-through">
                    {storeService.formatPrice(product.pricePKR, currency)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#49332D]/80 leading-relaxed font-light pt-1">
                {product.description}
              </p>

              {/* Color variant selection */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#49332D]/70 font-medium">Selected Leather Shade:</span>
                  <span className="text-[#49332D] font-semibold">{activeVariant.colorName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        if (v.image) {
                          const idx = product.images.indexOf(v.image);
                          if (idx >= 0) setSelectedImageIndex(idx);
                        }
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        activeVariant.id === v.id ? 'scale-115 border-[#49332D] shadow-xs' : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                      title={v.colorName}
                    />
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="pt-3 border-t border-[#E7DCCE] text-xs text-[#49332D]/70 space-y-1">
                <p>
                  Dimensions: {product.dimensions.widthCm}cm × {product.dimensions.heightCm}cm × {product.dimensions.depthCm}cm
                </p>
                <p>
                  Material: {product.materials.leatherType}
                </p>
              </div>

            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-[#E7DCCE]">
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#49332D] text-[#F7F3ED] py-3.5 px-4 text-xs uppercase tracking-widest font-medium hover:bg-[#632F39] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 text-[#B49A72]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onBuyNow(product, activeVariant.id);
                    onClose();
                  }}
                  className="bg-[#632F39] text-[#F7F3ED] py-3.5 px-5 text-xs uppercase tracking-widest font-medium hover:bg-[#49332D] transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={() => {
                  onViewFullDetails(product);
                  onClose();
                }}
                className="w-full text-center text-xs text-[#49332D]/70 hover:text-[#632F39] hover:underline flex items-center justify-center gap-1"
              >
                <span>View Full Editorial Dossier & Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
