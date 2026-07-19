import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import ScrollToTop from "@/components/ScrollToTop";
import Canonical from "@/components/Canonical";
import PageMeta from "@/components/PageMeta";
import CookieBanner from "@/components/CookieBanner";
import CartDrawer from "@/components/CartDrawer";
import { useAnalytics } from "@/hooks/useAnalytics";

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const queryClient = new QueryClient();

// Kořenový layout: obalí všechny stránky providery a globálním UI.
// Slouží jako root route pro prerender (vite-react-ssg).
const Layout = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Canonical />
          <PageMeta />
          <AnalyticsTracker />
          <Outlet />
          <CartDrawer />
          <CookieBanner />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default Layout;
