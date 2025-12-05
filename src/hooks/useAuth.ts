import { useMemo } from "react";

// Định nghĩa Interface cho User trong localStorage
// Đảm bảo khi Login, backend trả về JSON có chứa field "role"
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER"; // Khớp với Enum của Prisma/Backend
  avatar?: string | null;
}

export const useAuth = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  const user = useMemo<AuthUser | null>(() => {
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }, [userData]);

  const isAuthenticated = !!token;

  // Giả lập isLoading = false vì đang đọc từ localStorage (đồng bộ).
  // Nếu sau này bạn gọi API /auth/me để lấy user, biến này sẽ hữu dụng.
  const isLoading = false;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Hard reload để clear toàn bộ state của ứng dụng
    window.location.href = "/auth/login"; 
  };

  return { token, user, isAuthenticated, isLoading, logout };
};