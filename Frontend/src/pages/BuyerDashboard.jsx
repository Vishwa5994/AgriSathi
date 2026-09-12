import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dashboardApi } from '../api/dashboardApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCounter } from '../components/StatCounter';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/formatCurrency';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingDown,
  UserCheck,
  Search,
  Package,
  ShoppingCart,
  IndianRupee,
  RefreshCw,
  BadgeCheck,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getBuyerDashboard(user?.user_id);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load buyer dashboard statistics:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Unable to fetch latest buyer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.user_id]);

  // Aggregated values from real database endpoint
  const activeOrdersCount = dashboardData?.pending_orders ?? 0;
  const completedOrdersCount = dashboardData?.completed_orders ?? 0;
  const totalOrdersPlaced = dashboardData?.total_orders_placed ?? 0;
  const totalSpent = dashboardData?.total_spent ?? 0;
  const totalOffersMade = dashboardData?.total_offers_made ?? 0;
  const acceptedOffers = dashboardData?.accepted_offers ?? 0;
  const pendingPayments = dashboardData?.pending_payments ?? 0;
  const paymentsMade = dashboardData?.payments_made ?? 0;
  const recentOrders = dashboardData?.recent_orders || [];

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
              {user?.profile?.city || user?.profile?.district || 'Mumbai'}, {user?.profile?.state || 'Maharashtra'}
            </span>
          </p>
        </div>

        {/* Right: greeting badge & sync action */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Real Data
          </button>
        </div>
      </div>

      {/* ERROR / RETRY NOTIFICATION */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-sm">
          <span>Failed to load live database metrics: {error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="border-rose-300 text-rose-800">
            Retry
          </Button>
        </div>
      )}

      {/* ── 2. STAT CARDS (mirrors FarmerDashboard 4-card grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Active Orders */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
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
              <p className="text-xs text-indigo-700 font-semibold mt-3">
                {totalOrdersPlaced} Total Orders Placed
              </p>
            </>
          )}
        </Card>

        {/* Card 2: Offers Accepted */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Offers Accepted
                  </p>
                  <p className="text-3xl font-black text-amber-600 mt-1">
                    <StatCounter value={acceptedOffers} />
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-amber-700 font-semibold mt-3">
                {totalOffersMade} Total Direct Offers Sent
              </p>
            </>
          )}
        </Card>

        {/* Card 3: Total Spent */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
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
              <p className="text-xs text-indigo-700 font-semibold mt-3">
                {completedOrdersCount} Completed Farmgate Orders
              </p>
            </>
          )}
        </Card>

        {/* Card 4: Payments / Escrow */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Settled Payments
                  </p>
                  <p className="text-2xl font-black text-teal-700 mt-1">
                    {formatCurrency(paymentsMade, true)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-teal-700 font-semibold mt-3">
                {pendingPayments > 0 ? `₹${pendingPayments.toLocaleString('en-IN')} pending settlement` : 'Direct UPI & Bank Settled'}
              </p>
            </>
          )}
        </Card>
      </div>

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

          {loading ? (
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
                        Order #{ord.order_id} • {ord.quantity} {ord.unit || 'Kg'} {t(ord.product_name || 'Produce')}
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
