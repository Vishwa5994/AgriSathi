import React from 'react';
import { formatDate } from '../utils/formatCurrency';
import {
  Printer,
  X,
  CheckCircle2,
  Receipt,
  Building,
  User,
  MapPin,
  QrCode,
  ShieldCheck,
  Download
} from 'lucide-react';

export const InvoiceModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-${order.order_id?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '1001'}`;
  const paidDate = order.payment?.paid_at || order.completed_at || order.order_date;
  const unitRate = order.price_per_unit || 0;
  const qty = order.quantity || 1;
  const subtotal = order.total_amount || (unitRate * qty);
  const mandiTax = 0; // Exempt direct farmgate purchase
  const grandTotal = subtotal + mandiTax;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 border border-slate-200">
        
        {/* Action Header (Hidden during printing) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-emerald-700">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="font-black text-lg text-slate-900">Official Tax Invoice / Receipt</h2>
              <p className="text-xs text-slate-500 font-medium">Order #{order.order_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE AREA */}
        <div id="printable-invoice" className="space-y-6 bg-white p-2">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-700 tracking-tight">Agriसाथी</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase border border-emerald-300">
                  Verified B2B Direct Market
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Direct Farmgate Agricultural Produce Trading Platform
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAYMENT VERIFIED
              </span>
              <p className="text-xs font-bold text-slate-800">Invoice #: {invoiceNo}</p>
              <p className="text-[11px] text-slate-500 font-medium">Date: {formatDate(paidDate)}</p>
            </div>
          </div>

          {/* Seller vs Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Seller / Farmer Details
              </span>
              <p className="font-extrabold text-sm text-slate-900">{order.farmer_name}</p>
              <p className="text-xs text-slate-600 font-medium">{order.farmer_business || 'Direct Farm Producer'}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {order.pickup_location || 'APMC Yard Pimpalgaon'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">UPI ID: {order.farmer_upi || 'ramesh.patel@okaxis'}</p>
            </div>

            {/* Buyer Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Buyer / Bill To
              </span>
              <p className="font-extrabold text-sm text-slate-900">{order.buyer_name}</p>
              <p className="text-xs text-slate-600 font-medium">{order.buyer_business || 'Wholesale Agri Buyer'}</p>
              {order.buyer_phone && (
                <p className="text-xs text-slate-500 font-mono">Contact: {order.buyer_phone}</p>
              )}
              <p className="text-[11px] text-slate-500">Order ID: #{order.order_id}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Unit Price</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                <tr>
                  <td className="p-3">
                    <p className="font-extrabold text-slate-900">{order.product_name}</p>
                    <p className="text-[11px] text-slate-500">Grade: {order.quality_grade || 'Grade A+'}</p>
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700">
                    ₹{unitRate.toLocaleString('en-IN')} / {order.unit || 'Kg'}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    {qty} {order.unit || 'Kg'}
                  </td>
                  <td className="p-3 text-right font-extrabold text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & Summary Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
            {/* Payment Verification Seal */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 max-w-xs text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Direct Payment
              </div>
              <p className="text-[11px] text-emerald-900 font-medium">
                Method: <strong>{order.payment?.payment_method || 'UPI'}</strong>
              </p>
              {order.payment?.transaction_id && (
                <p className="text-[10px] font-mono text-emerald-800">
                  Txn Ref: {order.payment.transaction_id}
                </p>
              )}
            </div>

            {/* Subtotal Calculation */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Direct Farmgate Tax / APMC Fee</span>
                <span className="font-bold text-emerald-600">₹0 (Exempt)</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-black text-slate-900">
                <span>Total Paid</span>
                <span className="text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Invoice Disclaimer / Footer */}
          <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-500">
              This is a computer-generated tax invoice issued by Agriसाथी Direct Marketplace Platform.
            </p>
            <p>Subject to Agriसाथी 7-Day Produce Quality Return Policy terms.</p>
          </div>

        </div>

        {/* Modal Footer (Hidden in print) */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Invoice
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download / Print PDF
          </button>
        </div>

      </div>
    </div>
  );
};
