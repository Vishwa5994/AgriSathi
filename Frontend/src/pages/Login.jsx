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
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleRole, setCustomGoogleRole] = useState('FARMER');
  const [selectedPresetAccount, setSelectedPresetAccount] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'ramesh.farmer@agrimarket.in',
      password: 'password123'
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

  const checkAndProceedGoogleLogin = async (googleUserData) => {
    try {
      const usersRaw = localStorage.getItem('agri_users');
      const storedUsers = usersRaw ? JSON.parse(usersRaw) : MOCK_USERS;
      const existing = storedUsers.find(
        (u) => u.email?.toLowerCase() === (googleUserData.email || '').toLowerCase()
      );

      if (existing && existing.isProfileCompleted) {
        const user = await loginWithGoogle({ ...googleUserData, role: existing.role });
        navigateBasedOnRole(user.role);
      } else if (googleUserData.isPresetDemo) {
        const user = await loginWithGoogle({
          ...googleUserData,
          isProfileCompleted: true,
          profile:
            googleUserData.role === 'FARMER'
              ? { village: 'Pimpalgaon', district: 'Nashik', state: 'Maharashtra', upi_id: 'ramesh.patel@okaxis' }
              : { business_name: 'FreshMandi Wholesale Pvt Ltd', buyer_type: 'Wholesaler', city: 'Mumbai' }
        });
        navigateBasedOnRole(user.role);
      } else {
        setPendingGoogleUser({
          email: googleUserData.email || 'jayvekariya1107@gmail.com',
          name: googleUserData.name || 'Jay Vekariya',
          role: googleUserData.role || 'FARMER',
          picture: googleUserData.picture
        });
        setIsProfileCompletionOpen(true);
      }
    } catch (e) {
      setErrorMsg('Failed to process Google sign in');
    }
  };

  // Automated Google OAuth Redirect Callback Handler
  React.useEffect(() => {
    const hashOrQuery = window.location.hash || window.location.search;
    if (hashOrQuery && (hashOrQuery.includes('access_token') || hashOrQuery.includes('id_token'))) {
      const params = new URLSearchParams(hashOrQuery.replace('#', '?'));
      const accessToken = params.get('access_token');
      const stateRaw = params.get('state');
      let role = 'FARMER';
      try {
        if (stateRaw) {
          const parsedState = JSON.parse(decodeURIComponent(stateRaw));
          if (parsedState?.role) role = parsedState.role;
        }
      } catch (e) {
        console.error('Failed to parse OAuth state', e);
      }

      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then((res) => res.json())
          .then(async (googleUser) => {
            window.history.replaceState(null, null, window.location.pathname);
            if (googleUser.email) {
              checkAndProceedGoogleLogin({
                email: googleUser.email,
                name: googleUser.name || googleUser.given_name,
                role: role,
                picture: googleUser.picture
              });
            } else {
              setIsGoogleModalOpen(true);
            }
          })
          .catch(async () => {
            window.history.replaceState(null, null, window.location.pathname);
            setIsGoogleModalOpen(true);
          });
      }
    }
  }, [navigate]);

  const handleCompleteGoogleProfile = async (fullUserData) => {
    setErrorMsg('');
    try {
      const user = await loginWithGoogle(fullUserData);
      setIsProfileCompletionOpen(false);
      setPendingGoogleUser(null);
      navigateBasedOnRole(user.role);
    } catch (e) {
      setErrorMsg('Failed to process Google profile details');
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

  const handleQuickDemo = (role) => {
    setErrorMsg('');
    const demoUser = switchDemoRole(role);
    if (demoUser) {
      navigateBasedOnRole(demoUser.role);
    }
  };

  const handleGoogleRedirect = (role = 'FARMER') => {
    setErrorMsg('');
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSignInSubmit = (accountData) => {
    setIsGoogleModalOpen(false);
    checkAndProceedGoogleLogin({
      email: accountData.email || 'jayvekariya1107@gmail.com',
      name: accountData.name || 'Jay Vekariya',
      role: accountData.role || 'FARMER',
      picture: accountData.picture,
      isPresetDemo: accountData.isPresetDemo
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

        {/* Quick Demo Login Presets */}
        <Card className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white border-none p-4 space-y-3 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" /> Instant 1-Click Demo Login
            </div>
            <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
              No Password Needed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('FARMER')}
              className="p-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold text-left cursor-pointer transition-all border border-emerald-500/40 flex flex-col justify-between group shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-emerald-200 font-extrabold text-[10px] uppercase">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" /> Farmer
              </div>
              <div className="mt-1 font-black text-white text-xs group-hover:text-amber-300 transition-colors">
                Ramesh Patel
              </div>
              <div className="text-[9px] text-emerald-300/80 font-medium truncate">Nashik • 12 Acres</div>
            </button>

            <button
              onClick={() => handleQuickDemo('BUYER')}
              className="p-2.5 bg-amber-700/80 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold text-left cursor-pointer transition-all border border-amber-500/40 flex flex-col justify-between group shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-amber-200 font-extrabold text-[10px] uppercase">
                <UserCheck className="w-3.5 h-3.5 text-emerald-300" /> Buyer
              </div>
              <div className="mt-1 font-black text-white text-xs group-hover:text-emerald-300 transition-colors">
                Vikram Malhotra
              </div>
              <div className="text-[9px] text-amber-200/80 font-medium truncate">Wholesale • Mumbai</div>
            </button>

            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2.5 bg-purple-900/80 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold text-left cursor-pointer transition-all border border-purple-500/40 flex flex-col justify-between group shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-purple-200 font-extrabold text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Admin
              </div>
              <div className="mt-1 font-black text-white text-xs group-hover:text-purple-300 transition-colors">
                APMC Director
              </div>
              <div className="text-[9px] text-purple-300/80 font-medium truncate">Master Control Panel</div>
            </button>
          </div>
        </Card>

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
              onClick={() => handleGoogleRedirect()}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer group"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Log in with Google</span>
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
                  placeholder="ramesh.farmer@agrimarket.in"
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
                  placeholder="••••••••"
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
                      Sign in with Google
                    </h3>
                    <p className="text-xs text-slate-300">Choose Google account for Agriसाथी</p>
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
                    onClick={() => {
                      setSelectedPresetAccount('neel');
                      handleGoogleSignInSubmit({
                        name: 'Neel Yadav',
                        email: 'neelyadav6131@gmail.com',
                        role: 'FARMER',
                        isPresetDemo: true
                      });
                    }}
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
                    onClick={() => {
                      setSelectedPresetAccount('farmer');
                      handleGoogleSignInSubmit({
                        name: 'Ramesh Patel',
                        email: 'ramesh.farmer@agrimarket.in',
                        role: 'FARMER',
                        isPresetDemo: true,
                        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                      });
                    }}
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
                        <p className="text-xs text-slate-500">ramesh.farmer@agrimarket.in</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                      Farmer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPresetAccount('buyer');
                      handleGoogleSignInSubmit({
                        name: 'Vikram Malhotra',
                        email: 'vikram@freshmandi.com',
                        role: 'BUYER',
                        isPresetDemo: true,
                        picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
                      });
                    }}
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
                        <p className="text-xs text-slate-500">vikram@freshmandi.com</p>
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
                    Or sign in with custom Google details:
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
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomGoogleRole('FARMER')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${customGoogleRole === 'FARMER'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                      >
                        Farmer Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomGoogleRole('BUYER')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${customGoogleRole === 'BUYER'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                      >
                        Buyer Account
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      disabled={!customGoogleEmail}
                      onClick={() =>
                        handleGoogleSignInSubmit({
                          name: customGoogleName || 'Google User',
                          email: customGoogleEmail,
                          role: customGoogleRole
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

