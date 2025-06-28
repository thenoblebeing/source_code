import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
// Replaced CSS import with styled-components GlobalStyles
import GlobalStyles from './AppStyles';

// Import theme
import theme from './theme/theme';

// Import contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import components
import FuturisticNavigation from './components/FuturisticNavigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Import pages
import EnhancedHomePage from './pages/EnhancedHomePage';
import ShopPage from './pages/ShopPage';
import MyCraftPage from './pages/MyCraftPage';
import VirtualTryOnPage from './pages/VirtualTryOnPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RetroPage from './pages/RetroPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import SupabaseDiagnostic from './pages/SupabaseDiagnostic';
import VirtualTryOnTest from './pages/VirtualTryOnTest';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Router>
            <ScrollToTop />
            <div className="app">
              <FuturisticNavigation />
              <Routes>
                <Route path="/" element={<EnhancedHomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/my-craft" element={<MyCraftPage />} />
                <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
                <Route path="/virtual-try-on-test" element={<VirtualTryOnTest />} />
                <Route path="/retro" element={<RetroPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/supabase-status" element={<SupabaseDiagnostic />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
