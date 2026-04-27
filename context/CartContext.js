"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case "ADD_ITEM":
      newState = { ...state, items: [...state.items, action.payload] };
      break;
    case "REMOVE_ITEM":
      newState = {
        ...state,
        items: state.items.filter((item) => item.cartItemId !== action.payload),
      };
      break;
    case "UPDATE_QUANTITY":
      newState = {
        ...state,
        items: state.items.map((item) => {
          if (item.cartItemId === action.payload.cartItemId) {
            const newQuantity = action.payload.quantity;
            const unitPrice = item.basePrice + item.selectedOptions.reduce((acc, opt) => acc + opt.priceModifier, 0);
            return {
              ...item,
              quantity: newQuantity,
              itemSubtotal: unitPrice * newQuantity
            };
          }
          return item;
        }),
      };
      break;
    case "CLEAR_CART":
      newState = { items: [] };
      break;
    case "INIT_CART":
      newState = action.payload;
      break;
    default:
      return state;
  }

  // Save to cookie on every state change except INIT_CART to avoid unnecessary writes
  if (action.type !== "INIT_CART") {
    if (typeof document !== 'undefined') {
      document.cookie = `cart=${encodeURIComponent(JSON.stringify(newState))}; path=/; max-age=604800`; // 7 days
    }
  }
  return newState;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    // Read cart cookie on mount
    const fetchCart = () => {
      const match = document.cookie.match(new RegExp('(^| )cart=([^;]+)'));
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[2]));
          dispatch({ type: "INIT_CART", payload: parsed });
        } catch (e) {
          console.error("Cart parsing error", e);
        }
      }
    };
    fetchCart();
  }, []);

  const addItem = (item) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (cartItemId) => dispatch({ type: "REMOVE_ITEM", payload: cartItemId });
  const updateQuantity = (cartItemId, quantity) => dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
  const getTotal = () => state.items.reduce((acc, item) => acc + item.itemSubtotal, 0);

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, itemCount, getTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
