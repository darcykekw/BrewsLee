"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../menu/CartDrawer";

export default function Navbar() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="bg-brown-dark text-cream p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-30">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-wider text-gold">TAP N' BREW</h1>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/profile" className="hover:text-gold transition font-medium">Profile</Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1 hover:text-gold transition font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}