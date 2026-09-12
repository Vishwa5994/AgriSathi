import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../hooks/useOrders';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatDate } from '../utils/formatCurrency';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  QrCode,
  Search,
  XCircle,
  RotateCcw
} from 'lucide-react';

export const FarmerOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get('status') || 'ALL';
  const [statusTab, setStatusTab] = useState(initialFilter.toUpperCase());
  const [searchTerm, setSearchTerm] = useState('');

  const { orders, loading, confirmReceipt } = useOrders();

  const incomingOrders = orders.filter(
    (o) => o.farmer_id === user?.user_id || o.farmer_name === user?.name || true
  );

  const pendingOrders = incomingOrders.filter(
    (o) =>
      (o.payment?.payment_status === 'CLAIMED' ||
        o.status === 'PENDING_CONFIRMATION' ||
        o.status === 'PENDING') &&
      o.status !== 'CANCELLED' &&
      o.status !== 'RETURN_REQUESTED'
  );

  const completedOrders = incomingOrders.filter(
    (o) =>
      (o.payment?.payment_status === 'PAID' ||
        o.status === 'CONFIRMED' ||
        o.status === 'COMPLETED') &&
      o.status !== 'RETURN_REQUESTED'
  );

  const cancelledOrders = incomingOrders.filter((o) => o.status === 'CANCELLED');
  const returnRequestedOrders = incomingOrders.filter((o) => o.status === 'RETURN_REQUESTED');

  const filteredOrders = incomingOrders.filter((ord) => {
    const isCancelled = ord.status === 'CANCELLED';
    const isReturnRequested = ord.status === 'RETURN_REQUESTED';
    const isClaimed =
      (ord.payment?.payment_status === 'CLAIMED' ||
        ord.status === 'PENDING_CONFIRMATION' ||
        ord.status === 'PENDING') &&
      !isCancelled &&
      !isReturnRequested;
    const isPaid =
      (ord.payment?.payment_status === 'PAID' ||
        ord.status === 'CONFIRMED' ||
        ord.status === 'COMPLETED') &&
      !isReturnRequested;

    if (statusTab === 'PENDING' && !isClaimed) return false;
    if (statusTab === 'COMPLETED' && !isPaid) return false;
    if (statusTab === 'CANCELLED' && !isCancelled) return false;
    if (statusTab === 'RETURN_REQUESTED' && !isReturnRequested) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        String(ord.order_id).includes(q) ||
        ord.buyer_name?.toLowerCase().includes(q) ||
        ord.product_name?.toLowerCase().includes(q) ||
        ord.buyer_business?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/farmer-dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboard') || 'Back to Dashboard'}
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Total Buyer Orders ({incomingOrders.length})
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            Farmer Order Management
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Incoming Buyer Orders &amp; Returns
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium max-w-xl">
            Review buyer payment claims, verify direct UPI bank transfers to your registered UPI ID, and check buyer return requests.
          </p>
        </div>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <Card className="bg-white border-slate-200/90 p-4 shadow-2xs flex flex-col gap-4">
        {/* Filter Pills - wrappable on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl flex-wrap">
            <button
              onClick={() => {
                setStatusTab('ALL');
                setSearchParams({});
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({incomingOrders.length})
            </button>

            <button
              onClick={() => {
                setStatusTab('PENDING');
                setSearchParams({ status: 'pending' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending ({pendingOrders.length})
            </button>

            <button
              onClick={() => {
                setStatusTab('COMPLETED');
                setSearchParams({ status: 'completed' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed ({completedOrders.length})
            </button>

            <button
              onClick={() => {
                setStatusTab('RETURN_REQUESTED');
                setSearchParams({ status: 'returned' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'RETURN_REQUESTED'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Returns ({returnRequestedOrders.length})
            </button>

            <button
              onClick={() => {
                setStatusTab('CANCELLED');
                setSearchParams({ status: 'cancelled' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'CANCELLED'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancelled ({cancelledOrders.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 sm:ml-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by buyer or order #..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No {statusTab.toLowerCase() === 'all' ? '' : statusTab.toLowerCase()} orders found.</p>
          </Card>
        ) : (
          filteredOrders.map((ord) => {
            const isCancelled = ord.status === 'CANCELLED';
            const isReturnRequested = ord.status === 'RETURN_REQUESTED';
            const isClaimed =
              (ord.payment?.payment_status === 'CLAIMED' ||
                ord.status === 'PENDING_CONFIRMATION' ||
                ord.status === 'PENDING') &&
              !isCancelled &&
              !isReturnRequested;
            const isPaid =
              (ord.payment?.payment_status === 'PAID' ||
                ord.status === 'CONFIRMED' ||
                ord.status === 'COMPLETED') &&
              !isReturnRequested;

            return (
              <Card
                key={ord.order_id}
                className={`p-6 border-2 ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/10'
                    : isReturnRequested
                    ? 'border-purple-200 bg-purple-50/10'
                    : isClaimed
                    ? 'border-amber-400 bg-amber-50/20 shadow-md'
                    : isPaid
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-lg">
                        Order #{ord.order_id}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {formatDate(ord.order_date)}
                      </span>

                      {isCancelled && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-600" /> ORDER CANCELLED
                        </span>
                      )}

                      {isReturnRequested && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-purple-300">
                          <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> RETURN REQUESTED BY BUYER
                        </span>
                      )}

                      {isClaimed && (
                        <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> PENDING VERIFICATION
                        </span>
                      )}

                      {isPaid && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> COMPLETED &amp; PAID
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Buyer Name</p>
                        <p className="text-sm font-bold text-slate-800">{ord.buyer_name}</p>
                        <p className="text-xs text-slate-500">{ord.buyer_business || 'Wholesale Buyer'}</p>
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
                        <p className="text-base font-black text-emerald-700">
                          ₹{ord.total_amount?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {isClaimed && (
                      <div className="p-4 bg-amber-100/80 border border-amber-300 rounded-xl space-y-2 text-amber-950">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-amber-700" /> Buyer claims UPI Payment sent to{' '}
                            <strong className="underline">{user?.profile?.upi_id || ord.farmer_upi || 'ramesh.patel@okaxis'}</strong>
                          </p>
                          {ord.payment?.transaction_id && (
                            <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-amber-300">
                              Txn Ref: {ord.payment.transaction_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-900">
                          Please check your PhonePe / GPay / Paytm app to verify receipt of{' '}
                          <strong>₹{ord.total_amount?.toLocaleString('en-IN')}</strong> before confirming.
                        </p>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1 text-red-950">
                        <p className="text-xs font-bold flex items-center gap-1.5 text-red-800">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Order Cancelled by Buyer (Stock auto-restored)
                        </p>
                        <p className="text-xs text-red-700">
                          <strong>Reason:</strong> {ord.cancel_reason || 'Cancelled by buyer.'}
                        </p>
                      </div>
                    )}

                    {isReturnRequested && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5 text-purple-950">
                        <p className="text-xs font-bold flex items-center gap-1.5 text-purple-800">
                          <RotateCcw className="w-4 h-4 text-purple-600" />
                          Buyer Requested Return ({ord.buyer_name})
                        </p>
                        <p className="text-xs text-purple-900">
                          <strong>Reason:</strong> {ord.return_details?.reason || 'Return requested.'}
                        </p>
                        {ord.return_details?.note && (
                          <p className="text-xs text-purple-800 italic bg-white/70 p-2 rounded border border-purple-200">
                            "{ord.return_details.note}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 min-w-[220px]">
                    {isClaimed && (
                      <>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => confirmReceipt(ord.order_id, true)}
                          icon={Check}
                          className="bg-emerald-600 hover:bg-emerald-700 shadow-md font-extrabold"
                        >
                          Confirm Received
                        </Button>
                        <Button
                          variant="danger"
                          size="md"
                          onClick={() => confirmReceipt(ord.order_id, false)}
                          icon={X}
                        >
                          Not Received
                        </Button>
                      </>
                    )}

                    {isPaid && (
                      <div className="text-center p-3 bg-emerald-100/60 rounded-xl border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-800 flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Verified
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Pickup ready at farmgate</p>
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
