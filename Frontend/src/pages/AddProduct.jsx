import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useListings } from '../hooks/useListings';
import { productsApi } from '../api/productsApi';
import { priceHistoryApi } from '../api/priceHistoryApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PriceComparisonBadge } from '../components/PriceComparisonBadge';
import { comparePriceToMandi } from '../utils/priceComparison';
import { ImageFrameAdjuster } from '../components/ImageFrameAdjuster';
import {
  Sprout,
  PlusCircle,
  Edit3,
  Trash2,
  LineChart as LineChartIcon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Calendar,
  Sparkles,
  Camera
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import toast from 'react-hot-toast';

export const AddProduct = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editListingId = searchParams.get('edit');

  const { listings, createListing, updateListing, deleteListing, refetch } = useListings({
    farmer_id: user?.user_id
  });

  const [mode, setMode] = useState(editListingId ? 'edit' : 'add');
  const [selectedListingId, setSelectedListingId] = useState(editListingId || '');

  // Form fields
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [askingPrice, setAskingPrice] = useState('2100');
  const [qualityGrade, setQualityGrade] = useState('Grade A+');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Price history for inline discovery widget
  const [priceHistoryData, setPriceHistoryData] = useState(null);
  const [loadingPriceWidget, setLoadingPriceWidget] = useState(false);

  useEffect(() => {
    if (user?.profile?.village) {
      setPickupLocation(`${user.profile.village} Farmgate, ${user.profile.district || 'Nashik'}`);
    } else {
      setPickupLocation('Farmgate APMC Yard, Nashik');
    }
  }, [user]);

  useEffect(() => {
    productsApi.getProducts().then((data) => {
      setProducts(data || []);
      if (data && data.length > 0 && !selectedProductId) {
        setSelectedProductId(data[0].product_id);
        setAskingPrice(data[0].mandi_avg_price ? (data[0].mandi_avg_price * 0.95).toFixed(0) : '2000');
      }
    });
  }, []);

  useEffect(() => {
    if (editListingId && listings.length > 0) {
      const found = listings.find((l) => String(l.listing_id) === String(editListingId));
      if (found) {
        setMode('edit');
        setSelectedListingId(found.listing_id);
        setSelectedProductId(found.product_id);
        setImageUrl(found.image_url || found.picture || '');
        setQuantity(String(found.quantity ?? found.available_stock ?? 50));
        setAskingPrice(String(found.price_per_unit || 2000));
        setQualityGrade(found.quality_grade || 'Grade A+');
        setHarvestDate(found.harvest_date ? String(found.harvest_date).split('T')[0] : new Date().toISOString().split('T')[0]);
        setPickupLocation(found.location || found.pickup_location || 'Farmgate APMC Yard');
      }
    }
  }, [editListingId, listings]);

  useEffect(() => {
    if (selectedProductId && selectedProductId !== 'ADD_NEW') {
      setLoadingPriceWidget(true);
      priceHistoryApi.getPriceHistory(selectedProductId).then((data) => {
        setPriceHistoryData(data);
        setLoadingPriceWidget(false);
      });
    }
  }, [selectedProductId]);

  const selectedProductObj = products.find((p) => p.product_id === selectedProductId) || products[0];
  const mandiAvgPrice = priceHistoryData?.current_mandi_avg || selectedProductObj?.mandi_avg_price || 2000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !askingPrice || !quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    if (selectedProductId === 'ADD_NEW' && !customProductName.trim()) {
      toast.error('Please enter the name of your new product');
      return;
    }

    setSubmitting(true);
    try {
      let finalProductId = selectedProductId;

      if (selectedProductId === 'ADD_NEW') {
        const createdProduct = await productsApi.createProduct({
          product_name: customProductName.trim(),
          mandi_avg_price: Number(askingPrice)
        });
        finalProductId = createdProduct.product_id;
        const refreshedProducts = await productsApi.getProducts();
        setProducts(refreshedProducts);
      }

      const payload = {
        product_id: finalProductId,
        quantity: Number(quantity),
        price_per_unit: Number(askingPrice),
        quality_grade: qualityGrade,
        harvest_date: harvestDate,
        location: pickupLocation,
        pickup_location: pickupLocation,
        image_url: imageUrl || selectedProductObj?.image_url
      };

      if (mode === 'edit' && selectedListingId) {
        await updateListing(selectedListingId, payload);
        toast.success(t('update_product') || 'Listing updated successfully!');
      } else {
        await createListing(payload, user);
        toast.success(t('save_product') || 'Produce listing published successfully!');
      }
      await refetch();
      navigate('/my-products');
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedListingId) return;
    setDeleting(true);
    try {
      await deleteListing(selectedListingId);
      toast.success((t('delete_product') || 'Product') + ' Deleted');
      await refetch();
      navigate('/my-products');
    } catch (e) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Farmer Direct Listing Service
        </span>
      </div>

      {/* Hero Card Header */}
      <div className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30">
            <Sprout className="w-3.5 h-3.5 text-amber-400" />
            {mode === 'edit' ? t('edit_product') : t('add_new_product')}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {mode === 'edit' ? 'Edit Produce Listing' : 'List Crop Produce for Direct Sale'}
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium max-w-2xl leading-relaxed">
            Eliminate intermediary commission cuts. Set your direct farmgate price, view live APMC Mandi benchmark trends, and connect directly with certified wholesale buyers.
          </p>
        </div>
      </div>

      {/* Main Full Page Form Card */}
      <Card className="bg-white border-slate-200/90 shadow-md p-6 sm:p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Produce Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Package className="w-4 h-4 text-emerald-600" />
              1. Crop & Quality Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t('select_crop')} *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={mode === 'edit'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white disabled:opacity-70 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {t(p.product_name)} ({t(p.category)})
                    </option>
                  ))}
                  {mode !== 'edit' && <option value="ADD_NEW">+ Add Product...</option>}
                </select>
                {mode === 'edit' && (
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Product cannot be changed when editing an existing listing.
                  </p>
                )}

                {mode !== 'edit' && selectedProductId === 'ADD_NEW' && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                      New Crop / Product Name *
                    </label>
                    <input
                      type="text"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      placeholder="e.g. Fresh Organic Sweet Corn"
                      required
                      className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t('quality_grade')} *
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Grade A+">Grade A+ (Export Quality Premium)</option>
                  <option value="Grade A">Grade A (Standard Commercial)</option>
                  <option value="Grade B">Grade B (Bulk Processing)</option>
                  <option value="Organic A+">Organic A+ (Certified Organic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Produce Photo & Frame Adjuster */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera className="w-4 h-4 text-emerald-600" />
              2. Produce Photo & Frame Adjustment
            </h3>
            <p className="text-xs text-slate-500">
              Upload a crop photo from your device. You can reposition, zoom, rotate, and adjust the photo frame so it looks great on the marketplace.
            </p>

            <ImageFrameAdjuster
              currentImageUrl={imageUrl}
              onImageSelected={(url) => setImageUrl(url)}
              onImageRemoved={() => setImageUrl('')}
            />
          </div>

          {/* Section 3: Quantity & Price */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. Quantity & Asking Price
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t('quantity')} ({selectedProductObj?.unit || 'Kg'}) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setQuantity(e.target.value < 0 ? '0' : e.target.value)}
                  placeholder="50"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-1.5">
                  {t('asking_price_unit')} *
                </label>
                <input
                  type="number"
                  min="0"
                  value={askingPrice}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setAskingPrice(e.target.value < 0 ? '0' : e.target.value)}
                  placeholder="2100"
                  required
                  className="w-full px-4 py-3 bg-emerald-50 border border-emerald-300 text-emerald-950 font-black rounded-xl text-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Live APMC Price Discovery Widget */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-amber-300">
                  {t('live_apmc_benchmark')}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {priceHistoryData?.mandi_name || 'Regional APMC Benchmarks'}
              </span>
            </div>

            <PriceComparisonBadge askingPrice={askingPrice} mandiAvgPrice={mandiAvgPrice} />

            {loadingPriceWidget ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                {t('loading_mandi_chart')}
              </div>
            ) : priceHistoryData?.history ? (
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistoryData.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mandi_avg"
                      name="APMC Mandi Avg (₹)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <ReferenceLine
                      y={Number(askingPrice) || 0}
                      label={{ value: t('your_ask'), fill: '#10b981', fontSize: 11, fontWeight: 'bold' }}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>

          {/* Section 3: Harvest & Logistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              3. Harvest Date & Pickup Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t('harvest_date')}
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t('pickup_location')}
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Pimpalgaon APMC Yard, Nashik"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Delete Warning Box */}
          {showDeleteConfirm && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-800 text-sm font-black">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Are you sure you want to delete this produce listing?</span>
              </div>
              <p className="text-xs text-rose-700">This action will remove the listing from the marketplace and cannot be undone.</p>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete} icon={Trash2}>
                  Confirm Delete Listing
                </Button>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-100">
            {mode === 'edit' && selectedListingId ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
                icon={Trash2}
              >
                Delete Product Listing
              </Button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                icon={mode === 'edit' ? Edit3 : PlusCircle}
                className="shadow-md px-6"
              >
                {mode === 'edit' ? 'Update Product Listing' : 'Publish Product Listing'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
