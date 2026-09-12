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
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Forward OAuth token hash to /login route so GoogleProfileCompletionModal opens
      navigate(`/login${window.location.hash}`, { replace: true });
    }
  }, [navigate]);

  if (isAuthenticated) {
    if (role === 'FARMER') {
      return <Navigate to="/farmer-dashboard" replace />;
    } else if (role === 'BUYER') {
      return <Navigate to="/buyer-dashboard" replace />;
    } else if (role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    }
  }

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
