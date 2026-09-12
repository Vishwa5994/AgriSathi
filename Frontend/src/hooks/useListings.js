import { useState, useEffect, useCallback } from 'react';
import { listingsApi } from '../api/listingsApi';

export const useListings = (initialFilters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingsApi.getListings(filters);
      setListings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const createListing = async (listingData, currentUser) => {
    const newListing = await listingsApi.createListing(listingData, currentUser);
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
