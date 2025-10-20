import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CartCountProvider } from "./hooks/useCartCount";
import { WishlistCountProvider } from "./hooks/useWishlistCount";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WishlistCountProvider>
      <CartCountProvider>
        <App />
      </CartCountProvider>
    </WishlistCountProvider>
  </StrictMode>
);
