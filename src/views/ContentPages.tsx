import React, { useState } from 'react';
import { BrandSettings } from '../types';
import { Mail, Phone, MessageSquare, MapPin, ShieldCheck, Truck, ChevronDown, CheckCircle2 } from 'lucide-react';

interface ContentPageProps {
  brandSettings: BrandSettings;
  onNavigateToShop: () => void;
}

// 1. OUR STORY
export const OurStoryView: React.FC<ContentPageProps> = ({ brandSettings, onNavigateToShop }) => {
  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          The House Manifesto
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#49332D] mt-2 font-light">
          The Discipline of Form & Provenance
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
          Maison Élan was founded on a singular conviction: that modern luxury belongs to timeless architecture, rare artisanal hands, and quiet distinction.
        </p>
      </div>

      {/* Hero Narrative Image */}
      <div className="mb-16 aspect-16/9 overflow-hidden border border-[#E7DCCE] relative">
        <img
          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=85"
          alt="Leather cutting in atelier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#49332D]/80 via-transparent to-transparent flex items-end p-8 sm:p-12">
          <p className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F3ED] italic max-w-xl">
            “We don’t produce handbags for seasons. We engineer heirloom companions designed to outlive trends.”
          </p>
        </div>
      </div>

      {/* Editorial Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-[#49332D]/80 font-light leading-relaxed mb-16">
        <div className="space-y-4">
          <h3 className="font-serif-editorial text-2xl text-[#49332D]">The Dual Heritage: Lahore & Paris</h3>
          <p>
            The aesthetic identity of Maison Élan is forged at the crossroads of European haute maroquinerie and the profound, centuries-old leathercraft lineage of Pakistan. Where Paris contributes architectural restraint and proportions governed by the golden ratio, our Lahore atelier brings uncompromising mastery in saddle hand-stitching and bespoke finishings.
          </p>
          <p>
            Every skin is sourced directly from ethical tanneries in Santa Croce sull'Arno, Italy and specialized regional tanneries renowned for vegetable tanning. We refuse synthetic fillers; every panel retains its full, natural temper.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif-editorial text-2xl text-[#49332D]">Thirty-Four Hours of Devotion</h3>
          <p>
            A single Sienne top-handle or Marais tote requires up to thirty-four hours of uninterrupted artisan concentration. Edge sealing alone is performed across four successive layers: sanded by hand, dyed with natural pigments, cured over forty-eight hours, and burnished with heated iron creasers.
          </p>
          <p>
            When you hold a Maison Élan creation, there are no conspicuous oversized logos. Its identity is felt in the density of solid brass hardware, the satin drag of the zipper, and the quiet authority with which it stands on any marble table.
          </p>
        </div>
      </div>

      {/* Values Trio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-[#E7DCCE] text-xs">
        <div className="bg-white border border-[#E7DCCE] p-6 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#B49A72] tracking-wider">Provenance</span>
          <h4 className="font-serif-editorial text-lg text-[#49332D]">Traceable Full-Grain</h4>
          <p className="text-[#49332D]/70">Zero plastic laminates. 100% full-grain calfskins with authentic grain integrity.</p>
        </div>
        <div className="bg-white border border-[#E7DCCE] p-6 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#B49A72] tracking-wider">Permanence</span>
          <h4 className="font-serif-editorial text-lg text-[#49332D]">Lifetime Workshop Care</h4>
          <p className="text-[#49332D]/70">Complimentary edge renewal and hardware inspection for all registered owners.</p>
        </div>
        <div className="bg-white border border-[#E7DCCE] p-6 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#B49A72] tracking-wider">Integrity</span>
          <h4 className="font-serif-editorial text-lg text-[#49332D]">Numbered Editions</h4>
          <p className="text-[#49332D]/70">Each piece is stamped with its individual production year and serial number.</p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <button
          onClick={onNavigateToShop}
          className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3.5 px-8 transition-colors cursor-pointer"
        >
          Discover The Pieces
        </button>
      </div>

    </div>
  );
};

// 2. CONTACT CONCIERGE
export const ContactView: React.FC<ContentPageProps> = ({ brandSettings }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Bespoke Commission Inquiry');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          Client Services
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#49332D] mt-2 font-light">
          Atelier Concierge
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
          Our client advisors are at your service for private viewing appointments, bespoke leather commissions, and order queries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Contact info (5 cols) */}
        <div className="md:col-span-5 space-y-8">
          <div className="bg-white border border-[#E7DCCE] p-6 space-y-6">
            <h3 className="font-serif-editorial text-xl text-[#49332D]">Direct Salons</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B49A72] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#49332D]">Lahore Flagship Atelier</p>
                  <p className="text-[#49332D]/70">MM Alam Road, Gulberg III, Lahore, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B49A72] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#49332D]">Direct Atelier Line</p>
                  <p className="text-[#49332D]/70">{brandSettings.contactPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B49A72] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#49332D]">Official Concierge Email</p>
                  <p className="text-[#49332D]/70">{brandSettings.contactEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-[#B49A72] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#49332D]">Instant WhatsApp Concierge</p>
                  <a
                    href={`https://wa.me/${brandSettings.whatsappConcierge.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#632F39] underline font-medium"
                  >
                    {brandSettings.whatsappConcierge} (Live Chat)
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#632F39] text-[#F7F3ED] text-xs space-y-2">
            <p className="font-serif-editorial text-lg text-white">Private Viewing Hours</p>
            <p className="text-[#F7F3ED]/80">Monday through Saturday: 11:00 AM – 8:00 PM PKT</p>
            <p className="text-[#F7F3ED]/80">By appointment only for bespoke leather selections.</p>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-white border border-[#E7DCCE] p-8 shadow-xs">
          <h3 className="font-serif-editorial text-2xl text-[#49332D] mb-2">Transmit an Inquiry</h3>
          <p className="text-xs text-[#49332D]/60 mb-6">Our client team responds within four business hours.</p>

          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#B49A72] mx-auto" />
              <h4 className="font-serif-editorial text-2xl text-[#49332D]">Inquiry Dispatched</h4>
              <p className="text-xs text-[#49332D]/70 max-w-sm mx-auto">
                Thank you, {name}. A dedicated client advisor will review your note and contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayla Khan"
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                >
                  <option value="Bespoke Commission Inquiry">Bespoke Commission Inquiry</option>
                  <option value="Showroom Private Appointment">Showroom Private Appointment</option>
                  <option value="Existing Order Tracking">Existing Order Tracking</option>
                  <option value="Corporate / Wedding Gifting">Corporate / Wedding Gifting</option>
                  <option value="Press & Editorial Loans">Press & Editorial Loans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How may our atelier assist you?"
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3.5 transition-colors cursor-pointer"
              >
                Transmit to Concierge
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. FREQUENTLY ASKED QUESTIONS (FAQ)
export const FAQView: React.FC<ContentPageProps> = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Where are Maison Élan handbags crafted and what leathers are used?',
      a: 'All pieces are cut and assembled in our Lahore and Paris workshops. We use 100% full-grain European boxcalf, French bullcalf, and Italian nappa tanned with vegetable barks. We strictly avoid faux leather, bonded splits, and plastic coatings.',
    },
    {
      q: 'How does Cash on Delivery (COD) operate across Pakistan?',
      a: 'Cash on Delivery is available for all addresses across Pakistan. You receive an automated SMS and call verification upon order placement. You may inspect the tamper-evident luxury outer seal before handing cash to the courier.',
    },
    {
      q: 'What are the delivery timelines and domestic courier partners?',
      a: 'We partner with TCS Express White Glove and Leopards Luxury Delivery for domestic shipments. Standard delivery takes 2 to 4 business days. For Karachi, Lahore, and Islamabad, express next-day delivery is available.',
    },
    {
      q: 'Do you ship internationally to the UAE, UK, US, and Europe?',
      a: 'Yes. International orders are dispatched via DHL Express Worldwide (3 to 5 business days). International tracking numbers are provided instantly upon atelier handover.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We provide a 14-day complimentary return and exchange window from the date of receipt, provided the leather handbag is unused, in original packaging with unbroken serial tags and dust pouch.',
    },
    {
      q: 'What warranty is provided with each handbag?',
      a: 'Every handbag is accompanied by a Certificate of Origin and a Lifetime Atelier Warranty against structural defects in saddle stitching and solid brass hardware.',
    },
  ];

  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          Information & Guidance
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#49332D] mt-2 font-light">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
          Comprehensive details regarding our artisanal standards, Pakistani and international logistics, and client privileges.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white border border-[#E7DCCE] overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F3ED]/40 transition-colors"
            >
              <h3 className="font-serif-editorial text-lg text-[#49332D]">{f.q}</h3>
              <ChevronDown className={`w-4 h-4 text-[#B49A72] shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-6 pt-2 text-xs text-[#49332D]/80 leading-relaxed font-light border-t border-[#E7DCCE]/50">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. SHIPPING & RETURNS
export const ShippingReturnsView: React.FC<ContentPageProps> = ({ brandSettings }) => {
  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-4xl mx-auto space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          Delivery Protocols
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#49332D] mt-2 font-light">
          Shipping & Returns Policy
        </h1>
      </div>

      <div className="bg-white border border-[#E7DCCE] p-8 sm:p-10 space-y-6 text-xs text-[#49332D]/80 leading-relaxed font-light">
        <h3 className="font-serif-editorial text-2xl text-[#49332D]">Domestic Pakistan Delivery</h3>
        <p>
          We offer complimentary white-glove courier delivery across Pakistan on all orders exceeding PKR {brandSettings.freeShippingThresholdPKR.toLocaleString()}. Orders under this threshold incur a nominal courier fee of PKR 850.
        </p>
        <p>
          Shipments are routed through TCS Express and Leopards Courier with real-time tracking links transmitted to your phone and email. Estimated transit time is 2 to 4 business days.
        </p>

        <h3 className="font-serif-editorial text-2xl text-[#49332D] pt-4 border-t border-[#E7DCCE]">Worldwide International Courier</h3>
        <p>
          International orders are handled exclusively via DHL Express Air Priority (3 to 5 business days). Customs clearances and duties may be assessed depending on the jurisdiction of entry.
        </p>

        <h3 className="font-serif-editorial text-2xl text-[#49332D] pt-4 border-t border-[#E7DCCE]">Fourteen-Day Return Privilege</h3>
        <p>
          Patrons may request a return or exchange within 14 calendar days of handover. The creation must remain in original unused condition with protective hardware plastics intact, wrapped in its cotton dust bag and signature hard gift box.
        </p>
      </div>
    </div>
  );
};

// 5. PRIVACY & TERMS
export const PrivacyTermsView: React.FC<ContentPageProps> = () => {
  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-4xl mx-auto space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          Legal & Governance
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#49332D] mt-2 font-light">
          Privacy Policy & Terms
        </h1>
      </div>

      <div className="bg-white border border-[#E7DCCE] p-8 sm:p-10 space-y-6 text-xs text-[#49332D]/80 leading-relaxed font-light">
        <h3 className="font-serif-editorial text-2xl text-[#49332D]">Patron Privacy & Data Sovereignty</h3>
        <p>
          Maison Élan guarantees that customer personal details, address information, and order records are used exclusively for fulfilling commissions and logistics tracking. We never sell, rent, or lease patron records to third-party commercial networks.
        </p>

        <h3 className="font-serif-editorial text-2xl text-[#49332D] pt-4 border-t border-[#E7DCCE]">Handcrafted Variations</h3>
        <p>
          Because our handbags are crafted from authentic full-grain calfskins with vegetable finishes, subtle natural variations in grain texture and shade depth are celebrated attributes of fine maroquinerie, not defects.
        </p>

        <h3 className="font-serif-editorial text-2xl text-[#49332D] pt-4 border-t border-[#E7DCCE]">Intellectual Property</h3>
        <p>
          All silhouette drawings, metal hardware designs, photography, copy, and trademarks are the exclusive intellectual property of Maison Élan Haute Maroquinerie Ltd.
        </p>
      </div>
    </div>
  );
};
