import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/user/ProfilePage";
import AllProducts from "./pages/product/ProductsPage";
import ProductDetailsPage from "./pages/product/ProductDetailsPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import PaymentSuccessPage from "./pages/cart/PaymentSuccessPage";
import WishlistPage from "./pages/wishlist/WishlistPage";

import StaffPage from "./pages/staff/StaffPage";

import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import OrdersPage from "./pages/admin/OrdersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import InventoryPage from "./pages/admin/InventoryPage";
import CustomersPage from "./pages/admin/CustomersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import UsersRolesPage from "./pages/admin/UsersRolesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import SupportPage from "./pages/admin/SupportPage";
import MarketingPage from "./pages/admin/MarketingPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

// import PrivateRoute from "./utils/PrivateRoute";
// import PublicRoute from "./utils/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/user/profile" element={<ProfilePage />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/products/all" element={<AllProducts />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/cart/checkout" element={<CheckoutPage />} />
        <Route path="/cart/checkout/success" element={<PaymentSuccessPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        <Route path="/staff" element={<StaffPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersRolesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
        </Route>

        {/* Public routes (chưa đăng nhập) */}
        {/* <Route element={<PublicRoute />}> */}
        {/* <Route path="/" element={<Homepage />} /> */}
        {/* <Route path="/auth/login" element={<LoginPage />} /> */}
        {/* <Route path="/auth/register" element={<RegisterPage />} /> */}
        {/* </Route> */}

        {/* Protected routes (đã đăng nhập) */}
        {/* <Route element={<PrivateRoute />}> */}
        {/* Bạn có thể thêm các route bảo vệ khác ở đây */}
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
