import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Agri<span className="text-emerald-400">साथी</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('Strengthening Market Linkages & Price Discovery for Farmers. Direct platform solution to eliminate exploitative middlemen cuts.')}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/50 w-fit">
              <Zap className="w-4 h-4 text-amber-400" /> {t('Direct Producer-Buyer Network')}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('Platform Links')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">
                  {t('Browse Produce Listings')}
                </Link>
              </li>
              <li>
                <Link to="/price-discovery" className="hover:text-emerald-400 transition-colors">
                  {t('Live Mandi Price Discovery')}
                </Link>
              </li>
              <li>
                <Link to="/farmer-dashboard" className="hover:text-emerald-400 transition-colors">
                  {t('Farmer Selling Portal')}
                </Link>
              </li>
              <li>
                <Link to="/buyer-dashboard" className="hover:text-emerald-400 transition-colors">
                  {t('Buyer Sourcing Portal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('Platform Highlights')}</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {t('Direct UPI Instant Settlement')}
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <HeartHandshake className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {t('Transparent Price Discovery')}
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {t('Zero Commission Middlemen Cut')}
              </li>
            </ul>
          </div>

          {/* Problem Statement Box */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {t('Direct Trade Mission')}
            </h4>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{t('Multiple intermediaries reduce farmers\' earnings and increase consumer prices. Live price data alongside asking price empowers fair trade.')}"
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{t('© 2026 Agriसाथी Platform — Direct Farmgate Marketplace.')}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">{t('Privacy Policy')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('Terms of Trade')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('APMC Data Terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
