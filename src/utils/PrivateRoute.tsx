import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
  allowedRoles?: string[]; // Ví dụ: ['ADMIN', 'STAFF']
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // 1. Chưa đăng nhập -> Chuyển về trang Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 2. Đã đăng nhập nhưng KHÔNG CÓ QUYỀN (Role không nằm trong danh sách cho phép)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Điều hướng thông minh dựa trên Role thực tế
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === "STAFF") {
      return <Navigate to="/staff/dashboard" replace />;
    }
    // Mặc định (Customer) về trang chủ
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho phép truy cập
  return <Outlet />;
};

export default PrivateRoute;