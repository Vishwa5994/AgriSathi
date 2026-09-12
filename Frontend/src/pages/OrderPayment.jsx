import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../hooks/useOrders';
import { listingsApi } from '../api/listingsApi';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { buildUpiLink } from '../utils/buildUpiLink';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { StepperProgress } from '../components/StepperProgress';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkeletonLoader } from '../components/SkeletonLoader';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Banknote,
  Building,
  ShoppingBag,
  MapPin,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { orders, createOrder, claimPayment, confirmReceipt, refetch } = useOrders();

  const listingIdParam = searchParams.get('listing_id');
  const orderIdParam = searchParams.get('order_id');

  const [listing, setListing] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for creating order
  const [quantity, setQuantity] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Load listing or order details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (orderIdParam) {
      const existing = orders.find((o) => o.order_id === orderIdParam);
      if (existing) {
        setCurrentOrder(existing);
        setLoading(false);
      } else {
        refetch().then(() => setLoading(false));
      }
    } else if (listingIdParam) {
      listingsApi.getListingById(listingIdParam).then((item) => {
        if (isMounted) {
          setListing(item);
          if (item?.available_stock) {
            setQuantity(Math.min(10, item.available_stock));
          }
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [listingIdParam, orderIdParam, orders, refetch]);

  // Handle Create Order Step
  const handlePlaceOrder = async () => {
    if (!listing) return;
    try {
      const order = await createOrder({
        listing_id: listing.listing_id,
        quantity: Number(quantity)
      });
      setCurrentOrder(order);
    } catch (e) {
      toast.error('Could not create order');
    }
  };

  // Handle "I've Sent Payment" Step
  const handleClaimPaymentSent = async () => {
    if (!currentOrder) return;
    setSubmittingPayment(true);
    try {
      const updated = await claimPayment(currentOrder.order_id, paymentMethod);
      setCurrentOrder(updated);
      toast.success('Payment claim sent! Farmer notified.');
    } catch (e) {
      toast.error('Error claiming payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Demo shortcut for farmer confirmation
  const handleSimulateFarmerConfirm = async (received = true) => {
    if (!currentOrder) return;
    try {
      const updated = await confirmReceipt(currentOrder.order_id, received);
      setCurrentOrder(updated);
      if (received) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const calculateTotal = () => {
    const rate = listing?.price_per_unit || currentOrder?.price_per_unit || 0;
    const qty = currentOrder?.quantity || quantity || 1;
    return rate * qty;
  };

  const totalAmount = calculateTotal();
  const farmerUpiId = listing?.farmer_upi || currentOrder?.farmer_upi || 'ramesh.patel@okaxis';
  const farmerName = listing?.farmer_name || currentOrder?.farmer_name || 'Ramesh Kumar Patel';
  const displayOrderId = currentOrder?.order_id || 'NEW-ORDER';

  // Razorpay Gateway Checkout Handler
  const handleRazorpayCheckout = () => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TaDJIjue6hVX9R';

    if (!window.Razorpay) {
      toast.error('Razorpay SDK is loading. Please try again in a moment.');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: totalAmount * 100, // Razorpay takes amount in paise
      currency: 'INR',
      name: 'Agriसाथी Direct Market',
      description: `Order #${displayOrderId} - ${t(listing?.product_name || currentOrder?.product_name || 'Agri Produce')}`,
      image: listing?.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      handler: async function (response) {
        toast.success(`Razorpay Payment Successful! Txn ID: ${response.razorpay_payment_id}`);
        setSubmittingPayment(true);
        try {
          const updated = await claimPayment(currentOrder?.order_id || displayOrderId, 'RAZORPAY');
          setCurrentOrder(updated);
        } catch {
          // fallback update
        } finally {
          setSubmittingPayment(false);
        }
      },
      prefill: {
        name: user?.name || 'Vikram Malhotra',
        email: user?.email || 'vikram@freshmandi.com',
        contact: user?.phone || '+91 98999 11223'
      },
      notes: {
        order_id: displayOrderId,
        farmer: farmerName,
        farmer_upi: farmerUpiId
      },
      theme: {
        color: '#059669' // Emerald theme
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      toast.error(`Razorpay Payment Failed: ${response.error.description || 'Transaction declined'}`);
    });
    rzp.open();
  };

  // Build official UPI Link
  const upiDeepLink = buildUpiLink({
    upi_id: farmerUpiId,
    farmer_name: farmerName,
    amount: totalAmount,
    order_id: displayOrderId
  });

  const copyUpiToClipboard = () => {
    navigator.clipboard.writeText(farmerUpiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <SkeletonLoader type="chart" count={1} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> {t('back_to_dashboard')}
      </button>

      {/* Direct Payment Centerpiece Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between border border-slate-800">
        <div>
          <span className="px-3 py-1 bg-emerald-800 text-emerald-200 text-xs font-bold rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t('centerpiece_feature')}
          </span>
          <h1 className="text-2xl font-black mt-2">{t('direct_order_flow')}</h1>
        </div>

        {/* Demo Simulator Helper */}
        {currentOrder && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-amber-300 font-bold px-2">{t('judge_demo_simulator')}</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSimulateFarmerConfirm(true)}
              icon={CheckCircle2}
            >
              {t('simulate_farmer_confirm')}
            </Button>
          </div>
        )}
      </div>

      {/* Stepper Progress */}
      <Card className="p-6 bg-white border-slate-200">
        <StepperProgress
          status={currentOrder?.status || 'PENDING'}
          paymentStatus={currentOrder?.payment?.payment_status || 'PENDING'}
        />
      </Card>

      {/* Main Order / Payment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Summary & Quantity Selector */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5 bg-white border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-5 h-5 text-emerald-600" /> {t('order_summary')}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t('produce')}</span>
                <span className="font-bold text-slate-900">
                  {t(listing?.product_name || currentOrder?.product_name)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t('farmer_producer')}</span>
                <span className="font-bold text-slate-900">{farmerName}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t('rate_per')} {t(listing?.unit || currentOrder?.unit || 'Kg')}</span>
                <span className="font-bold text-slate-900">
                  ₹{(listing?.price_per_unit || currentOrder?.price_per_unit || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Quantity Selector if order not yet created */}
              {!currentOrder && listing && (
                <div className="py-3 border-y border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    {t('select_quantity')} ({t(listing.unit)})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={listing.available_stock}
                    value={quantity}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setQuantity(Math.max(1, Math.abs(Number(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2 bg-emerald-50 border border-emerald-300 font-extrabold text-emerald-950 rounded-xl text-lg text-center"
                  />
                  <p className="text-[11px] text-slate-400 text-center font-medium">
                    {t('available_stock')}: {listing.available_stock} {t(listing.unit)}
                  </p>
                </div>
              )}

              {currentOrder && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('order_quantity')}</span>
                  <span className="font-extrabold text-slate-900">
                    {currentOrder.quantity} {t(currentOrder.unit)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-extrabold uppercase text-slate-500">{t('total_payable')}</span>
                <span className="text-3xl font-black text-emerald-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action if order not created yet */}
            {!currentOrder && (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handlePlaceOrder}
                icon={ShoppingBag}
              >
                {t('proceed_to_payment')}
              </Button>
            )}
          </Card>

          {/* Logistics Pickup Banner */}
          <Card className="p-4 bg-emerald-50 border-emerald-200 text-xs space-y-2">
            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> {t('farmgate_pickup')}
            </p>
            <p className="text-emerald-900 font-medium leading-relaxed">
              {listing?.pickup_location || currentOrder?.pickup_location || 'APMC Yard Pimpalgaon'}
            </p>
          </Card>
        </div>

        {/* Right Column: Interactive Payment & QR Deep Link Screen */}
        <div className="lg:col-span-7">
          {!currentOrder ? (
            <Card className="p-12 text-center text-slate-400 space-y-3">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-medium text-sm">
                {t('confirm_qty_msg')}
              </p>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{t('upi_payment_title')}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t('orders')} ID: #{currentOrder.order_id}</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> {t('direct_payout')}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('payment_method')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer relative overflow-hidden ${
                      paymentMethod === 'RAZORPAY'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500 shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-bl-md uppercase">
                      Test API
                    </span>
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px]">Razorpay Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" /> UPI QR / App
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-600" /> Cash on Pickup
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'BANK'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building className="w-5 h-5 text-slate-700" /> Direct Bank NEFT
                  </button>
                </div>
              </div>

              {/* Razorpay Gateway Card Section */}
              {paymentMethod === 'RAZORPAY' && (
                <div className="p-6 bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl space-y-5 text-center shadow-xl border border-emerald-700/40 relative overflow-hidden">
                  <div className="space-y-1.5">
                    <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold rounded-full inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Razorpay Test Gateway Active
                    </span>
                    <h4 className="text-2xl font-black">Pay via Razorpay Checkout</h4>
                    <p className="text-xs text-emerald-200/90 max-w-md mx-auto">
                      Supports Credit/Debit Cards, NetBanking, UPI, and Wallets using test key: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">rzp_test_TaDJ...</code>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-left text-xs max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="font-bold font-mono text-emerald-400">#{displayOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Merchant / Farmer:</span>
                      <span className="font-bold text-white">{farmerName}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                      <span className="font-bold text-slate-300">Total Payable:</span>
                      <span className="font-black text-amber-400">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRazorpayCheckout}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-base shadow-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" /> Launch Razorpay Payment ₹{totalAmount.toLocaleString('en-IN')}
                  </button>
                </div>
              )}

              {/* UPI QR & Deep Link Section */}
              {paymentMethod === 'UPI' && (
                <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-6 text-center shadow-xl relative overflow-hidden">
                  <div className="space-y-1">
                    <p className="text-xs text-amber-400 font-extrabold uppercase tracking-wider">
                      {t('pay_direct_farmer')}
                    </p>
                    <h4 className="text-2xl font-black">{farmerName}</h4>
                    <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 border border-slate-700">
                      <span>{farmerUpiId}</span>
                      <button
                        onClick={copyUpiToClipboard}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP VIEWPORT: QR CODE */}
                  <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-2xl border-4 border-emerald-500">
                    <QRCodeSVG value={upiDeepLink} size={180} level="H" includeMargin />
                    <p className="text-[10px] font-bold text-slate-900 uppercase mt-2 tracking-wider">
                      {t('scan_upi_apps')}
                    </p>
                  </div>

                  {/* MOBILE VIEWPORT: NATIVE DEEP LINK BUTTON */}
                  <div className="pt-2">
                    <a
                      href={upiDeepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-base shadow-lg transition-all"
                    >
                      <Smartphone className="w-5 h-5" /> {t('pay_via_upi_app')} ₹{totalAmount.toLocaleString('en-IN')}
                    </a>
                  </div>
                </div>
              )}

              {/* Action Button: "I've Sent Payment" */}
              {currentOrder.payment?.payment_status === 'PENDING' && (
                <div className="space-y-3 pt-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    loading={submittingPayment}
                    onClick={handleClaimPaymentSent}
                    icon={CheckCircle2}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {t('sent_payment_btn')}
                  </Button>
                  <p className="text-[11px] text-slate-400 text-center font-medium">
                    {t('sent_payment_subtext')}
                  </p>
                </div>
              )}

              {currentOrder.payment?.payment_status === 'CLAIMED' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-amber-950 text-xs">
                  <p className="font-extrabold flex items-center gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600" /> {t('payment_claimed_heading')}
                  </p>
                  <p>
                    {t('notified_farmer_msg')} {farmerName}. {t('once_verified_msg')}
                  </p>
                </div>
              )}

              {currentOrder.payment?.payment_status === 'PAID' && (
                <div className="p-6 bg-emerald-500 text-white rounded-2xl space-y-2 text-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 mx-auto stroke-[2.5]" />
                  <h4 className="text-xl font-black">{t('payment_verified_heading')}</h4>
                  <p className="text-xs text-emerald-100">
                    {t('farmer_confirmed_amount')} ₹{totalAmount.toLocaleString('en-IN')}. {t('pickup_ready')}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
