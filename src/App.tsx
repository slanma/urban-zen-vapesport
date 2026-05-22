import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import B2BLogin from "./pages/B2BLogin";
import B2BRegister from "./pages/B2BRegister";
import B2BDashboard from "./pages/B2BDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import { AdminProducts, AdminServices } from "./pages/admin/AdminProductTable";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrders from "./pages/admin/AdminOrders";
import Withdrawal from "./pages/Withdrawal";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CookieBanner from "./components/CookieBanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produkty" element={<Products />} />
            <Route path="/obchod" element={<Shop />} />
            <Route path="/produkt/:id" element={<ProductDetail />} />
            <Route path="/kosik" element={<Cart />} />
            <Route path="/pokladna" element={<Checkout />} />
            <Route path="/b2b-login" element={<B2BLogin />} />
            <Route path="/b2b-register" element={<B2BRegister />} />
            <Route path="/b2b-dashboard" element={<B2BDashboard />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/odstoupeni" element={<Withdrawal />} />
            <Route path="/obchodni-podminky" element={<Terms />} />
            <Route path="/ochrana-udaju" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CookieBanner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
