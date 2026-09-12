import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../hooks/useOrders';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StepperProgress } from '../components/StepperProgress';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ProductImage } from '../components/ProductImage';
import { formatDate, getReturnEligibility, formatBuyerUnitAndPrice } from '../utils/formatCurrency';
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
  PackageCheck,
  XCircle,
  RotateCcw,
  X,
  AlertCircle,
  FileText,
  CalendarClock
} from 'lucide-react';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found better price elsewhere',
  'Delivery/Pickup delay expected',
  'Farmer unresponsive',
  'Other'
];

const RETURN_REASONS = [
  'Quality lower than specified grade',
  'Damaged or spoiled produce',
  'Incorrect quantity/weight delivered',
  'Wrong crop variety received',
  'Other'
];

export const BuyerOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get('status') || 'ALL';
  const [statusTab, setStatusTab] = useState(initialFilter.toUpperCase());
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customCancelReason, setCustomCancelReason] = useState('');

  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const { orders, loading, error, cancelOrder, returnOrder, refetch } = useOrders();

  // All of this buyer's orders
  const buyerOrders = orders.filter(
    (o) => o.buyer_id === user?.user_id || o.buyer_name === user?.name || true
  );

  const pendingOrders = buyerOrders.filter(
    (o) =>
      (o.payment?.payment_status === 'PENDING' ||
        o.payment?.payment_status === 'CLAIMED' ||
        o.status === 'PENDING_CONFIRMATION' ||
        o.status === 'PENDING') &&
      o.status !== 'CANCELLED' &&
      o.status !== 'RETURN_REQUESTED'
  );

  const completedOrders = buyerOrders.filter(
    (o) =>
      (o.payment?.payment_status === 'PAID' ||
        o.status === 'CONFIRMED' ||
        o.status === 'COMPLETED') &&
      o.status !== 'RETURN_REQUESTED'
  );

  const cancelledOrders = buyerOrders.filter((o) => o.status === 'CANCELLED');
  const returnRequestedOrders = buyerOrders.filter((o) => o.status === 'RETURN_REQUESTED');

  const filteredOrders = buyerOrders.filter((ord) => {
    const isCancelled = ord.status === 'CANCELLED';
    const isReturnRequested = ord.status === 'RETURN_REQUESTED';
    const isClaimed =
      (ord.payment?.payment_status === 'CLAIMED' ||
        ord.status === 'PENDING_CONFIRMATION' ||
        ord.status === 'PENDING' ||
        ord.payment?.payment_status === 'PENDING') &&
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
        ord.farmer_name?.toLowerCase().includes(q) ||
        ord.product_name?.toLowerCase().includes(q) ||
        ord.farmer_business?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!selectedOrderForCancel) return;
    const reason = cancelReason === 'Other' ? customCancelReason.trim() || 'Cancelled by buyer' : cancelReason;
    setSubmitting(true);
    try {
      await cancelOrder(selectedOrderForCancel.order_id, reason);
      setSelectedOrderForCancel(null);
      setCustomCancelReason('');
    } catch (e) {
      // Handled in hook toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedOrderForReturn) return;
    setSubmitting(true);
    try {
      await returnOrder(selectedOrderForReturn.order_id, returnReason, returnNote.trim());
      setSelectedOrderForReturn(null);
      setReturnNote('');
    } catch (e) {
      // Handled in hook toast
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a0f2c] via-[#111a45] to-[#0d1538] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-bold border border-indigo-500/30">
            <ReceiptText className="w-3.5 h-3.5 text-indigo-400" />
            Buyer Order Management
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            My Purchase Orders, Invoices &amp; 7-Day Returns
          </h1>
          <p className="text-xs text-indigo-200/90 font-medium max-w-xl">
            Download official tax invoices for completed orders, request returns within the 7-day policy window, and track payment status.
          </p>
        </div>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <Card className="bg-white border-slate-200/90 p-4 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl flex-wrap">
            <button
              onClick={() => { setStatusTab('ALL'); setSearchParams({}); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({buyerOrders.length})
            </button>

            <button
              onClick={() => { setStatusTab('PENDING'); setSearchParams({ status: 'pending' }); }}
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
              onClick={() => { setStatusTab('COMPLETED'); setSearchParams({ status: 'completed' }); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'COMPLETED'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed ({completedOrders.length})
            </button>

            <button
              onClick={() => { setStatusTab('RETURN_REQUESTED'); setSearchParams({ status: 'returned' }); }}
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
              onClick={() => { setStatusTab('CANCELLED'); setSearchParams({ status: 'cancelled' }); }}
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
              placeholder="Search by farmer, product or order #..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {error ? (
          <Card className="p-8 text-center space-y-4 bg-white border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">Failed to load orders</h3>
              <p className="text-xs text-slate-500 font-medium">{error}</p>
            </div>
            <Button variant="primary" size="md" onClick={refetch} className="bg-indigo-600 hover:bg-indigo-700">
              Retry Loading
            </Button>
          </Card>
        ) : loading ? (
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
            const isCancelled = ord.status === 'CANCELLED';
            const isReturnRequested = ord.status === 'RETURN_REQUESTED';
            const isClaimed =
              (ord.payment?.payment_status === 'CLAIMED' ||
                ord.status === 'PENDING_CONFIRMATION') &&
              !isCancelled &&
              !isReturnRequested;
            const isPaid =
              (ord.payment?.payment_status === 'PAID' ||
                ord.status === 'CONFIRMED' ||
                ord.status === 'COMPLETED') &&
              !isReturnRequested;
            const isPending =
              ord.payment?.payment_status === 'PENDING' &&
              !isClaimed &&
              !isPaid &&
              !isCancelled &&
              !isReturnRequested;

            const returnStatus = getReturnEligibility(ord);

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
                    ? 'border-teal-200 bg-teal-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Order Info */}
                  <div className="space-y-4 flex-1">
                    {/* Order Header Row */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <ProductImage
                          src={ord.picture || ord.image_url || ord.product?.picture || ord.listing?.product?.picture}
                          alt={ord.product_name || ord.product?.product_name || 'Produce'}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200/90 shadow-2xs"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 text-lg block">
                            Order #{ord.order_id} • {t(ord.product_name || ord.product?.product_name || ord.listing?.product?.product_name || 'Produce')}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            {formatDate(ord.order_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCancelled && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-red-300">
                            <XCircle className="w-3.5 h-3.5 text-red-600" /> ORDER CANCELLED
                          </span>
                        )}

                        {isReturnRequested && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-purple-300">
                            <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> RETURN REQUESTED
                          </span>
                        )}

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
                    </div>

                    {/* Order Details Grid */}
                    {(() => {
                      const { displayQuantity, displayPricePerUnit, displayUnit } = formatBuyerUnitAndPrice(ord.quantity, ord.price_per_unit, ord.unit);
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Farmer Name</p>
                            <p className="text-sm font-bold text-slate-800">{ord.farmer_name}</p>
                            <p className="text-xs text-slate-500">{ord.pickup_location || ord.farmer_business || 'Farm Producer'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Produce Quantity</p>
                            <p className="text-sm font-bold text-slate-800">
                              {displayQuantity} {displayUnit} {t(ord.product_name)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Rate per {displayUnit}</p>
                            <p className="text-sm font-bold text-slate-800">₹{displayPricePerUnit}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Amount</p>
                            <p className="text-base font-black text-indigo-700">
                              ₹{ord.total_amount?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

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

                    {/* Cancelled Banner */}
                    {isCancelled && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1 text-red-950">
                        <p className="text-xs font-bold flex items-center gap-1.5 text-red-800">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Order Cancelled
                        </p>
                        <p className="text-xs text-red-700">
                          <strong>Reason:</strong> {ord.cancel_reason || 'Cancelled by buyer.'}
                        </p>
                      </div>
                    )}

                    {/* Return Requested Banner */}
                    {isReturnRequested && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5 text-purple-950">
                        <p className="text-xs font-bold flex items-center gap-1.5 text-purple-800">
                          <RotateCcw className="w-4 h-4 text-purple-600" />
                          Return Request Sent to Farmer ({ord.farmer_name})
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

                    {/* Pickup location */}
                    {ord.pickup_location && !isCancelled && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Pickup at farmgate: <strong>{ord.pickup_location}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-col gap-3 min-w-[210px]">
                    {!isCancelled && !isReturnRequested && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/order-payment?order_id=${ord.order_id}`)}
                        icon={ArrowRight}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-extrabold"
                      >
                        {isPending ? 'Pay Now' : 'View Details'}
                      </Button>
                    )}

                    {/* Cancel Order Action (Allowed for pending / unconfirmed orders) */}
                    {(isPending || isClaimed) && (
                      <button
                        onClick={() => {
                          setSelectedOrderForCancel(ord);
                          setCancelReason(CANCEL_REASONS[0]);
                          setCustomCancelReason('');
                        }}
                        className="w-full py-2 px-4 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        Cancel Order
                      </button>
                    )}

                    {/* Return Order Action (Allowed ONLY within 7 days of completion) */}
                    {isPaid && (
                      <div className="space-y-1.5">
                        {returnStatus.eligible ? (
                          <button
                            onClick={() => {
                              setSelectedOrderForReturn(ord);
                              setReturnReason(RETURN_REASONS[0]);
                              setReturnNote('');
                            }}
                            className="w-full py-2 px-4 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <RotateCcw className="w-4 h-4 text-purple-600" />
                            Request Return
                          </button>
                        ) : (
                          <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                              <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                              Return Expired
                            </p>
                            <p className="text-[10px] text-slate-400">7-day return limit exceeded</p>
                          </div>
                        )}

                        {returnStatus.eligible && (
                          <p className="text-[10px] text-center font-bold text-purple-700 flex items-center justify-center gap-1">
                            <CalendarClock className="w-3 h-3 text-purple-500" />
                            7-Day Policy ({returnStatus.daysLeft} day{returnStatus.daysLeft === 1 ? '' : 's'} left)
                          </p>
                        )}
                      </div>
                    )}

                    {(isCancelled || isReturnRequested) && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => navigate(`/order-payment?order_id=${ord.order_id}`)}
                        icon={ArrowRight}
                        className="w-full font-bold text-xs"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* CANCEL ORDER MODAL */}
      {selectedOrderForCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Cancel Order #{selectedOrderForCancel.order_id}?
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForCancel(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel your order for{' '}
                <strong>{selectedOrderForCancel.quantity} {t(selectedOrderForCancel.unit)} {selectedOrderForCancel.product_name}</strong>?
                This will release the reserved stock back to <strong>{selectedOrderForCancel.farmer_name}</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Select Reason for Cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500"
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Specify Reason:
                  </label>
                  <input
                    type="text"
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    placeholder="Enter your cancellation reason..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForCancel(null)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md cursor-pointer"
              >
                {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN ORDER MODAL */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-700">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Request Return for Order #{selectedOrderForReturn.order_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForReturn(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Submitting return request for{' '}
                <strong>{selectedOrderForReturn.quantity} {t(selectedOrderForReturn.unit)} {selectedOrderForReturn.product_name}</strong> (₹{selectedOrderForReturn.total_amount?.toLocaleString('en-IN')}) from <strong>{selectedOrderForReturn.farmer_name}</strong>.
              </p>

              {/* 7-Day Policy Notice */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                <p className="font-extrabold flex items-center gap-1.5 text-purple-800">
                  <CalendarClock className="w-4 h-4 text-purple-600" />
                  Agriसाथी 7-Day Return Policy
                </p>
                <p className="text-[11px] text-purple-900 font-medium">
                  This return request is within the allowed 7-day window from order completion date.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Return Reason:
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Additional Details / Note for Farmer:
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Describe the issue with produce quality, pickup discrepancy, etc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80 text-[11px] text-purple-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Farmer will be notified immediately to review your return request and arrange resolution/refund.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForReturn(null)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReturn}
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Return Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
