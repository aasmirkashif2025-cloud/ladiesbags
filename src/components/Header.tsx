import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { BrandSettings, Currency } from '../types';
import { storeService } from '../services/storeService';
import { CURRENCY_RATES } from '../data/initialData';

interface HeaderProps {
  brandSettings: BrandSettings;
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  cartCount: number;
  wishlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  brandSettings,
  currentCurrency,
  onCurrencyChange,
  onNavigate,
  currentView,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  cartCount,
  wishlistCount,
}) => {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const announcements = [
    brandSettings.announcementText,
    'Bespoke Monogramming & Concierge Consultations Available at Lahore & Paris Salons · Handcrafted in Limited Editions',
  ];

  useEffect(() => {
    if (!brandSettings.announcementActive) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [brandSettings.announcementActive, announcements.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Shop All', view: 'shop' },
    { label: 'New Arrivals', view: 'shop', param: 'new' },
    { label: 'Collections', view: 'collections' },
    { label: 'Bestsellers', view: 'shop', param: 'bestsellers' },
    { label: 'Our Story', view: 'story' },
    { label: 'Track Order', view: 'track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Editorial Announcement Bar */}
      {brandSettings.announcementActive && (
        <div className="bg-[#49332D] text-[#F7F3ED] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase py-2.5 px-4 text-center font-medium border-b border-[#632F39]/50 overflow-hidden relative">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 transition-opacity duration-700">
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#B49A72]" />
            <span className="truncate">{announcements[announcementIndex]}</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#B49A72]" />
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav 
        className={`w-full px-4 sm:px-8 lg:px-12 py-4 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-[#F7F3ED]/96 backdrop-blur-md border-[#E7DCCE] shadow-xs' 
            : 'bg-[#F7F3ED] border-[#E7DCCE]/40'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Mobile Menu Toggle & Desktop Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#49332D] hover:text-[#632F39] transition-colors focus-visible:outline-2 focus-visible:outline-[#B49A72]"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex items-center space-x-7 text-[13px] tracking-wide font-normal">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.view, item.param)}
                  className={`transition-colors relative py-1 hover:text-[#632F39] cursor-pointer ${
                    currentView === item.view 
                      ? 'text-[#632F39] font-medium' 
                      : 'text-[#49332D]/80'
                  }`}
                >
                  {item.label}
                  {currentView === item.view && (
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#632F39]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Brand Wordmark */}
          <div className="text-center flex-1 lg:flex-none">
            <button 
              onClick={() => onNavigate('home')} 
              className="group text-left inline-block focus-visible:outline-2 focus-visible:outline-[#B49A72]"
            >
              <span className="font-brand-display text-xl sm:text-2xl lg:text-3xl font-medium tracking-[0.2em] text-[#49332D] block group-hover:text-[#632F39] transition-colors">
                {brandSettings.brandName}
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-[#49332D]/70 text-center font-sans -mt-0.5">
                {brandSettings.brandTagline}
              </span>
            </button>
          </div>

          {/* Right: Currency, Search, Wishlist, Bag, Account */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Currency Selector */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-[#49332D]/80 hover:text-[#49332D] py-1 px-2 border border-[#E7DCCE] rounded-none bg-white/50 transition-colors"
                aria-expanded={currencyDropdownOpen}
                aria-label="Select currency"
              >
                <Globe className="w-3.5 h-3.5 text-[#B49A72]" />
                <span className="font-medium">{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 text-[#49332D]/60" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white border border-[#E7DCCE] shadow-md z-50 py-1">
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCurrencyChange(c);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F7F3ED] transition-colors ${
                        currentCurrency === c ? 'font-semibold text-[#632F39] bg-[#F7F3ED]/70' : 'text-[#49332D]'
                      }`}
                    >
                      <span>{c}</span>
                      <span className="text-[#49332D]/60 text-[10px]">{CURRENCY_RATES[c].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Trigger */}
            <button 
              onClick={onOpenSearch}
              className="p-1.5 text-[#49332D]/80 hover:text-[#49332D] transition-colors"
              aria-label="Search collection"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Account / Admin Portal */}
            <button 
              onClick={() => onNavigate('account')}
              className="hidden sm:inline-flex p-1.5 text-[#49332D]/80 hover:text-[#49332D] transition-colors"
              aria-label="My Atelier Account"
              title="Account & Orders"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Trigger */}
            <button 
              onClick={onOpenWishlist}
              className="relative p-1.5 text-[#49332D]/80 hover:text-[#49332D] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#632F39] text-white text-[9px] font-semibold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger */}
            <button 
              onClick={onOpenCart}
              className="relative p-1.5 text-[#49332D] hover:text-[#632F39] transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B49A72] text-[#49332D] font-bold text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Quick Entry */}
            <button
              onClick={() => onNavigate('admin')}
              className="hidden xl:inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#49332D]/60 hover:text-[#632F39] py-1 px-2 border-l border-[#E7DCCE] ml-2"
              title="Maison Control Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B49A72]" />
              <span>Atelier Admin</span>
            </button>

          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-[#49332D]/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#F7F3ED] shadow-xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E7DCCE]">
                <div>
                  <span className="font-brand-display text-lg tracking-[0.2em] text-[#49332D] block">
                    {brandSettings.brandName}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#49332D]/70 block">
                    Atelier de Maroquinerie
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#49332D] hover:text-[#632F39]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="py-6 space-y-4">
                {navLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.view, item.param);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-base text-[#49332D] hover:text-[#632F39] py-2 border-b border-[#E7DCCE]/50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    onNavigate('cart');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base text-[#49332D] hover:text-[#632F39] py-2 border-b border-[#E7DCCE]/50 transition-colors"
                >
                  Shopping Bag ({cartCount})
                </button>

                <button
                  onClick={() => {
                    onNavigate('account');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base text-[#49332D] hover:text-[#632F39] py-2 border-b border-[#E7DCCE]/50 transition-colors"
                >
                  My Account & Orders
                </button>

                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left text-sm text-[#632F39] font-medium py-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#B49A72]" />
                  <span>Admin Control Panel</span>
                </button>
              </div>
            </div>

            {/* Currency switcher inside mobile menu */}
            <div className="pt-6 border-t border-[#E7DCCE]">
              <p className="text-xs text-[#49332D]/60 uppercase tracking-wider mb-2 font-medium">Select Currency</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CURRENCY_RATES) as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onCurrencyChange(c);
                    }}
                    className={`py-1.5 text-xs text-center border transition-colors ${
                      currentCurrency === c 
                        ? 'border-[#632F39] bg-[#632F39] text-white font-medium' 
                        : 'border-[#E7DCCE] bg-white text-[#49332D]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#49332D]/60 mt-4 text-center">
                Concierge: {brandSettings.contactPhone}
              </p>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
