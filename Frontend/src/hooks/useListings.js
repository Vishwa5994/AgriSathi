import { useState, useEffect, useCallback } from 'react';
import { listingsApi } from '../api/listingsApi';

export const useListings = (initialFilters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters.farmer_id, initialFilters.product_id, initialFilters.status]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const farmerId = filters.farmer_id || initialFilters.farmer_id;
      const data = farmerId
        ? await listingsApi.getMyListings(farmerId)
        : await listingsApi.getListings(filters);
      setListings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [filters, initialFilters.farmer_id]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const createListing = async (listingData, currentUser) => {
    const newListing = await listingsApi.createListing(listingData, currentUser);
    if (newListing && newListing.listing_id) {
      setListings((prev) => [newListing, ...prev]);
    }
    fetchListings();
    return newListing;
  };

  const updateListing = async (listingId, listingData) => {
    const updated = await listingsApi.updateListing(listingId, listingData);
    fetchListings();
    return updated;
  };

  const deleteListing = async (listingId) => {
    const res = await listingsApi.deleteListing(listingId);
    setListings((prev) => prev.filter((l) => String(l.listing_id) !== String(listingId)));
    fetchListings();
    return res;
  };

  return {
    listings,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing
  };
};
