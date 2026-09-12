import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  User,
  MapPin,
  Sprout,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  Award,
  TrendingUp,
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Ramesh Kumar Patel',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'ramesh.farmer@agrimarket.in',
    village: user?.profile?.village || 'Pimpalgaon',
    district: user?.profile?.district || 'Nashik',
    state: user?.profile?.state || 'Maharashtra',
    land_area: user?.profile?.land_area || '12 Acres',
    upi_id: user?.profile?.upi_id || 'ramesh.patel@okaxis',
    bank_name: user?.profile?.bank_name || 'State Bank of India',
    account_no: user?.profile?.account_no || 'XXXX XXXX 4829',
    ifsc_code: user?.profile?.ifsc_code || 'SBIN0001429',
    primary_crops: user?.profile?.primary_crops || 'Wheat, Red Onion, Hybrid Tomato'
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'Ramesh Kumar Patel',
        phone: user.phone || '+91 98765 43210',
        email: user.email || 'ramesh.farmer@agrimarket.in',
        village: user.profile?.village || 'Pimpalgaon',
        district: user.profile?.district || 'Nashik',
        state: user.profile?.state || 'Maharashtra',
        land_area: user.profile?.land_area || user.profile?.land_acres ? `${user.profile?.land_acres} Acres` : '12 Acres',
        upi_id: user.profile?.upi_id || 'ramesh.patel@okaxis',
        bank_name: user.profile?.bank_name || 'State Bank of India',
        account_no: user.profile?.account_no || 'XXXX XXXX 4829',
        ifsc_code: user.profile?.ifsc_code || 'SBIN0001429',
        primary_crops: user.profile?.primary_crops || 'Wheat, Red Onion, Hybrid Tomato'
      });
    }
  }, [user, isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (updateProfile) {
        await updateProfile({
          name: formData.name,
          phone: formData.phone,
          profile: {
            ...user?.profile,
            village: formData.village,
            district: formData.district,
            state: formData.state,
            land_area: formData.land_area,
            upi_id: formData.upi_id,
            bank_name: formData.bank_name,
            account_no: formData.account_no,
            ifsc_code: formData.ifsc_code,
            primary_crops: formData.primary_crops
          }
        });
      }
      setIsEditing(false);
      toast.success('Farmer profile details updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Farmer Profile & Account Details"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header Profile Summary Banner */}
        <div className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-900/50">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-300">
              {(formData?.name || 'F').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight text-white">{formData.name}</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-extrabold flex items-center gap-1 uppercase">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {formData.village}, {formData.district}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" /> {formData.land_area}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shrink-0 relative z-10"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? 'Cancel Edit' : 'Edit Details'}
          </button>
        </div>

        {/* DETAILS CONTENT / FORM */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Village</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Land Ownership (Acres)</label>
                <input
                  type="text"
                  value={formData.land_area}
                  onChange={(e) => setFormData({ ...formData, land_area: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Direct UPI ID for Payouts</label>
                <input
                  type="text"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-950 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Crops Grown</label>
                <input
                  type="text"
                  value={formData.primary_crops}
                  onChange={(e) => setFormData({ ...formData, primary_crops: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Section 1: Personal & Contact Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <User className="w-4 h-4 text-emerald-600" /> Personal & Account Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{formData.name}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> Phone Number
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{formData.phone}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" /> Email Address
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs mt-0.5 block truncate">{formData.email}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Role</span>
                  <span className="font-extrabold text-emerald-700 text-xs mt-0.5 block uppercase">Farmer Producer</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Verification Status</span>
                  <span className="font-extrabold text-emerald-800 text-xs mt-0.5 block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> KCC Verified (Govt ID)
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Farmer Rating</span>
                  <span className="font-extrabold text-amber-600 text-xs mt-0.5 block">4.9 ★★★★★ (38 Sales)</span>
                </div>
              </div>
            </div>

            {/* Section 2: Farm Location & Agricultural Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <MapPin className="w-4 h-4 text-amber-500" /> Farm Location & Produce Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Village / Taluka</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{formData.village}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">District</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{formData.district}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">State</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{formData.state}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Land Area</span>
                  <span className="font-extrabold text-emerald-800 text-sm mt-0.5 block">{formData.land_area}</span>
                </div>
              </div>

              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-xs">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">Primary Crops Cultivated</span>
                <p className="font-extrabold text-slate-900 text-sm mt-1">{formData.primary_crops}</p>
              </div>
            </div>

            {/* Section 3: Banking & UPI Direct Payout Setup */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <QrCode className="w-4 h-4 text-emerald-600" /> Direct UPI & Bank Settlement Setup
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" /> Direct UPI ID (Primary)
                  </span>
                  <p className="font-black text-emerald-950 text-base font-mono">{formData.upi_id}</p>
                  <p className="text-[11px] text-emerald-800 font-medium">Buyer payments go straight to this UPI ID without middleman fees.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-600" /> Linked Bank Account
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">{formData.bank_name}</p>
                    <p className="text-xs text-slate-600 font-mono">Account: {formData.account_no} • IFSC: {formData.ifsc_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
