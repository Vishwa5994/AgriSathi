import axios from 'axios';

const PREDICTION_BASE_URL = import.meta.env.VITE_PREDICTION_API_URL || 'http://localhost:8000';

const predictionClient = axios.create({
  baseURL: PREDICTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const predictionApi = {
  // Check microservice health
  checkHealth: async () => {
    try {
      const res = await predictionClient.get('/health');
      return res.data;
    } catch (err) {
      console.warn('Prediction service offline:', err.message);
      return null;
    }
  },

  // Get available commodity names
  getCommodities: async () => {
    try {
      const res = await predictionClient.get('/commodities');
      return res.data?.commodities || [];
    } catch (err) {
      console.warn('Failed to fetch commodities list:', err.message);
      return [];
    }
  },

  // Get available crops and regions
  getCropsAndRegions: async () => {
    try {
      const res = await predictionClient.get('/crops-and-regions');
      return res.data || { crops: [], regions: [] };
    } catch (err) {
      console.warn('Failed to fetch crops and regions list:', err.message);
      return { crops: [], regions: [] };
    }
  },

  // Predict price for a commodity
  predictPrice: async (commodityName, monthsAhead = 3) => {
    if (!commodityName) return null;
    try {
      const res = await predictionClient.get('/predict/price', {
        params: {
          commodity_name: commodityName,
          months_ahead: monthsAhead,
        },
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        console.info(`No ML price model data available for '${commodityName}'`);
      } else {
        console.warn('Price prediction error:', err.message);
      }
      return null;
    }
  },

  // Predict demand for a crop & region
  predictDemand: async (crop, region, monthsAhead = 3) => {
    if (!crop || !region) return null;
    try {
      const res = await predictionClient.get('/predict/demand', {
        params: {
          crop,
          region,
          months_ahead: monthsAhead,
        },
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        console.info(`No ML demand model data available for '${crop}' in '${region}'`);
      } else {
        console.warn('Demand prediction error:', err.message);
      }
      return null;
    }
  },
};

export default predictionApi;
