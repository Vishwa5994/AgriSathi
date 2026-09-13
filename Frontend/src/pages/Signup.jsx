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
import { authApi } from '../api/authApi';
import { triggerGoogleAuth } from '../utils/googleAuth';
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
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

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
      village: '',
      district: '',
      state: '',
      land_area: '',
      upi_id: '',
      business_name: '',
      buyer_type: 'Wholesaler',
      address: '',
      city: ''
    }
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const navigateBasedOnRole = (role) => {
    if (role === 'ADMIN') {
      navigate('/admin-dashboard');
    } else if (role === 'FARMER') {
      navigate('/farmer-dashboard');
    } else if (role === 'BUYER') {
      navigate('/buyer-dashboard');
    } else {
      navigate('/marketplace');
    }
  };

  const handleGoogleCallback = (authPayload) => {
    loginWithGoogle(authPayload)
      .then((res) => {
        const user = res.user || res;
        const isNewUser = res.isNewUser || user.role === 'PENDING' || !user.phone;

        if (isNewUser) {
          setPendingGoogleUser(user);
          setIsProfileCompletionOpen(true);
        } else {
          navigateBasedOnRole(user.role);
        }
      })
      .catch((err) => {
        console.error('Google sign in error:', err);
      });
  };

  const handleGoogleSignUp = () => {
    triggerGoogleAuth({
      onSuccess: (authPayload) => handleGoogleCallback(authPayload),
      onError: (err) => console.error('Google signup error:', err),
      selectRole: selectedRole
    });
  };

  // Automated Google OAuth Redirect Callback Handler
  React.useEffect(() => {
    const hashOrQuery = window.location.hash || window.location.search;
    if (hashOrQuery && (hashOrQuery.includes('access_token') || hashOrQuery.includes('id_token') || hashOrQuery.includes('error='))) {
      const params = new URLSearchParams(hashOrQuery.replace('#', '?'));
      const error = params.get('error');
      if (error) {
        window.history.replaceState(null, null, window.location.pathname);
        return;
      }
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');

      window.history.replaceState(null, null, window.location.pathname);

      if (accessToken || idToken) {
        handleGoogleCallback({ access_token: accessToken, id_token: idToken });
      }
    }
  }, [navigate]);

  const handleCompleteGoogleProfile = async ({ role, phone }) => {
    try {
      if (!pendingGoogleUser?.user_id) return;
      const updatedUser = await authApi.updateUser(pendingGoogleUser.user_id, { role, phone });
      setIsProfileCompletionOpen(false);
      setPendingGoogleUser(null);
      navigateBasedOnRole(updatedUser?.role || role);
    } catch (e) {
      console.error('Failed to complete Google profile:', e);
    }
  };

  const onSubmit = async (data) => {
    const profile =
      selectedRole === 'FARMER'
        ? {
            village: data.village || '',
            district: data.district || '',
            state: data.state || '',
            land_area: data.land_area || '',
            upi_id: data.upi_id || ''
          }
        : {
            business_name: data.business_name || '',
            buyer_type: data.buyer_type || 'Wholesaler',
            address: data.address || '',
            city: data.city || ''
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
              onClick={handleGoogleSignUp}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer group"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Sign up with Google</span>
            </button>

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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('District')}</label>
                    <input
                      {...register('district')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('State')}</label>
                    <input
                      {...register('state')}
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> {t('UPI ID (For Instant Direct Payouts)')}
                    </label>
                    <input
                      {...register('upi_id')}
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t('City')}</label>
                    <input
                      {...register('city')}
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
