import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { productsApi } from '../api/productsApi';
import { priceHistoryApi } from '../api/priceHistoryApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PriceComparisonBadge } from '../components/PriceComparisonBadge';
import { LoginRequiredModal } from '../components/LoginRequiredModal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  LineChart as LineChartIcon,
  Search,
  MapPin,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building2,
  Info,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export const PriceDiscovery = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('prod-4'); // Nashik Red Onion default
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginPromptAction, setLoginPromptAction] = useState(null);

  useEffect(() => {
    productsApi.getProducts().then((data) => setProducts(data || []));
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      setLoading(true);
      priceHistoryApi.getPriceHistory(selectedProductId, selectedDistrict).then((data) => {
        setPriceData(data);
        setLoading(false);
      });
    }
  }, [selectedProductId, selectedDistrict]);

  const currentProduct = products.find((p) => p.product_id === selectedProductId) || products[0];

  const handleTradeAction = () => {
    if (!isAuthenticated) {
      setLoginPromptAction(t('buy_now'));
      return;
    }
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30">
            <BarChart3 className="w-3.5 h-3.5" /> {t('apmc_market_intelligence')}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {t('price_discovery_title')}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {t('price_discovery_desc')}
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <Card className="p-6 bg-white border-slate-200 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('select_crop_produce')}
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {t(p.product_name)} ({t(p.category)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('select_mandi_region')}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
            >
              <option value="Nashik">Nashik & Pimpalgaon APMC (Maharashtra)</option>
              <option value="Karnal">Karnal & Taraori Mandi (Haryana)</option>
              <option value="Sehore">Sehore & Indore APMC (Madhya Pradesh)</option>
              <option value="Guntur">Guntur & Vijayawada APMC (Andhra Pradesh)</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 w-full text-xs font-bold text-emerald-900 flex items-center justify-between">
              <span>{t('benchmark_rate')}:</span>
              <span className="text-base font-black text-emerald-700">
                ₹{priceData?.current_mandi_avg?.toLocaleString('en-IN') || '2,150'} / {t(currentProduct?.unit) || 'Kg'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Recharts Chart Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-emerald-600" />
              {t(currentProduct?.product_name) || t('Crop')} {t('price_trend_30')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Source: {priceData?.mandi_name || 'Agmarknet APMC Live Feeds'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span> {t('apmc_mandi_avg')}
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-3 h-3 bg-emerald-600 rounded-full inline-block"></span> {t('platform_direct_avg')}
            </span>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type="chart" count={1} />
        ) : priceData?.history ? (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData.history}>
                <defs>
                  <linearGradient id="colorMandi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="mandi_avg"
                  name={t('apmc_mandi_rate')}
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMandi)"
                />
                <Area
                  type="monotone"
                  dataKey="platform_avg"
                  name={t('direct_ask_rate')}
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPlatform)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </Card>

      {/* Comparison Table */}
      <Card className="p-6 bg-white border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          {t('recent_mandi_breakdown')}
        </h3>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3">{t('quality_grade')}</th>
                <th className="p-3">{t('mandi_min_price')}</th>
                <th className="p-3">{t('mandi_avg_price')}</th>
                <th className="p-3">{t('mandi_max_price')}</th>
                <th className="p-3">{t('agrisathi_fair_range')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="p-3 font-bold text-emerald-800">Grade A+ (Export Quality)</td>
                <td className="p-3">₹{(currentProduct?.mandi_min_price || 1800) + 200}</td>
                <td className="p-3 font-bold">₹{(currentProduct?.mandi_avg_price || 2150) + 300}</td>
                <td className="p-3">₹{(currentProduct?.mandi_max_price || 2500)}</td>
                <td className="p-3 font-bold text-emerald-700 bg-emerald-50">
                  ₹{(currentProduct?.mandi_avg_price || 2150) + 100} - ₹{(currentProduct?.mandi_max_price || 2500)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-800">Grade A (Standard Mandi)</td>
                <td className="p-3">₹{currentProduct?.mandi_min_price || 1800}</td>
                <td className="p-3 font-bold">₹{currentProduct?.mandi_avg_price || 2150}</td>
                <td className="p-3">₹{(currentProduct?.mandi_max_price || 2500) - 200}</td>
                <td className="p-3 font-bold text-emerald-700 bg-emerald-50">
                  ₹{(currentProduct?.mandi_avg_price || 2150) - 100} - ₹{currentProduct?.mandi_avg_price || 2150}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOGIN REQUIRED MODAL */}
      <LoginRequiredModal
        isOpen={!!loginPromptAction}
        onClose={() => setLoginPromptAction(null)}
        actionTitle={loginPromptAction}
      />
    </div>
  );
};
