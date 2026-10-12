import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Star, 
  Maximize2, 
  X, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Product, Currency, Review } from '../types';
import { storeService } from '../services/storeService';

interface ProductDetailViewProps {
  product: Product;
  currency: Currency;
  onAddToCart: (product: Product, variantId: string, quantity: number) => void;
  onBuyNow: (product: Product, variantId: string, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  onNavigateToProduct: (product: Product) => void;
  onNavigateBackToShop: () => void;
  relatedProducts: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isInWishlist,
  onNavigateToProduct,
  onNavigateBackToShop,
  relatedProducts,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping' | 'care'>('details');
  const [addedToast, setAddedToast] = useState(false);

  // Review submission state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const activeVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const activePricePKR = product.salePricePKR || product.pricePKR;
  const reviews = storeService.getReviews(product.id).filter((r) => r.status === 'approved');

  const handleAdd = () => {
    onAddToCart(product, activeVariant.id, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewAuthor.trim() && newReviewComment.trim()) {
      storeService.addReview({
        productId: product.id,
        customerName: newReviewAuthor,
        rating: newReviewRating,
        title: newReviewTitle || 'Atelier Feedback',
        comment: newReviewComment,
        verifiedPurchase: true,
      });
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSubmitted(false);
        setNewReviewAuthor('');
        setNewReviewTitle('');
        setNewReviewComment('');
      }, 1500);
    }
  };

  return (
    <div className="w-full bg-[#F7F3ED] py-8 sm:py-12 px-6 sm:px-12 max-w-7xl mx-auto">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#49332D]/60 mb-8" aria-label="Breadcrumb">
        <button onClick={onNavigateBackToShop} className="hover:text-[#632F39] transition-colors">
          Atelier Catalog
        </button>
        <ChevronRight className="w-3 h-3 text-[#B49A72]" />
        <span className="capitalize">{product.silhouette}</span>
        <ChevronRight className="w-3 h-3 text-[#B49A72]" />
        <span className="text-[#49332D] font-medium">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Product Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 w-full bg-white border border-[#E7DCCE] overflow-hidden group">
            <img 
              src={product.images[selectedImageIndex] || product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105 cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Lightbox Trigger */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 bg-white/90 text-[#49332D] shadow-xs hover:bg-white transition-colors"
              title="Expand photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 bg-white/90 text-[#49332D] shadow-xs hover:bg-white transition-colors"
              aria-label="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 border overflow-hidden shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx 
                      ? 'border-[#632F39] ring-1 ring-[#632F39]' 
                      : 'border-[#E7DCCE] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications, Variant Selection & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#49332D]/60 mb-2">
              <span className="capitalize">{product.silhouette}</span>
              <span>·</span>
              <span>SKU: {activeVariant.sku}</span>
            </div>

            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D] leading-tight font-light">
              {product.name}
            </h1>

            <p className="font-serif-editorial text-sm italic text-[#49332D]/70 mt-1">
              {product.frenchSubtitle}
            </p>

            {/* Rating unboxed summary */}
            <div className="flex items-center gap-2 mt-3 text-xs text-[#49332D]/70">
              <div className="flex items-center gap-1 text-[#B49A72]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#B49A72]" />
                ))}
              </div>
              <span>{product.rating}</span>
              <span>·</span>
              <a href="#reviews" className="underline hover:text-[#632F39]">
                {reviews.length} atelier reviews
              </a>
            </div>

            {/* Price */}
            <div className="mt-4 pt-4 border-t border-[#E7DCCE] flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[#49332D]">
                {storeService.formatPrice(activePricePKR, currency)}
              </span>
              {product.salePricePKR && (
                <span className="text-sm text-[#49332D]/50 line-through">
                  {storeService.formatPrice(product.pricePKR, currency)}
                </span>
              )}
            </div>
          </div>

          {/* Color Variant Selector */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#49332D]/70">Leather Shade:</span>
              <span className="font-semibold text-[#49332D]">{activeVariant.colorName}</span>
            </div>
            <div className="flex items-center gap-3">
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
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    activeVariant.id === v.id ? 'scale-115 border-[#49332D] shadow-xs' : 'border-white hover:scale-105'
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                  title={v.colorName}
                />
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center gap-2 text-xs text-[#632F39]">
            <span className="w-2 h-2 rounded-full bg-[#632F39] animate-pulse" />
            <span>
              {activeVariant.stock > 0 
                ? `In stock at Lahore Atelier (${activeVariant.stock} pieces crafted)` 
                : 'Bespoke commission by order'}
            </span>
          </div>

          {/* Stepper & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              
              {/* Stepper */}
              <div className="flex items-center border border-[#E7DCCE] bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-11 flex items-center justify-center text-[#49332D] hover:bg-[#F7F3ED] font-semibold text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-semibold text-[#49332D]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-11 flex items-center justify-center text-[#49332D] hover:bg-[#F7F3ED] font-semibold text-sm"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag */}
              <button
                onClick={handleAdd}
                className="flex-1 bg-[#49332D] text-[#F7F3ED] py-3.5 px-4 text-xs uppercase tracking-widest font-medium hover:bg-[#632F39] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-[#B49A72]" />
                    <span>Added to Shopping Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>

            </div>

            {/* Instant Buy Now Button */}
            <button
              onClick={() => onBuyNow(product, activeVariant.id, quantity)}
              className="w-full bg-[#632F39] text-[#F7F3ED] py-3.5 px-4 text-xs uppercase tracking-widest font-medium hover:bg-[#49332D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Instant Commission & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Atelier Guarantees */}
          <div className="pt-4 border-t border-[#E7DCCE] space-y-2 text-xs text-[#49332D]/70">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#B49A72] shrink-0" />
              <span>Complimentary White-Glove Courier across Pakistan (TCS) & DHL Worldwide</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B49A72] shrink-0" />
              <span>Signature Maison gift box, organic dust pouch & certificate of origin</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B49A72] shrink-0" />
              <span>14-day return privilege & lifetime atelier craftsmanship warranty</span>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="pt-6 border-t border-[#E7DCCE]">
            <div className="flex border-b border-[#E7DCCE] gap-6 text-xs uppercase tracking-wider font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition-colors cursor-pointer ${
                  activeTab === 'details' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/60 hover:text-[#49332D]'
                }`}
              >
                Dimensions & Fit
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`pb-2 transition-colors cursor-pointer ${
                  activeTab === 'materials' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/60 hover:text-[#49332D]'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`pb-2 transition-colors cursor-pointer ${
                  activeTab === 'care' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/60 hover:text-[#49332D]'
                }`}
              >
                Care
              </button>
            </div>

            <div className="pt-4 text-xs text-[#49332D]/80 leading-relaxed font-light">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p><strong>Width:</strong> {product.dimensions.widthCm} cm</p>
                  <p><strong>Height:</strong> {product.dimensions.heightCm} cm</p>
                  <p><strong>Depth:</strong> {product.dimensions.depthCm} cm</p>
                  {product.dimensions.strapDropCm && (
                    <p><strong>Strap Drop:</strong> {product.dimensions.strapDropCm} cm (Adjustable & Detachable)</p>
                  )}
                  <p className="pt-1 text-[#49332D]/60 italic font-serif-editorial">
                    Accommodates daily essentials, large smartphone, continental wallet, and makeup compact.
                  </p>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-2">
                  <p><strong>Leather:</strong> {product.materials.leatherType}</p>
                  <p><strong>Hardware:</strong> {product.materials.hardware}</p>
                  <p><strong>Lining:</strong> {product.materials.lining}</p>
                  <p><strong>Origin:</strong> {product.materials.origin}</p>
                </div>
              )}

              {activeTab === 'care' && (
                <ul className="list-disc pl-4 space-y-1">
                  {product.careInstructions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-[#49332D]/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={product.images[selectedImageIndex] || product.images[0]}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* Customer Reviews Section */}
      <section id="reviews" className="mt-20 pt-12 border-t border-[#E7DCCE]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#49332D]">
              Client Commendations & Reviews
            </h3>
            <p className="text-xs text-[#49332D]/60 mt-1">
              Verified evaluations from patrons across Pakistan and international salons.
            </p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="bg-white border border-[#E7DCCE] text-[#49332D] hover:border-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 self-start sm:self-auto cursor-pointer"
          >
            Write an Atelier Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white border border-[#E7DCCE] p-8 text-center">
            <p className="font-serif-editorial text-lg text-[#49332D]">No published reviews yet for this silhouette.</p>
            <p className="text-xs text-[#49332D]/60 mt-1">Be the first patron to share your experience.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-[#E7DCCE] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#B49A72]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B49A72]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#49332D]/50">{rev.date}</span>
                </div>
                <h4 className="font-serif-editorial text-lg text-[#49332D]">“{rev.title}”</h4>
                <p className="text-xs text-[#49332D]/80 leading-relaxed font-light">{rev.comment}</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#49332D]">{rev.customerName}</span>
                  {rev.verifiedPurchase && (
                    <span className="text-[11px] text-[#632F39] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Verified Commission</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#49332D]/60 flex items-center justify-center p-4">
          <div className="bg-[#F7F3ED] max-w-md w-full border border-[#E7DCCE] p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-[#49332D]/60 hover:text-[#49332D]"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="font-serif-editorial text-2xl text-[#49332D] mb-1">
              Submit Atelier Review
            </h4>
            <p className="text-xs text-[#49332D]/60 mb-6">
              Share your impressions on the leather hand-feel, hardware, and delivery.
            </p>

            {reviewSubmitted ? (
              <div className="text-center py-8 text-[#632F39]">
                <Check className="w-8 h-8 mx-auto mb-2 text-[#B49A72]" />
                <p className="font-serif-editorial text-lg">Thank you. Your commendation has been submitted for moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="w-full bg-white border border-[#E7DCCE] text-xs p-2.5 focus:outline-none focus:border-[#632F39]"
                    placeholder="e.g. Zainab M."
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full bg-white border border-[#E7DCCE] text-xs p-2.5 focus:outline-none focus:border-[#632F39]"
                  >
                    <option value={5}>5 Stars - Exquisite Perfection</option>
                    <option value={4}>4 Stars - High Distinction</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="w-full bg-white border border-[#E7DCCE] text-xs p-2.5 focus:outline-none focus:border-[#632F39]"
                    placeholder="e.g. Flawless Tuscan Boxcalf"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1">Detailed Remarks</label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-white border border-[#E7DCCE] text-xs p-2.5 focus:outline-none focus:border-[#632F39]"
                    placeholder="Describe the craftsmanship, tactile finish, packaging..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#49332D] text-[#F7F3ED] py-3 text-xs uppercase tracking-wider hover:bg-[#632F39] transition-colors"
                >
                  Submit For Review
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#E7DCCE]">
          <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#49332D] mb-8">
            Companion Atelier Silhouettes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <div 
                key={rel.id}
                onClick={() => onNavigateToProduct(rel)}
                className="group bg-white border border-[#E7DCCE] p-4 cursor-pointer hover:border-[#632F39] transition-colors"
              >
                <div className="aspect-4/5 overflow-hidden bg-[#F7F3ED] mb-3">
                  <img
                    src={rel.images[0]}
                    alt={rel.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-serif-editorial text-base text-[#49332D] group-hover:text-[#632F39] truncate">
                  {rel.name}
                </h4>
                <p className="text-xs text-[#632F39] font-medium mt-1">
                  {storeService.formatPrice(rel.pricePKR, currency)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
