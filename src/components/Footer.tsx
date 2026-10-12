import React, { useState } from 'react';
import { BrandSettings, Currency } from '../types';
import { CURRENCY_RATES } from '../data/initialData';
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Sparkles } from 'lucide-react';

interface FooterProps {
  brandSettings: BrandSettings;
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  brandSettings,
  currentCurrency,
  onCurrencyChange,
  onNavigate,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#49332D] text-[#F7F3ED] border-t border-[#632F39]/60">
      
      {/* Editorial Value Badges Bar */}
      <div className="border-b border-[#F7F3ED]/10 py-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B49A72]/20 flex items-center justify-center text-[#B49A72]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif-editorial text-lg tracking-wide text-[#F7F3ED]">Tuscan & European Leathers</p>
              <p className="text-xs text-[#F7F3ED]/70 mt-0.5">Full-grain boxcalf and saddle-stitched finishes</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B49A72]/20 flex items-center justify-center text-[#B49A72]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif-editorial text-lg tracking-wide text-[#F7F3ED]">White-Glove Delivery</p>
              <p className="text-xs text-[#F7F3ED]/70 mt-0.5">Complimentary across Pakistan & worldwide express</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B49A72]/20 flex items-center justify-center text-[#B49A72]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif-editorial text-lg tracking-wide text-[#F7F3ED]">Numbered Authenticity</p>
              <p className="text-xs text-[#F7F3ED]/70 mt-0.5">Lifetime atelier warranty & certificate of origin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Col 1 & 2: Brand Heritage & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="font-brand-display text-2xl tracking-[0.22em] text-[#F7F3ED] block">
                {brandSettings.brandName}
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#B49A72] block mt-1">
                {brandSettings.brandTagline}
              </span>
            </div>

            <p className="text-sm text-[#F7F3ED]/80 leading-relaxed font-light max-w-sm">
              Founded on the values of architectural restraint, immaculate proportion, and timeless Pakistani and Parisian leather craftsmanship. Each piece is constructed in limited numbered editions.
            </p>

            <div className="pt-2">
              <h4 className="font-serif-editorial text-lg text-[#F7F3ED] mb-2">The Private Atelier Salon</h4>
              <p className="text-xs text-[#F7F3ED]/70 mb-3">
                Receive private previews of seasonal silhouettes and bespoke commission announcements.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#B49A72] bg-[#F7F3ED]/10 p-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Welcome to the Maison Élan Salon. An invitation has been dispatched.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-[#F7F3ED]/10 border border-[#F7F3ED]/20 text-[#F7F3ED] placeholder-[#F7F3ED]/40 text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#B49A72]"
                  />
                  <button
                    type="submit"
                    className="bg-[#B49A72] text-[#49332D] hover:bg-[#B49A72]/90 font-medium text-xs px-4 py-2.5 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Col 3: Silhouettes */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#B49A72] font-semibold mb-4">
              Silhouettes
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F3ED]/80">
              <li>
                <button onClick={() => onNavigate('shop', 'top-handle')} className="hover:text-[#B49A72] transition-colors">
                  Top-Handle Bags
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'tote')} className="hover:text-[#B49A72] transition-colors">
                  The Everyday Totes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'shoulder')} className="hover:text-[#B49A72] transition-colors">
                  Shoulder Bags
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'crossbody')} className="hover:text-[#B49A72] transition-colors">
                  Crossbody & Saddles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'evening')} className="hover:text-[#B49A72] transition-colors">
                  Evening Minaudières
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'mini')} className="hover:text-[#B49A72] transition-colors">
                  Architectural Minis
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Atelier Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#B49A72] font-semibold mb-4">
              Atelier Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F3ED]/80">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-[#B49A72] transition-colors">
                  Track Your Commission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping')} className="hover:text-[#B49A72] transition-colors">
                  Pakistan Courier Logistics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping')} className="hover:text-[#B49A72] transition-colors">
                  International Delivery & Customs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#B49A72] transition-colors">
                  Authenticity & Warranty
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#B49A72] transition-colors">
                  Bespoke Appointment
                </button>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${brandSettings.whatsappConcierge.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-[#B49A72] transition-colors block"
                >
                  WhatsApp Concierge
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: The House */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#B49A72] font-semibold mb-4">
              The House
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F3ED]/80">
              <li>
                <button onClick={() => onNavigate('story')} className="hover:text-[#B49A72] transition-colors">
                  Heritage & Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('collections')} className="hover:text-[#B49A72] transition-colors">
                  Collection Archives
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-[#B49A72] transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-[#B49A72] transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-[#B49A72] hover:underline transition-colors">
                  Admin Dashboard Portal
                </button>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-[#F7F3ED]/10">
              <p className="text-[11px] text-[#F7F3ED]/60 mb-2">Display Currency</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CURRENCY_RATES) as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => onCurrencyChange(c)}
                    className={`px-2 py-0.5 text-[11px] border transition-colors ${
                      currentCurrency === c 
                        ? 'border-[#B49A72] text-[#B49A72] font-semibold' 
                        : 'border-[#F7F3ED]/20 text-[#F7F3ED]/70 hover:border-[#F7F3ED]/40'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#F7F3ED]/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#F7F3ED]/50 gap-4">
          <p>
            © {new Date().getFullYear()} {brandSettings.brandName}. All rights reserved. Handcrafted in {brandSettings.atelierLocation}.
          </p>
          <div className="flex items-center gap-6">
            <span>Domestic Couriers: TCS · Leopards · Trax</span>
            <span>Worldwide: DHL Express</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
