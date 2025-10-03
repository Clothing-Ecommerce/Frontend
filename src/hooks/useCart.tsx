// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useEffect, useState } from "react";
// import type { ReactNode } from "react";
// import api from "@/utils/axios";

// interface CartItem {
//   id: number | string;
//   quantity: number;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key: string]: any;
// }

// interface CartContextType {
//   cartItems: CartItem[];
//   cartCount: number;
//   fetchCart: () => Promise<void>;
//   addToCart: (item: CartItem) => void;
//   updateCart: (item: CartItem) => void;
//   removeFromCart: (id: number | string) => void;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   const fetchCart = async () => {
//     try {
//       const { data } = await api.get<CartItem[]>("/cart");
//       setCartItems(data);
//     } catch (error) {
//       console.error("Failed to fetch cart", error);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const addToCart = (item: CartItem) => {
//     setCartItems((prev) => [...prev, item]);
//   };

//   const updateCart = (item: CartItem) => {
//     setCartItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
//   };

//   const removeFromCart = (id: number | string) => {
//     setCartItems((prev) => prev.filter((i) => i.id !== id));
//   };

//   const cartCount = cartItems.reduce(
//     (total, item) => total + (item.quantity || 0),
//     0
//   );

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         cartCount,
//         fetchCart,
//         addToCart,
//         updateCart,
//         removeFromCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// }
