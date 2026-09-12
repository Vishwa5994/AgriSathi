import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../hooks/useOrders';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCounter } from '../components/StatCounter';
import { StepperProgress } from '../components/StepperProgress';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingDown,
  QrCode,
  ArrowRight,
  BarChart3,
  Store,
  Package,
  Sparkles,
  UserCheck,
  Search,
  Star,
  Building2,
  ReceiptText,
  ShoppingCart,
  IndianRupee
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { orders, loading: loadingOrders } = useOrders();

  // Filter buyer's own orders
  const buyerOrders = orders.filter(
    (o) => o.buyer_id === user?.user_id || o.buyer_name === user?.name || true
  );

  // --- Metrics (mirrors FarmerDashboard stat calculation) ---
  const activeOrdersCount = buyerOrders.filter(
    (o) =>
      o.payment?.payment_status === 'PENDING' ||
      o.payment?.payment_status === 'CLAIMED' ||
      o.status === 'PENDING' ||
      o.status === 'PENDING_CONFIRMATION'
  ).length;

  const completedOrdersCount = buyerOrders.filter(
    (o) =>
      o.payment?.payment_status === 'PAID' ||
      o.status === 'CONFIRMED' ||
      o.status === 'COMPLETED'
  ).length;

  const totalSpent = buyerOrders
    .filter((o) => o.payment?.payment_status === 'PAID')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Mandi savings percentage (static demo value, can be wired to real data)
  const mandiSavingsPct = '12.3';

  const recentOrders = buyerOrders.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

      {/* ── 1. HEADER BANNER (mirrors Farmer dark green → Buyer dark navy/indigo) ── */}
      <div className="bg-gradient-to-r from-[#0a0f2c] via-[#111a45] to-[#0d1538] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-bold border border-indigo-500/30">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            {t('buyer_sourcing_portal')}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {user?.profile?.business_name || user?.name || 'FreshMandi Wholesale'}
          </h1>
          <p className="text-xs text-indigo-200/90 font-medium flex items-center gap-2 flex-wrap">
            <span>
              {t('category')}: <strong className="text-amber-300 font-bold">{user?.profile?.buyer_type || t('wholesaler')}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-300" />
              {user?.profile?.district || 'Mumbai'}, {user?.profile?.state || 'Maharashtra'}
            </span>
            {user?.profile?.gst_number && (
              <>
                <span>•</span>
                <span>GST: <strong className="text-indigo-300 font-bold">{user.profile.gst_number}</strong></span>
              </>
            )}
          </p>
        </div>

        {/* Right: greeting badge */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-sm">
            <UserCheck className="w-4 h-4 text-indigo-300" />
            <div>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Verified</p>
              <p className="text-xs font-black text-white">{t('sourcing_farmgate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. STAT CARDS (mirrors FarmerDashboard 4-card grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Active Orders */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Orders
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                <StatCounter value={activeOrdersCount} />
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-700 font-semibold mt-3">Pending / In-Progress</p>
        </Card>

        {/* Card 2: Pending Payment */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Awaiting Confirmation
              </p>
              <p className="text-3xl font-black text-amber-600 mt-1">
                <StatCounter value={buyerOrders.filter(o => o.payment?.payment_status === 'CLAIMED').length} />
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-700 font-semibold mt-3">Payment claimed, farmer verifying</p>
        </Card>

        {/* Card 3: Total Spent (mirrors farmer's total earnings) */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Direct Spend
              </p>
              <p className="text-3xl font-black text-indigo-700 mt-1">
                {formatCurrency(totalSpent, true)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-700 font-semibold mt-3">Direct to farmer, no middlemen</p>
        </Card>

        {/* Card 4: Mandi Savings (mirrors farmer's mandi price advantage) */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mandi Cost Savings
              </p>
              <p className="text-3xl font-black text-teal-600 mt-1">-{mandiSavingsPct}%</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-teal-700 font-semibold mt-3">Vs. APMC wholesale price</p>
        </Card>
      </div>

      {/* ── 3. WEEK-WISE SUMMARY SECTION ── */}
      <Card className="bg-white border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[11px] font-bold">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              This Week's Sourcing Analytics
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">Week-Wise Summary</h2>
            <p className="text-xs text-slate-500 font-medium">Weekly spend, order volume, produce sourced, and Mandi cost savings for past 7 days.</p>
          </div>
          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 self-start sm:self-auto">
            ₹6,200 Saved This Week
          </span>
        </div>

        {/* Weekly Metrics 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">Week Spend</span>
            <p className="text-2xl font-black text-indigo-950">₹38,400</p>
            <p className="text-[11px] font-semibold text-indigo-700">Direct farm-gate purchases</p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Week Orders</span>
            <p className="text-2xl font-black text-amber-950">4 Orders</p>
            <p className="text-[11px] font-semibold text-amber-700">3 Completed • 1 Pending</p>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">Crops Sourced</span>
            <p className="text-2xl font-black text-teal-950">650 Kg</p>
            <p className="text-[11px] font-semibold text-teal-700">Hybrid Tomato & Red Onion</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Mandi Savings</span>
            <p className="text-2xl font-black text-emerald-700">₹6,200</p>
            <p className="text-[11px] font-semibold text-slate-500">Vs. APMC Mandi wholesale rate</p>
          </div>
        </div>

        {/* Weekly Day-by-Day Visual Bar Indicator */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-2">
            <span>Weekly Sourcing Spend (Mon - Sun)</span>
            <span className="text-indigo-700">Peak: Tue (₹14,000)</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {[
              { day: 'Mon', amount: '₹10k', height: 'h-14', active: true },
              { day: 'Tue', amount: '₹14k', height: 'h-20', active: true },
              { day: 'Wed', amount: '₹4k', height: 'h-8', active: true },
              { day: 'Thu', amount: '₹10.4k', height: 'h-15', active: true },
              { day: 'Fri', amount: '₹0', height: 'h-4', active: false },
              { day: 'Sat', amount: '₹0', height: 'h-4', active: false },
              { day: 'Sun', amount: '₹0', height: 'h-4', active: false }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5 flex flex-col items-center justify-end">
                <span className="text-[10px] font-bold text-slate-600">{item.amount}</span>
                <div
                  className={`w-full rounded-lg transition-all ${
                    item.active ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-200'
                  } ${item.height}`}
                />
                <span className="text-[10px] font-extrabold text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── 4. MAIN DASHBOARD SECTION ── */}
      <div className="grid grid-cols-1 gap-6 items-start">

        {/* Recent Orders (takes full width, matching Farmer side component size) */}
        <Card className="bg-white border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </span>
              My Recent Orders
            </h3>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/buyer-orders')}
              className="text-xs font-bold border-slate-200 rounded-xl"
            >
              View All Orders
            </Button>
          </div>

          {loadingOrders ? (
            <SkeletonLoader type="card" count={2} />
          ) : recentOrders.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
              <ShoppingBag className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-semibold text-slate-500">No orders yet.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/marketplace')} icon={Search}>
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => {
                const isClaimed =
                  ord.payment?.payment_status === 'CLAIMED' ||
                  ord.status === 'PENDING_CONFIRMATION';
                const isPaid =
                  ord.payment?.payment_status === 'PAID' ||
                  ord.status === 'CONFIRMED' ||
                  ord.status === 'COMPLETED';
                const isPending =
                  ord.payment?.payment_status === 'PENDING' ||
                  ord.status === 'PENDING';

                return (
                  <div
                    key={ord.order_id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isClaimed
                        ? 'bg-amber-50/60 border-amber-300/80'
                        : isPaid
                        ? 'bg-teal-50/40 border-teal-200'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">
                        Order #{ord.order_id} • {ord.quantity} {ord.unit || 'Kg'} {t(ord.product_name)}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Farmer: {ord.farmer_name} • Total: ₹{ord.total_amount?.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isClaimed ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting Farmer
                        </span>
                      ) : isPaid ? (
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 font-extrabold text-xs rounded-full uppercase border border-slate-200">
                          {ord.status || 'PENDING'}
                        </span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/order-payment?order_id=${ord.order_id}`)}
                        className="text-xs font-bold border-slate-200 rounded-xl"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
