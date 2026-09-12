/**
 * Formats a number into Indian Rupee currency format (e.g. ₹1,50,000 or ₹1.5 Lakhs)
 */
export const formatCurrency = (amount, compact = false) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  const num = Number(amount);

  if (compact) {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getReturnEligibility = (order) => {
  if (!order) return { eligible: false, daysElapsed: 0, daysLeft: 0 };

  const isPaid =
    order.payment?.payment_status === 'PAID' ||
    order.status === 'CONFIRMED' ||
    order.status === 'COMPLETED';

  if (!isPaid || order.status === 'CANCELLED' || order.status === 'RETURN_REQUESTED') {
    return { eligible: false, daysElapsed: 0, daysLeft: 0 };
  }

  const completionDateStr = order.payment?.paid_at || order.completed_at || order.order_date;
  const completionDate = new Date(completionDateStr);
  const now = new Date();

  const diffMs = now.getTime() - completionDate.getTime();
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 7 - daysElapsed);

  return {
    eligible: daysElapsed <= 7,
    daysElapsed,
    daysLeft
  };
};

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://agrisathi-3eew.onrender.com';
  const cleanBase = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export const formatBuyerUnitAndPrice = (quantity, pricePerUnit, rawUnit) => {
  const unitStr = String(rawUnit || 'kg').trim();
  const isQuintal = /^quintal|qtl$/i.test(unitStr);
  if (isQuintal) {
    return {
      displayQuantity: Number(quantity || 0) * 100,
      displayPricePerUnit: Number(pricePerUnit || 0) / 100,
      displayUnit: 'kg'
    };
  }
  return {
    displayQuantity: Number(quantity || 0),
    displayPricePerUnit: Number(pricePerUnit || 0),
    displayUnit: /^quintal|qtl$/i.test(unitStr) ? 'kg' : unitStr
  };
};

export const formatBuyerUnit = (rawUnit) => {
  const unitStr = String(rawUnit || 'kg').trim();
  if (/^quintal|qtl$/i.test(unitStr)) {
    return 'kg';
  }
  return unitStr;
};
