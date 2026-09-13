import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, Sparkles, UserCheck, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GoogleProfileCompletionModal } from '../components/GoogleProfileCompletionModal';
import { authApi } from '../api/authApi';
import { triggerGoogleAuth } from '../utils/googleAuth';
import { motion, AnimatePresence } from 'framer-motion';

export const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const Login = () => {
  const { login, loginWithGoogle, loading, switchDemoRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

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

  const handleGoogleCallback = async (authPayload) => {
    setErrorMsg('');
    try {
      // 1. Authenticate with Google on Backend FIRST
      const res = await loginWithGoogle(authPayload);
      const user = res.user || res;
      const isNewUser = res.isNewUser || user.role === 'PENDING' || !user.phone;

      if (isNewUser) {
        setPendingGoogleUser(user);
        setIsProfileCompletionOpen(true);
      } else {
        navigateBasedOnRole(user.role);
      }
    } catch (e) {
      console.error('Google login error:', e);
      setErrorMsg(e.message || 'Google authentication failed.');
    }
  };

  // Automated Google OAuth Redirect Callback Handler
  React.useEffect(() => {
    const hashOrQuery = window.location.hash || window.location.search;
    if (hashOrQuery && (hashOrQuery.includes('access_token') || hashOrQuery.includes('id_token') || hashOrQuery.includes('error='))) {
      const params = new URLSearchParams(hashOrQuery.replace('#', '?'));
      const error = params.get('error');
      if (error) {
        window.history.replaceState(null, null, window.location.pathname);
        setErrorMsg('Google sign in was cancelled or denied.');
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
    setErrorMsg('');
    try {
      if (!pendingGoogleUser?.user_id) return;
      const updatedUser = await authApi.updateUser(pendingGoogleUser.user_id, { role, phone });
      setIsProfileCompletionOpen(false);
      setPendingGoogleUser(null);
      navigateBasedOnRole(updatedUser?.role || role);
    } catch (e) {
      setErrorMsg(e.message || 'Failed to complete profile details');
    }
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const user = await login(data.email, data.password);
      navigateBasedOnRole(user.role);
    } catch (e) {
      setErrorMsg('Invalid credentials or network issue');
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    triggerGoogleAuth({
      onSuccess: (authPayload) => handleGoogleCallback(authPayload),
      onError: (err) => setErrorMsg(typeof err === 'string' ? err : 'Google Sign-In failed'),
      selectRole: 'FARMER'
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('Sign In to Agriसाथी')}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {t('Access your farmer sales dashboard or buyer sourcing portal')}
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-200">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Google Sign In Primary Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer group"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Log in with Google</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or email sign in
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('Email Address')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 font-semibold mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('Password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={ArrowRight}
              size="lg"
            >
              {t('Sign In')}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              {t("Don't have an account?")}{' '}
              <Link to="/signup" className="font-bold text-emerald-700 hover:text-emerald-800">
                {t('Register as Farmer or Buyer')}
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

