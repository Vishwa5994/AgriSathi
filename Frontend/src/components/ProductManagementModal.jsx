import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useListings } from '../hooks/useListings';
import { productsApi } from '../api/productsApi';
import { priceHistoryApi } from '../api/priceHistoryApi';
import { Modal } from './Modal';
import { Button } from './Button';
import { PriceComparisonBadge } from './PriceComparisonBadge';
import { comparePriceToMandi } from '../utils/priceComparison';
import {
  Sprout,
  PlusCircle,
  Edit3,
  Trash2,
  LineChart as LineChartIcon,
  AlertTriangle,
  Check
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

export const ProductManagementModal = ({ isOpen, onClose, initialMode = 'add', targetListing = null }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { listings, createListing, updateListing, deleteListing, refetch } = useListings({
    farmer_id: user?.user_id
  });

  const [mode, setMode] = useState(initialMode); // 'add' | 'edit'
  const [selectedListingId, setSelectedListingId] = useState('');
  
  // Form fields
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
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
      setPickupLocation('Farmgate APMC Yard');
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
    if (targetListing) {
      setMode('edit');
      setSelectedListingId(targetListing.listing_id);
      setSelectedProductId(targetListing.product_id);
      setQuantity(String(targetListing.quantity ?? targetListing.available_stock ?? 50));
      setAskingPrice(String(targetListing.price_per_unit || 2000));
      setQualityGrade(targetListing.quality_grade || 'Grade A+');
      setHarvestDate(targetListing.harvest_date ? String(targetListing.harvest_date).split('T')[0] : new Date().toISOString().split('T')[0]);
      setPickupLocation(targetListing.location || targetListing.pickup_location || 'Farmgate APMC Yard');
    }
  }, [targetListing]);

  // When changing edit listing dropdown
  const handleSelectListingToEdit = (listingId) => {
    setSelectedListingId(listingId);
    const found = listings.find((l) => l.listing_id === listingId);
    if (found) {
      setSelectedProductId(found.product_id);
      setQuantity(String(found.quantity ?? found.available_stock ?? 50));
      setAskingPrice(String(found.price_per_unit || 2000));
      setQualityGrade(found.quality_grade || 'Grade A+');
      setHarvestDate(found.harvest_date ? String(found.harvest_date).split('T')[0] : new Date().toISOString().split('T')[0]);
      setPickupLocation(found.location || found.pickup_location || 'Farmgate APMC Yard');
    }
  };

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
        pickup_location: pickupLocation
      };

      if (mode === 'edit' && selectedListingId) {
        await updateListing(selectedListingId, payload);
        toast.success(t('update_product'));
      } else {
        await createListing(payload, user);
        toast.success(t('save_product'));
      }
      refetch();
      onClose();
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedListingId) return;
    setDeleting(true);
    try {
      await deleteListing(selectedListingId);
      toast.success(t('delete_product') + ' Successful');
      refetch();
      setShowDeleteConfirm(false);
      onClose();
    } catch (e) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('manage_products')}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('add');
              setShowDeleteConfirm(false);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'add' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> {t('add_new_product')}
          </button>

          {listings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMode('edit');
                if (listings.length > 0 && !selectedListingId) {
                  handleSelectListingToEdit(listings[0].listing_id);
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'edit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Edit3 className="w-4 h-4" /> {t('edit_product')} / {t('delete')}
            </button>
          )}
        </div>

        {/* If Mode is Edit, Listing Selector */}
        {mode === 'edit' && listings.length > 0 && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
            <label className="block text-xs font-bold text-amber-900 uppercase">
              {t('select_existing_product') || 'Select Existing Product to Edit or Delete:'}
            </label>
            <select
              value={selectedListingId}
              onChange={(e) => handleSelectListingToEdit(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
            >
              {listings.map((item) => (
                <option key={item.listing_id} value={item.listing_id}>
                  #{item.listing_id} — {t(item.product_name)} ({t(item.quality_grade)}) — ₹{item.price_per_unit}/{t(item.unit)}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('select_crop')}
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={mode === 'edit'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 disabled:opacity-70 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                    className="w-full px-3.5 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('quality_grade')}
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
              >
                <option value="Grade A+">{t('Grade A+')} ({t('Export Quality') || 'Export Premium'})</option>
                <option value="Grade A">{t('Grade A')}</option>
                <option value="Grade B">{t('Grade B')}</option>
                <option value="Organic A+">{t('Organic A+')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('quantity')} ({selectedProductObj?.unit || 'Kg'})
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setQuantity(e.target.value < 0 ? '0' : e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                {t('asking_price_unit')}
              </label>
              <input
                type="number"
                min="0"
                value={askingPrice}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setAskingPrice(e.target.value < 0 ? '0' : e.target.value)}
                placeholder="2100"
                className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-950 font-black rounded-xl text-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* INLINE LIVE MANDI PRICE DISCOVERY CHART WIDGET */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-amber-300">
                  {t('live_apmc_benchmark')}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {priceHistoryData?.mandi_name || t('regional_apmc')}
              </span>
            </div>

            <PriceComparisonBadge askingPrice={askingPrice} mandiAvgPrice={mandiAvgPrice} />

            {loadingPriceWidget ? (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400">
                {t('loading_mandi_chart')}
              </div>
            ) : priceHistoryData?.history ? (
              <div className="h-40 w-full">
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
                      name={t('mandi_avg_rs')}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('harvest_date')}
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('pickup_location')}
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Pimpalgaon APMC Yard, Nashik"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Delete Confirmation Warning Box */}
          {showDeleteConfirm && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-extrabold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>{t('confirm_delete')}</span>
              </div>
              <p className="text-xs text-rose-700">{t('delete_warning')}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  {t('cancel')}
                </Button>
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete} icon={Trash2}>
                  {t('confirm_delete_btn')}
                </Button>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {mode === 'edit' && selectedListingId ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
                icon={Trash2}
              >
                {t('delete_product')}
              </Button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                icon={mode === 'edit' ? Edit3 : PlusCircle}
              >
                {mode === 'edit' ? t('update_product') : t('save_product')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
