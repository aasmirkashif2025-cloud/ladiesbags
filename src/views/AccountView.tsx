import React, { useState } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { UserAccount, Order, Currency, ShippingAddress } from '../types';
import { storeService } from '../services/storeService';

interface AccountViewProps {
  currentUser: UserAccount | null;
  currency: Currency;
  onNavigateToTracking: (orderId: string) => void;
  onNavigateToAdmin: () => void;
  onUserChanged: (user: UserAccount | null) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentUser,
  currency,
  onNavigateToTracking,
  onNavigateToAdmin,
  onUserChanged,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'appointments'>('orders');
  
  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Lahore');
  const [newAddrCountry, setNewAddrCountry] = useState('Pakistan');
  const [newAddrPhone, setNewAddrPhone] = useState('+92 ');

  // Appointment Form State
  const [appointmentDate, setAppointmentDate] = useState('2026-10-20');
  const [appointmentCity, setAppointmentCity] = useState('Lahore MM Alam Road Salon');
  const [appointmentSubmitted, setAppointmentSubmitted] = useState(false);

  const orders = storeService.getOrders();
  const userOrders = currentUser 
    ? orders.filter(o => 
        (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
        (Boolean(o.customerId) && o.customerId === currentUser.id)
      ) 
    : [];

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() && loginName.trim()) {
      const u = storeService.loginAsGuest(loginEmail, loginName);
      if (loginPhone) u.phone = loginPhone;
      onUserChanged(u);
    }
  };

  const handleLogout = () => {
    storeService.setCurrentUser(null);
    onUserChanged(null);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newAddrName || !newAddrLine1) return;

    const newAddr: ShippingAddress = {
      fullName: newAddrName,
      email: currentUser.email,
      phone: newAddrPhone || currentUser.phone || '',
      addressLine1: newAddrLine1,
      city: newAddrCity,
      provinceState: newAddrCity === 'Lahore' ? 'Punjab' : 'Territory',
      postalCode: '54000',
      country: newAddrCountry,
    };

    const updatedUser: UserAccount = {
      ...currentUser,
      savedAddresses: [...currentUser.savedAddresses, newAddr],
    };

    storeService.setCurrentUser(updatedUser);
    onUserChanged(updatedUser);
    setShowAddressModal(false);
    setNewAddrName('');
    setNewAddrLine1('');
  };

  const handleDeleteAddress = (index: number) => {
    if (!currentUser) return;
    const updatedAddresses = currentUser.savedAddresses.filter((_, i) => i !== index);
    const updatedUser: UserAccount = {
      ...currentUser,
      savedAddresses: updatedAddresses,
    };
    storeService.setCurrentUser(updatedUser);
    onUserChanged(updatedUser);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentSubmitted(true);
    setTimeout(() => setAppointmentSubmitted(false), 3000);
  };

  // Unauthenticated State: Sign In / Register
  if (!currentUser) {
    return (
      <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-md mx-auto">
        <div className="bg-white border border-[#E7DCCE] p-8 sm:p-10 shadow-xs text-center space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold block mb-1">
              Maison Salon Authentication
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D]">
              {authMode === 'signin' ? 'Patron Sign In' : 'Create Salon Portfolio'}
            </h2>
            <p className="text-xs text-[#49332D]/70 mt-1 font-light leading-relaxed">
              Access your bespoke orders, numbered commission certificates, and saved delivery destinations.
            </p>
          </div>

          {/* Toggle between Sign In & Register */}
          <div className="flex border-b border-[#E7DCCE] text-xs uppercase tracking-wider font-semibold">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 pb-2.5 transition-colors cursor-pointer ${
                authMode === 'signin' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/50 hover:text-[#49332D]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 pb-2.5 transition-colors cursor-pointer ${
                authMode === 'register' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/50 hover:text-[#49332D]'
              }`}
            >
              New Registration
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Full Name*</label>
              <input
                type="text"
                required
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="e.g. Marium Ali"
                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Email Address*</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="patron@domain.com"
                className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs text-[#49332D]/70 mb-1 font-medium">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs p-3 focus:outline-none focus:border-[#632F39]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3.5 transition-colors cursor-pointer mt-2"
            >
              {authMode === 'signin' ? 'Enter Salon Portfolio' : 'Register Patron Profile'}
            </button>
          </form>

          {/* Google Sign-in with Firebase Auth */}
          <div className="pt-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const u = await storeService.signInWithGoogle();
                  onUserChanged(u);
                } catch (err) {
                  console.error('Google sign-in error:', err);
                }
              }}
              className="w-full bg-white border border-[#E7DCCE] hover:border-[#632F39] text-[#49332D] text-xs font-medium py-3 px-4 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google (Firebase)</span>
            </button>
          </div>

          {/* Quick Admin Profile shortcut for verification */}
          <div className="pt-4 border-t border-[#E7DCCE]">
            <button
              onClick={() => {
                const adminProfile: UserAccount = {
                  id: 'admin-1',
                  email: 'ksarwar78@gmail.com',
                  fullName: 'Kamran Sarwar (Atelier Admin)',
                  role: 'admin',
                  savedAddresses: [],
                  createdAt: '2026-01-01',
                };
                storeService.setCurrentUser(adminProfile);
                onUserChanged(adminProfile);
              }}
              className="text-xs text-[#632F39] hover:underline font-medium cursor-pointer"
            >
              Sign In as Atelier Administrator (Default Admin Profile)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Patron Account Dashboard
  return (
    <div className="w-full bg-[#F7F3ED] py-16 px-6 sm:px-12 max-w-5xl mx-auto space-y-8">
      
      {/* Account Profile Header */}
      <div className="bg-white border border-[#E7DCCE] p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#49332D]">
              {currentUser.fullName}
            </h1>
            {currentUser.role === 'admin' ? (
              <span className="bg-[#632F39] text-[#F7F3ED] text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold">
                Atelier Admin
              </span>
            ) : (
              <span className="bg-[#B49A72]/20 text-[#49332D] text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium">
                Verified Patron
              </span>
            )}
          </div>
          <p className="text-xs text-[#49332D]/70 mt-1 font-light">
            Patron Email: <span className="text-[#49332D] font-medium">{currentUser.email}</span> · Member since {currentUser.createdAt.split('T')[0]}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' && (
            <button
              onClick={onNavigateToAdmin}
              className="bg-[#632F39] text-[#F7F3ED] hover:bg-[#49332D] text-xs uppercase tracking-wider py-2.5 px-4 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#B49A72]" />
              <span>Admin Control</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="border border-[#E7DCCE] text-[#49332D] hover:border-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-[#E7DCCE] gap-6 text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/60 hover:text-[#49332D]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Commissions & Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'addresses' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/60 hover:text-[#49332D]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Delivery Addresses ({currentUser.savedAddresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointments' ? 'border-b-2 border-[#632F39] text-[#632F39]' : 'text-[#49332D]/60 hover:text-[#49332D]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bespoke Appointments</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {userOrders.length === 0 ? (
            <div className="bg-white border border-[#E7DCCE] p-12 text-center space-y-3">
              <p className="font-serif-editorial text-2xl text-[#49332D]">No commissions on record</p>
              <p className="text-xs text-[#49332D]/60 max-w-sm mx-auto">
                Explore the atelier catalog to commission your inaugural handcrafted silhouette.
              </p>
            </div>
          ) : (
            userOrders.map((ord) => (
              <div key={ord.id} className="bg-white border border-[#E7DCCE] p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7DCCE] gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#49332D]/60">Reference:</span>
                    <span className="font-mono font-bold text-sm text-[#632F39] ml-1">{ord.id}</span>
                    <span className="text-xs text-[#49332D]/60 ml-3">
                      {new Date(ord.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-medium text-[#632F39] bg-[#F7F3ED] px-2.5 py-1">
                      {ord.fulfillmentStatus.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => onNavigateToTracking(ord.id)}
                      className="text-xs text-[#49332D] hover:text-[#632F39] font-medium flex items-center gap-1 underline cursor-pointer"
                    >
                      <span>Track Logistics</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  {ord.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs">
                      <img src={it.image} alt={it.productName} className="w-12 h-14 object-cover border border-[#E7DCCE]" />
                      <div className="flex-1">
                        <h4 className="font-serif-editorial text-base text-[#49332D]">{it.productName}</h4>
                        <p className="text-[11px] text-[#49332D]/60">Shade: {it.variantColor} · Qty: {it.quantity}</p>
                      </div>
                      <span className="font-medium text-[#49332D]">
                        {storeService.formatPrice(it.priceCharged * it.quantity, ord.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-between text-xs text-[#49332D]/70">
                  <span>Destination: {ord.shippingAddress.city}, {ord.shippingAddress.country}</span>
                  <span className="font-bold text-sm text-[#49332D]">
                    Total Charged: {storeService.formatPrice(ord.totalPKR, currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. SAVED ADDRESSES TAB */}
      {activeTab === 'addresses' && (
        <div className="bg-white border border-[#E7DCCE] p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7DCCE]">
            <div>
              <h3 className="font-serif-editorial text-2xl text-[#49332D]">Saved Delivery Locations</h3>
              <p className="text-xs text-[#49332D]/60 mt-0.5">Pre-configured destinations for expedited courier dispatch.</p>
            </div>
            <button
              onClick={() => setShowAddressModal(true)}
              className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {currentUser.savedAddresses.length === 0 ? (
            <p className="text-xs text-[#49332D]/60 py-6 text-center">
              No saved addresses. Add a delivery destination above or during checkout.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentUser.savedAddresses.map((addr, i) => (
                <div key={i} className="p-5 bg-[#F7F3ED]/40 border border-[#E7DCCE] text-xs space-y-2 relative group">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm text-[#49332D]">{addr.fullName}</p>
                    <button
                      onClick={() => handleDeleteAddress(i)}
                      className="text-[#49332D]/40 hover:text-red-700 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[#49332D]/80 leading-relaxed">
                    {addr.addressLine1}<br />
                    {addr.city}, {addr.provinceState} {addr.postalCode}<br />
                    {addr.country}
                  </p>
                  <p className="text-[11px] text-[#49332D]/60 pt-1">
                    Phone: {addr.phone}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Address Modal */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 bg-[#49332D]/60 flex items-center justify-center p-4">
              <div className="bg-[#F7F3ED] border border-[#E7DCCE] max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
                <h4 className="font-serif-editorial text-2xl text-[#49332D]">Add Delivery Destination</h4>
                
                <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#49332D]/70 mb-1">Recipient Full Name*</label>
                    <input
                      type="text"
                      required
                      value={newAddrName}
                      onChange={(e) => setNewAddrName(e.target.value)}
                      placeholder="e.g. Marium Ali"
                      className="w-full bg-white border border-[#E7DCCE] p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[#49332D]/70 mb-1">Street Address, House No.*</label>
                    <input
                      type="text"
                      required
                      value={newAddrLine1}
                      onChange={(e) => setNewAddrLine1(e.target.value)}
                      placeholder="e.g. House 44, Street 9, DHA Phase 6"
                      className="w-full bg-white border border-[#E7DCCE] p-2.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#49332D]/70 mb-1">City*</label>
                      <input
                        type="text"
                        required
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full bg-white border border-[#E7DCCE] p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[#49332D]/70 mb-1">Country*</label>
                      <select
                        value={newAddrCountry}
                        onChange={(e) => setNewAddrCountry(e.target.value)}
                        className="w-full bg-white border border-[#E7DCCE] p-2.5"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#49332D]/70 mb-1">Contact Phone*</label>
                    <input
                      type="tel"
                      required
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-white border border-[#E7DCCE] p-2.5"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="px-4 py-2 border border-[#E7DCCE] bg-white text-[#49332D]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#632F39] text-[#F7F3ED] uppercase tracking-wider"
                    >
                      Save Destination
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. BESPOKE APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="bg-white border border-[#E7DCCE] p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif-editorial text-2xl text-[#49332D]">Schedule Showroom Consultation</h3>
            <p className="text-xs text-[#49332D]/60 mt-0.5">
              Meet our master maroquiniers at our Lahore MM Alam Road salon or book a private video viewing.
            </p>
          </div>

          {appointmentSubmitted ? (
            <div className="p-6 bg-[#F7F3ED] border border-[#E7DCCE] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#B49A72] mx-auto" />
              <h4 className="font-serif-editorial text-xl text-[#49332D]">Appointment Requested</h4>
              <p className="text-xs text-[#49332D]/70">
                A personal concierge advisor will contact you via WhatsApp to finalize your viewing date.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookAppointment} className="max-w-md space-y-4 text-xs">
              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Viewing Venue</label>
                <select
                  value={appointmentCity}
                  onChange={(e) => setAppointmentCity(e.target.value)}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5"
                >
                  <option value="Lahore MM Alam Road Salon">Lahore MM Alam Road Showroom (In Person)</option>
                  <option value="Private Video Concierge">Private Video Concierge (Zoom / WhatsApp HD)</option>
                  <option value="Paris Rue Saint-Honoré">Paris Rue Saint-Honoré Viewing Salon</option>
                </select>
              </div>

              <div>
                <label className="block text-[#49332D]/70 mb-1 font-medium">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-[#F7F3ED]/40 border border-[#E7DCCE] p-2.5"
                />
              </div>

              <button
                type="submit"
                className="bg-[#49332D] text-[#F7F3ED] hover:bg-[#632F39] text-xs uppercase tracking-widest py-3 px-6 transition-colors cursor-pointer"
              >
                Confirm Appointment Request
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
