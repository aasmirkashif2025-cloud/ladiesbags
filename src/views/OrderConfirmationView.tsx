import React from 'react';
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order, Currency } from '../types';
import { storeService } from '../services/storeService';

interface OrderConfirmationViewProps {
  order: Order;
  currency: Currency;
  onTrackOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  currency,
  onTrackOrder,
  onContinueShopping,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-4xl mx-auto">
      
      <div className="bg-white border border-[#E7DCCE] p-8 sm:p-12 shadow-sm space-y-8">
        
        {/* Header Confirmation */}
        <div className="text-center space-y-3 pb-8 border-b border-[#E7DCCE]">
          <div className="w-14 h-14 rounded-full bg-[#632F39]/10 text-[#632F39] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49A72] font-semibold block">
            Atelier Commission Confirmed
          </span>

          <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#49332D] font-light">
            Thank You, {order.shippingAddress.fullName.split(' ')[0]}
          </h1>

          <p className="text-xs sm:text-sm text-[#49332D]/80 max-w-md mx-auto leading-relaxed">
            Your piece has entered our workshop docket. A complete commission dossier has been transmitted to <strong className="font-medium text-[#49332D]">{order.customerEmail}</strong>.
          </p>

          <div className="pt-3">
            <div className="inline-block bg-[#F7F3ED] border border-[#E7DCCE] px-4 py-2 text-xs">
              <span className="text-[#49332D]/60 uppercase tracking-wider">Order Reference: </span>
              <strong className="text-[#632F39] text-sm tracking-wider font-mono font-bold">{order.id}</strong>
            </div>
          </div>
        </div>

        {/* Estimated Timeline */}
        <div className="p-4 bg-[#F7F3ED]/60 border border-[#E7DCCE] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[#B49A72]" />
            <div>
              <p className="font-medium text-[#49332D]">Estimated White-Glove Handover</p>
              <p className="text-[11px] text-[#49332D]/60">3-4 business days (Insured TCS / Leopards Courier)</p>
            </div>
          </div>
          <span className="text-[#632F39] font-medium uppercase text-[11px] tracking-wider">
            Status: {order.fulfillmentStatus === 'in_atelier' ? 'In Atelier Workshop' : order.fulfillmentStatus}
          </span>
        </div>

        {/* Items Summary */}
        <div>
          <h3 className="font-serif-editorial text-xl text-[#49332D] mb-4">Commissioned Pieces</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-[#F7F3ED]/30 border border-[#E7DCCE]">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-20 object-cover bg-white"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif-editorial text-lg text-[#49332D]">{item.productName}</h4>
                    <p className="text-xs text-[#49332D]/60">Shade: {item.variantColor} · Qty: {item.quantity}</p>
                    <p className="text-[10px] text-[#49332D]/50">SKU: {item.sku}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#49332D]">
                    {storeService.formatPrice(item.priceCharged * item.quantity, order.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Financial Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#E7DCCE] text-xs">
          
          <div>
            <h4 className="font-semibold text-[#49332D] uppercase tracking-wider mb-2">Delivery Destination</h4>
            <p className="text-[#49332D]/80 leading-relaxed">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.addressLine1}<br />
              {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}\n`}
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#49332D] uppercase tracking-wider mb-2">Settlement Summary</h4>
            <div className="flex justify-between text-[#49332D]/70">
              <span>Subtotal:</span>
              <span>{storeService.formatPrice(order.subtotalPKR, order.currency)}</span>
            </div>
            {order.discountPKR > 0 && (
              <div className="flex justify-between text-[#632F39]">
                <span>Privilege Reduction:</span>
                <span>-{storeService.formatPrice(order.discountPKR, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#49332D]/70">
              <span>Shipping Fee:</span>
              <span>{order.shippingFeePKR === 0 ? 'Complimentary' : storeService.formatPrice(order.shippingFeePKR, order.currency)}</span>
            </div>
            {order.taxPKR !== undefined && order.taxPKR > 0 && (
              <div className="flex justify-between text-[#49332D]/70">
                <span>Regional Sales Tax:</span>
                <span>{storeService.formatPrice(order.taxPKR, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-sm pt-2 border-t border-[#E7DCCE] text-[#49332D]">
              <span>Authoritative Total:</span>
              <span className="text-[#632F39] text-base">
                {storeService.formatPrice(order.totalPKR, order.currency)}
              </span>
            </div>
            <p className="text-[11px] text-[#49332D]/60 pt-1">
              Payment Protocol: <strong className="uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="pt-8 border-t border-[#E7DCCE] flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white border border-[#E7DCCE] text-[#49332D] text-xs hover:border-[#632F39] flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Invoice</span>
            </button>
            <button
              onClick={() => onTrackOrder(order.id)}
              className="px-4 py-2.5 bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-wider hover:bg-[#632F39] flex items-center gap-2 cursor-pointer"
            >
              <span>Track Atelier Logistics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onContinueShopping}
            className="text-xs text-[#49332D]/70 hover:text-[#632F39] hover:underline"
          >
            Return to Atelier Catalog
          </button>
        </div>

      </div>

    </div>
  );
};
