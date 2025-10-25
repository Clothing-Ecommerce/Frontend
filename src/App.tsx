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

// import StaffPage from "./pages/staff/StaffPage";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboardPage from "./pages/staff/DashboardPage";
import StaffOrdersPage from "./pages/staff/OrdersPage";
import StaffInventoryPage from "./pages/staff/InventoryPage";
import StaffProductsPage from "./pages/staff/ProductsPage";
import StaffCustomersPage from "./pages/staff/CustomersPage";
import StaffSupportPage from "./pages/staff/SupportPage";
import StaffReportsPage from "./pages/staff/ReportsPage";
import StaffProfilePage from "./pages/staff/ProfilePage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminCategoriesPage from "./pages/admin/CategoriesPage";
import AdminInventoryPage from "./pages/admin/InventoryPage";
import AdminCustomersPage from "./pages/admin/CustomersPage";
import AdminReportsPage from "./pages/admin/ReportsPage";
import AdminUsersRolesPage from "./pages/admin/UsersRolesPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AdminSupportPage from "./pages/admin/SupportPage";
import AdminMarketingPage from "./pages/admin/MarketingPage";
import AdminAuditLogsPage from "./pages/admin/AuditLogsPage";

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

        {/* <Route path="/staff" element={<StaffPage />} /> */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboardPage />} />
          <Route path="orders" element={<StaffOrdersPage />} />
          <Route path="inventory" element={<StaffInventoryPage />} />
          <Route path="products" element={<StaffProductsPage />} />
          <Route path="customers" element={<StaffCustomersPage />} />
          <Route path="support" element={<StaffSupportPage />} />
          <Route path="reports" element={<StaffReportsPage />} />
          <Route path="profile" element={<StaffProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="users" element={<AdminUsersRolesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="marketing" element={<AdminMarketingPage />} />
          <Route path="audit" element={<AdminAuditLogsPage />} />
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
