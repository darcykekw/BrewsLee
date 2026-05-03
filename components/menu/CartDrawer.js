"use client";

import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import GradientButton from "@/components/ui/GradientButton";

export default function CartDrawer({ isOpen, onClose }) {
  const { state, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();

  if (!isOpen) return null;

  const total = getTotal();

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-left">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-cream-light">
          <h2 className="text-2xl font-bold text-brown-dark tracking-wider flex items-center gap-3">
             <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
             Your Cart
          </h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:text-brown border border-gray-200 transition shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 custom-scrollbar">
          {state.items.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
               <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
               <p className="text-xl text-gray-500 font-medium">Your cart is empty.</p>
               <button onClick={onClose} className="text-brown font-bold hover:underline">Explore Menu &rarr;</button>
             </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.cartItemId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">Coffee</div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                      <button onClick={() => removeItem(item.cartItemId)} className="text-red-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3 space-y-0.5 max-h-16 overflow-y-auto pr-1 select-none">
                      {item.selectedOptions.map((opt, idx) => (
                        <p key={idx} className="flex justify-between">
                          <span>• {opt.label}</span>
                          {opt.priceModifier > 0 && <span className="text-gold font-semibold text-[10px]">+₱{opt.priceModifier}</span>}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                      <div className="flex items-center bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 font-bold transition"
                        >-</button>
                        <span className="px-3 py-1 font-bold text-sm bg-white min-w-[2rem] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 font-bold transition"
                        >+</button>
                      </div>
                      <span className="font-bold text-brown-dark tracking-wide">
                        ₱{item.itemSubtotal}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-lg mb-6">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-bold text-2xl text-brown-dark">₱{total}</span>
            </div>
            
            {session ? (
              <div className="w-full">
                <GradientButton 
                  onClick={() => {
                    onClose();
                    router.push("/checkout");
                  }}
                  variant="primary"
                  fullWidth={true}
                >
                  <span className="flex items-center justify-center gap-3 w-full">
                    Checkout
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                </GradientButton>
              </div>
            ) : (
              <div className="w-full">
                <GradientButton 
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                  variant="ghost"
                  fullWidth={true}
                >
                  <span className="flex items-center justify-center gap-3 w-full">
                    Sign in to Order
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  </span>
                </GradientButton>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}