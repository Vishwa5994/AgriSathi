import apiClient from './client';

export const listingsApi = {
  getListings: async (filters = {}) => {
    try {
      const response = await apiClient.get('/listings', { params: filters });
      const res = response.data;
      if (res.error) return [];
      const listings = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      return listings;
    } catch (e) {
      console.error('Failed to fetch listings:', e?.response?.data || e.message);
      return [];
    }
  },

  getMyListings: async (farmerId) => {
    try {
      // Primary: use /listings/farmer/:farmer_id (always works, even on older backend deploys)
      // Fallback: /listings/my-listings (requires deployed route, uses JWT user_id)
      let response;
      if (farmerId) {
        response = await apiClient.get(`/listings/farmer/${farmerId}`);
      } else {
        // Try my-listings first, fall back to query param
        try {
          response = await apiClient.get('/listings/my-listings');
        } catch (innerErr) {
          // If /my-listings route doesn't exist on deployed backend, fallback
          const storedUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
          const uid = storedUser.user_id;
          if (uid) {
            response = await apiClient.get(`/listings/farmer/${uid}`);
          } else {
            throw innerErr;
          }
        }
      }
      const res = response.data;
      if (res.error) return [];
      const listings = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      return listings;
    } catch (e) {
      console.error('Failed to fetch my listings:', e?.response?.data || e.message);
      return [];
    }
  },

  getListingById: async (id) => {
    try {
      const response = await apiClient.get(`/listings/${id}`);
      const res = response.data;
      if (res.error) return null;
      return res.data || res;
    } catch (e) {
      console.error(`Failed to fetch listing #${id}:`, e?.response?.data || e.message);
      return null;
    }
  },

  createListing: async (listingData) => {
    const payload = {
      product_id: Number(listingData.product_id),
      quantity: Number(listingData.quantity),
      price_per_unit: Number(listingData.price_per_unit),
      quality_grade: listingData.quality_grade || 'Grade A+',
      harvest_date: listingData.harvest_date || new Date().toISOString().split('T')[0],
      location: listingData.location || listingData.pickup_location || 'APMC Yard',
      status: listingData.status || 'AVAILABLE'
    };

    const response = await apiClient.post('/listings', payload);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to create listing');
    }
    return res.data || res;
  },

  updateListing: async (listingId, listingData) => {
    const response = await apiClient.put(`/listings/${listingId}`, listingData);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to update listing');
    }
    return res.data || res;
  },

  deleteListing: async (listingId) => {
    const response = await apiClient.delete(`/listings/${listingId}`);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to delete listing');
    }
    return true;
  }
};
