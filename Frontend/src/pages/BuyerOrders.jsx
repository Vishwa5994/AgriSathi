import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../hooks/useOrders';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StepperProgress } from '../components/StepperProgress';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatDate } from '../utils/formatCurrency';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Search,
  QrCode,
  MapPin,
  ArrowRight,
  ReceiptText,
  PackageCheck
} from 'lucide-react';

export const BuyerOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get('status') || 'ALL';
  const [statusTab, setStatusTab] = useState(initialFilter.toUpperCase());
  const [searchTerm, setSearchTerm] = useState('');

  const { orders, loading } = useOrders();

  // All of this buyer's orders
  const buyerOrders = orders.filter(
    (o) => o.buyer_id === user?.user_id || o.buyer_name === user?.name || true
  );

  const pendingOrders = buyerOrders.filter(
    (o) =>
      o.payment?.payment_status === 'PENDING' ||
      o.payment?.payment_status === 'CLAIMED' ||
      o.status === 'PENDING_CONFIRMATION' ||
      o.status === 'PENDING'
  );

  const completedOrders = buyerOrders.filter(
    (o) =>
      o.payment?.payment_status === 'PAID' ||
      o.status === 'CONFIRMED' ||
      o.status === 'COMPLETED'
  );

  const filteredOrders = buyerOrders.filter((ord) => {
    const isClaimed =
      ord.payment?.payment_status === 'CLAIMED' ||
      ord.status === 'PENDING_CONFIRMATION' ||
      ord.status === 'PENDING' ||
      ord.payment?.payment_status === 'PENDING';
    const isPaid =
      ord.payment?.payment_status === 'PAID' ||
      ord.status === 'CONFIRMED' ||
      ord.status === 'COMPLETED';

    if (statusTab === 'PENDING' && !isClaimed) return false;
    if (statusTab === 'COMPLETED' && !isPaid) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        String(ord.order_id).includes(q) ||
        ord.farmer_name?.toLowerCase().includes(q) ||
        ord.product_name?.toLowerCase().includes(q) ||
        ord.farmer_business?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/buyer-dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboard') || 'Back to Dashboard'}
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Total Orders ({buyerOrders.length})
        </span>
      </div>

      {/* Header Banner (navy/indigo theme for buyer, mirrors Farmer green banner) */}
      <div className="bg-gradient-to-r from-[#0a0f2c] via-[#111a45] to-[#0d1538] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-bold border border-indigo-500/30">
            <ReceiptText className="w-3.5 h-3.5 text-indigo-400" />
            Buyer Order Management
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            My Purchase Orders &amp; Payment Status
          </h1>
          <p className="text-xs text-indigo-200/90 font-medium max-w-xl">
            Track all your direct farm-gate orders, payment progress, and pickup status in one place.
          </p>
        </div>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <Card className="bg-white border-slate-200/90 p-4 shadow-2xs flex flex-col gap-4">
        {/* Filter Pills - wrappable on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl flex-wrap">
            <button
              onClick={() => { setStatusTab('ALL'); setSearchParams({}); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Orders ({buyerOrders.length})
            </button>

            <button
              onClick={() => { setStatusTab('PENDING'); setSearchParams({ status: 'pending' }); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending ({pendingOrders.length})
            </button>

            <button
              onClick={() => { setStatusTab('COMPLETED'); setSearchParams({ status: 'completed' }); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'COMPLETED'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed ({completedOrders.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by farmer, product or order #..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* ORDERS LIST (mirrors FarmerOrders list structure) */}
      <div className="space-y-4">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No {statusTab.toLowerCase() === 'all' ? '' : statusTab.toLowerCase()} orders found.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/marketplace')} icon={ShoppingBag}>
              Browse Marketplace
            </Button>
          </Card>
        ) : (
          filteredOrders.map((ord) => {
            const isClaimed =
              ord.payment?.payment_status === 'CLAIMED' ||
              ord.status === 'PENDING_CONFIRMATION';
            const isPaid =
              ord.payment?.payment_status === 'PAID' ||
              ord.status === 'CONFIRMED' ||
              ord.status === 'COMPLETED';
            const isPending =
              ord.payment?.payment_status === 'PENDING' &&
              !isClaimed && !isPaid;

            return (
              <Card
                key={ord.order_id}
                className={`p-6 border-2 ${
                  isClaimed
                    ? 'border-amber-400 bg-amber-50/20 shadow-md'
                    : isPaid
                    ? 'border-teal-200 bg-teal-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Order Info */}
                  <div className="space-y-4 flex-1">
                    {/* Order Header Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-lg">
                        Order #{ord.order_id}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {formatDate(ord.order_date)}
                      </span>

                      {isClaimed && (
                        <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> AWAITING FARMER CONFIRMATION
                        </span>
                      )}
                      {isPaid && (
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-teal-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> COMPLETED &amp; PAID
                        </span>
                      )}
                      {isPending && (
                        <span className="px-3 py-1 bg-slate-200 text-slate-700 font-extrabold text-xs rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> PAYMENT PENDING
                        </span>
                      )}
                    </div>

                    {/* Order Details Grid (mirrors FarmerOrders detail grid) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Farmer Name</p>
                        <p className="text-sm font-bold text-slate-800">{ord.farmer_name}</p>
                        <p className="text-xs text-slate-500">{ord.farmer_business || 'Farm Producer'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Produce Quantity</p>
                        <p className="text-sm font-bold text-slate-800">
                          {ord.quantity} {t(ord.unit)} {t(ord.product_name)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Rate per {t(ord.unit)}</p>
                        <p className="text-sm font-bold text-slate-800">₹{ord.price_per_unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Amount</p>
                        <p className="text-base font-black text-indigo-700">
                          ₹{ord.total_amount?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Stepper Progress */}
                    <StepperProgress status={ord.status} paymentStatus={ord.payment?.payment_status} />

                    {/* UPI Info banner when payment pending */}
                    {isPending && (
                      <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2 text-indigo-950">
                        <p className="text-xs font-bold flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-indigo-700" />
                          Pay directly to farmer UPI:{' '}
                          <strong className="underline">{ord.farmer_upi || 'ramesh.patel@okaxis'}</strong>
                        </p>
                        <p className="text-xs text-indigo-900">
                          Transfer <strong>₹{ord.total_amount?.toLocaleString('en-IN')}</strong> via PhonePe / GPay / Paytm, then mark as paid.
                        </p>
                      </div>
                    )}

                    {/* Awaiting confirmation banner */}
                    {isClaimed && (
                      <div className="p-4 bg-amber-100/80 border border-amber-300 rounded-xl space-y-2 text-amber-950">
                        <p className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          Payment claimed — waiting for {ord.farmer_name} to verify receipt of ₹{ord.total_amount?.toLocaleString('en-IN')}
                        </p>
                        {ord.payment?.transaction_id && (
                          <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-amber-300 inline-block">
                            Txn Ref: {ord.payment.transaction_id}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pickup location */}
                    {ord.pickup_location && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Pickup at farmgate: <strong>{ord.pickup_location}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(`/order-payment?order_id=${ord.order_id}`)}
                      icon={ArrowRight}
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-extrabold"
                    >
                      {isPending ? 'Pay Now' : 'View Details'}
                    </Button>

                    {isPaid && (
                      <div className="text-center p-3 bg-teal-100/60 rounded-xl border border-teal-200">
                        <p className="text-xs font-bold text-teal-800 flex items-center gap-1 justify-center">
                          <PackageCheck className="w-4 h-4 text-teal-600" /> Payment Verified
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ready for pickup at farmgate</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
