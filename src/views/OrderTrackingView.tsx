import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { Order, Currency } from '../types';
import { storeService } from '../services/storeService';

interface OrderTrackingViewProps {
  initialOrderId?: string;
  currency: Currency;
  onNavigateToShop: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderId,
  currency,
  onNavigateToShop,
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderId || '');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      const ord = storeService.getOrderById(initialOrderId);
      if (ord) setFoundOrder(ord);
      setSearched(true);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const ord = storeService.getOrderById(orderQuery.trim());
    setFoundOrder(ord || null);
    setSearched(true);
  };

  const steps = [
    { key: 'confirmed', label: 'Commission Received', icon: CheckCircle2 },
    { key: 'in_atelier', label: 'In Atelier Workshop', icon: Clock },
    { key: 'dispatched', label: 'Dispatched via Courier', icon: Truck },
    { key: 'delivered', label: 'White-Glove Handover', icon: Package },
  ];

  const getStepStatus = (stepIndex: number, currentFulfillment: string) => {
    const orderMap: Record<string, number> = {
      unfulfilled: 0,
      in_atelier: 1,
      dispatched: 2,
      delivered: 3,
      cancelled: -1,
    };
    const current = orderMap[currentFulfillment] ?? 1;
    if (stepIndex < current) return 'completed';
    if (stepIndex === current) return 'active';
    return 'upcoming';
  };

  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-4xl mx-auto">
      
      {/* Editorial Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold">
          Logistics Concierge
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#49332D] mt-2 font-light">
          Track Your Atelier Commission
        </h1>
        <p className="text-xs sm:text-sm text-[#49332D]/70 mt-3 font-light leading-relaxed">
          Follow your handcrafted piece from the cutting table in our master maroquinerie workshop through insured courier transit to your residence.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-8 flex max-w-md mx-auto">
          <input
            type="text"
            required
            placeholder="e.g. ME-2026-8941"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="flex-1 bg-white border border-[#E7DCCE] text-xs p-3.5 focus:outline-none focus:border-[#632F39] uppercase font-mono tracking-wider"
          />
          <button
            type="submit"
            className="bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-widest px-6 hover:bg-[#632F39] transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Locate</span>
          </button>
        </form>

        <p className="text-[11px] text-[#49332D]/50 mt-2">
          Tip: Sample active reference: <strong className="text-[#632F39] font-mono cursor-pointer" onClick={() => { setOrderQuery('ME-2026-8941'); setFoundOrder(storeService.getOrderById('ME-2026-8941') || null); setSearched(true); }}>ME-2026-8941</strong> or <strong className="text-[#632F39] font-mono cursor-pointer" onClick={() => { setOrderQuery('ME-2026-8812'); setFoundOrder(storeService.getOrderById('ME-2026-8812') || null); setSearched(true); }}>ME-2026-8812</strong>
        </p>
      </div>

      {/* Results */}
      {searched && (
        foundOrder ? (
          <div className="bg-white border border-[#E7DCCE] p-8 sm:p-12 shadow-sm space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7DCCE] gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60">Order Reference</span>
                <h3 className="font-mono text-xl sm:text-2xl font-bold text-[#632F39]">{foundOrder.id}</h3>
                <p className="text-xs text-[#49332D]/70 mt-0.5">
                  Commissioned on {new Date(foundOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60">Payment Status</span>
                <p className="text-xs font-semibold text-[#49332D] uppercase mt-0.5">
                  {foundOrder.paymentMethod.toUpperCase()} · <span className="text-emerald-700">{foundOrder.paymentStatus}</span>
                </p>
                {foundOrder.trackingNumber && (
                  <p className="text-xs text-[#632F39] font-mono font-medium mt-1">
                    Courier: {foundOrder.carrier} · #{foundOrder.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Stepper Visualizer */}
            <div className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((st, idx) => {
                  const state = getStepStatus(idx, foundOrder.fulfillmentStatus);
                  const Icon = st.icon;

                  return (
                    <div key={st.key} className="text-center p-3 relative">
                      <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 transition-colors ${
                        state === 'completed'
                          ? 'bg-[#632F39] text-[#F7F3ED]'
                          : state === 'active'
                          ? 'bg-[#B49A72] text-[#49332D] ring-4 ring-[#B49A72]/20'
                          : 'bg-[#F7F3ED] text-[#49332D]/40 border border-[#E7DCCE]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs font-medium ${state === 'upcoming' ? 'text-[#49332D]/50' : 'text-[#49332D]'}`}>
                        {st.label}
                      </p>
                      <p className="text-[10px] text-[#49332D]/60 mt-0.5 capitalize">
                        {state === 'completed' ? 'Completed' : state === 'active' ? 'Current Stage' : 'Pending'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Audit Trail */}
            <div className="pt-6 border-t border-[#E7DCCE]">
              <h4 className="font-serif-editorial text-lg text-[#49332D] mb-4">
                Workshop & Transit Log
              </h4>
              <div className="space-y-4">
                {foundOrder.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-4 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#B49A72] mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#49332D] capitalize">{h.status.replace('_', ' ')}</p>
                      <p className="text-[#49332D]/80 mt-0.5">{h.note}</p>
                      <span className="text-[10px] text-[#49332D]/50">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination & Items */}
            <div className="pt-6 border-t border-[#E7DCCE] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <p className="text-[10px] uppercase font-semibold text-[#49332D]/60 mb-1">Destination Address</p>
                <p className="text-[#49332D]/80">
                  {foundOrder.shippingAddress.fullName}<br />
                  {foundOrder.shippingAddress.addressLine1}, {foundOrder.shippingAddress.city}<br />
                  {foundOrder.shippingAddress.country}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-[#49332D]/60 mb-1">Pieces in Package</p>
                <div className="space-y-1">
                  {foundOrder.items.map((it, i) => (
                    <p key={i} className="text-[#49332D]/80">
                      <strong>{it.quantity}×</strong> {it.productName} ({it.variantColor})
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-[#E7DCCE] p-12 text-center">
            <p className="font-serif-editorial text-2xl text-[#49332D]">No commission record matches "{orderQuery}"</p>
            <p className="text-xs text-[#49332D]/60 mt-2 max-w-sm mx-auto">
              Please verify your reference number sent to your email, or contact our concierge via WhatsApp for live assistance.
            </p>
          </div>
        )
      )}

    </div>
  );
};
