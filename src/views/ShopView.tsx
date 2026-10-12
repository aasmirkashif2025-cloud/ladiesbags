import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X, 
  Eye, 
  Heart, 
  Star, 
  SlidersHorizontal, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Product, Currency, Collection } from '../types';
import { storeService } from '../services/storeService';

interface ShopViewProps {
  products: Product[];
  collections: Collection[];
  currency: Currency;
  initialFilter?: string; // silhouette or collection slug or 'new' or 'bestsellers'
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  collections,
  currency,
  initialFilter,
  onSelectProduct,
  onQuickView,
  onToggleWishlist,
  wishlistIds,
}) => {
  // In-Page Search
  const [searchQuery, setSearchQuery] = useState('');

  // Filters State
  const [selectedSilhouette, setSelectedSilhouette] = useState<string>(() => {
    if (initialFilter && ['tote', 'shoulder', 'crossbody', 'top-handle', 'mini', 'evening'].includes(initialFilter)) {
      return initialFilter;
    }
    return 'all';
  });

  const [selectedCollection, setSelectedCollection] = useState<string>(() => {
    if (initialFilter && collections.some(c => c.slug === initialFilter)) {
      return initialFilter;
    }
    return 'all';
  });

  const [filterSpecial, setFilterSpecial] = useState<string>(() => {
    if (initialFilter === 'new') return 'new';
    if (initialFilter === 'bestsellers') return 'bestsellers';
    return 'all';
  });

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Sync initialFilter prop if changed
  useEffect(() => {
    if (initialFilter) {
      if (['tote', 'shoulder', 'crossbody', 'top-handle', 'mini', 'evening'].includes(initialFilter)) {
        setSelectedSilhouette(initialFilter);
        setSelectedCollection('all');
        setFilterSpecial('all');
      } else if (collections.some(c => c.slug === initialFilter)) {
        setSelectedCollection(initialFilter);
        setSelectedSilhouette('all');
        setFilterSpecial('all');
      } else if (initialFilter === 'new' || initialFilter === 'bestsellers') {
        setFilterSpecial(initialFilter);
        setSelectedSilhouette('all');
        setSelectedCollection('all');
      }
      setCurrentPage(1);
    }
  }, [initialFilter, collections]);

  // Reset page when any filter alters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSilhouette, selectedCollection, filterSpecial, inStockOnly, sortBy]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          p.name.toLowerCase().includes(q) ||
          p.frenchSubtitle.toLowerCase().includes(q) ||
          p.silhouette.toLowerCase().includes(q) ||
          p.materials.leatherType.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Silhouette filter
      if (selectedSilhouette !== 'all' && p.silhouette !== selectedSilhouette) {
        return false;
      }
      // Collection filter
      if (selectedCollection !== 'all' && p.collectionId !== selectedCollection) {
        return false;
      }
      // Special filter
      if (filterSpecial === 'new' && !p.isNewArrival) return false;
      if (filterSpecial === 'bestsellers' && !p.isBestseller) return false;
      // In stock
      if (inStockOnly && !p.inStock) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.salePricePKR || a.pricePKR;
      const priceB = b.salePricePKR || b.pricePKR;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [products, searchQuery, selectedSilhouette, selectedCollection, filterSpecial, inStockOnly, sortBy]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSilhouette('all');
    setSelectedCollection('all');
    setFilterSpecial('all');
    setInStockOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const silhouettes: { id: string; label: string; french: string }[] = [
    { id: 'all', label: 'All Silhouettes', french: 'Anthologie Complète' },
    { id: 'top-handle', label: 'Top-Handle', french: 'Porté Main Structuré' },
    { id: 'tote', label: 'Everyday Tote', french: 'Le Grand Cabas' },
    { id: 'shoulder', label: 'Shoulder Bag', french: 'Porté Épaule' },
    { id: 'crossbody', label: 'Curved Crossbody', french: 'Bandoulière Demi-Lune' },
    { id: 'evening', label: 'Evening Minaudière', french: 'Minaudière Bijou' },
    { id: 'mini', label: 'Architectural Mini', french: 'Petite Maroquinerie' },
  ];

  // Active Category Title
  const activeSilhouetteObj = silhouettes.find(s => s.id === selectedSilhouette);
  const activeCollectionObj = collections.find(c => c.slug === selectedCollection);

  return (
    <div className="w-full bg-[#F7F3ED] py-12 px-6 sm:px-12 max-w-7xl mx-auto">
      
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold block">
          {activeCollectionObj ? activeCollectionObj.subtitle : activeSilhouetteObj?.french || 'Haute Maroquinerie Catalog'}
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl text-[#49332D] mt-2 font-light">
          {activeCollectionObj ? activeCollectionObj.name : selectedSilhouette !== 'all' ? activeSilhouetteObj?.label : 'The Atelier Anthology'}
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed max-w-2xl mx-auto">
          {activeCollectionObj 
            ? activeCollectionObj.description 
            : 'Handcrafted women’s leather handbag creations. Finished with hand-painted edge lacquers and 24k satin champagne gold hardware, ready for white-glove delivery across Pakistan and international transit.'}
        </p>

        {/* In-Page Catalog Search Input */}
        <div className="mt-8 max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search silhouettes, boxcalf, shades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E7DCCE] text-xs py-3 pl-10 pr-8 focus:outline-none focus:border-[#632F39] text-[#49332D]"
          />
          <Search className="w-4 h-4 text-[#49332D]/40 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-[#49332D]/40 hover:text-[#49332D]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Filter status, active badges, and sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#E7DCCE] gap-4">
        
        {/* Left: Filter count & Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-wider text-[#49332D] bg-white border border-[#E7DCCE] py-2 px-3.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#632F39]" />
            <span>Filter Criteria</span>
          </button>

          <span className="text-xs text-[#49332D]/70">
            Showing <strong className="text-[#49332D] font-medium">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'creation' : 'creations'}
          </span>

          {(selectedSilhouette !== 'all' || selectedCollection !== 'all' || filterSpecial !== 'all' || inStockOnly || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#632F39] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Right: Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="sort-select" className="text-xs text-[#49332D]/70 font-medium">Sort Order:</label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#E7DCCE] text-xs text-[#49332D] py-2 px-3 focus:outline-none focus:border-[#632F39] cursor-pointer"
            >
              <option value="featured">Featured Atelier Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Grid: Sidebar Filters (3 cols) + Catalog (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-4 border-r border-[#E7DCCE]/60">
          
          {/* Silhouettes */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#632F39] font-semibold mb-3">
              Silhouette Archetype
            </h4>
            <div className="space-y-1 text-xs">
              {silhouettes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSilhouette(s.id)}
                  className={`block w-full text-left py-1.5 transition-colors cursor-pointer ${
                    selectedSilhouette === s.id 
                      ? 'text-[#632F39] font-semibold pl-2 border-l-2 border-[#632F39]' 
                      : 'text-[#49332D]/70 hover:text-[#49332D]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#632F39] font-semibold mb-3">
              Collection Capsule
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCollection('all')}
                className={`block w-full text-left py-1.5 transition-colors cursor-pointer ${
                  selectedCollection === 'all' 
                    ? 'text-[#632F39] font-semibold pl-2 border-l-2 border-[#632F39]' 
                    : 'text-[#49332D]/70 hover:text-[#49332D]'
                }`}
              >
                All Collections
              </button>
              {collections.map((col) => (
                <button
                  key={col.slug}
                  onClick={() => setSelectedCollection(col.slug)}
                  className={`block w-full text-left py-1.5 transition-colors cursor-pointer ${
                    selectedCollection === col.slug 
                      ? 'text-[#632F39] font-semibold pl-2 border-l-2 border-[#632F39]' 
                      : 'text-[#49332D]/70 hover:text-[#49332D]'
                  }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Curated Tags */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#632F39] font-semibold mb-3">
              Curated Tags
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setFilterSpecial(filterSpecial === 'new' ? 'all' : 'new')}
                className={`block w-full text-left py-2 px-3 border transition-colors cursor-pointer ${
                  filterSpecial === 'new' ? 'bg-[#632F39] text-white border-[#632F39]' : 'bg-white text-[#49332D] border-[#E7DCCE]'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setFilterSpecial(filterSpecial === 'bestsellers' ? 'all' : 'bestsellers')}
                className={`block w-full text-left py-2 px-3 border transition-colors cursor-pointer ${
                  filterSpecial === 'bestsellers' ? 'bg-[#632F39] text-white border-[#632F39]' : 'bg-white text-[#49332D] border-[#E7DCCE]'
                }`}
              >
                Atelier Bestsellers
              </button>
            </div>
          </div>

          {/* Stock availability */}
          <div className="pt-4 border-t border-[#E7DCCE]">
            <label className="flex items-center gap-2.5 text-xs text-[#49332D] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#632F39] w-4 h-4 cursor-pointer"
              />
              <span>In Atelier Stock Only</span>
            </label>
          </div>

        </aside>

        {/* Mobile Filters Collapsible */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-12 bg-white p-6 border border-[#E7DCCE] mb-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7DCCE]">
              <span className="font-serif-editorial text-lg text-[#49332D]">Filter Options</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-xs text-[#49332D]/70">Done</button>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-[#632F39] mb-2">Silhouette</p>
              <div className="flex flex-wrap gap-1.5">
                {silhouettes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSilhouette(s.id)}
                    className={`px-3 py-1.5 text-xs border ${
                      selectedSilhouette === s.id ? 'bg-[#632F39] text-white border-[#632F39]' : 'bg-white text-[#49332D] border-[#E7DCCE]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Grid & Pagination (9 cols) */}
        <main className="lg:col-span-9 space-y-10">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E7DCCE] p-8">
              <p className="font-serif-editorial text-2xl text-[#49332D]">No creations match your active criteria</p>
              <p className="text-xs text-[#49332D]/60 mt-2 max-w-sm mx-auto">
                Please refine your silhouette selections or reset your filters to discover our permanent collection.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-wider py-3 px-6 hover:bg-[#632F39] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col justify-between bg-white border border-[#E7DCCE] p-4 transition-all duration-300 hover:shadow-xs"
                  >
                    <div>
                      {/* Image Box */}
                      <div className="relative aspect-4/5 overflow-hidden bg-[#F7F3ED] mb-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          onClick={() => onSelectProduct(product)}
                          className="w-full h-full object-cover cursor-pointer group-hover:scale-104 transition-transform duration-500"
                        />

                        {/* Unboxed Status */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                          {product.isNewArrival && (
                            <span className="text-[10px] uppercase tracking-wider text-[#632F39] bg-white/90 px-2 py-0.5 font-medium shadow-2xs">
                              New In
                            </span>
                          )}
                          {product.isBestseller && !product.isNewArrival && (
                            <span className="text-[10px] uppercase tracking-wider text-[#B49A72] bg-white/90 px-2 py-0.5 font-medium shadow-2xs">
                              Iconic
                            </span>
                          )}
                        </div>

                        {/* Wishlist */}
                        <button
                          onClick={() => onToggleWishlist(product.id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-[#49332D] shadow-xs transition-colors"
                          aria-label="Save to wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(product.id) ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
                        </button>

                        {/* Quick View Button on Hover */}
                        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => onQuickView(product)}
                            className="w-full bg-[#49332D]/90 hover:bg-[#49332D] text-[#F7F3ED] text-[11px] uppercase tracking-wider py-2.5 backdrop-blur-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#49332D]/60 uppercase tracking-wider">
                          <span>{product.silhouette}</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#B49A72] fill-[#B49A72]" />
                            <span>{product.rating}</span>
                          </span>
                        </div>

                        <h4
                          onClick={() => onSelectProduct(product)}
                          className="font-serif-editorial text-lg text-[#49332D] hover:text-[#632F39] cursor-pointer truncate"
                        >
                          {product.name}
                        </h4>

                        <p className="text-xs text-[#49332D]/60 italic font-serif-editorial truncate">
                          {product.frenchSubtitle}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Variant Swatches & Price */}
                    <div className="pt-3 mt-3 border-t border-[#E7DCCE] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="w-3.5 h-3.5 rounded-full border border-stone-300"
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-8 border-t border-[#E7DCCE] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#49332D]/70">
                    <span>Page</span>
                    <strong className="text-[#49332D] font-mono">{currentPage}</strong>
                    <span>of</span>
                    <span className="font-mono">{totalPages}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-[#E7DCCE] bg-white text-[#49332D] disabled:opacity-30 hover:border-[#632F39] transition-colors cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const pNum = i + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => handlePageChange(pNum)}
                          className={`w-8 h-8 font-mono text-xs border transition-colors cursor-pointer ${
                            currentPage === pNum 
                              ? 'bg-[#632F39] text-white border-[#632F39] font-bold' 
                              : 'bg-white text-[#49332D] border-[#E7DCCE] hover:border-[#632F39]'
                          }`}
                        >
                          0{pNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-[#E7DCCE] bg-white text-[#49332D] disabled:opacity-30 hover:border-[#632F39] transition-colors cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

      </div>

    </div>
  );
};
