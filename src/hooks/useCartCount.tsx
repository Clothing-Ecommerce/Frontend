import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "@/utils/axios";

type CartCountResponse = { itemCount: number; quantity: number };

type CartCountContextValue = {
  quantity: number;
  setCartQuantity: (quantity: number) => void;
  refreshCartCount: () => Promise<void>;
};

type CartCountProviderProps = {
  initialQuantity?: number;
  children: ReactNode;
};

const CartCountContext = createContext<CartCountContextValue | undefined>(undefined);

export function CartCountProvider({ initialQuantity = 0, children }: CartCountProviderProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const setCartQuantity = useCallback((nextQuantity: number) => {
    setQuantity(Math.max(0, nextQuantity));
  }, []);

  const refreshCartCount = useCallback(async () => {
    try {
      const res = await api.get<CartCountResponse>("/cart/count");
      setCartQuantity(res.data.quantity);
    } catch (error) {
      console.error("Failed to fetch cart count", error);
      setCartQuantity(0);
    }
  }, [setCartQuantity]);

  useEffect(() => {
    void refreshCartCount();
  }, [refreshCartCount]);

  const value = useMemo(
    () => ({
      quantity,
      setCartQuantity,
      refreshCartCount,
    }),
    [quantity, refreshCartCount, setCartQuantity]
  );

  return <CartCountContext.Provider value={value}>{children}</CartCountContext.Provider>;
}

export function useCartCount() {
  const context = useContext(CartCountContext);
  if (!context) {
    throw new Error("useCartCount must be used within a CartCountProvider");
  }
  return context;
}