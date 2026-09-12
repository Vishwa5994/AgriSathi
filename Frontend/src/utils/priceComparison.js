/**
 * Compares asking price against Mandi benchmark price.
 */
export const comparePriceToMandi = (askingPrice, mandiAvgPrice) => {
  const ask = Number(askingPrice) || 0;
  const mandi = Number(mandiAvgPrice) || 0;

  if (!mandi || mandi <= 0) {
    return {
      diffPercent: 0,
      status: 'neutral',
      color: 'slate',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Market Avg Unavailable',
      recommendation: 'Enter asking price based on quality grade.'
    };
  }

  const diffPercent = (((ask - mandi) / mandi) * 100).toFixed(1);
  const diffVal = ask - mandi;

  if (diffVal < -30) {
    // Significantly below market avg (Great buyer deal, Farmer pricing low)
    return {
      diffPercent: Math.abs(diffPercent),
      status: 'below',
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: `${Math.abs(diffPercent)}% Below Mandi Avg`,
      recommendation: 'Attractive buyer pricing! Will sell very quickly on the platform.',
      farmerTip: 'You are pricing below market average. Consider raising slightly to maximize profit.'
    };
  } else if (diffVal >= -30 && diffVal <= 50) {
    // Fair market price range
    return {
      diffPercent: Math.abs(diffPercent),
      status: 'fair',
      color: 'teal',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      label: ask < mandi ? `${Math.abs(diffPercent)}% Below Mandi` : `${Math.abs(diffPercent)}% Above Mandi (Fair)`,
      recommendation: 'Fair market competitive price! Cutting middleman margin effectively.',
      farmerTip: 'Spot-on market rate! High buyer response rate expected.'
    };
  } else if (diffVal > 50 && diffVal <= 250) {
    // Slightly above market avg
    return {
      diffPercent,
      status: 'slightly_above',
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      label: `${diffPercent}% Above Mandi Avg`,
      recommendation: 'Premium grade pricing. Ensure produce quality grade (Grade A+) justifies premium.',
      farmerTip: 'Priced above local mandi average. Highlight quality grade to attract premium buyers.'
    };
  } else {
    // High above market avg
    return {
      diffPercent,
      status: 'above',
      color: 'rose',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      label: `${diffPercent}% Above Mandi Avg`,
      recommendation: 'Significantly higher than recent regional APMC prices.',
      farmerTip: 'Your asking price is quite high compared to Mandi trends. Buyers might prefer lower offers.'
    };
  }
};
