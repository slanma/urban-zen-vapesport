import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import { Analytics } from "@vercel/analytics/react";

import Shop from "./pages/Shop";
import KolekceMorseo from "./pages/KolekceMorseo";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import B2BLogin from "./pages/B2BLogin";
import B2BSetPassword from "./pages/B2BSetPassword";
import B2BRegister from "./pages/B2BRegister";
import B2BDashboard from "./pages/B2BDashboard";
import B2BNastenka from "./pages/B2BNastenka";
import B2BWholesale from "./pages/B2BWholesale";
import B2BCheckout from "./pages/B2BCheckout";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import { AdminProducts, AdminServices } from "./pages/admin/AdminProductTable";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminB2B from "./pages/admin/AdminB2B";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminSettings from "./pages/admin/AdminSettings";
import Withdrawal from "./pages/Withdrawal";
import Account from "./pages/Account";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import ONas from "./pages/ONas";
import AppServices from "./pages/AppServices";
import OAuthConsent from "./pages/OAuthConsent";
import CookieBanner from "./components/CookieBanner";
import CartDrawer from "./components/CartDrawer";
import NotFound from "./pages/NotFound";
import { useAnalytics } from "@/hooks/useAnalytics";

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produkty" element={<Navigate to="/obchod" replace />} />
            <Route path="/obchod" element={<Shop />} />
            <Route path="/kolekce-morseo" element={<KolekceMorseo />} />
            <Route path="/produkt/:id" element={<ProductDetail />} />
            <Route path="/kosik" element={<Cart />} />
            <Route path="/pokladna" element={<Checkout />} />
            <Route path="/b2b-login" element={<B2BLogin />} />
            <Route path="/b2b-heslo" element={<B2BSetPassword />} />
            <Route path="/b2b-register" element={<B2BRegister />} />
            <Route path="/b2b-nastenka" element={<B2BNastenka />} />
            <Route path="/b2b-dashboard" element={<B2BDashboard />} />
            <Route path="/b2b-velkoobchod" element={<B2BWholesale />} />
            <Route path="/b2b-pokladna" element={<B2BCheckout />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin/b2b" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="produkty" element={<AdminProducts />} />
              <Route path="produkty/:id" element={<AdminProductEdit />} />
              <Route path="sluzby" element={<AdminServices />} />
              <Route path="objednavky" element={<AdminOrders />} />
              <Route path="b2b" element={<AdminB2B />} />
              <Route path="slevy" element={<AdminPromoCodes />} />
              <Route path="nastaveni" element={<AdminSettings />} />
            </Route>
            <Route path="/odstoupeni" element={<Withdrawal />} />
            <Route path="/ucet" element={<Account />} />
            <Route path="/obchodni-podminky" element={<Terms />} />
            <Route path="/ochrana-udaju" element={<Privacy />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/o-nas" element={<ONas />} />
            <Route path="/aplikace-a-sluzby" element={<AppServices />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CartDrawer />
        </BrowserRouter>
        <CookieBanner />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
