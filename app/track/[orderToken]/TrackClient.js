"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { writeCart } from "../../../lib/cartUtils";
import { useCart } from "../../../context/CartContext";
import Toast from "../../../components/ui/Toast";
import GradientButton from "@/components/ui/GradientButton";

const deliverySteps = ["pending", "preparing", "out_for_delivery", "completed"];
const deliveryLabels = ["Order Placed", "Preparing Your Order", "Out for Delivery", "Delivered"];

const pickupSteps = ["pending", "preparing", "ready", "completed"];
const pickupLabels = ["Order Placed", "Preparing Your Order", "Ready for Pickup", "Picked Up"];

export default function TrackClient({ initialOrder, token }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { setCart } = useCart();
  const [order, setOrder] = useState(initialOrder);
  const [statusLogs, setStatusLogs] = useState(initialOrder.logs || []);
  const [rider, setRider] = useState(initialOrder.riderAssignment || null);
  const [isReordering, setIsReordering] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const steps = order.delivery_method === "pickup" ? pickupSteps : deliverySteps;
  const labels = order.delivery_method === "pickup" ? pickupLabels : deliveryLabels;

  // Polling Effect
  useEffect(() => {
    let mounted = true;
    if (order.status === "completed" || order.status === "cancelled" || order.status === "delivered" || order.status === "picked_up") return; // No need to poll

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${token}/status`);
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;

          setOrder(prev => ({ ...prev, status: data.status }));
          setStatusLogs(data.statusLogs || []);
          if (data.riderAssignment && !rider) {
            setRider(data.riderAssignment);
          }
        }
      } catch (err) {
        console.error("Tracking poll failed:", err);
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [order.status, token, rider]);

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      const res = await fetch(`/api/orders/reorder/${token}`, { method: "POST" });
      if (!res.ok) throw new Error("Reorder failed");
      const { availableItems, unavailableItems } = await res.json();

      if (availableItems.length === 0) {
        setToastMessage("Sorry, none of these items are currently available for order.");
        return;
      }

      // Write to cookie directly via util
      writeCart(availableItems);
      setCart(availableItems);

      if (unavailableItems.length > 0) {
        alert(`Some items were no longer available: ${unavailableItems.join(", ")}`);
      }
      
      router.push("/checkout");
    } catch (err) {
      console.error(err);
      setToastMessage("Error processing reorder.");
    } finally {
      setIsReordering(false);
    }
  };

  const currentStepIndex = steps.indexOf(order.status === "delivered" ? "completed" : order.status === "picked_up" ? "completed" : order.status);
  const isCompletedType = order.status === "completed" || order.status === "delivered" || order.status === "picked_up";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-brown-900 text-cream p-4 shadow-md sticky top-0 z-30 flex justify-center items-center">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-wider text-gold hover:text-orange-200 transition">
            BREWS LEE
          </h1>
        </Link>
      </nav>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}

      <main className="flex-grow max-w-lg w-full mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">ORD-{order.id.slice(0, 8).toUpperCase()}</h2>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
            {new Date(order.created_at).toLocaleString()}
          </p>
          <div className="mt-4">
            <span className="bg-gray-200 text-gray-800 px-3 py-1 font-bold text-sm uppercase rounded-full">
              {order.delivery_method}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-black text-xl text-brown-900 mb-6">Tracking Status</h3>
          {isCancelled ? (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
              <span className="text-red-700 font-bold block mb-1">Order Cancelled</span>
              <p className="text-sm text-red-600">Your order has been cancelled.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 py-2">
              {steps.map((step, idx) => {
                // Determine step state
                const isCompleted = isCompletedType || idx < currentStepIndex;
                const isCurrent = !isCompletedType && idx === currentStepIndex;
                const isFuture = !isCompletedType && idx > currentStepIndex;

                let iconColor = "bg-gray-200";
                let textColor = "text-gray-400 font-normal";
                let pulseHtml = null;

                if (isCompleted) {
                  iconColor = "bg-gold border-2 border-white shadow-sm";
                  textColor = "text-gray-900 font-bold";
                } else if (isCurrent) {
                  iconColor = "bg-orange-400 border-2 border-white relative z-10";
                  textColor = "text-brown-700 font-black";
                  pulseHtml = <span className="absolute -inset-1 rounded-full bg-orange-400 animate-ping opacity-75 backdrop-blur-md z-0" />;
                }

                // Match step to log to get timestamp if any
                const log = statusLogs.find(l => l.status === step || (step === "completed" && (l.status === "delivered" || l.status === "picked_up" || l.status === "completed")));
                
                return (
                  <div key={step} className="relative flex items-center pl-6">
                    <div className="absolute -left-[5px] w-full flex items-center justify-start">
                      <div className={`w-[11px] h-[11px] rounded-full ${iconColor} flex items-center justify-center`}>
                        {pulseHtml}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className={textColor}>{labels[idx]}</span>
                      {isCompleted && log ? (
                        <span className="text-xs text-gray-500 font-semibold">{new Date(log.created_at).toLocaleTimeString()}</span>
                      ) : isCurrent ? (
                        <span className="text-xs text-orange-600 font-bold italic animate-pulse">In progress...</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Estimated Time Box */}
        {!isCompletedType && !isCancelled && (
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 mb-6 text-center shadow-inner">
             <span className="font-bold text-brown-900 uppercase text-xs tracking-widest block mb-1">Estimated {order.delivery_method === "pickup" ? "Ready" : "Delivery"} Time</span>
             <p className="text-brown-800 font-semibold italic text-sm">
                {order.delivery_method === "delivery" 
                  ? "30-45 minutes from confirmation" 
                  : "approx 15-20 minutes"}
             </p>
          </div>
        )}

        {/* Rider Assignment (Fade in transition handled by pure tailwind on mount) */}
        {order.delivery_method === "delivery" && rider && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-5 mb-6 flex items-center justify-between animate-fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gold shadow-sm shrink-0">
                 {rider.photoUrl ? (
                   <img src={rider.photoUrl} className="object-cover w-full h-full" alt={rider.name} />
                 ) : (
                   <div className="w-full h-full bg-orange-100 flex items-center justify-center text-brown-600 font-bold text-xl">
                      {rider.name.charAt(0).toUpperCase()}
                   </div>
                 )}
              </div>
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-black uppercase tracking-widest">Your Rider</span>
                <span className="text-lg font-black text-gray-900 leading-tight">{rider.name}</span>
                <span className="text-sm font-bold text-orange-600 flex items-center gap-1 mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  {rider.contact}
                </span>
              </div>
            </div>
            <a 
              href={`tel:${rider.contact}`} 
              className="bg-orange-100 hover:bg-orange-200 text-brown-800 p-3 rounded-full transition-colors flex shrink-0 border border-orange-200"
              aria-label="Call Rider"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </a>
          </div>
        )}

        {/* Order Specs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
           <div className="bg-brown-50 px-5 py-4 border-b border-gray-100">
              <h3 className="font-black text-brown-900">Order Summary</h3>
           </div>
           <div className="p-5 space-y-4">
              <ul className="space-y-4 mb-4">
                {order.items.map(item => (
                  <li key={item.id} className="flex gap-4">
                     <div className="w-14 h-14 relative bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                        {item.image_url ? (
                          <Image src={item.image_url} fill className="object-cover" alt={item.name} unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                           <span className="font-bold text-gray-900 leading-none">{item.quantity}x {item.name}</span>
                           <span className="font-black text-gray-800 ml-2">₱{(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.selected_options && Object.entries(item.selected_options).map(([k, v]) => (
                           <span key={k} className="text-xs text-gray-500 font-medium leading-tight mt-0.5 text-left block">{v}</span>
                        ))}
                     </div>
                  </li>
                ))}
              </ul>
              {order.delivery_method === "delivery" && order.delivery_fee && (
                <div className="pt-2 flex justify-between items-center text-sm font-semibold text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₱{order.delivery_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-black text-gray-700 uppercase tracking-widest text-xs">Total</span>
                <span className="text-2xl font-black text-green-700">₱{order.total.toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
           <div className="p-5">
             <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1 block">Customer Details</span>
             <p className="font-bold text-gray-800 mb-4">{order.customer_name} ({order.contact_number})</p>

             <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1 block">
                {order.delivery_method === "pickup" ? "Pickup Location" : "Deliver To"}
             </span>
             <p className="font-bold text-gray-800 leading-tight bg-gray-50 p-3 rounded-lg border border-gray-200">
                {order.delivery_method === "pickup" 
                  ? "Self-Pickup at BrewsLee Store, 123 Coffee St." 
                  : order.address_snapshot?.full_address || "No address provided"}
             </p>

             {order.address_snapshot?.notes && order.delivery_method === "delivery" && (
                <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                   <p className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-1">Rider Notes</p>
                   <p className="text-sm font-semibold text-yellow-900 italic">{order.address_snapshot.notes}</p>
                </div>
             )}
             
             {order.notes && (
                <div className="mt-4 bg-orange-50 p-3 rounded-lg border border-orange-200">
                   <p className="text-xs font-black text-orange-800 uppercase tracking-widest mb-1">Kitchen Notes</p>
                   <p className="text-sm font-semibold text-orange-900 italic">{order.notes}</p>
                </div>
             )}
           </div>
        </div>

        {/* Reorder Button */}
        {(isCompletedType || isCancelled) && (
          <>
            {session ? (
              <div className="w-full">
                <GradientButton
                  onClick={handleReorder}
                  disabled={isReordering}
                  variant="primary"
                  fullWidth={true}
                  className="py-4 font-black text-lg uppercase tracking-widest"
                >
                  {isReordering ? (
                    <span className="animate-pulse">Loading menu items...</span>
                  ) : "Order Again"}
                </GradientButton>
              </div>
            ) : (
              <div className="w-full">
                <GradientButton
                  href="/login"
                  variant="ghost"
                  fullWidth={true}
                  className="py-4 font-black text-lg uppercase tracking-widest"
                >
                  Sign in to reorder
                </GradientButton>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
