import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Dùng để chặn truy cập nếu chưa đăng nhập (tức là không có token)
const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default PrivateRoute;
