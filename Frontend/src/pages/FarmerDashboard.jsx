import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dashboardApi } from '../api/dashboardApi';
import { ordersApi } from '../api/ordersApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCounter } from '../components/StatCounter';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { ProductManagementModal } from '../components/ProductManagementModal';
import {
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  QrCode,
  Check,
  Store,
  ArrowRight,
  RefreshCw,
  Star,
  Scale
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEditListing, setTargetEditListing] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getFarmerDashboard(user?.user_id);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load farmer dashboard statistics:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Unable to fetch latest farmer dashboard data. Showing cached view.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.user_id]);

  const handleConfirmReceipt = async (orderId) => {
    try {
      await ordersApi.updateStatus(orderId, 'COMPLETED');
      toast.success('Order confirmed & marked as completed!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  // Aggregated values from real database endpoint with zero fallbacks
  const activeListingsCount = dashboardData?.total_active_listings ?? 0;
  const totalListingsCount = dashboardData?.total_listings ?? 0;
  const pendingOrdersCount = dashboardData?.pending_orders ?? 0;
  const completedOrdersCount = dashboardData?.completed_orders ?? 0;
  const totalRevenue = dashboardData?.total_revenue ?? 0;
  const totalQuantitySold = dashboardData?.total_quantity_sold ?? 0;
  const averageRating = dashboardData?.average_rating ?? 0;
  const totalReviews = dashboardData?.total_reviews ?? 0;
  const recentOrders = dashboardData?.recent_orders || [];

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
            <span>{t('land_label')}: <strong className="text-white font-bold">{user?.profile?.land_area || user?.profile?.land_acres || '12'} Acres</strong></span>
            <span>•</span>
            <span>
              {t('direct_upi_label')}: <strong className="text-emerald-300 font-bold">{user?.phone ? `${user.phone}@upi` : 'ramesh.patel@okaxis'}</strong>
            </span>
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
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

      {/* 2. OVERVIEW STAT CARDS GRID (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Listings */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
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
              <p className="text-xs text-emerald-700 font-semibold mt-3">
                {totalListingsCount} Total Listed All-Time
              </p>
            </>
          )}
        </Card>

        {/* Card 2: Pending Orders */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t('awaiting_confirmation')}
                  </p>
                  <p className="text-3xl font-black text-amber-600 mt-1">
                    <StatCounter value={pendingOrdersCount} />
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-amber-700 font-semibold mt-3">
                {pendingOrdersCount > 0 ? 'Orders awaiting fulfilment' : 'All orders up to date'}
              </p>
            </>
          )}
        </Card>

        {/* Card 3: Total Earnings / Revenue */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t('total_direct_payouts')}
                  </p>
                  <p className="text-3xl font-black text-emerald-700 mt-1">
                    {formatCurrency(totalRevenue, true)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-3">
                {completedOrdersCount} Completed Orders Direct
              </p>
            </>
          )}
        </Card>

        {/* Card 4: Volume Sold & Rating */}
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total Produce Sold
                  </p>
                  <p className="text-2xl font-black text-teal-700 mt-1">
                    {totalQuantitySold.toLocaleString('en-IN', { maximumFractionDigits: 1 })} <span className="text-sm font-semibold">Qty</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold mt-3">
                {averageRating > 0 ? (
                  <>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{averageRating} Rating ({totalReviews} reviews)</span>
                  </>
                ) : (
                  <span>Verified 0% middleman cut</span>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

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
                <span>{t('product_list') || 'Product List'} ({totalListingsCount})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            {/* Action 2: Pending Orders */}
            <button
              onClick={() => navigate('/orders?status=pending')}
              className="w-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 p-3.5 rounded-2xl font-bold text-sm flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{t('pending_orders') || 'Pending Orders'} ({pendingOrdersCount})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Action 3: Completed Orders */}
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

          {loading ? (
            <SkeletonLoader type="card" count={2} />
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No incoming orders yet. Once wholesale buyers purchase your listings, they will appear here live.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => {
                const isClaimed = ord.payment?.payment_status === 'CLAIMED' || ord.status === 'PENDING_CONFIRMATION';
                const isPaid = ord.payment?.payment_status === 'PAID' || ord.status === 'CONFIRMED' || ord.status === 'COMPLETED';

                return (
                  <div
                    key={ord.order_id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isClaimed
                        ? 'bg-amber-50/60 border-amber-300/80'
                        : isPaid
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">
                        Order #{ord.order_id} • {ord.quantity} {ord.unit || 'Kg'} {t(ord.product_name || 'Produce')}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Buyer: {ord.buyer_name} {ord.buyer_business ? `(${ord.buyer_business})` : ''} • Total: ₹{ord.total_amount?.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div>
                      {isClaimed ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleConfirmReceipt(ord.order_id)}
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
          )}
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
