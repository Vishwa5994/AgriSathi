import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Show toast in an effect, NOT during render (avoids "update depth exceeded" error)
  useEffect(() => {
    if (!isAuthenticated) {
      const msg =
        requiredRole === 'FARMER'
          ? t('Please log in as a Farmer to access farmer activities.')
          : requiredRole === 'BUYER'
          ? t('Please log in as a Buyer to access buyer activities.')
          : t('Please log in to continue.');
      toast.error(msg, { id: `auth-req-${requiredRole || 'general'}` });
    } else if (requiredRole && role !== requiredRole) {
      const roleMsg =
        requiredRole === 'FARMER'
          ? t('This section is restricted to Farmers. Please log in with a Farmer account.')
          : t('This section is restricted to Buyers. Please log in with a Buyer account.');
      toast.error(roleMsg, { id: `auth-role-${requiredRole}` });
    }
  }, [isAuthenticated, requiredRole, role]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?role=${requiredRole || ''}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <Navigate
        to={`/login?role=${requiredRole}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};
