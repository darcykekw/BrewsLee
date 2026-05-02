"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </CartProvider>
    </SessionProvider>
  );
}
