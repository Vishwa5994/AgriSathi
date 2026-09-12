import apiClient from './client';
import { mockListingsApi } from './mockService';

export const listingsApi = {
  getListings: async (filters = {}) => {
    try {
      const response = await apiClient.get('/listings', { params: filters });
      return response.data;
    } catch (e) {
      return await mockListingsApi.getListings(filters);
    }
  },

  getListingById: async (id) => {
    try {
      const response = await apiClient.get(`/listings/${id}`);
      return response.data;
    } catch (e) {
      return await mockListingsApi.getListingById(id);
    }
  },

  createListing: async (listingData, currentUser) => {
    try {
      const response = await apiClient.post('/listings', listingData);
      return response.data;
    } catch (e) {
      return await mockListingsApi.createListing(listingData, currentUser);
    }
  },

  updateListing: async (listingId, listingData) => {
    try {
      const response = await apiClient.put(`/listings/${listingId}`, listingData);
      return response.data;
    } catch (e) {
      return await mockListingsApi.updateListing(listingId, listingData);
    }
  },

  deleteListing: async (listingId) => {
    try {
      await apiClient.delete(`/listings/${listingId}`);
      return true;
    } catch (e) {
      return await mockListingsApi.deleteListing(listingId);
    }
  }
};
