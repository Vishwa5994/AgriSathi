import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  Sprout,
  ShoppingBag,
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GoogleProfileCompletionModal = ({
  isOpen,
  onClose,
  googleUser,
  onComplete
}) => {
  const [role, setRole] = useState(googleUser?.role && googleUser.role !== 'PENDING' ? googleUser.role : 'FARMER');
  const [phone, setPhone] = useState(googleUser?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (googleUser) {
      if (googleUser.role && googleUser.role !== 'PENDING') {
        setRole(googleUser.role);
      }
      if (googleUser.phone) {
        setPhone(googleUser.phone);
      }
    }
  }, [googleUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      await onComplete({
        role,
        phone: cleanPhone
      });
    } catch (err) {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Profile"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Google User Identity Card */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-3 border border-slate-800 shadow-md">
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
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-extrabold uppercase border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Google Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{googleUser?.email}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          Welcome to AgriSaathi! Select your role and enter your contact number to finalize your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Select Your Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={`p-3.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'FARMER'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Sprout className="w-5 h-5" />
                <span>Farmer Producer</span>
                <span className={`text-[10px] font-medium ${role === 'FARMER' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  Sell crops directly
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`p-3.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'BUYER'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Wholesale Buyer</span>
                <span className={`text-[10px] font-medium ${role === 'BUYER' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  Source produce directly
                </span>
              </button>
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={13}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Used for trade order notifications and direct buyer-farmer coordination.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-3 rounded-2xl font-black text-xs text-white flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                role === 'FARMER'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              <span>{submitting ? 'Saving Profile...' : 'Save & Enter Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
