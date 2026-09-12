import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Breadcrumbs = ({ customItems = null }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const path = location.pathname;

  // Don't render breadcrumbs on landing page '/'
  if (path === '/') {
    return null;
  }

  // Pre-defined breadcrumb mapping for clean paths
  const routeMap = {
    '/farmer-dashboard': [
      { label: 'Home', path: '/' },
      { label: t('dashboard') || 'Farmer Dashboard', path: '/farmer-dashboard' }
    ],
    '/buyer-dashboard': [
      { label: 'Home', path: '/' },
      { label: t('marketplace') || 'Buyer Dashboard', path: '/buyer-dashboard' }
    ],
    '/marketplace': [
      { label: 'Home', path: '/' },
      { label: t('marketplace') || 'Marketplace', path: '/marketplace' }
    ],
    '/my-products': [
      { label: 'Home', path: '/' },
      { label: t('dashboard') || 'Farmer Dashboard', path: '/farmer-dashboard' },
      { label: t('my_products') || 'My Products', path: '/my-products' }
    ],
    '/add-product': [
      { label: 'Home', path: '/' },
      { label: t('dashboard') || 'Farmer Dashboard', path: '/farmer-dashboard' },
      { label: t('add_product') || 'Add Product', path: '/add-product' }
    ],
    '/orders': [
      { label: 'Home', path: '/' },
      { label: t('dashboard') || 'Farmer Dashboard', path: '/farmer-dashboard' },
      { label: t('orders') || 'Orders', path: '/orders' }
    ],
    '/price-discovery': [
      { label: 'Home', path: '/' },
      { label: t('price_discovery') || 'Price Discovery', path: '/price-discovery' }
    ],
    '/notifications': [
      { label: 'Home', path: '/' },
      { label: 'Notifications', path: '/notifications' }
    ],
    '/order-payment': [
      { label: 'Home', path: '/' },
      { label: 'Marketplace', path: '/marketplace' },
      { label: 'Order & Payment', path: '/order-payment' }
    ],
    '/login': [
      { label: 'Home', path: '/' },
      { label: 'Login', path: '/login' }
    ],
    '/signup': [
      { label: 'Home', path: '/' },
      { label: 'Signup', path: '/signup' }
    ]
  };

  const items = customItems || routeMap[path] || [
    { label: 'Home', path: '/' },
    { label: path.replace('/', '').replace('-', ' '), path }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {isLast ? (
                <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-emerald-700 flex items-center gap-1 transition-colors hover:underline"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 text-slate-400" />}
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
