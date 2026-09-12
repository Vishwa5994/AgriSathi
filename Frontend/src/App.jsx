import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatAssistant } from './components/ChatAssistant';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { OrderPayment } from './pages/OrderPayment';
import { PriceDiscovery } from './pages/PriceDiscovery';
import { Notifications } from './pages/Notifications';
import { AddProduct } from './pages/AddProduct';
import { MyProducts } from './pages/MyProducts';
import { FarmerOrders } from './pages/FarmerOrders';
import { BuyerOrders } from './pages/BuyerOrders';
import { BuyerMarketplace } from './pages/BuyerMarketplace';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';

const HomeRoute = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const hashOrQuery = window.location.hash || window.location.search;
    if (hashOrQuery && (hashOrQuery.includes('access_token') || hashOrQuery.includes('id_token'))) {
      // Forward OAuth token hash/query to /login route so profile modal or authentication completes
      navigate(`/login${hashOrQuery}`, { replace: true });
    }
  }, [navigate]);

  return <Landing />;
};

const OrdersRoute = () => {
  const { role } = useAuth();
  if (role === 'FARMER') {
    return <FarmerOrders />;
  }
  return <BuyerOrders />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/farmer-dashboard"
            element={
              <ProtectedRoute requiredRole="FARMER">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-products"
            element={
              <ProtectedRoute requiredRole="FARMER">
                <MyProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <ProtectedRoute requiredRole="FARMER">
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/marketplace" element={<BuyerMarketplace />} />
          <Route
            path="/buyer-orders"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <BuyerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-payment"
            element={
              <ProtectedRoute>
                <OrderPayment />
              </ProtectedRoute>
            }
          />
          <Route path="/price-discovery" element={<PriceDiscovery />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="FARMER">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export function App() {
  React.useEffect(() => {
    // Prevent negative sign key input, sanitize values < 0, and stop mouse wheel scroll value changes
    const handleKeyDown = (e) => {
      if (e.target && e.target.tagName === 'INPUT' && (e.target.type === 'number' || e.target.type === 'tel')) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
        }
      }
    };

    const handleInput = (e) => {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
        if (e.target.value !== '' && Number(e.target.value) < 0) {
          e.target.value = Math.max(0, parseFloat(e.target.value) || 0);
        }
      }
    };

    const handleWheel = (e) => {
      if (
        e.target &&
        e.target.tagName === 'INPUT' &&
        (e.target.type === 'number' || e.target.getAttribute('type') === 'number')
      ) {
        e.target.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('input', handleInput);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('input', handleInput);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
              <Navbar />
              <Breadcrumbs />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <Footer />
              {/* Global AI Chat Assistant — visible on all pages */}
              <ChatAssistant />
              <Toaster
                position="bottom-left"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '13px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                  }
                }}
              />
            </div>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
