import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Heart, Eye } from 'lucide-react';
import { Collection, Product, Currency } from '../types';
import { storeService } from '../services/storeService';

interface CollectionsViewProps {
  collections: Collection[];
  products: Product[];
  currency: Currency;
  initialCollectionSlug?: string;
  onSelectCollection: (col: Collection) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToShop: (filter?: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  products,
  currency,
  initialCollectionSlug,
  onSelectCollection,
  onSelectProduct,
  onNavigateToShop,
}) => {
  const [activeCollection, setActiveCollection] = useState<Collection | null>(() => {
    if (initialCollectionSlug) {
      return collections.find(c => c.slug === initialCollectionSlug) || null;
    }
    return null;
  });

  // Dedicated Collection Capsule Detail View
  if (activeCollection) {
    const colProducts = products.filter(
      (p) => p.collectionId === activeCollection.slug || p.collectionId === activeCollection.id
    );

    return (
      <div className="w-full bg-[#F7F3ED]">
        
        {/* Full-width Capsule Hero Banner */}
        <div className="relative w-full h-[60vh] min-h-[420px] max-h-[640px] bg-[#49332D] overflow-hidden">
          <img
            src={activeCollection.heroImage}
            alt={activeCollection.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#49332D]/90 via-[#49332D]/40 to-transparent" />
          
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 text-[#F7F3ED]">
            <button
              onClick={() => setActiveCollection(null)}
              className="text-xs uppercase tracking-[0.2em] text-[#B49A72] hover:text-white flex items-center gap-1.5 mb-4 self-start cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Collection Archives</span>
            </button>

            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold block">
              {activeCollection.subtitle}
            </span>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-white mt-1 font-light">
              {activeCollection.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#F7F3ED]/80 max-w-xl font-light mt-3 leading-relaxed">
              {activeCollection.description}
            </p>
          </div>
        </div>

        {/* Capsule Products Grid */}
        <div className="py-16 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between pb-6 border-b border-[#E7DCCE] mb-10">
            <span className="text-xs text-[#49332D]/70 uppercase tracking-wider">
              Anthology contains <strong>{colProducts.length}</strong> handcrafted silhouettes
            </span>
            <button
              onClick={() => onNavigateToShop(activeCollection.slug)}
              className="text-xs text-[#632F39] hover:underline font-medium flex items-center gap-1"
            >
              <span>Open in Catalog with Filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {colProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white border border-[#E7DCCE] p-6 shadow-xs cursor-pointer hover:border-[#632F39] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-4/5 overflow-hidden bg-[#F7F3ED] mb-4 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#632F39] bg-white/90 px-2 py-0.5 font-medium">
                        {product.silhouette}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-serif-editorial text-2xl text-[#49332D] group-hover:text-[#632F39] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#49332D]/60 italic font-serif-editorial mt-0.5">
                    {product.frenchSubtitle}
                  </p>
                  <p className="text-xs text-[#49332D]/80 font-light mt-2 line-clamp-2">
                    {product.editorialQuote}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E7DCCE] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {product.variants.map((v) => (
                      <span
                        key={v.id}
                        className="w-3 h-3 rounded-full border border-stone-300"
                        style={{ backgroundColor: v.colorHex }}
                        title={v.colorName}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#49332D]">
                    {storeService.formatPrice(product.pricePKR, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => setActiveCollection(null)}
              className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3.5 px-8 transition-colors cursor-pointer"
            >
              Return to All Collections
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Collections Overview Stack
  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-7xl mx-auto">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          Curated Anthology
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#49332D] mt-2 font-light">
          The Collections
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
          Thematic chapters in contemporary maroquinerie. Each capsule explores a unique dialogue between leather temper, hardware architecture, and seasonal atmosphere.
        </p>
      </div>

      {/* Collections Stack */}
      <div className="space-y-16">
        {collections.map((col, index) => {
          const colProducts = products.filter((p) => p.collectionId === col.slug || p.collectionId === col.id);
          const isEven = index % 2 === 0;

          return (
            <div 
              key={col.id} 
              className="bg-white border border-[#E7DCCE] overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className={`grid grid-cols-1 lg:grid-cols-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                
                {/* Image Banner */}
                <div 
                  onClick={() => setActiveCollection(col)}
                  className={`lg:col-span-6 relative aspect-4/3 lg:aspect-auto lg:h-[450px] overflow-hidden cursor-pointer group ${isEven ? '' : 'lg:order-2'}`}
                >
                  <img
                    src={col.heroImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-[#49332D]/20 group-hover:bg-[#49332D]/10 transition-colors" />
                </div>

                {/* Content */}
                <div className={`lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6 ${isEven ? '' : 'lg:order-1'}`}>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[#632F39] font-medium">
                      {col.subtitle}
                    </span>
                    <h2 
                      onClick={() => setActiveCollection(col)}
                      className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D] mt-2 cursor-pointer hover:text-[#632F39]"
                    >
                      {col.name}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#49332D]/80 leading-relaxed font-light">
                    {col.description}
                  </p>

                  {/* Thumbnail Row of Collection pieces */}
                  {colProducts.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] uppercase tracking-wider text-[#49332D]/60 mb-2">Featured Silhouettes:</p>
                      <div className="flex gap-3">
                        {colProducts.slice(0, 3).map((p) => (
                          <div 
                            key={p.id}
                            onClick={() => onSelectProduct(p)}
                            className="cursor-pointer group/item text-center"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-16 h-20 object-cover border border-[#E7DCCE] group-hover/item:border-[#632F39]"
                            />
                            <span className="text-[10px] text-[#49332D]/70 block truncate max-w-[64px] mt-1">
                              {p.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E7DCCE] flex items-center gap-4">
                    <button
                      onClick={() => setActiveCollection(col)}
                      className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3 px-6 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>Explore Dossier ({colProducts.length} pieces)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
