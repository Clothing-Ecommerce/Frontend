import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Nếu đã đăng nhập, không cho vào trang Public (Login/Register) nữa
  if (isAuthenticated && user) {
    // Điều hướng về dashboard tương ứng
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/reports" replace />;
    }
    if (user.role === "STAFF") {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;