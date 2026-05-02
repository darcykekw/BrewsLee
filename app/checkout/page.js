"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { state, getTotal, clearCart } = useCart();
  const cartItems = state.items;

  // Checkout State
  const [step, setStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // 'delivery' | 'pickup'
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    fullAddress: "",
    floorUnit: "",
    landmark: "",
    saveAddress: false,
    label: "Home"
  });
  const [orderNotes, setOrderNotes] = useState("");
  
  // Data State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(50); // Mapped from DB ideally
  const [shopAddress, setShopAddress] = useState("123 Coffee St. Cityville");
  const [pickupTime, setPickupTime] = useState("15-20 Mins");
  const [isPlacing, setIsPlacing] = useState(false);

  const grandTotal = getTotal() + (deliveryMethod === "pickup" ? 0 : deliveryFee);
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    // Basic protection against empty carts manually loading checkout
    if (cartItems.length === 0 && step > 1) {
      setTimeout(() => setStep(1), 0);
    }
  }, [cartItems.length, step]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    let mounted = true;
    if (isLoggedIn) {
      fetch("/api/profile/addresses")
        .then(res => res.json())
        .then(data => {
          if (!mounted) return;
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            setSelectedAddressId(data.addresses[0].id);
            setShowManualAddress(false);
          } else {
            setShowManualAddress(true);
          }
        })
        .catch(console.error);
    } else {
      setTimeout(() => setShowManualAddress(true), 0);
    }
    return () => { mounted = false; };
  }, [isLoggedIn]);

  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    setIsPlacing(true);

    try {
      const payload = {
        cartItems,
        deliveryMethod,
        addressData: showManualAddress ? addressData : null,
        selectedAddressId: !showManualAddress ? selectedAddressId : null,
        orderNotes,
        deliveryFee
      };

      const res = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      
      router.push(`/track/${data.orderToken || ""}`);
    } catch (err) {
      alert("Error: " + err.message);
      setIsPlacing(false);
    }
  };

  const validateStep2 = () => {
    if (deliveryMethod === "pickup") return true;
    if (!showManualAddress && selectedAddressId) return true;
    if (showManualAddress && addressData.fullAddress.trim().length > 5) return true;
    alert("Please provide a valid full address.");
    return false;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
        <h2 className="text-2xl font-bold text-gray-600 mb-6">Your cart is empty</h2>
        <Button onClick={() => router.push("/menu")} className="px-8 text-lg py-3">Browse Menu</Button>
      </div>
    );
  }

  const steps = ["Order Summary", "Delivery Details", "Payment", "Review"];

  return (
    <main className="min-h-screen bg-cream pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Indicator */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          <div className="flex justify-between items-center min-w-[500px]">
            {steps.map((label, index) => {
              const stepNum = index + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={label} className="flex flex-col items-center flex-1 relative group">
                  {index !== 0 && (
                    <div className={`absolute top-4 left-[-50%] w-full h-[2px] ${isCompleted || isActive ? 'bg-gold' : 'bg-gray-200'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                    isActive ? 'bg-gold text-brown-dark shadow' : 
                    isCompleted ? 'bg-brown text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? "✓" : stepNum}
                  </div>
                  <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-brown' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-100">
          {/* STEP 1: ORDER SUMMARY */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-brown-dark mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 relative">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="w-16 h-16 bg-white rounded flex-shrink-0 overflow-hidden border border-gray-200">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.name} <span className="text-gray-500 font-normal">x{item.quantity}</span></h4>
                      <p className="text-xs text-gray-500 leading-snug max-w-[80%]">
                        {item.selectedOptions.map(o => o.label).join(", ")}
                      </p>
                    </div>
                    <div className="font-bold text-lg text-brown-dark">
                      ₱{item.itemSubtotal}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-lg font-medium text-gray-600 mb-2 px-2">
                <span>Subtotal</span>
                <span>₱{getTotal()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-medium text-gray-600 mb-6 px-2">
                <span>Delivery Est.</span>
                <span>₱{deliveryFee}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button variant="secondary" onClick={() => router.push("/menu?openCart=true")} className="flex-1 py-4 text-lg border-2 border-dashed">Edit Cart</Button>
                <Button onClick={() => setStep(2)} className="flex-1 py-4 text-lg">Continue to Delivery</Button>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY DETAILS */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-brown-dark mb-6">How would you like to get your order?</h2>
              
              <div className="flex gap-4 mb-8">
                <button onClick={() => setDeliveryMethod("delivery")} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${deliveryMethod === "delivery" ? 'border-gold bg-gold/10 text-brown-dark' : 'border-gray-200 text-gray-600 hover:border-cream-dark'}`}>
                  🚚 Delivery
                </button>
                <button onClick={() => setDeliveryMethod("pickup")} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${deliveryMethod === "pickup" ? 'border-gold bg-gold/10 text-brown-dark' : 'border-gray-200 text-gray-600 hover:border-cream-dark'}`}>
                   Self-Pickup
                </button>
              </div>

              {deliveryMethod === "delivery" && (
                <div className="space-y-6">
                  {isLoggedIn && savedAddresses.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Saved Addresses</h3>
                      <div className="space-y-3">
                        {savedAddresses.map(addr => (
                          <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${!showManualAddress && selectedAddressId === addr.id ? 'border-brown bg-brown/5' : 'border-gray-200'}`}>
                            <input type="radio" name="address" checked={!showManualAddress && selectedAddressId === addr.id} onChange={() => { setSelectedAddressId(addr.id); setShowManualAddress(false); }} className="mt-1 text-brown focus:ring-brown" />
                            <div>
                               <span className="inline-block px-2 text-xs font-bold text-brown bg-gold rounded uppercase mb-1">{addr.label}</span>
                               <p className="text-gray-800 font-medium">{addr.full_address}</p>
                               {addr.floor_unit && <p className="text-sm text-gray-500">{addr.floor_unit}</p>}
                            </div>
                          </label>
                        ))}
                        <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${showManualAddress ? 'border-brown bg-brown/5' : 'border-gray-200'}`}>
                          <input type="radio" name="address" checked={showManualAddress} onChange={() => setShowManualAddress(true)} className="text-brown focus:ring-brown" />
                          <span className="font-medium text-gray-700">Use a different address...</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {showManualAddress && (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Full Address *</label>
                         <textarea required rows="3" value={addressData.fullAddress} onChange={e => setAddressData({...addressData, fullAddress: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brown focus:ring-brown" placeholder="123 Coffee St..."></textarea>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Floor/Unit No.</label>
                            <input type="text" value={addressData.floorUnit} onChange={e => setAddressData({...addressData, floorUnit: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brown" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Landmark</label>
                            <input type="text" value={addressData.landmark} onChange={e => setAddressData({...addressData, landmark: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brown" />
                          </div>
                       </div>
                       
                       {isLoggedIn && (
                         <div className="pt-4 border-t border-gray-200 mt-4">
                           <label className="flex items-center gap-2 mb-3">
                             <input type="checkbox" checked={addressData.saveAddress} onChange={e => setAddressData({...addressData, saveAddress: e.target.checked})} className="text-brown focus:ring-brown rounded" />
                             <span className="font-medium text-gray-700 text-sm">Save this address to my profile</span>
                           </label>
                           {addressData.saveAddress && (
                             <div className="flex gap-2 items-center">
                               <span className="text-sm font-medium text-gray-600">Label:</span>
                               <select value={addressData.label} onChange={e => setAddressData({...addressData, label: e.target.value})} className="border-gray-300 rounded-lg shadow-sm focus:border-brown py-1.5 text-sm">
                                 <option value="Home">Home</option>
                                 <option value="Office">Office</option>
                                 <option value="Other">Other</option>
                               </select>
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              )}

              {deliveryMethod === "pickup" && (
                <div className="bg-cream-dark/30 p-6 rounded-xl border border-cream space-y-2 text-center py-10">
                   <h3 className="font-bold text-xl text-brown-dark mb-1">Pickup at {shopAddress}</h3>
                   <p className="text-gray-600">Your order will be ready in approximately <strong className="text-brown">{pickupTime}</strong>.</p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <Button variant="secondary" onClick={() => setStep(1)} className="py-4 px-8 text-lg border-2 border-dashed">Back</Button>
                <Button onClick={() => { if(validateStep2()) setStep(3); }} className="flex-1 py-4 text-lg">Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-brown-dark mb-6">Payment & Notes</h2>
              
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-6 flex items-center gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-900 leading-tight">Payment Method: {deliveryMethod === "delivery" ? "Cash on Delivery" : "Cash on Pickup"}</h3>
                  <p className="text-green-700 text-sm">Please prepare the exact amount of <strong>₱{grandTotal}</strong>.</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Order Notes (Optional)</label>
                <textarea 
                  rows="4" 
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="e.g. No ice please, extra hot, please call before arriving..." 
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-brown focus:ring-brown p-4"
                ></textarea>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="secondary" onClick={() => setStep(2)} className="py-4 px-8 text-lg border-2 border-dashed">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1 py-4 text-lg">Review Order</Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PLACE */}
          {step === 4 && (
            <div className="animate-fade-in relative">
              <h2 className="text-2xl font-bold text-brown-dark mb-6">Review & Place Order</h2>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Your Items</h3>
                  <ul className="space-y-3">
                    {cartItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{item.quantity}x {item.name}</span>
                        <span className="font-bold text-gray-900">₱{item.itemSubtotal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Fulfillment</h3>
                   <div className="flex items-start gap-2">
                     <span className="inline-block px-2 text-[10px] font-bold text-brown bg-gold rounded uppercase mt-0.5">{deliveryMethod}</span>
                     {deliveryMethod === "pickup" ? (
                       <span className="text-sm font-medium text-gray-700">Pickup at {shopAddress}</span>
                     ) : (
                       <span className="text-sm font-medium text-gray-700">
                         {showManualAddress ? addressData.fullAddress : (savedAddresses.find(a => a.id === selectedAddressId)?.full_address || "Custom Address")}
                       </span>
                     )}
                   </div>
                </div>

                {orderNotes && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Notes</h3>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100">{orderNotes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-lg font-medium text-gray-600 mb-2 px-2">
                <span>Subtotal</span>
                <span>₱{getTotal()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-6 px-2 border-b pb-6">
                <span>Delivery Fee</span>
                <span>{deliveryMethod === "delivery" ? `₱${deliveryFee}` : "Free"}</span>
              </div>
              
              <div className="flex justify-between items-end mb-8 px-2">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Grand Total</span>
                <span className="text-4xl font-black text-brown-dark">₱{grandTotal}</span>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(3)} className="py-4 px-8 text-lg border-2 border-dashed" disabled={isPlacing}>Back</Button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className={`flex-1 py-4 text-xl font-bold uppercase tracking-wider rounded-xl transition shadow-lg flex justify-center items-center gap-2 ${isPlacing ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gold hover:bg-yellow-500 text-brown-dark active:scale-95'}`}
                >
                  {isPlacing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : "Place Order"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}