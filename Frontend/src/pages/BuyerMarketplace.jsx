import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useListings } from '../hooks/useListings';
import { productsApi } from '../api/productsApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PriceComparisonBadge } from '../components/PriceComparisonBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ProductImage } from '../components/ProductImage';
import { LoginRequiredModal } from '../components/LoginRequiredModal';
import { Modal } from '../components/Modal';
import { formatDate } from '../utils/formatCurrency';
import {
  ShoppingBag,
  Search,
  ArrowLeft,
  Store,
  LayoutGrid,
  ListFilter,
  Filter,
  MapPin,
  Star,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const BuyerMarketplace = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { listings, loading, updateFilters, filters } = useListings();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('photos'); // 'photos' | 'table'
  const [selectedListing, setSelectedListing] = useState(null);
  const [loginPromptAction, setLoginPromptAction] = useState(null);

  useEffect(() => {
    productsApi.getProducts().then((data) => setProducts(data || []));
  }, []);

  const handleProductChange = (prodId) => {
    setSelectedProductFilter(prodId);
    updateFilters({ product_id: prodId });
  };

  const handleDistrictChange = (val) => {
    setDistrictFilter(val);
    updateFilters({ district: val });
  };

  const handleReset = () => {
    setSearchTerm('');
    setDistrictFilter('');
    setSelectedProductFilter('');
    setGradeFilter('ALL');
    updateFilters({});
  };

  const handleGuardedAction = (actionTitle, callback) => {
    if (!isAuthenticated) {
      setLoginPromptAction(actionTitle);
      return;
    }
    if (callback) callback();
  };

  // Client-side search + grade filter on top of API filters
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmer_location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      gradeFilter === 'ALL' ||
      item.quality_grade?.toUpperCase().includes(gradeFilter.toUpperCase());

    return matchesSearch && matchesGrade;
  });

  // Helper to get clean grade alphabet
  const getGradeAlphabet = (gradeStr) => {
    if (!gradeStr) return 'A';
    if (gradeStr.includes('A+')) return 'A+';
    if (gradeStr.includes('A')) return 'A';
    if (gradeStr.includes('B+')) return 'B+';
    if (gradeStr.includes('B')) return 'B';
    if (gradeStr.includes('C')) return 'C';
    return gradeStr.replace(/Grade\s*|Organic\s*/i, '').trim() || 'A';
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
          {filteredListings.length} listings available
        </span>
      </div>

      {/* Header Banner (navy/indigo theme, mirrors MyProducts dark green banner) */}
      <div className="bg-gradient-to-r from-[#0a0f2c] via-[#111a45] to-[#0d1538] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-bold border border-indigo-500/30">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            {viewMode === 'photos' ? 'Produce Gallery View' : 'Detailed Listings Table'}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {t('browse_marketplace') || 'Browse Marketplace'}
          </h1>
          <p className="text-xs text-indigo-200/90 font-medium max-w-xl">
            {viewMode === 'photos'
              ? 'Explore farm-fresh produce listed directly by verified farmers — no middlemen.'
              : 'Detailed crop listings table with stock, asking prices, and Mandi price benchmarks.'}
          </p>
        </div>

        {/* Guest banner */}
        {!isAuthenticated && (
          <div className="relative z-10 flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Login to buy</span>
          </div>
        )}
      </div>

      {/* Toolbar: Search, Filters, View Toggle (mirrors MyProducts toolbar exactly) */}
      <Card className="bg-white border-slate-200/90 p-4 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by crop, farmer or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Quality Grade Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
              {['ALL', 'A+', 'A', 'B'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(grade)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    gradeFilter === grade
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {grade === 'ALL' ? `All (${listings.length})` : `${grade}`}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 text-white p-1 rounded-xl">
              <button
                onClick={() => setViewMode('photos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'photos'
                    ? 'bg-indigo-500 text-white font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Photos View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Photos
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filters Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-700 uppercase tracking-wider shrink-0">
            <Filter className="w-4 h-4 text-indigo-600" /> {t('sourcing_filters')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <select
              value={selectedProductFilter}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">{t('all_crop_categories')}</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {t(p.product_name)}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={districtFilter}
              onChange={(e) => handleDistrictChange(e.target.value)}
              placeholder={t('filter_district') || 'Filter by district...'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />

            <Button variant="outline" size="sm" fullWidth onClick={handleReset}>
              {t('reset_filters')}
            </Button>
          </div>
        </div>
      </Card>

      {/* CONTENT AREA: PHOTOS GRID vs TABLE VIEW */}
      {loading ? (
        <Card className="p-6">
          <SkeletonLoader type="card" count={6} />
        </Card>
      ) : filteredListings.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-white border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">No listings found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filters or search term.</p>
          </div>
          <Button variant="outline" size="md" onClick={handleReset}>
            Reset All Filters
          </Button>
        </Card>
      ) : viewMode === 'photos' ? (

        /* ── PHOTO GRID VIEW (mirrors MyProducts photo grid) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.listing_id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Photo */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <ProductImage
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  iconClassName="w-10 h-10 text-slate-400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                {/* Grade Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-black uppercase rounded-lg shadow-sm">
                    Grade {getGradeAlphabet(item.quality_grade)}
                  </span>
                </div>

                {/* Location + Floating Price Tag */}
                <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-200">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{item.farmer_location}</span>
                  </div>
                  <p className="text-lg font-black tracking-tight drop-shadow-md">
                    ₹{item.price_per_unit?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-200">/ {t(item.unit)}</span>
                  </p>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-3 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">
                    {t(item.product_name)}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">{t('farmer')}: {item.farmer_name}</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.farmer_rating || 4.9}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stock: <strong className="text-slate-800">{item.available_stock} {t(item.unit)}</strong>
                  </p>
                </div>

                <PriceComparisonBadge
                  askingPrice={item.price_per_unit}
                  mandiAvgPrice={item.mandi_avg_price}
                  compact
                />

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGuardedAction(t('view_details'), () => setSelectedListing(item))}
                    className="text-xs"
                  >
                    {t('view_details')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleGuardedAction(t('buy_now'), () =>
                        navigate(`/order-payment?listing_id=${item.listing_id}`)
                      )
                    }
                    icon={ShoppingBag}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {t('buy_now')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

      ) : (

        /* ── TABLE VIEW (mirrors MyProducts table) ── */
        <Card className="bg-white border-slate-200/90 shadow-sm overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '750px' }}>
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4"># / Crop Produce</th>
                  <th className="py-3.5 px-4">Farmer</th>
                  <th className="py-3.5 px-4">Quality Grade</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Asking Price</th>
                  <th className="py-3.5 px-4">Mandi Benchmark</th>
                  <th className="py-3.5 px-4">Pickup Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredListings.map((item) => (
                  <tr key={item.listing_id} className="hover:bg-slate-50/80 transition-colors">

                    {/* Crop Produce Name & Image */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                          iconClassName="w-5 h-5 text-slate-400"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{t(item.product_name)}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">
                            {t(item.category)} • ID #{item.listing_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Farmer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{item.farmer_name}</p>
                      <div className="flex items-center gap-1 text-amber-500 text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-bold">{item.farmer_rating || 4.9}</span>
                      </div>
                    </td>

                    {/* Quality Grade */}
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-lg border border-indigo-300 inline-block text-center shadow-2xs">
                        {getGradeAlphabet(item.quality_grade)}
                      </span>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {item.available_stock} {t(item.unit)}
                    </td>

                    {/* Asking Price */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-indigo-700 text-sm">
                        ₹{item.price_per_unit?.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-medium text-slate-400">/ {t(item.unit)}</span>
                      </p>
                    </td>

                    {/* Mandi Benchmark */}
                    <td className="py-3.5 px-4">
                      <PriceComparisonBadge
                        askingPrice={item.price_per_unit}
                        mandiAvgPrice={item.mandi_avg_price}
                        compact
                      />
                    </td>

                    {/* Pickup Location */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 max-w-[160px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.farmer_location}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGuardedAction(t('view_details'), () => setSelectedListing(item))}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() =>
                            handleGuardedAction(t('buy_now'), () =>
                              navigate(`/order-payment?listing_id=${item.listing_id}`)
                            )
                          }
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Buy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* LISTING DETAIL MODAL (mirrors BuyerDashboard modal) */}
      <Modal
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        title={t(selectedListing?.product_name) || t('listing_details')}
        maxWidth="max-w-2xl"
      >
        {selectedListing && (
          <div className="space-y-6">
            <div className="h-56 rounded-2xl overflow-hidden bg-slate-100">
              <ProductImage
                src={selectedListing.image_url}
                alt={selectedListing.product_name}
                className="w-full h-full object-cover"
                iconClassName="w-12 h-12 text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">{t(selectedListing.product_name)}</h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-extrabold rounded-full">
                  {t(selectedListing.quality_grade)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                <span>{t('farmer')}: {selectedListing.farmer_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedListing.farmer_rating} {t('farmer_rating')}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('asking_direct_price')}</p>
                <p className="text-2xl font-black text-indigo-700">
                  ₹{selectedListing.price_per_unit.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {t(selectedListing.unit)}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('stock_available')}</p>
                <p className="text-xl font-extrabold text-slate-900">
                  {selectedListing.available_stock} {t(selectedListing.unit)}
                </p>
              </div>
            </div>

            <PriceComparisonBadge
              askingPrice={selectedListing.price_per_unit}
              mandiAvgPrice={selectedListing.mandi_avg_price}
            />

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-xs space-y-1">
              <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-600" /> {t('direct_farmer_upi')}
              </p>
              <p className="text-indigo-800">
                {t('upi_target')} <strong>{selectedListing.farmer_upi}</strong> • {t('pickup_point')}{' '}
                {selectedListing.pickup_location}
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedListing(null)}>
                {t('close')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const id = selectedListing.listing_id;
                  setSelectedListing(null);
                  handleGuardedAction(t('proceed_checkout'), () =>
                    navigate(`/order-payment?listing_id=${id}`)
                  );
                }}
                icon={ShoppingBag}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {t('proceed_checkout')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* LOGIN REQUIRED MODAL */}
      <LoginRequiredModal
        isOpen={!!loginPromptAction}
        onClose={() => setLoginPromptAction(null)}
        actionTitle={loginPromptAction}
      />
    </div>
  );
};
