import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { comparePriceToMandi } from '../utils/priceComparison';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export const PriceComparisonBadge = ({ askingPrice, mandiAvgPrice, compact = false }) => {
  const { t } = useLanguage();
  const comp = comparePriceToMandi(askingPrice, mandiAvgPrice);

  const getIcon = () => {
    if (comp.status === 'below' || comp.status === 'fair') {
      return <TrendingDown className="w-3.5 h-3.5" />;
    } else if (comp.status === 'above' || comp.status === 'slightly_above') {
      return <TrendingUp className="w-3.5 h-3.5" />;
    }
    return <Minus className="w-3.5 h-3.5" />;
  };

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${comp.badgeClass}`}
      >
        {getIcon()}
        {t(comp.label)}
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${comp.badgeClass} flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          {getIcon()}
          {t(comp.label)}
        </span>
        <span className="text-xs font-semibold opacity-90">
          {t('mandi_avg')}: ₹{Number(mandiAvgPrice || 0).toLocaleString('en-IN')}/Kg
        </span>
      </div>
      <p className="text-xs opacity-90 font-medium leading-relaxed">
        {comp.recommendation}
      </p>
    </div>
  );
};
