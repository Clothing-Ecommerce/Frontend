import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng về "/"
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnlyRoute;
