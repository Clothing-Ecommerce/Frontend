import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CartCountProvider } from "./hooks/useCartCount";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartCountProvider>
      <App />
    </CartCountProvider>
  </StrictMode>
);
