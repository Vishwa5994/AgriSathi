import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sprout, ShoppingBag, ArrowRight, QrCode, Building, MapPin, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GoogleIcon } from './Login';
import { GoogleProfileCompletionModal } from '../components/GoogleProfileCompletionModal';
import { motion, AnimatePresence } from 'framer-motion';

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['FARMER', 'BUYER']),
  // Farmer fields
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  land_area: z.string().optional(),
  upi_id: z.string().optional(),
  // Buyer fields
  business_name: z.string().optional(),
  buyer_type: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional()
});

export const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') || 'FARMER').toUpperCase();
  const [selectedRole, setSelectedRole] = useState(initialRole === 'BUYER' ? 'BUYER' : 'FARMER');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const { signup, loginWithGoogle, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: selectedRole,
      name: '',
      email: '',
      phone: '',
      password: '',
      village: 'Pimpalgaon',
      district: 'Nashik',
      state: 'Maharashtra',
      land_area: '5 Acres',
      upi_id: 'myfarmer@upi',
      business_name: 'Green Grocers & Supplies',
      buyer_type: 'Wholesaler',
      address: 'APMC Grain Market Yard',
      city: 'Mumbai'
    }
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const handleGoogleRedirect = () => {
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSubmit = (accountData) => {
    setIsGoogleModalOpen(false);
    setPendingGoogleUser({
      email: accountData.email || 'jayvekariya1107@gmail.com',
      name: accountData.name || 'Jay Vekariya',
      role: selectedRole,
      picture: accountData.picture
    });
    setIsProfileCompletionOpen(true);
  };

  const handleCompleteGoogleProfile = async (fullUserData) => {
    try {
      const user = await loginWithGoogle(fullUserData);
      setIsProfileCompletionOpen(false);
      if (user.role === 'FARMER') navigate('/farmer-dashboard');
      else navigate('/buyer-dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit = async (data) => {
    const profile =
      selectedRole === 'FARMER'
        ? {
            village: data.village || 'Pimpalgaon',
            district: data.district || 'Nashik',
            state: data.state || 'Maharashtra',
            land_area: data.land_area || '5 Acres',
            upi_id: data.upi_id || 'farmer@upi'
          }
        : {
            business_name: data.business_name || 'Agri Sourcing Co.',
            buyer_type: data.buyer_type || 'Wholesaler',
            address: data.address || 'Market Yard Gate 1',
            city: data.city || 'Mumbai'
          };

    try {
      const user = await signup({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: selectedRole,
        profile
      });

      if (user.role === 'FARMER') navigate('/farmer-dashboard');
      else navigate('/buyer-dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('Create Your Account')}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {t("Join India's transparent direct agricultural trade ecosystem")}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRoleChange('FARMER')}
            className={`py-3 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'FARMER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-4 h-4" /> {t('I am a Farmer')}
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('BUYER')}
            className={`py-3 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'BUYER'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> {t('I am a Buyer')}
          </button>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-200">
          {/* Quick Sign up with Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleGoogleRedirect()}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer group"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Sign up with Google</span>
            </button>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>Redirects to Google Sign-In</span>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Demo Google Accounts
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or fill registration form
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('Full Name')}
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g. Ramesh Kumar Patel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('Mobile Phone')} (+91)
                </label>
                <input
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {errors.phone && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('Email Address')}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@agrimarket.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('Password')}
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {errors.password && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role-Specific Completion Fields */}
            {selectedRole === 'FARMER' ? (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> {t('Step 2: Farmer Land & UPI Details')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('Village')}</label>
                    <input
                      {...register('village')}
                      placeholder="Pimpalgaon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('District')}</label>
                    <input
                      {...register('district')}
                      placeholder="Nashik"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('State')}</label>
                    <input
                      {...register('state')}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {t('Land Area')} ({t('Acres')})
                    </label>
                    <input
                      {...register('land_area')}
                      placeholder="e.g. 8 Acres"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> {t('UPI ID (For Instant Direct Payouts)')}
                    </label>
                    <input
                      {...register('upi_id')}
                      placeholder="e.g. ramesh@okaxis"
                      className="w-full px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                  <Building className="w-4 h-4" /> {t('Step 2: Buyer Business Profile')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {t('Business Name')}
                    </label>
                    <input
                      {...register('business_name')}
                      placeholder="FreshMandi Wholesale Pvt Ltd"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {t('Buyer Category')}
                    </label>
                    <select
                      {...register('buyer_type')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="Wholesaler">{t('wholesaler')} / APMC Trader</option>
                      <option value="Retailer">{t('retailer')}</option>
                      <option value="Restaurant">{t('restaurant')}</option>
                      <option value="Consumer">{t('consumer')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {t('Office / Warehouse Address')}
                    </label>
                    <input
                      {...register('address')}
                      placeholder="Gate 3, APMC Market Yard"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('City')}</label>
                    <input
                      {...register('city')}
                      placeholder="Mumbai / Delhi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant={selectedRole === 'FARMER' ? 'primary' : 'secondary'}
              fullWidth
              loading={loading}
              icon={ArrowRight}
              size="lg"
            >
              {t('Complete Registration')}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              {t('Already registered?')}{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
                {t('Sign in here')}
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Google Authentication Accounts Modal */}
      <AnimatePresence>
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                    <GoogleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                      Sign up with Google
                    </h3>
                    <p className="text-xs text-slate-300">
                      Register as {selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select a Google Account:
                </p>

                {/* Preset Accounts */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleSubmit({
                        name: 'Neel Yadav',
                        email: 'neelyadav6131@gmail.com'
                      })
                    }
                    className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-700 text-amber-300 font-black flex items-center justify-center shadow-xs text-sm">
                        NY
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-950">
                          Neel Yadav
                        </p>
                        <p className="text-xs text-slate-600 font-mono">neelyadav6131@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full uppercase">
                      Google User
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleSubmit({
                        name: 'Ramesh Patel',
                        email: 'ramesh.patel.farmer@gmail.com',
                        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                      })
                    }
                    className="w-full p-3.5 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                        RP
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-900">
                          Ramesh Patel
                        </p>
                        <p className="text-xs text-slate-500">ramesh.patel.farmer@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                      Farmer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleSubmit({
                        name: 'Vikram Malhotra',
                        email: 'vikram.malhotra.buyer@gmail.com',
                        picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
                      })
                    }
                    className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                        VM
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-900">
                          Vikram Malhotra
                        </p>
                        <p className="text-xs text-slate-500">vikram.malhotra.buyer@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full uppercase">
                      Buyer
                    </span>
                  </button>
                </div>

                {/* Custom Google Account Section */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Or sign up with custom Google details:
                  </p>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="email"
                      placeholder="user@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      disabled={!customGoogleEmail}
                      onClick={() =>
                        handleGoogleSubmit({
                          name: customGoogleName || 'Google User',
                          email: customGoogleEmail
                        })
                      }
                      size="md"
                    >
                      Continue with Custom Google Account
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google Profile Completion Modal */}
      <GoogleProfileCompletionModal
        isOpen={isProfileCompletionOpen}
        onClose={() => setIsProfileCompletionOpen(false)}
        googleUser={pendingGoogleUser}
        onComplete={handleCompleteGoogleProfile}
      />
    </div>
  );
};
