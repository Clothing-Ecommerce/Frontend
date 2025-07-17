import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// import PrivateRoute from "./utils/PrivateRoute";
// import PublicRoute from "./utils/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

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
