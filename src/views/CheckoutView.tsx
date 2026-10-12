import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  CreditCard, 
  Banknote, 
  Building2, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { CartItem, Currency, BrandSettings, PaymentMethod, ShippingAddress, Order } from '../types';
import { storeService } from '../services/storeService';

interface CheckoutViewProps {
  cart: CartItem[];
  currency: Currency;
  brandSettings: BrandSettings;
  onOrderCompleted: (order: Order) => void;
  onNavigateBack: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  currency,
  brandSettings,
  onOrderCompleted,
  onNavigateBack,
}) => {
  // Step State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Authenticated user pre-fill
  const currentUser = storeService.getCurrentUser();
  const defaultAddress = currentUser?.savedAddresses?.[0];

  // Form State
  const [email, setEmail] = useState(() => currentUser?.email || '');
  const [fullName, setFullName] = useState(() => currentUser?.fullName || '');
  const [phone, setPhone] = useState(() => defaultAddress?.phone || currentUser?.phone || '+92 ');
  const [country, setCountry] = useState(() => defaultAddress?.country || 'Pakistan');
  const [addressLine1, setAddressLine1] = useState(() => defaultAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(() => defaultAddress?.addressLine2 || '');
  const [city, setCity] = useState(() => defaultAddress?.city || 'Lahore');
  const [provinceState, setProvinceState] = useState(() => defaultAddress?.provinceState || 'Punjab');
  const [postalCode, setPostalCode] = useState(() => defaultAddress?.postalCode || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Card Simulation State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPKR, setCouponDiscountPKR] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotalPKR = storeService.getCartSubtotalPKR();
  const isDomestic = country.toLowerCase() === 'pakistan';

  // Shipping cost calculation based on brandSettings and selected method
  let shippingCostPKR = 0;
  if (isDomestic) {
    if (shippingMethod === 'express') {
      shippingCostPKR = brandSettings.expressDomesticShippingFeePKR || 1500;
    } else {
      shippingCostPKR = subtotalPKR >= brandSettings.freeShippingThresholdPKR 
        ? 0 
        : (brandSettings.domesticShippingFeePKR || 850);
    }
  } else {
    shippingCostPKR = brandSettings.internationalShippingFeePKR || 12500; // International DHL flat
  }

  // Tax calculation where applicable
  const taxRatePercent = brandSettings.taxRatePercent || 0;
  const taxableBase = Math.max(0, subtotalPKR - couponDiscountPKR);
  const taxPKR = Math.round((taxableBase * taxRatePercent) / 100);

  const totalPKR = Math.max(0, taxableBase + shippingCostPKR + taxPKR);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = storeService.validateCoupon(couponInput, subtotalPKR);
    if (res.valid) {
      setAppliedCoupon(res.coupon?.code || couponInput.toUpperCase());
      setCouponDiscountPKR(res.discountPKR);
      setCouponError(null);
    } else {
      setCouponError(res.error || 'Invalid privilege code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountPKR(0);
    setCouponInput('');
    setCouponError(null);
  };

  const handleSubmitOrder = async () => {
    if (isSubmitting) return;

    if (!email || !fullName || !phone || !addressLine1 || !city) {
      setErrorMessage('Please complete all mandatory delivery fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const address: ShippingAddress = {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        provinceState,
        postalCode: postalCode || '00000',
        country,
      };

      const order = storeService.createOrder({
        customerId: currentUser?.id,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        paymentMethod,
        currency,
        shippingMethod,
        couponCode: appliedCoupon || undefined,
        notes: orderNotes,
      });

      onOrderCompleted(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while creating order.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-6">
        <p className="font-serif-editorial text-2xl text-[#49332D]">Your shopping bag is unoccupied</p>
        <button
          onClick={onNavigateBack}
          className="mt-4 bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-wider py-3 px-6 hover:bg-[#632F39]"
        >
          Return to Atelier
        </button>
      </div>
    );
  }

  const pakistanCities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Peshawar', 'Multan', 'Quetta', 'Sialkot', 'Gujranwala', 
    'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha'
  ];

  return (
    <div className="w-full bg-[#F7F3ED] py-12 px-6 sm:px-12 max-w-7xl mx-auto">
      
      {/* Checkout Progress Stepper */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider font-medium text-[#49332D]/60">
          <span className={step >= 1 ? 'text-[#632F39] font-semibold' : ''}>01. Delivery & Contact</span>
          <span className="h-[1px] w-8 sm:w-16 bg-[#E7DCCE]" />
          <span className={step >= 2 ? 'text-[#632F39] font-semibold' : ''}>02. Courier Shipping</span>
          <span className="h-[1px] w-8 sm:w-16 bg-[#E7DCCE]" />
          <span className={step >= 3 ? 'text-[#632F39] font-semibold' : ''}>03. Atelier Settlement</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Form: Step Content (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E7DCCE] p-6 sm:p-10 shadow-xs">
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: CONTACT & DELIVERY */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-editorial text-2xl text-[#49332D]">01. Patron Contact & Delivery Address</h3>
                <p className="text-xs text-[#49332D]/60 mt-1">
                  Ensure address information matches local courier requirements for seamless delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Email Address (for order tracking dossier)*</label>
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
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Full Name*</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Syeda Fatima"
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Phone Number (with country code)*</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Country / Destination Territory*</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                  >
                    <option value="Pakistan">Pakistan (Domestic White Glove)</option>
                    <option value="United Arab Emirates">United Arab Emirates (DHL Express)</option>
                    <option value="United Kingdom">United Kingdom (DHL Express)</option>
                    <option value="United States">United States (DHL Express)</option>
                    <option value="Saudi Arabia">Saudi Arabia (DHL Express)</option>
                    <option value="Canada">Canada (DHL Express)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Street Address, Suite / Apartment / House No.*</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. House 14, Street 9, Sector F-6/3"
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">City*</label>
                  {isDomestic ? (
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                    >
                      {pakistanCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City name"
                      className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Special Atelier Packaging or Delivery Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Please include handwritten gift card calligraphy or dispatch after 2 PM."
                    className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E7DCCE]">
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="text-xs text-[#49332D]/70 hover:text-[#49332D] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Bag</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!email || !fullName || !phone || !addressLine1) {
                      setErrorMessage('Please fill out all required fields marked with *');
                      return;
                    }
                    setErrorMessage(null);
                    setStep(2);
                  }}
                  className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3 px-6 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Shipping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-editorial text-2xl text-[#49332D]">02. Courier Shipping Protocol</h3>
                <p className="text-xs text-[#49332D]/60 mt-1">
                  Delivering to: <strong className="text-[#49332D]">{addressLine1}, {city}, {country}</strong>
                </p>
              </div>

              <div className="space-y-3">
                {isDomestic ? (
                  <>
                    <label 
                      className={`flex items-start justify-between p-4 border cursor-pointer transition-colors ${
                        shippingMethod === 'standard' ? 'border-[#632F39] bg-[#F7F3ED]/40' : 'border-[#E7DCCE]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="mt-1 accent-[#632F39]"
                        />
                        <div>
                          <p className="font-medium text-xs text-[#49332D]">Standard White-Glove Courier (TCS / Leopards)</p>
                          <p className="text-[11px] text-[#49332D]/60 mt-0.5">2-4 Business Days · Secure Insured Dispatch with Monogrammed Gift Box</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#49332D]">
                        {subtotalPKR >= brandSettings.freeShippingThresholdPKR ? 'COMPLIMENTARY' : storeService.formatPrice(850, currency)}
                      </span>
                    </label>

                    <label 
                      className={`flex items-start justify-between p-4 border cursor-pointer transition-colors ${
                        shippingMethod === 'express' ? 'border-[#632F39] bg-[#F7F3ED]/40' : 'border-[#E7DCCE]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="mt-1 accent-[#632F39]"
                        />
                        <div>
                          <p className="font-medium text-xs text-[#49332D]">Express VIP Same/Next Day Dispatch</p>
                          <p className="text-[11px] text-[#49332D]/60 mt-0.5">Karachi, Lahore & Islamabad Capital Region Priority Logistics</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#49332D]">
                        {storeService.formatPrice(1500, currency)}
                      </span>
                    </label>
                  </>
                ) : (
                  <div className="p-4 border border-[#632F39] bg-[#F7F3ED]/40 flex items-start justify-between">
                    <div>
                      <p className="font-medium text-xs text-[#49332D]">DHL Express Worldwide (Air Priority)</p>
                      <p className="text-[11px] text-[#49332D]/60 mt-0.5">3-5 Business Days · Real-time GPS Tracking & White-Glove Customs Handling</p>
                    </div>
                    <span className="text-xs font-semibold text-[#49332D]">
                      {storeService.formatPrice(12500, currency)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E7DCCE]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#49332D]/70 hover:text-[#49332D] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Address</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3 px-6 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Settlement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-editorial text-2xl text-[#49332D]">03. Atelier Settlement Method</h3>
                <p className="text-xs text-[#49332D]/60 mt-1">
                  Choose your preferred regional or international payment channel.
                </p>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery (Pakistan) */}
                {isDomestic && (
                  <label 
                    className={`block p-4 border cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-[#632F39] bg-[#F7F3ED]/40' : 'border-[#E7DCCE]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-[#632F39]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#B49A72]" />
                          <span className="font-medium text-xs text-[#49332D]">Cash on Delivery (Pakistan Only)</span>
                        </div>
                        <p className="text-[11px] text-[#49332D]/60 mt-1">
                          Inspect your sealed Maison Élan package upon arrival and settle directly with the courier in cash.
                        </p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Raast / Direct Bank Wire */}
                <label 
                  className={`block p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'raast_bank' ? 'border-[#632F39] bg-[#F7F3ED]/40' : 'border-[#E7DCCE]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'raast_bank'}
                      onChange={() => setPaymentMethod('raast_bank')}
                      className="mt-1 accent-[#632F39]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#B49A72]" />
                        <span className="font-medium text-xs text-[#49332D]">Raast Instant Settlement / Official Bank Wire</span>
                      </div>
                      <p className="text-[11px] text-[#49332D]/60 mt-1">
                        Direct interbank transfer to Maison Élan Ltd corporate account (Meezan Bank / HBL Raast ID).
                      </p>

                      {paymentMethod === 'raast_bank' && (
                        <div className="mt-3 p-3 bg-white border border-[#E7DCCE] text-[11px] text-[#49332D]/80 space-y-1">
                          <p><strong>Title:</strong> MAISON ELAN HAUTE MAROQUINERIE LTD</p>
                          <p><strong>Bank:</strong> Meezan Bank Limited (Main Gulberg Branch)</p>
                          <p><strong>IBAN:</strong> PK44 MEZN 0002 0109 8492 8812</p>
                          <p><strong>Raast ID:</strong> 03008492200</p>
                          <p className="text-[#632F39] font-medium pt-1">
                            Use Order Reference as transfer narrative. Your order is reserved immediately upon placement.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Credit / Debit Card Gateway */}
                <label 
                  className={`block p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-[#632F39] bg-[#F7F3ED]/40' : 'border-[#E7DCCE]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1 accent-[#632F39]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#B49A72]" />
                        <span className="font-medium text-xs text-[#49332D]">International Credit or Debit Card</span>
                      </div>
                      <p className="text-[11px] text-[#49332D]/60 mt-1">
                        Visa, Mastercard, American Express with 3D Secure 2.0 end-to-end encryption.
                      </p>

                      {paymentMethod === 'card' && (
                        <div className="mt-3 p-3 bg-white border border-[#E7DCCE] space-y-3">
                          <div>
                            <label className="block text-[10px] text-[#49332D]/60 mb-0.5">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4000 1234 5678 9010"
                              className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-[#49332D]/60 mb-0.5">MM / YY</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="12/28"
                                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-[#49332D]/60 mb-0.5">CVC</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="882"
                                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="p-2.5 bg-[#F7F3ED] border border-[#E7DCCE] rounded-none text-[10px] space-y-1 text-[#49332D]/70">
                            <div className="flex items-center justify-between font-medium text-[#49332D]">
                              <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3 text-[#B49A72]" />
                                <span>Gateway Channel: Paymob Pakistan (Sandbox Mode)</span>
                              </span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800">
                                Test Gateway Active
                              </span>
                            </div>
                            <p>
                              Pre-authorized test credentials: Enter standard sandbox details or test card numbers. No genuine bank cards will be debited until formal State Bank of Pakistan production merchant activation is configured.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              {/* Confirm Order Button */}
              <div className="pt-6 border-t border-[#E7DCCE] space-y-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitOrder}
                  className="w-full bg-[#632F39] text-[#F7F3ED] py-4 px-6 text-xs uppercase tracking-widest font-medium hover:bg-[#49332D] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Registering Atelier Commission...</span>
                  ) : (
                    <>
                      <span>Complete Commission · {storeService.formatPrice(totalPKR, currency)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#49332D]/60">
                  By commissioning this piece, you acknowledge the Maison Élan terms of handcrafted production and delivery.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Right Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E7DCCE] p-6 shadow-xs space-y-6">
            <h3 className="font-serif-editorial text-xl text-[#49332D] pb-3 border-b border-[#E7DCCE]">
              Commissions Summary ({cart.length})
            </h3>

            {/* Item List */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover bg-[#F7F3ED] border border-[#E7DCCE]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif-editorial text-base text-[#49332D] leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#49332D]/60 mt-0.5">
                        Shade: {item.selectedColor} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-[#49332D]">
                      {storeService.formatPrice((item.product.salePricePKR || item.product.pricePKR) * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-4 border-t border-[#E7DCCE]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#F7F3ED] p-3 text-xs text-[#632F39]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-[#B49A72]" />
                    <span>Privilege Code: <strong>{appliedCoupon}</strong> (-{storeService.formatPrice(couponDiscountPKR, currency)})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[#49332D]/60 hover:text-[#632F39] text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Privilege Code (e.g. MAISON10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-2.5 focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-[#49332D] text-[#F7F3ED] text-xs uppercase tracking-wider px-3 py-2.5 hover:bg-[#632F39] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600">{couponError}</p>
                  )}
                  <p className="text-[10px] text-[#49332D]/50">
                    Try "MAISON10" for 10% off or "ATELIERVIP" for Rs. 10,000 credit.
                  </p>
                </form>
              )}
            </div>

            {/* Financial Calculations */}
            <div className="pt-4 border-t border-[#E7DCCE] space-y-2 text-xs">
              <div className="flex justify-between text-[#49332D]/70">
                <span>Subtotal</span>
                <span>{storeService.formatPrice(subtotalPKR, currency)}</span>
              </div>

              {couponDiscountPKR > 0 && (
                <div className="flex justify-between text-[#632F39] font-medium">
                  <span>Privilege Credit</span>
                  <span>-{storeService.formatPrice(couponDiscountPKR, currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#49332D]/70">
                <span>Shipping ({isDomestic ? 'Pakistan Courier' : 'DHL Worldwide'})</span>
                <span>
                  {shippingCostPKR === 0 ? 'COMPLIMENTARY' : storeService.formatPrice(shippingCostPKR, currency)}
                </span>
              </div>

              {taxPKR > 0 ? (
                <div className="flex justify-between text-[#49332D]/70">
                  <span>Regional Sales Tax ({taxRatePercent}%)</span>
                  <span>{storeService.formatPrice(taxPKR, currency)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[#49332D]/70">
                  <span>Taxes & Atelier Tariff</span>
                  <span>Included</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#E7DCCE] flex justify-between items-baseline text-base font-semibold text-[#49332D]">
                <span>Authoritative Total</span>
                <span className="text-xl text-[#632F39]">
                  {storeService.formatPrice(totalPKR, currency)}
                </span>
              </div>

              <p className="text-[10px] text-[#49332D]/50 text-right">
                Authoritative base: Rs. {totalPKR.toLocaleString()} PKR
              </p>
            </div>

            {/* Provider Evaluation & Security Badge */}
            <div className="p-3 bg-[#F7F3ED]/70 border border-[#E7DCCE] text-[11px] text-[#49332D]/75 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[#49332D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B49A72]" />
                <span>Verified Commerce Architecture</span>
              </div>
              <p className="text-[10px] leading-tight">
                Cash on Delivery verified by courier handover. Card checkout operates in verified Sandbox with 3D Secure simulation pending live State Bank of Pakistan merchant authorization.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
