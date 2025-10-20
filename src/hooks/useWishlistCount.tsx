import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "@/utils/axios";

export type WishlistCountResponse = { count: number };

export type WishlistCountContextValue = {
  count: number;
  setWishlistCount: (count: number) => void;
  refreshWishlistCount: () => Promise<void>;
};

export type WishlistCountProviderProps = {
  initialCount?: number;
  children: ReactNode;
};

const WishlistCountContext = createContext<WishlistCountContextValue | undefined>(undefined);

export function WishlistCountProvider({ initialCount = 0, children }: WishlistCountProviderProps) {
  const [count, setCount] = useState(initialCount);

  const setWishlistCount = useCallback((nextCount: number) => {
    setCount(Math.max(0, nextCount));
  }, []);

  const refreshWishlistCount = useCallback(async () => {
    try {
      const res = await api.get<WishlistCountResponse>("/wishlist/count");
      setWishlistCount(res.data.count ?? 0);
    } catch (error) {
      console.error("Failed to fetch wishlist count", error);
      setWishlistCount(0);
    }
  }, [setWishlistCount]);

  useEffect(() => {
    void refreshWishlistCount();
  }, [refreshWishlistCount]);

  const value = useMemo(
    () => ({
      count,
      setWishlistCount,
      refreshWishlistCount,
    }),
    [count, refreshWishlistCount, setWishlistCount]
  );

  return <WishlistCountContext.Provider value={value}>{children}</WishlistCountContext.Provider>;
}

export function useWishlistCount() {
  const context = useContext(WishlistCountContext);
  if (!context) {
    throw new Error("useWishlistCount must be used within a WishlistCountProvider");
  }
  return context;
}