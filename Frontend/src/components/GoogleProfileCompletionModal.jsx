import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  User,
  Sprout,
  ShoppingBag,
  MapPin,
  Phone,
  QrCode,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GoogleProfileCompletionModal = ({
  isOpen,
  onClose,
  googleUser,
  onComplete
}) => {
  const [role, setRole] = useState(googleUser?.role || 'FARMER');

  // Farmer form state
  const [farmerForm, setFarmerForm] = useState({
    name: googleUser?.name || '',
    phone: '',
    village: '',
    district: '',
    state: '',
    land_area: '',
    upi_id: '',
    primary_crops: ''
  });

  // Buyer form state
  const [buyerForm, setBuyerForm] = useState({
    name: googleUser?.name || '',
    phone: '',
    business_name: '',
    buyer_type: 'Wholesaler',
    address: '',
    city: '',
    state: ''
  });

  React.useEffect(() => {
    if (googleUser) {
      setRole(googleUser.role || 'FARMER');
      setFarmerForm((prev) => ({
        ...prev,
        name: googleUser.name || prev.name
      }));
      setBuyerForm((prev) => ({
        ...prev,
        name: googleUser.name || prev.name
      }));
    }
  }, [googleUser]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === 'FARMER') {
      if (!farmerForm.phone || farmerForm.phone.trim().length < 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
      if (!farmerForm.village || !farmerForm.district || !farmerForm.upi_id) {
        toast.error('Please fill in all required farmer location & UPI details');
        return;
      }

      onComplete({
        email: googleUser?.email,
        name: farmerForm.name || googleUser?.name,
        phone: farmerForm.phone,
        role: 'FARMER',
        picture: googleUser?.picture,
        profile: {
          village: farmerForm.village,
          district: farmerForm.district,
          state: farmerForm.state,
          land_area: farmerForm.land_area,
          land_acres: farmerForm.land_area.replace(/[^0-9]/g, '') || '0',
          upi_id: farmerForm.upi_id,
          primary_crops: farmerForm.primary_crops
        }
      });
    } else {
      if (!buyerForm.phone || buyerForm.phone.trim().length < 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
      if (!buyerForm.business_name || !buyerForm.city) {
        toast.error('Please fill in business name & location');
        return;
      }

      onComplete({
        email: googleUser?.email,
        name: buyerForm.name || googleUser?.name,
        phone: buyerForm.phone,
        role: 'BUYER',
        picture: googleUser?.picture,
        profile: {
          business_name: buyerForm.business_name,
          buyer_type: buyerForm.buyer_type,
          address: buyerForm.address,
          city: buyerForm.city,
          state: buyerForm.state
        }
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Account Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Google User Header Banner */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-3 border border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            {googleUser?.picture ? (
              <img
                src={googleUser.picture}
                alt="Google avatar"
                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center border-2 border-white/20">
                {(googleUser?.name || googleUser?.email || 'G').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{googleUser?.name || 'Google User'}</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-extrabold uppercase border border-emerald-500/30">
                  Google Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{googleUser?.email}</p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Step 2 of 2</span>
            <span className="text-xs font-bold text-amber-400">Required Account Info</span>
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Select Your Marketplace Role
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={`p-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'FARMER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Farmer Producer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`p-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'BUYER'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Wholesale Buyer</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {role === 'FARMER' ? (
            /* FARMER DETAILS FORM */
            <div className="space-y-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                  Farmer Location & Farm Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={farmerForm.phone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Village / Taluka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={farmerForm.village}
                    onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={farmerForm.district}
                    onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={farmerForm.state}
                    onChange={(e) => setFarmerForm({ ...farmerForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Land Ownership (Acres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={farmerForm.land_area}
                    onChange={(e) => setFarmerForm({ ...farmerForm, land_area: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-emerald-800 uppercase mb-1 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" /> Direct UPI ID for Payouts <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={farmerForm.upi_id}
                    onChange={(e) => setFarmerForm({ ...farmerForm, upi_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-950 font-mono focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Primary Crops Cultivated
                </label>
                <input
                  type="text"
                  value={farmerForm.primary_crops}
                  onChange={(e) => setFarmerForm({ ...farmerForm, primary_crops: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            /* BUYER DETAILS FORM */
            <div className="space-y-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 border-b border-indigo-200/60 pb-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                  Buyer Business & Shipping Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={buyerForm.phone}
                    onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Business / Firm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyerForm.business_name}
                    onChange={(e) => setBuyerForm({ ...buyerForm, business_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Buyer Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={buyerForm.buyer_type}
                    onChange={(e) => setBuyerForm({ ...buyerForm, buyer_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500"
                  >
                    <option value="Wholesaler">Wholesaler / Mandi Trader</option>
                    <option value="Retail Chain">Retail Chain / Supermarket</option>
                    <option value="Food Processor">Food Processing Unit</option>
                    <option value="Exporter">Agri Exporter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyerForm.city}
                    onChange={(e) => setBuyerForm({ ...buyerForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Shipping / Warehouse Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyerForm.address}
                    onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-5 py-3 rounded-2xl font-black text-xs text-white flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                role === 'FARMER'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              <span>Save & Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
