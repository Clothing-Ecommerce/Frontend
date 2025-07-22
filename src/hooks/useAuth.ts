import { useMemo } from "react";

export const useAuth = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  const user = useMemo(() => {
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }, [userData]);

  const isAuthenticated = !!token;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // sử dụng tạm
    window.location.href = "/"; // hoặc dùng useNavigate()

    // kiểm tra lại
    // const navigate = useNavigate();
    // logout = () => {
    //   localStorage.clear();
    //   navigate("/auth/login");
    // };
  };

  return { token, user, isAuthenticated, logout };
};
