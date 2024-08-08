import React from "react";
import { BrowserRouter, Route, Routes, useLocation, matchPath, Navigate } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import jwtDecode from "jwt-decode"; // Corregido la importación
import { Menu } from "./pages/menu";
import { OrderSummary } from "./pages/OrderSummary";
import { OrderSuccess } from "./pages/OrderSuccess";
import { KitchenList } from "./pages/KitchenList";
import { GenerateQR } from "./pages/GenerateQR";
import { AboutUs } from "./pages/AboutUs";
import Login from "./pages/login";
import injectContext from "./store/appContext";
import Mesas from "./pages/mesas";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Caja from "./pages/caja";
import AdminMenuView from './pages/adminMenuView';
import { Sidebar } from "./component/Sidebar";
import { SuccessPage } from "./pages/SuccessPage";

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/app/login" />;
  }
  const decodedToken = jwtDecode(token);
  if (roles && !roles.includes(decodedToken.roles)) {
    return <Navigate to="/app/login" />;
  }
  return children;
};

const SidebarController = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  let decodedToken = null;

  if (token) {
    decodedToken = jwtDecode(token);
  }
  
  const pathsToShowSidebar = [
    "/app/caja",
    "/app/mesas",
    "/app/adminmenu",
    "/app/about-us",
    "/app/generate-qr",
    "/app/restaurants/:restaurantId/orders"
  ];

  const showSidebar = pathsToShowSidebar.some((path) =>
    matchPath(path, location.pathname)
  );

  if (decodedToken && decodedToken.roles === "admin" && showSidebar) {
    return <Sidebar />;
  }

  return null;
};

const Layout = () => {
  const basename = process.env.BASENAME || "";

  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "")
    return <BackendURL />;

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop>
        <Routes>
          <Route path="/app/login" element={<Login />} />
          <Route path="/app/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/app/caja" />} />
          <Route path="/app/caja" element={<ProtectedRoute roles={['admin', 'caja']}><Caja /></ProtectedRoute>} />
          <Route path="/app/dashboard" element={<ProtectedRoute roles="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/app/mesas" element={<ProtectedRoute roles="admin"><Mesas /></ProtectedRoute>} />
          <Route path="/app/adminmenu" element={<ProtectedRoute roles="admin"><AdminMenuView /></ProtectedRoute>} />
          <Route path="/app/about-us" element={<AboutUs />} />
          <Route path="/app/generate-qr" element={<ProtectedRoute roles="admin"><GenerateQR /></ProtectedRoute>} />
          <Route path="/app/restaurants/:restaurantId/orders" element={<ProtectedRoute roles={['admin', 'cocina']}><KitchenList /></ProtectedRoute>} />
          <Route path="/app/generate-qr/app/restaurants/:restaurantId/tables/:tableId/menu" element={<Menu />} />
          <Route path="/restaurants/:restaurantId/tables/:tableId/order-summary" element={<OrderSummary />} />
          <Route path="/restaurants/:restaurantId/tables/:tableId/order-success" element={<OrderSuccess />} />
          <Route path="/app/generate-qr/order-success" element={<SuccessPage />} />
          <Route path="*" element={<h1>Not found!</h1>} />
        </Routes>
        <SidebarController />
      </ScrollToTop>
    </BrowserRouter>
  );
};

export default injectContext(Layout);

