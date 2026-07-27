import type { RouteRecord } from "vite-react-ssg";
import { Navigate } from "react-router-dom";
import Layout from "./Layout";
import { products } from "./data/products";

import Index from "./pages/Index";
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
import AdminB2BNovy from "./pages/admin/AdminB2BNovy";
import AdminNewsletters from "./pages/admin/AdminNewsletters";
import AdminPoptavky from "./pages/admin/AdminPoptavky";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminSettings from "./pages/admin/AdminSettings";
import Withdrawal from "./pages/Withdrawal";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import ONas from "./pages/ONas";
import AppServices from "./pages/AppServices";
import NotFound from "./pages/NotFound";

// Konkrétní cesty produktů, které se mají předrenderovat.
const productPaths = products.map((p) => `produkt/${p.id}`);

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Index /> },
      { path: "produkty", element: <Navigate to="/obchod" replace /> },
      { path: "obchod", element: <Shop /> },
      { path: "kolekce-morseo", element: <KolekceMorseo /> },
      {
        path: "produkt/:id",
        element: <ProductDetail />,
        getStaticPaths: () => productPaths,
      },
      { path: "kosik", element: <Cart /> },
      { path: "pokladna", element: <Checkout /> },
      { path: "b2b-login", element: <B2BLogin /> },
      { path: "b2b-heslo", element: <B2BSetPassword /> },
      { path: "b2b-register", element: <B2BRegister /> },
      { path: "b2b-nastenka", element: <B2BNastenka /> },
      { path: "b2b-dashboard", element: <B2BDashboard /> },
      { path: "b2b-velkoobchod", element: <B2BWholesale /> },
      { path: "b2b-pokladna", element: <B2BCheckout /> },
      { path: "admin-login", element: <AdminLogin /> },
      { path: "admin-dashboard", element: <Navigate to="/admin/b2b" replace /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverview /> },
          { path: "produkty", element: <AdminProducts /> },
          { path: "produkty/:id", element: <AdminProductEdit /> },
          { path: "sluzby", element: <AdminServices /> },
          { path: "objednavky", element: <AdminOrders /> },
          { path: "b2b", element: <AdminB2B /> },
          { path: "b2b-novy", element: <AdminB2BNovy /> },
          { path: "newslettery", element: <AdminNewsletters /> },
          { path: "poptavky", element: <AdminPoptavky /> },
          { path: "slevy", element: <AdminPromoCodes /> },
          { path: "nastaveni", element: <AdminSettings /> },
        ],
      },
      { path: "odstoupeni", element: <Withdrawal /> },
      { path: "obchodni-podminky", element: <Terms /> },
      { path: "ochrana-udaju", element: <Privacy /> },
      { path: "kontakt", element: <Contact /> },
      { path: "o-nas", element: <ONas /> },
      { path: "aplikace-a-sluzby", element: <AppServices /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
