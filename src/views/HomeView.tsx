import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Eye, 
  Star, 
  Check, 
  Compass, 
  Feather, 
  ShieldCheck,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { Product, Collection, HeroSlide, Currency, BrandSettings } from '../types';
import { HeroCarousel } from '../components/HeroCarousel';
import { storeService } from '../services/storeService';

interface HomeViewProps {
  slides: HeroSlide[];
  products: Product[];
  collections: Collection[];
  currency: Currency;
  brandSettings?: BrandSettings;
  onNavigate: (view: string, param?: string) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  slides,
  products,
  collections,
  currency,
  brandSettings,
  onNavigate,
  onQuickView,
  onSelectProduct,
  onToggleWishlist,
  wishlistIds,
}) => {
  const vis = brandSettings?.sectionVisibility || {
    hero: true,
    manifesto: true,
    featuredCapsule: true,
    bestsellers: true,
    craftsmanship: true,
    reviews: true,
    newsletter: true,
  };

  // Craftsmanship interactive tab
  const [selectedCraftPillar, setSelectedCraftPillar] = useState<number>(0);

  const bestsellers = products.filter((p) => p.isBestseller);
  const leadBestseller = bestsellers[0] || products[0];
  const secondaryBestsellers = bestsellers.slice(1, 3);

  const newArrivals = products.filter((p) => p.isNewArrival);
  const leadNewArrival = newArrivals[0] || products[0];
  const secondaryNewArrivals = newArrivals.slice(1, 3);

  const reviews = storeService.getReviews().filter((r) => r.status === 'approved').slice(0, 3);

  const silhouettes = [
    {
      id: 'top-handle',
      name: 'Top-Handle',
      french: 'Porté Main Structuré',
      description: 'Architectural arches and statuesque composure.',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'tote',
      name: 'The Everyday Tote',
      french: 'Le Grand Cabas',
      description: 'Harmonious volume sculpted for modern executive life.',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'shoulder',
      name: 'Shoulder Silhouettes',
      french: 'Porté Épaule Intemporel',
      description: 'Understated drape resting effortlessly beneath the arm.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'crossbody',
      name: 'Curved Crossbody',
      french: 'Bandoulière Demi-Lune',
      description: 'Equestrian saddle contours designed for tactile ease.',
      image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'evening',
      name: 'Evening Minaudière',
      french: 'Minaudière Bijou',
      description: 'Jewel-like clasps and precious satin-sheen calfskins.',
      image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'mini',
      name: 'Architectural Mini',
      french: 'Petite Maroquinerie',
      description: 'Petite proportions executed with uncompromising rigor.',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85',
    },
  ];

  const craftPillars = [
    {
      number: '01',
      title: 'Tuscan Full-Grain Boxcalf',
      subtitle: 'Santa Croce sull’Arno Tanneries',
      quote: 'Vegetable-tanned using organic chestnut and mimosa barks for 60 days.',
      body: 'We source exclusively from heritage Tuscan tanneries adhering to strict consortium standards. The hide preserves its authentic grain, developing a soft luster that deepens gracefully with touch and climate rather than degrading.',
      stats: 'Grade 1 Selection · 1.4mm Temper',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
    },
    {
      number: '02',
      title: 'Solid Brass & 24k Champagne Gold',
      subtitle: 'Custom Pressure-Cast Metallurgy',
      quote: 'Cast from monolithic brass ingots and electroplated in satin champagne palladium.',
      body: 'Every turnlock clasp, arch handle hinge, and numbered foot stud is individually milled. Our signature champagne-gold tone balances the warmth of yellow gold with the restraint of brushed titanium, protected against tropical humidity.',
      stats: '380g Clasp Density · Tarnish Proof',
      image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85',
    },
    {
      number: '03',
      title: 'Hand-Waxed Saddlery Stitch',
      subtitle: 'Double-Needle Linen Cord Mastery',
      quote: 'Forty-eight hours of edge sealing and hot-iron burnishing per silhouette.',
      body: 'Originating in centuries of saddlery, our artisans guide two needles through each awl-pierced hole simultaneously. Unlike machine lock-stitching, should a single stitch meet friction, the integrity of the surrounding seam remains anchored forever.',
      stats: '4 Coats Hand-Applied Lacquer · Waxed Linen',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
    },
  ];

  return (
    <div className="w-full bg-[#F7F3ED]">
      
      {/* 1. CINEMATIC HERO CAMPAIGN (FULL SCREEN, 3.5S FLOW WITH PROGRESS LINE) */}
      {vis.hero && <HeroCarousel slides={slides} intervalMs={3500} onNavigate={onNavigate} />}

      {/* 2. EDITORIAL BRAND INTRODUCTION: L'ESPRIT MAISON */}
      {vis.manifesto && (
        <section className="py-24 lg:py-32 px-6 sm:px-12 max-w-6xl mx-auto border-b border-[#E7DCCE]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Asymmetric Eyebrow & Headline (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#B49A72]" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold">
                  L’Esprit Maison · Atelier Manifesto
                </span>
              </div>

              <h2 className="font-serif-editorial text-3xl sm:text-5xl lg:text-6xl text-[#49332D] leading-[1.08] font-light">
                Quiet luxury born from mathematical symmetry, noble leathers, and uncompromising restraint.
              </h2>

              <div className="pt-2 flex items-center gap-6 text-xs text-[#49332D]/70 font-light">
                <span>MM Alam Road, Lahore</span>
                <span>·</span>
                <span>Rue Saint-Honoré, Paris</span>
                <span>·</span>
                <span>Fondé en 2026</span>
              </div>
            </div>

            {/* Right: Dual-Paragraph Narrative & Atelier Seal (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:pt-4 text-xs sm:text-sm text-[#49332D]/80 leading-relaxed font-light border-l lg:border-l border-[#E7DCCE] lg:pl-8">
              <p className="first-letter:text-4xl first-letter:font-serif-editorial first-letter:text-[#632F39] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                At Maison Élan, each silhouette is conceived without ostentation. We reject fleeting logos and transient fashion in favor of immaculate proportions, vegetable-tanned Tuscan boxcalf, and hand-burnished edge lacquers that mature with regal character.
              </p>
              <p>
                Bridging Parisian architectural discipline with the profound saddlery traditions of Pakistan, our master artisans craft each numbered piece over thirty-four dedicated hours. An investment in permanence and quiet personal power.
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-[#E7DCCE]">
                <div>
                  <span className="font-brand-display text-sm tracking-[0.2em] text-[#49332D] block">
                    MAISON ÉLAN
                  </span>
                  <span className="text-[10px] text-[#49332D]/60 uppercase tracking-wider block">
                    Haute Maroquinerie Atelier
                  </span>
                </div>
                <span className="font-serif-editorial italic text-sm text-[#632F39]">
                  “Sans artifice, avec autorité.”
                </span>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 3. DISTINCTIVE NEW-SEASON CAPSULE: L'AUTOMNE ÉTERNEL (ASYMMETRIC MAGAZINE LAYOUT) */}
      {vis.featuredCapsule && (
        <section className="py-24 lg:py-32 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#E7DCCE] pb-6 gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#632F39] font-medium block">
                Capsule Collection · Automne-Hiver 2026
              </span>
              <h3 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] mt-1.5 font-light">
                L'Automne Éternel
              </h3>
            </div>
          <button
            onClick={() => onNavigate('shop', 'automne-eternel')}
            className="text-xs uppercase tracking-[0.2em] text-[#49332D] hover:text-[#632F39] font-medium flex items-center gap-2 group cursor-pointer self-start md:self-auto"
          >
            <span>Explore The Capsule Portfolio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Asymmetrical Magazine Layout: 7 cols Dominant Lead Feature + 5 cols Stacked Complements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Dominant Portrait Feature */}
          {leadNewArrival && (
            <div className="lg:col-span-7 bg-white border border-[#E7DCCE] p-6 sm:p-10 shadow-xs relative group">
              <div className="relative aspect-4/5 overflow-hidden bg-[#F7F3ED]">
                <img
                  src={leadNewArrival.images[0]}
                  alt={leadNewArrival.name}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                
                {/* Clean unboxed tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#632F39] bg-white/95 px-3 py-1 font-semibold shadow-2xs">
                    Capsule Lead Piece
                  </span>
                </div>

                <button
                  onClick={() => onToggleWishlist(leadNewArrival.id)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-[#49332D] shadow-xs transition-colors"
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-4 h-4 ${wishlistIds.includes(leadNewArrival.id) ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
                </button>
              </div>

              {/* Text Editorial Dossier */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#49332D]/60 uppercase tracking-wider">
                  <span className="capitalize">{leadNewArrival.silhouette} Archetype</span>
                  <span>{leadNewArrival.materials.origin}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h4 
                    onClick={() => onSelectProduct(leadNewArrival)}
                    className="font-serif-editorial text-2xl sm:text-3xl text-[#49332D] hover:text-[#632F39] cursor-pointer"
                  >
                    {leadNewArrival.name}
                  </h4>
                  <span className="text-xl font-medium text-[#49332D]">
                    {storeService.formatPrice(leadNewArrival.pricePKR, currency)}
                  </span>
                </div>

                <p className="text-xs text-[#49332D]/70 italic font-serif-editorial">
                  {leadNewArrival.frenchSubtitle}
                </p>

                <p className="text-xs text-[#49332D]/80 font-light leading-relaxed">
                  {leadNewArrival.description}
                </p>

                <div className="pt-4 border-t border-[#E7DCCE] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {leadNewArrival.variants.map((v) => (
                      <span
                        key={v.id}
                        className="w-4 h-4 rounded-full border border-stone-300"
                        style={{ backgroundColor: v.colorHex }}
                        title={v.colorName}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onQuickView(leadNewArrival)}
                      className="text-xs uppercase tracking-wider text-[#49332D]/70 hover:text-[#49332D] flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={() => onSelectProduct(leadNewArrival)}
                      className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3 px-6 transition-colors"
                    >
                      Inspect Dossier
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Right: Asymmetric Complementary Staggered Pair */}
          <div className="lg:col-span-5 space-y-8">
            {secondaryNewArrivals.map((item, index) => (
              <div 
                key={item.id}
                className="bg-white border border-[#E7DCCE] p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-center group"
              >
                <div className="w-full sm:w-44 aspect-4/5 overflow-hidden shrink-0 bg-[#F7F3ED] relative">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => onToggleWishlist(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-[#49332D] shadow-xs"
                    aria-label="Save to wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(item.id) ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <span className="text-[10px] text-[#49332D]/60 uppercase tracking-wider block">
                    {item.silhouette} · {item.materials.hardware}
                  </span>
                  <h4 
                    onClick={() => onSelectProduct(item)}
                    className="font-serif-editorial text-xl text-[#49332D] hover:text-[#632F39] cursor-pointer truncate"
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#49332D]/60 italic font-serif-editorial truncate">
                    {item.frenchSubtitle}
                  </p>

                  <p className="text-sm font-semibold text-[#632F39] pt-1">
                    {storeService.formatPrice(item.pricePKR, currency)}
                  </p>

                  <div className="pt-3 flex items-center justify-between border-t border-[#E7DCCE]/60">
                    <button
                      onClick={() => onQuickView(item)}
                      className="text-xs text-[#49332D]/70 hover:text-[#49332D] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => onSelectProduct(item)}
                      className="text-xs uppercase tracking-wider text-[#632F39] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Acquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* 4. SHOP BY SILHOUETTE: LES SILHOUETTES FONDATRICES */}
      <section className="py-24 bg-[#E7DCCE]/25 border-y border-[#E7DCCE]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold">
              The Architecture of Form
            </span>
            <h3 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] mt-2 font-light">
              Les Silhouettes Fondatrices
            </h3>
            <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
              Six deliberate silhouettes, each proportioned for specific rhythms of life—from executive morning salons to radiant midnight galas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {silhouettes.map((sil) => (
              <div
                key={sil.id}
                onClick={() => onNavigate('shop', sil.id)}
                className="group relative bg-white border border-[#E7DCCE] overflow-hidden cursor-pointer hover:border-[#632F39] transition-all duration-300 shadow-2xs hover:shadow-sm"
              >
                <div className="aspect-3/4 overflow-hidden relative bg-[#F7F3ED]">
                  <img
                    src={sil.image}
                    alt={sil.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#49332D]/85 via-[#49332D]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-[#F7F3ED] space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#B49A72] font-medium block">
                      {sil.french}
                    </span>
                    <h4 className="font-serif-editorial text-2xl font-light text-white">
                      {sil.name}
                    </h4>
                    <p className="text-xs text-[#F7F3ED]/80 font-light opacity-90 group-hover:opacity-100 transition-opacity">
                      {sil.description}
                    </p>
                    <span className="pt-2 inline-flex items-center gap-1.5 text-xs text-[#B49A72] uppercase tracking-wider font-medium">
                      <span>Explore Silhouettes</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. DISTINCTIVE BESTSELLERS: LES CHEFS-D'ŒUVRE PERMANENTS (ASYMMETRICAL CURATION) */}
      {vis.bestsellers && (
        <section className="py-24 lg:py-32 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 border-b border-[#E7DCCE] pb-6 gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#632F39] font-medium block">
                Permanent Icons
              </span>
              <h3 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] mt-1.5 font-light">
                Les Chefs-d'Œuvre Permanents
              </h3>
            </div>
            <button
              onClick={() => onNavigate('shop', 'bestsellers')}
              className="text-xs uppercase tracking-[0.2em] text-[#49332D] hover:text-[#632F39] font-medium flex items-center gap-2 group cursor-pointer"
            >
              <span>View All Permanent Editions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        {/* Asymmetrical Gallery Composition: Left Dominant Piece + Right Staggered Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Dominant Left Icon */}
          {leadBestseller && (
            <div className="lg:col-span-7 bg-white border border-[#E7DCCE] p-6 sm:p-10 shadow-xs relative group">
              <div className="relative aspect-4/5 overflow-hidden bg-[#F7F3ED]">
                <img
                  src={leadBestseller.images[0]}
                  alt={leadBestseller.name}
                  onClick={() => onSelectProduct(leadBestseller)}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 cursor-pointer"
                />

                <div className="absolute top-4 left-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#B49A72] bg-[#49332D] text-white px-3 py-1 font-semibold">
                    Signature Icon
                  </span>
                </div>

                <button
                  onClick={() => onToggleWishlist(leadBestseller.id)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-[#49332D] shadow-xs transition-colors"
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-4 h-4 ${wishlistIds.includes(leadBestseller.id) ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
                </button>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#49332D]/60 uppercase tracking-wider">
                  <span className="capitalize">{leadBestseller.silhouette}</span>
                  <span className="flex items-center gap-1 text-[#B49A72]">
                    <Star className="w-3.5 h-3.5 fill-[#B49A72]" />
                    <span className="text-[#49332D] font-medium">{leadBestseller.rating}</span>
                    <span className="text-[#49332D]/40">({leadBestseller.reviewCount} client reviews)</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h4 
                    onClick={() => onSelectProduct(leadBestseller)}
                    className="font-serif-editorial text-2xl sm:text-3xl text-[#49332D] hover:text-[#632F39] cursor-pointer"
                  >
                    {leadBestseller.name}
                  </h4>
                  <span className="text-xl font-medium text-[#49332D]">
                    {storeService.formatPrice(leadBestseller.pricePKR, currency)}
                  </span>
                </div>

                <p className="text-xs text-[#49332D]/70 italic font-serif-editorial">
                  {leadBestseller.frenchSubtitle}
                </p>

                <p className="text-xs text-[#49332D]/80 font-light leading-relaxed">
                  {leadBestseller.editorialQuote}
                </p>

                <div className="pt-4 border-t border-[#E7DCCE] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {leadBestseller.variants.map((v) => (
                      <span
                        key={v.id}
                        className="w-4 h-4 rounded-full border border-stone-300"
                        style={{ backgroundColor: v.colorHex }}
                        title={v.colorName}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onQuickView(leadBestseller)}
                      className="text-xs uppercase tracking-wider text-[#49332D]/70 hover:text-[#49332D] flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={() => onSelectProduct(leadBestseller)}
                      className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3 px-6 transition-colors"
                    >
                      Acquire Piece
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Complementary Staggered Pair */}
          <div className="lg:col-span-5 space-y-8">
            {secondaryBestsellers.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-[#E7DCCE] p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-center group"
              >
                <div className="w-full sm:w-44 aspect-4/5 overflow-hidden shrink-0 bg-[#F7F3ED] relative">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => onToggleWishlist(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-[#49332D] shadow-xs"
                    aria-label="Save to wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(item.id) ? 'text-[#632F39] fill-[#632F39]' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <span className="text-[10px] text-[#49332D]/60 uppercase tracking-wider block">
                    {item.silhouette} · {item.materials.leatherType.split(' ')[0]} Leather
                  </span>
                  <h4 
                    onClick={() => onSelectProduct(item)}
                    className="font-serif-editorial text-xl text-[#49332D] hover:text-[#632F39] cursor-pointer truncate"
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#49332D]/60 italic font-serif-editorial truncate">
                    {item.frenchSubtitle}
                  </p>

                  <p className="text-sm font-semibold text-[#632F39] pt-1">
                    {storeService.formatPrice(item.pricePKR, currency)}
                  </p>

                  <div className="pt-3 flex items-center justify-between border-t border-[#E7DCCE]/60">
                    <button
                      onClick={() => onQuickView(item)}
                      className="text-xs text-[#49332D]/70 hover:text-[#49332D] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => onSelectProduct(item)}
                      className="text-xs uppercase tracking-wider text-[#632F39] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Acquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* 6. ASYMMETRICAL CAMPAIGN STORY: 34 HEURES DE DÉVOTION */}
      <section className="py-24 lg:py-32 bg-[#49332D] text-[#F7F3ED] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#B49A72]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold">
                L’Art du Savoir-Faire · 34 Heures
              </span>
            </div>

            <h3 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.08]">
              Thirty-Four Hours of Continuous Devotion
            </h3>

            <p className="text-xs sm:text-sm text-[#F7F3ED]/80 font-light leading-relaxed">
              Every Maison Élan bag begins as an unblemished single hide of full-grain Tuscan calfskin. Before a single cut is made, master maroquiniers inspect the skin under angled morning light to celebrate authentic grain density.
            </p>

            <blockquote className="border-l border-[#B49A72] pl-4 italic text-sm sm:text-base text-[#B49A72] font-serif-editorial leading-relaxed">
              “True luxury never raises its voice. It establishes itself through the mathematical poise of its handles, the density of pure brass, and four hand-applied coats of edge lacquer cured in silence.”
            </blockquote>

            <div className="pt-2 flex flex-wrap items-center gap-6">
              <button
                onClick={() => onNavigate('story')}
                className="bg-[#B49A72] text-[#49332D] hover:bg-white text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-8 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Read The House Manifesto</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-[#F7F3ED]/60 uppercase tracking-widest font-mono">
                Lahore · Paris Atelier
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
                alt="Artisanal leathercraft in atelier"
                className="w-full aspect-4/5 object-cover border border-[#F7F3ED]/20 shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#632F39] text-[#F7F3ED] p-6 max-w-xs shadow-xl hidden sm:block border border-white/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B49A72] font-semibold">Atelier Standard</p>
                <p className="font-serif-editorial text-lg mt-1 leading-snug">48 Hours of Edge Lacquer Curing per Bag</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. CRAFTSMANSHIP FEATURE: L'ATELIER DES MÉTIERS (TACTILE INTERACTIVE EXPLORER) */}
      {vis.craftsmanship && (
        <section className="py-24 lg:py-32 px-6 sm:px-12 max-w-7xl mx-auto border-b border-[#E7DCCE]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#632F39] font-semibold">
              Uncompromising Standards
            </span>
            <h3 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] mt-2 font-light">
              L'Atelier des Métiers
            </h3>
            <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
              The three foundational disciplines that govern every stitch, turnlock, and cut in our workshops.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[#E7DCCE] justify-center gap-4 sm:gap-12 mb-12 overflow-x-auto pb-2">
            {craftPillars.map((p, idx) => (
              <button
                key={p.number}
                onClick={() => setSelectedCraftPillar(idx)}
                className={`pb-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCraftPillar === idx 
                    ? 'border-b-2 border-[#632F39] text-[#632F39] font-semibold' 
                    : 'text-[#49332D]/60 hover:text-[#49332D]'
                }`}
              >
                <span>{p.number}. {p.title.split(' ')[0]} {p.title.split(' ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Interactive Feature Display */}
          {craftPillars[selectedCraftPillar] && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-[#E7DCCE] p-8 sm:p-12 shadow-xs items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="font-mono text-xs text-[#B49A72] uppercase tracking-[0.25em]">
                  Pillar {craftPillars[selectedCraftPillar].number} · {craftPillars[selectedCraftPillar].subtitle}
                </span>

                <h4 className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D] leading-tight">
                  {craftPillars[selectedCraftPillar].title}
                </h4>

                <p className="italic text-xs sm:text-sm text-[#632F39] font-serif-editorial border-l-2 border-[#632F39] pl-3">
                  “{craftPillars[selectedCraftPillar].quote}”
                </p>

                <p className="text-xs sm:text-sm text-[#49332D]/80 leading-relaxed font-light">
                  {craftPillars[selectedCraftPillar].body}
                </p>

                <div className="pt-4 border-t border-[#E7DCCE] flex items-center justify-between text-xs">
                  <span className="font-mono text-[#49332D]/70 font-medium">
                    {craftPillars[selectedCraftPillar].stats}
                  </span>
                  <span className="text-[#632F39] uppercase tracking-wider font-semibold text-[11px]">
                    Lifetime Atelier Warranty
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="aspect-4/3 overflow-hidden bg-[#F7F3ED] border border-[#E7DCCE]">
                  <img
                    src={craftPillars[selectedCraftPillar].image}
                    alt={craftPillars[selectedCraftPillar].title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
                  />
                </div>
              </div>

            </div>
          )}
        </section>
      )}

      {/* 8. VERIFIED ATELIER REVIEWS (REAL CLIENT COMMENDATIONS) */}
      {vis.reviews && (
        <section className="py-24 lg:py-32 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 border-b border-[#E7DCCE] pb-6 gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold block">
                Client Commendations
              </span>
              <h3 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] mt-1.5 font-light">
                Voices of Distinction
              </h3>
            </div>
            <span className="text-xs text-[#49332D]/60 font-light">
              Verified commissions across Lahore, Karachi, Islamabad & Overseas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-[#E7DCCE] p-8 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-1 text-[#B49A72] mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B49A72]" />
                    ))}
                  </div>
                  <h4 className="font-serif-editorial text-xl text-[#49332D] mb-3 leading-snug">
                    “{rev.title}”
                  </h4>
                  <p className="text-xs text-[#49332D]/80 leading-relaxed font-light">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E7DCCE] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-[#49332D]">{rev.customerName}</p>
                    <p className="text-[10px] text-[#49332D]/50">{rev.date}</p>
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] text-[#632F39] font-medium tracking-wide">
                      <Check className="w-3.5 h-3.5" />
                      <span>Verified Commission</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. THE MAISON SALON PRIVILEGE BANNER */}
      {vis.newsletter && (
        <section className="py-20 bg-[#632F39] text-[#F7F3ED] text-center px-6 sm:px-12 border-t border-[#49332D]">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold block">
              Bespoke Atelier Services
            </span>
            <h3 className="font-serif-editorial text-3xl sm:text-5xl text-white font-light">
              Schedule a Private Viewing Consultation
            </h3>
            <p className="text-xs sm:text-sm text-[#F7F3ED]/85 font-light max-w-xl mx-auto leading-relaxed">
              Experience our Tuscan leathers, inspect hardware weight in person, and discuss personalized monogramming at our Lahore flagship showroom or through our dedicated video concierge.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('contact')}
                className="bg-[#B49A72] text-[#49332D] hover:bg-white text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-8 transition-colors cursor-pointer shadow-sm"
              >
                Book Concierge Consultation
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
