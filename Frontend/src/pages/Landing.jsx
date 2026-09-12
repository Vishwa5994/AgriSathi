import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StatCounter } from '../components/StatCounter';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Sprout,
  ArrowRight,
  QrCode,
  LineChart,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../utils/mockData';
import { PriceComparisonBadge } from '../components/PriceComparisonBadge';
import { ProductImage } from '../components/ProductImage';

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();

  const handleFarmerActivity = () => {
    if (isAuthenticated && role === 'FARMER') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/login?role=FARMER');
    }
  };

  const handleBuyerActivity = () => {
    if (isAuthenticated && role === 'BUYER') {
      navigate('/buyer-dashboard');
    } else {
      navigate('/login?role=BUYER');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Live Ticker Marquee - Infinite scroll */}
      <div className="bg-emerald-950 text-emerald-200 text-xs py-2 border-b border-emerald-900 overflow-hidden">
        <div className="flex items-center gap-0">
          <span className="shrink-0 bg-emerald-800 text-amber-300 font-extrabold px-3 py-1 rounded text-[10px] uppercase flex items-center gap-1 z-10 mr-3 ml-3">
            <Sparkles className="w-3 h-3" /> {t('Live Mandi Rates')}
          </span>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
              {/* Duplicated for seamless loop */}
              {[1, 2].map((n) => (
                <React.Fragment key={n}>
                  <span className="shrink-0">🌾 {t('Sharbati Wheat')}: <strong className="text-white">₹2,450/Kg</strong> <span className="text-emerald-400">(-3% {t('vs Mandi')})</span></span>
                  <span className="shrink-0 mx-6">•</span>
                  <span className="shrink-0">🧅 {t('Nashik Red Onion')}: <strong className="text-white">₹1,980/Kg</strong> <span className="text-emerald-400">(-8% {t('vs Mandi')})</span></span>
                  <span className="shrink-0 mx-6">•</span>
                  <span className="shrink-0">🌾 {t('Basmati Rice 1121')}: <strong className="text-white">₹4,650/Kg</strong> <span className="text-emerald-400">(-4% {t('vs Mandi')})</span></span>
                  <span className="shrink-0 mx-6">•</span>
                  <span className="shrink-0">🍅 {t('Red Hybrid Tomatoes')}: <strong className="text-white">₹1,720/Kg</strong> <span className="text-emerald-400">(-7% {t('vs Mandi')})</span></span>
                  <span className="shrink-0 mx-6">•</span>
                  <span className="shrink-0">🌽 {t('Sweet Corn')}: <strong className="text-white">₹890/Kg</strong> <span className="text-emerald-400">(-5% {t('vs Mandi')})</span></span>
                  <span className="shrink-0 mx-6">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-300/20 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{t('Direct Producer-Buyer Platform')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              {t('hero_title_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-600">
                {t('hero_title_2')}
              </span>{' '}
              {t('hero_title_3')}
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
              {t('hero_sub')}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleFarmerActivity}
                icon={Sprout}
                className="shadow-xl"
              >
                {t('im_farmer')}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleBuyerActivity}
                icon={ArrowRight}
                className="shadow-xl"
              >
                {t('im_buyer')}
              </Button>
            </div>

            {/* Key trust bullets */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {t('Direct UPI QR Pay')}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {t('Mandi Price Match')}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {t('Zero Commissions')}
              </div>
            </div>
          </motion.div>

          {/* Hero Right Visual Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md">
              {/* Main Demo Card */}
              <div className="glass-card rounded-3xl p-6 shadow-2xl border border-white/60 space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={MOCK_PRODUCTS[3].image_url}
                      alt="Produce"
                      className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white"
                      iconClassName="w-6 h-6 text-slate-400"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{t(MOCK_PRODUCTS[3].product_name)}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{t('Farmer:')} Ramesh Patel (Nashik)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    {t('Grade A+')}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('asking_price')}</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-700">₹1,980</span>
                      <span className="text-xs text-slate-500 font-bold"> / Kg</span>
                    </div>
                  </div>

                  <PriceComparisonBadge askingPrice={1980} mandiAvgPrice={2150} />
                </div>



                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleBuyerActivity}
                  icon={ChevronRight}
                >
                  {t('Inspect Live Produce Listings')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Live Impact Counters */}
      <section className="bg-emerald-900 text-white py-12 border-y border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x-0 lg:divide-x divide-emerald-800">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl text-amber-400">
                <StatCounter value={42.8} prefix="₹" suffix=" Lakhs" decimals={1} />
              </p>
              <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                {t('Middleman Commissions Saved')}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl text-white">
                <StatCounter value={12450} suffix="+" />
              </p>
              <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                {t('Farmers Direct Onboarded')}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl text-amber-400">
                <StatCounter value={98.4} suffix="%" decimals={1} />
              </p>
              <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                {t('Instant UPI Payment Settlement')}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl text-white">
                <StatCounter value={450} suffix={` ${t('Mandis')}`} />
              </p>
              <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                {t('APMC Price Data Tracked')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - 3 Step Visual */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('How Agriसाथी Solves Market Exploitation')}
          </h2>
          <p className="text-slate-600 font-medium">
            {t('3 simple steps connecting farmgate produce to bulk buyers with total price transparency.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden bg-white space-y-4 p-7 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg">
              01
            </div>
            <h3 className="text-xl font-bold text-slate-900">{t('1. Farmer Lists Harvest')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('Farmers create a listing specifying quantity, quality grade (Grade A+), pickup location, and preferred UPI payment address.')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Sprout className="w-4 h-4" /> {t('Direct Farmgate Listing')}
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-white space-y-4 p-7 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-lg">
              02
            </div>
            <h3 className="text-xl font-bold text-slate-900">{t('2. Live Price Discovery')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('Our embedded engine compares asking price directly against recent APMC Mandi trends. Farmers price fairly; buyers trust the deal.')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-700">
              <LineChart className="w-4 h-4" /> {t('Live Agmarknet Benchmarks')}
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-white space-y-4 p-7 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg">
              03
            </div>
            <h3 className="text-xl font-bold text-slate-900">{t('3. Direct UPI Settlement')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('Buyer scans farmer\'s UPI QR code directly. Farmer verifies payment in bank app & confirms receipt. Zero intermediary delay.')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <QrCode className="w-4 h-4" /> {t('Instant 100% Direct Pay')}
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Market Produce Grid */}
      <section className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                {t('Direct Farmgate Offers')}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('Live Farmers Produce Listings')}
              </h2>
            </div>
            <button
              onClick={handleBuyerActivity}
              className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              {t('View all active listings')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.slice(0, 3).map((product) => (
              <Card key={product.product_id} className="space-y-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                  <ProductImage
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    iconClassName="w-10 h-10 text-slate-300"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                    {t(product.category)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t(product.product_name)}</h3>
                  <p className="text-xs text-slate-500 font-semibold line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{t('Mandi Benchmark')}</p>
                    <p className="text-base font-extrabold text-slate-900">
                      ₹{product.mandi_avg_price.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">/ {t(product.unit)}</span>
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleBuyerActivity}
                  >
                    {t('View Deals')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-900 p-8 sm:p-14 text-white overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('Ready to eliminate middleman cuts from your transactions?')}
            </h2>
            <p className="text-emerald-100 text-base font-medium">
              {t("Join thousands of farmers and bulk buyers already trading fairly on India's direct agritech market platform.")}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/signup')}
                icon={Sprout}
              >
                {t('Create Account (Free)')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/price-discovery')}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                icon={LineChart}
              >
                {t('Explore Price Discovery')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
