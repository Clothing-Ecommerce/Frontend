import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/user/ProfilePage";
import AllProducts from "./pages/product/ProductsPage";
import ProductDetailPage from "./pages/product/ProductDetailsPage";

// import PrivateRoute from "./utils/PrivateRoute";
// import PublicRoute from "./utils/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/user/profile" element={<ProfilePage />}></Route>
        <Route path="/products/all" element={<AllProducts />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

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
