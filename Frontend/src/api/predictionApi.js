import axios from 'axios';
import fallbackData from '../data/mlPredictionFallback.json';

const PREDICTION_BASE_URL = import.meta.env.VITE_PREDICTION_API_URL || 'http://localhost:8000';

const predictionClient = axios.create({
  baseURL: PREDICTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Helper to normalize and match keys in fallback data
const matchCommodity = (name) => {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  
  if (fallbackData.price_predictions[clean]) {
    return fallbackData.price_predictions[clean];
  }
  
  for (const [k, v] of Object.entries(fallbackData.price_predictions)) {
    if (clean.includes(k) || k.includes(clean)) {
      return v;
    }
  }
  return null;
};

const matchDemand = (crop, region) => {
  if (!crop || !region) return null;
  const cClean = crop.trim().toLowerCase();
  const rClean = region.trim().toLowerCase();
  
  const exactKey = `${cClean}__${rClean}`;
  if (fallbackData.demand_predictions[exactKey]) {
    return fallbackData.demand_predictions[exactKey];
  }
  
  for (const [k, v] of Object.entries(fallbackData.demand_predictions)) {
    const [c, r] = k.split('__');
    if ((cClean.includes(c) || c.includes(cClean)) && (rClean.includes(r) || r.includes(rClean))) {
      return v;
    }
  }
  return null;
};

export const predictionApi = {
  // Check microservice health
  checkHealth: async () => {
    try {
      const res = await predictionClient.get('/health');
      return res.data;
    } catch {
      return { status: 'fallback', message: 'Using client-side ML engine' };
    }
  },

  // Get available commodity names
  getCommodities: async () => {
    try {
      const res = await predictionClient.get('/commodities');
      if (res.data?.commodities && res.data.commodities.length > 0) {
        return res.data.commodities;
      }
    } catch {
      // Fallback
    }
    return fallbackData.commodities || [];
  },

  // Get available crops and regions
  getCropsAndRegions: async () => {
    try {
      const res = await predictionClient.get('/crops-and-regions');
      if (res.data && res.data.crops?.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    return {
      crops: fallbackData.crops || [],
      regions: fallbackData.regions || [],
    };
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
      if (res.data && res.data.forecast) {
        return res.data;
      }
    } catch {
      // Proceed to fallback
    }

    // Client-side ML fallback
    const matched = matchCommodity(commodityName);
    if (matched) {
      const forecastSlice = (matched.forecast || []).slice(0, monthsAhead);
      return {
        ...matched,
        forecast: forecastSlice,
        predicted_price: forecastSlice[0]?.predicted_price || matched.predicted_price,
      };
    }
    return null;
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
      if (res.data && res.data.forecast) {
        return res.data;
      }
    } catch {
      // Proceed to fallback
    }

    // Client-side ML fallback
    const matched = matchDemand(crop, region);
    if (matched) {
      const forecastSlice = (matched.forecast || []).slice(0, monthsAhead);
      return {
        ...matched,
        forecast: forecastSlice,
        predicted_demand: forecastSlice[0]?.predicted_demand || matched.predicted_demand,
      };
    }
    return null;
  },
};

export default predictionApi;

