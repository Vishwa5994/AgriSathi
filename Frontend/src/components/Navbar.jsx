import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationBell } from './NotificationBell';
import { ProductManagementModal } from './ProductManagementModal';
import { FarmerProfileModal } from './FarmerProfileModal';
import {
  Sprout,
  Store,
  BarChart3,
  ShoppingBag,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout, switchDemoRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
              Agri<span className="text-emerald-600">साथी</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest block uppercase -mt-1">
              {t('brand_subtitle')}
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {!isAuthenticated && (
            <>
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/marketplace') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                {t('marketplace')}
              </Link>
              <Link
                to="/price-discovery"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                {t('price_discovery')}
              </Link>
            </>
          )}

          {role === 'FARMER' && (
            <>
              <Link
                to="/farmer-dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold transition-colors flex items-center gap-1.5 ${
                  isActive('/farmer-dashboard')
                    ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                {t('dashboard')}
              </Link>
              <Link
                to="/my-products"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/my-products') ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                {t('my_products')}
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/orders') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                {t('orders')}
              </Link>
              <Link
                to="/price-discovery"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                {t('price_discovery')}
              </Link>
            </>
          )}

          {role === 'BUYER' && (
            <>
              <Link
                to="/buyer-dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold transition-colors flex items-center gap-1.5 ${
                  isActive('/buyer-dashboard')
                    ? 'bg-indigo-100/90 text-indigo-800 border border-indigo-300/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                {t('dashboard')}
              </Link>
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/marketplace') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                {t('marketplace')}
              </Link>
              <Link
                to="/price-discovery"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                {t('price_discovery')}
              </Link>
              <Link
                to="/buyer-orders"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/buyer-orders') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                {t('my_orders')}
              </Link>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <Link
                to="/admin-dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin-dashboard')
                    ? 'bg-purple-100/90 text-purple-900 border border-purple-300/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-600" />
                Admin Control Panel
              </Link>
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/marketplace') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                {t('marketplace')}
              </Link>
              <Link
                to="/price-discovery"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                {t('price_discovery')}
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-sm shadow-xs ${
                    role === 'ADMIN'
                      ? 'bg-purple-700'
                      : role === 'BUYER'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      role === 'ADMIN'
                        ? 'text-purple-700'
                        : role === 'BUYER'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {role === 'ADMIN' ? '🛡️ APMC Admin' : role === 'BUYER' ? '🛒 Wholesale Buyer' : '🌾 Farmer'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1"
                    >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 space-y-1">
                      <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span
                        className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : role === 'BUYER'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {role === 'ADMIN' ? '🛡️ APMC Master Admin' : role === 'BUYER' ? '🛒 Wholesale Buyer' : '🌾 Farmer'}
                      </span>
                    </div>

                    {/* Quick Switch Demo Role Section */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase px-2 tracking-wider">
                        Switch Role Context
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            switchDemoRole('FARMER');
                            navigate('/farmer-dashboard');
                          }}
                          className={`px-1.5 py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                            role === 'FARMER'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          🌾 Farmer
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            switchDemoRole('BUYER');
                            navigate('/buyer-dashboard');
                          }}
                          className={`px-1.5 py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                            role === 'BUYER'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          🛒 Buyer
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            switchDemoRole('ADMIN');
                            navigate('/admin-dashboard');
                          }}
                          className={`px-1.5 py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                            role === 'ADMIN'
                              ? 'bg-purple-700 text-white shadow-2xs'
                              : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          🛡️ Admin
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-emerald-600" /> Profile
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> {t('sign_out')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
              >
                {t('get_started')}
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 overflow-hidden"
          >
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t('home')}
                </Link>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/marketplace') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('marketplace')}
                </Link>
                <Link
                  to="/price-discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('price_discovery')}
                </Link>
              </>
            )}

            {role === 'FARMER' && (
              <>
                <Link
                  to="/farmer-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/farmer-dashboard') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/my-products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/my-products') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('my_products')}
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/orders') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('orders')}
                </Link>
                <Link
                  to="/price-discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('price_discovery')}
                </Link>
              </>
            )}

            {role === 'BUYER' && (
              <>
                <Link
                  to="/buyer-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/buyer-dashboard') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/marketplace') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('marketplace')}
                </Link>
                <Link
                  to="/price-discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/price-discovery') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('price_discovery')}
                </Link>
                <Link
                  to="/buyer-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/buyer-orders') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t('my_orders')}
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Product Management Modal */}
      <ProductManagementModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      {/* Farmer Profile Modal */}
      <FarmerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
