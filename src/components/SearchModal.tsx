import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product, Currency } from '../types';
import { storeService } from '../services/storeService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  onNavigateToCategory: (category: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  onSelectProduct,
  onNavigateToCategory,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.frenchSubtitle.toLowerCase().includes(q) ||
        p.silhouette.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.materials.leatherType.toLowerCase().includes(q) ||
        p.variants.some((v) => v.colorName.toLowerCase().includes(q))
      );
    });
  }, [query, products]);

  const popularSearches = ['Top-Handle', 'Burgundy Boxcalf', 'Trapezoid Tote', 'Evening Minaudière', 'Crossbody'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-[#49332D]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:max-w-2xl sm:mx-auto sm:my-16 bg-[#F7F3ED] shadow-2xl border border-[#E7DCCE] z-50 p-6 sm:p-8">
        
        {/* Header & Input */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7DCCE]">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-[#632F39]" />
            <input
              type="text"
              autoFocus
              placeholder="Search silhouettes, leathers, shades..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-base sm:text-lg text-[#49332D] placeholder-[#49332D]/40 focus:outline-none font-serif-editorial"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#49332D]/60 hover:text-[#632F39] transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions */}
        {!query && (
          <div className="py-6 space-y-4">
            <p className="text-xs uppercase tracking-wider text-[#49332D]/60 font-semibold">
              Curated Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 text-xs bg-white border border-[#E7DCCE] text-[#49332D] hover:border-[#632F39] hover:text-[#632F39] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E7DCCE]">
              <p className="text-xs uppercase tracking-wider text-[#49332D]/60 font-semibold mb-3">
                Explore by Silhouette
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['top-handle', 'tote', 'shoulder', 'crossbody', 'evening', 'mini'].map((sil) => (
                  <button
                    key={sil}
                    onClick={() => {
                      onClose();
                      onNavigateToCategory(sil);
                    }}
                    className="text-left text-xs text-[#49332D] hover:text-[#632F39] py-1 capitalize flex items-center justify-between group"
                  >
                    <span>{sil.replace('-', ' ')}</span>
                    <ArrowRight className="w-3 h-3 text-[#B49A72] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#49332D]/70">
                Found {searchResults.length} {searchResults.length === 1 ? 'creation' : 'creations'}
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-serif-editorial text-xl text-[#49332D]">No pieces matching "{query}"</p>
                <p className="text-xs text-[#49332D]/60 mt-1">Try searching by leather type like "Boxcalf", or silhouette like "Tote".</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-4 p-2 bg-white/70 hover:bg-white border border-transparent hover:border-[#E7DCCE] cursor-pointer transition-all"
                  >
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-14 h-16 object-cover bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-editorial text-base text-[#49332D] truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#49332D]/60 truncate italic">
                        {product.frenchSubtitle}
                      </p>
                      <p className="text-xs font-medium text-[#632F39] mt-0.5">
                        {storeService.formatPrice(product.salePricePKR || product.pricePKR, currency)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#B49A72] shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
