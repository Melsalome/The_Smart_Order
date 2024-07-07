import React from "react";
import { BrowserRouter, Route, Routes, useLocation, matchPath, Redirect } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import {jwtDecode} from "jwt-decode";
import { Navigate } from "react-router-dom";
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



const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/app/login" />;
  }
  const decodedToken = jwtDecode(token);
  // console.log(decodedToken.roles);
  if (role && decodedToken.roles !== role) {
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

          <Route element={<Login />} path="/app/login" />
          <Route element={<Signup />} path="/app/signup" />
          <Route path="/" element={<Navigate to="/app/caja" />} />
          <Route element={<ProtectedRoute roles={['admin', 'caja']}><Caja /></ProtectedRoute>} path="/app/caja" />
          <Route element={<ProtectedRoute roles="admin"><Dashboard /></ProtectedRoute>} path="/app/dashboard" />
          <Route element={<ProtectedRoute roles="admin"><Mesas /></ProtectedRoute>} path="/app/mesas" />
          <Route element={<ProtectedRoute roles="admin"><AdminMenuView /></ProtectedRoute>} path="/app/adminmenu" />
          <Route element={<AboutUs />} path="/app/about-us" />
          <Route element={<ProtectedRoute roles="admin"><GenerateQR /></ProtectedRoute>} path="/app/generate-qr" />
          <Route element={<ProtectedRoute roless={['admin', 'cocina']}><KitchenList /></ProtectedRoute>} path="/app/restaurants/:restaurantId/orders" />
          <Route element={<Menu />} path="/app/generate-qr/app/restaurants/:restaurantId/tables/:tableId/menu" />
          <Route element={<OrderSummary />} path="/restaurants/:restaurantId/tables/:tableId/order-summary" />
          <Route element={<OrderSuccess />} path="/restaurants/:restaurantId/tables/:tableId/order-success" />
          <Route element={<h1>Not found!</h1>} />
        </Routes>
        <SidebarController />
      </ScrollToTop>
    </BrowserRouter>
  );
};


export default injectContext(Layout);
