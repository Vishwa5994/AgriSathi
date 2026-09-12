import { useState, useEffect } from 'react';
import { priceHistoryApi } from '../api/priceHistoryApi';

export const usePriceHistory = (productId = 'prod-4', location = '') => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    priceHistoryApi.getPriceHistory(productId, location).then((data) => {
      if (isMounted) {
        setPriceData(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [productId, location]);

  return { priceData, loading };
};
