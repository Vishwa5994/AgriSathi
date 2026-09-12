import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useListings } from '../hooks/useListings';
import { useOrders } from '../hooks/useOrders';
import { productsApi } from '../api/productsApi';
import { priceHistoryApi } from '../api/priceHistoryApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCounter } from '../components/StatCounter';
import { PriceComparisonBadge } from '../components/PriceComparisonBadge';
import { Modal } from '../components/Modal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { ProductManagementModal } from '../components/ProductManagementModal';
import {
  Sprout,
  PlusCircle,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  LineChart as LineChartIcon,
  QrCode,
  Check,
  X,
  Sparkles,
  MapPin,
  Edit3,
  Store,
  ShoppingBag,
  ArrowRight,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { listings, loading: loadingListings, refetch: refetchListings } = useListings({
    farmer_id: user?.user_id
  });
  const { orders, loading: loadingOrders, confirmReceipt, refetch: refetchOrders } = useOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEditListing, setTargetEditListing] = useState(null);

  // Calculate Metrics
  const activeListingsCount = listings.filter((l) => l.status === 'AVAILABLE').length;
  const incomingOrders = orders.filter(
    (o) => o.farmer_id === user?.user_id || o.farmer_name === user?.name || true
  );
  const pendingClaimsCount = incomingOrders.filter(
    (o) => o.payment?.payment_status === 'CLAIMED' || o.status === 'PENDING_CONFIRMATION' || o.status === 'PENDING'
  ).length;
  const completedOrdersCount = incomingOrders.filter(
    (o) => o.payment?.payment_status === 'PAID' || o.status === 'CONFIRMED' || o.status === 'COMPLETED'
  ).length;
  const totalEarnings = incomingOrders
    .filter((o) => o.payment?.payment_status === 'PAID')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. TOP DARK GREEN FARMER HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            {t('farmer_producer_hub')}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {user?.name || 'Ramesh Kumar Patel'}
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium flex items-center gap-2 flex-wrap">
            <span>
              {t('location_label')}: <strong className="text-amber-300 font-bold">{user?.profile?.village || 'Pimpalgaon'}, {user?.profile?.district || 'Nashik'}</strong>
            </span>
            <span>•</span>
            <span>{t('land_label')}: <strong className="text-white font-bold">{user?.profile?.land_acres || '12'} Acres</strong></span>
            <span>•</span>
            <span>
              {t('direct_upi_label')}: <strong className="text-emerald-300 font-bold">{user?.profile?.upi_id || 'ramesh.patel@okaxis'}</strong>
            </span>
          </p>
        </div>
      </div>

      {/* 2. OVERVIEW STAT CARDS GRID (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('live_produce_listed')}
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                <StatCounter value={activeListingsCount} />
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">{t('active_on_marketplace')}</p>
        </Card>

        {/* Card 2 */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('awaiting_confirmation')}
              </p>
              <p className="text-3xl font-black text-amber-600 mt-1">
                <StatCounter value={pendingClaimsCount} />
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-700 font-semibold mt-3">{t('buyer_claimed_payments')}</p>
        </Card>

        {/* Card 3 */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('total_direct_payouts')}
              </p>
              <p className="text-3xl font-black text-emerald-700 mt-1">
                {formatCurrency(totalEarnings, true)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">{t('direct_to_bank')}</p>
        </Card>

        {/* Card 4 */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('mandi_price_advantage')}
              </p>
              <p className="text-3xl font-black text-teal-600 mt-1">+18.5%</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-teal-700 font-semibold mt-3">{t('eliminated_broker_cuts')}</p>
        </Card>
      </div>

      {/* 3. WEEK-WISE SUMMARY SECTION */}
      <Card className="bg-white border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              This Week's Analytics
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">Week-Wise Summary</h2>
            <p className="text-xs text-slate-500 font-medium">Direct earnings, sales volume, and order performance for the past 7 days.</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            +14.5% vs Last Week
          </span>
        </div>

        {/* Weekly Metrics 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">Week Profit / Revenue</span>
            <p className="text-2xl font-black text-emerald-950">₹45,200</p>
            <p className="text-[11px] font-semibold text-emerald-700">Direct payouts into bank/UPI</p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Week Orders</span>
            <p className="text-2xl font-black text-amber-950">6 Orders</p>
            <p className="text-[11px] font-semibold text-amber-700">4 Confirmed • 2 Pending</p>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">Produce Sold</span>
            <p className="text-2xl font-black text-teal-950">850 Kg</p>
            <p className="text-[11px] font-semibold text-teal-700">Red Onion, Tomato & Wheat</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Avg Order Value</span>
            <p className="text-2xl font-black text-slate-900">₹7,533</p>
            <p className="text-[11px] font-semibold text-slate-500">Per direct buyer transaction</p>
          </div>
        </div>

        {/* Weekly Day-by-Day Visual Bar Indicator */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-2">
            <span>Weekly Sales Distribution (Mon - Sun)</span>
            <span className="text-emerald-700">Peak: Tue (₹14,000)</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {[
              { day: 'Mon', amount: '₹8.5k', height: 'h-12', active: true },
              { day: 'Tue', amount: '₹14k', height: 'h-20', active: true },
              { day: 'Wed', amount: '₹6k', height: 'h-10', active: true },
              { day: 'Thu', amount: '₹9.2k', height: 'h-14', active: true },
              { day: 'Fri', amount: '₹7.5k', height: 'h-11', active: true },
              { day: 'Sat', amount: '₹0', height: 'h-4', active: false },
              { day: 'Sun', amount: '₹0', height: 'h-4', active: false }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5 flex flex-col items-center justify-end">
                <span className="text-[10px] font-bold text-slate-600">{item.amount}</span>
                <div
                  className={`w-full rounded-lg transition-all ${
                    item.active ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-200'
                  } ${item.height}`}
                />
                <span className="text-[10px] font-extrabold text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. TWO-COLUMN DASHBOARD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN (1 col): Quick Farmer Actions */}
        <Card className="bg-white border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {t('quick_farmer_actions')}
          </h3>

          <div className="space-y-2.5">
            {/* Action 1: Product List */}
            <button
              onClick={() => navigate('/my-products?view=table')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-between transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-emerald-100" />
                <span>{t('product_list') || 'Product List'} ({listings.length})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            {/* Action 3: Pending Orders */}
            <button
              onClick={() => navigate('/orders?status=pending')}
              className="w-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 p-3.5 rounded-2xl font-bold text-sm flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{t('pending_orders') || 'Pending Orders'} ({pendingClaimsCount})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Action 4: Completed Orders */}
            <button
              onClick={() => navigate('/orders?status=completed')}
              className="w-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 p-3.5 rounded-2xl font-bold text-sm flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('completed_orders') || 'Completed Orders'} ({completedOrdersCount})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </Card>

        {/* RIGHT COLUMN (2 cols): Recent Buyer Orders Requiring Attention */}
        <Card className="lg:col-span-2 bg-white border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
              {t('recent_buyer_orders_attention')}
            </h3>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/orders')}
              className="text-xs font-bold border-slate-200 rounded-xl"
            >
              {t('view_all_orders')}
            </Button>
          </div>

          <div className="space-y-3">
            {incomingOrders.slice(0, 3).map((ord) => {
              const isClaimed = ord.payment?.payment_status === 'CLAIMED' || ord.status === 'PENDING_CONFIRMATION';
              const isPaid = ord.payment?.payment_status === 'PAID' || ord.status === 'CONFIRMED';

              return (
                <div
                  key={ord.order_id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isClaimed
                      ? 'bg-amber-50/60 border-amber-300/80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900">
                      Order #{ord.order_id} • {ord.quantity} {ord.unit || 'Kg'} {t(ord.product_name)}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Buyer: {ord.buyer_name} ({ord.buyer_business || 'Wholesale Buyer'}) • Total: ₹{ord.total_amount?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    {isClaimed ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => confirmReceipt(ord.order_id, true)}
                        icon={Check}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs shrink-0"
                      >
                        {t('confirm_received')}
                      </Button>
                    ) : isPaid ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t('confirmed')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 font-extrabold text-xs rounded-full uppercase border border-slate-200">
                        {ord.status || 'PENDING'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* UNIFIED PRODUCT MANAGEMENT MODAL */}
      <ProductManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetEditListing(null);
        }}
        targetListing={targetEditListing}
      />
    </div>
  );
};
