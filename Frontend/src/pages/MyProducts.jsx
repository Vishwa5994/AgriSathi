import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useListings } from '../hooks/useListings';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PriceComparisonBadge } from '../components/PriceComparisonBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ProductImage } from '../components/ProductImage';
import { formatDate } from '../utils/formatCurrency';
import {
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  MapPin,
  Search,
  ArrowLeft,
  Store,
  LayoutGrid,
  ListFilter,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyProducts = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to get clean grade alphabet (e.g. 'A+', 'A', 'B')
  const getGradeAlphabet = (gradeStr) => {
    if (!gradeStr) return 'A';
    if (gradeStr.includes('A+')) return 'A+';
    if (gradeStr.includes('A')) return 'A';
    if (gradeStr.includes('B+')) return 'B+';
    if (gradeStr.includes('B')) return 'B';
    if (gradeStr.includes('C')) return 'C';
    return gradeStr.replace(/Grade\s*|Organic\s*/i, '').trim() || 'A';
  };

  // If view=table param exists, default to table, otherwise default to photo view
  const initialView = searchParams.get('view') === 'table' ? 'table' : 'photos';
  const [viewMode, setViewMode] = useState(initialView); // 'photos' | 'table'

  const { listings, loading, error, deleteListing, refetch } = useListings({
    farmer_id: user?.user_id
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'table') {
      setViewMode('table');
    } else if (view === 'photos') {
      setViewMode('photos');
    }
  }, [searchParams]);

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (listingId) => {
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this produce listing?')) {
      return;
    }
    setDeletingId(listingId);
    try {
      await deleteListing(listingId);
      toast.success(t('delete_product') || 'Product deleted successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb / Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/farmer-dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboard') || 'Back to Dashboard'}
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Farmer Produce Inventory ({listings.length} items)
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            {viewMode === 'photos' ? 'Product Photos Gallery' : (t('product_list') || 'Product List')}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {t('my_products') || 'My Products'}
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium max-w-xl">
            {viewMode === 'photos'
              ? 'View all listed crop produce photos and images.'
              : 'Detailed crop inventory table showing stock, asking prices, and Mandi price benchmarks.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/add-product')}
          icon={PlusCircle}
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md shrink-0 text-xs"
        >
          {t('add_product') || '+ Add Product'}
        </Button>
      </div>

      {/* Toolbar: Search, Filter, and Photos vs Table Toggle */}
      <Card className="bg-white border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search produce by crop name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({listings.length})
            </button>
            <button
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Available ({listings.filter((l) => l.status === 'AVAILABLE').length})
            </button>
          </div>

          {/* View Mode Toggle Switch (Photos vs Table) */}
          <div className="flex items-center gap-1 bg-slate-900 text-white p-1 rounded-xl">
            <button
              onClick={() => {
                setViewMode('photos');
                setSearchParams({ view: 'photos' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'photos'
                  ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Photos View"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Photos
            </button>

            <button
              onClick={() => {
                setViewMode('table');
                setSearchParams({ view: 'table' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              Table
            </button>
          </div>
        </div>
      </Card>

      {/* CONTENT AREA: PHOTOS GRID vs TABLE VIEW */}
      {error ? (
        <Card className="p-8 text-center space-y-4 bg-white border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-lg">
            !
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">Failed to load your products</h3>
            <p className="text-xs text-slate-500 font-medium">{error}</p>
          </div>
          <Button variant="primary" size="md" onClick={refetch} className="bg-emerald-600 hover:bg-emerald-700">
            Retry Loading
          </Button>
        </Card>
      ) : loading ? (
        <Card className="p-6">
          <SkeletonLoader type="card" count={4} />
        </Card>
      ) : filteredListings.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-white border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500">
              You haven't listed any crop produce matching this filter yet.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/add-product')} icon={PlusCircle}>
            Add Product Now
          </Button>
        </Card>
      ) : viewMode === 'photos' ? (
        /* 1. PHOTO GRID VIEW ("just show photos and that all") */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.listing_id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Photo */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <ProductImage
                  src={item.picture || item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  iconClassName="w-10 h-10 text-slate-400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-black uppercase rounded-lg shadow-sm">
                    Grade {getGradeAlphabet(item.quality_grade)}
                  </span>
                </div>

                {/* Floating Price Tag */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-lg font-black tracking-tight drop-shadow-md">
                    ₹{item.price_per_unit?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-200">/ {t(item.unit)}</span>
                  </p>
                </div>
              </div>

              {/* Photo Card Details */}
              <div className="p-4 space-y-3 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                    {t(item.product_name)}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Stock: <strong className="text-slate-800">{item.quantity ?? item.available_stock ?? 0} {t(item.unit)}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate max-w-[140px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.pickup_location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => navigate(`/add-product?edit=${item.listing_id}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.listing_id)}
                      disabled={deletingId === item.listing_id}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 2. TABLE VIEW (Detailed Table Form) */
        <Card className="bg-white border-slate-200/90 shadow-sm overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4"># / Crop Produce</th>
                  <th className="py-3.5 px-4">Quality Grade</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Asking Price</th>
                  <th className="py-3.5 px-4">Mandi Benchmark</th>
                  <th className="py-3.5 px-4">Pickup Location</th>
                  <th className="py-3.5 px-4">Harvest Date</th>
                  <th className="py-3.5 px-4">Status</th>
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
                          src={item.picture || item.image_url}
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

                    {/* Quality Grade */}
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg border border-emerald-300 inline-block text-center shadow-2xs">
                        {getGradeAlphabet(item.quality_grade)}
                      </span>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {item.quantity ?? item.available_stock ?? 0} {t(item.unit)}
                    </td>

                    {/* Asking Price */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-emerald-700 text-sm">
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
                        <span className="truncate">{item.pickup_location}</span>
                      </div>
                    </td>

                    {/* Harvest Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {formatDate(item.harvest_date)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/add-product?edit=${item.listing_id}`)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.listing_id)}
                          disabled={deletingId === item.listing_id}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          Delete
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
    </div>
  );
};
