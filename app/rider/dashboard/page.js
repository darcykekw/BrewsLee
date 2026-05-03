"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import GradientButton from "@/components/ui/GradientButton";

export default function RiderDashboard() {
  const { data: session } = useSession();
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (currentPage = 1) => {
    try {
      const res = await fetch(`/api/rider/orders?page=${currentPage}`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrders(data.active || []);
        
        if (currentPage === 1) {
          setCompletedOrders(data.completed || []);
        } else {
          setCompletedOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newOrders = (data.completed || []).filter((o) => !existingIds.has(o.id));
            return [...prev, ...newOrders];
          });
        }
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Initial fetch avoiding synchronous setState in effect
    setTimeout(() => {
      if (mounted) fetchOrders(1);
    }, 0);

    const interval = setInterval(() => {
      if (mounted && tab === "active") fetchOrders(1);
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tab]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === "preparing" ? "out_for_delivery" : "delivered";
    
    const message = currentStatus === "preparing" 
      ? `Confirm you have picked up Order #${orderId.substring(0, 8).toUpperCase()}?`
      : `Confirm Order #${orderId.substring(0, 8).toUpperCase()} has been delivered?`;

    if (!confirm(message)) return;

    try {
      const res = await fetch("/api/rider/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus })
      });

      if (res.ok) {
        toast.success("Order status updated!");
        // Refresh orders
        fetchOrders(1);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  if (loading && activeOrders.length === 0) {
    return <div className="text-center p-10 text-gray-500 font-bold text-lg mt-10">Loading your deliveries...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24">
      {/* Mobile-Friendly Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 sticky z-10" style={{ top: "80px" }}>
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-3 text-center rounded-lg font-bold transition-all ${
            tab === "active" 
            ? "bg-brown-900 text-white shadow" 
            : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 py-3 text-center rounded-lg font-bold transition-all ${
            tab === "completed" 
            ? "bg-brown-900 text-white shadow" 
            : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Completed
        </button>
      </div>

      {tab === "active" && (
        <div className="space-y-6">
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <span className="text-6xl block mb-4">☕</span>
              <p className="text-gray-600 font-medium text-lg">No active deliveries right now.<br/>New orders will appear here automatically.</p>
            </div>
          ) : (
            activeOrders.map((order) => (
              <div key={order.id} className={`bg-white rounded-2xl shadow-lg border-l-8 overflow-hidden ${order.status === "preparing" ? "border-l-blue-500" : "border-l-orange-500"}`}>
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">ORD-{order.id.substring(0, 8).toUpperCase()}</h2>
                    <p className="text-sm text-gray-500 mt-1 font-semibold">Assigned {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                    order.status === "preparing" ? "bg-blue-100 text-blue-900" : "bg-orange-100 text-orange-900"
                  }`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                       {order.customer_name} 
                    </p>
                    <p className="text-gray-700 font-semibold">{order.contact_number}</p>
                  </div>

                  {order.address_snapshot && (
                    <div className="mb-6 bg-brown-50 p-4 rounded-xl border border-brown-100">
                      <p className="text-xs text-brown-600 font-black uppercase tracking-widest mb-1">Delivery Address</p>
                      <p className="text-2xl font-black text-gray-900 leading-tight">
                        {order.address_snapshot.full_address}
                      </p>
                      {order.address_snapshot.notes && (
                        <p className="text-sm text-brown-800 mt-3 font-semibold bg-white p-2 rounded border border-brown-200">
                          <span className="text-brown-500 mr-2 uppercase text-xs">Note:</span>
                          {order.address_snapshot.notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-3">Order Items</p>
                    <ul className="space-y-3">
                      {order.items.map((item) => (
                        <li key={item.id} className="text-gray-900 font-bold text-lg flex items-start gap-2">
                          <span className="text-brown-600 bg-brown-100 px-2 py-0.5 rounded text-sm">{item.quantity}x</span>
                          <div>
                            {item.name}
                            {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                              <p className="text-gray-500 font-medium text-sm mt-0.5">
                                ({Object.values(item.selected_options).join(", ")})
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-end mb-6 pb-2">
                    <span className="text-gray-500 font-black uppercase tracking-widest">Collect / Total</span>
                    <span className="text-4xl font-black text-green-700">₱{order.total.toFixed(2)}</span>
                  </div>

                  {/* Actions */}
                  {order.status === "preparing" && (
                    <GradientButton
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      variant="primary"
                      fullWidth={true}
                      className="py-5 text-xl font-black"
                    >
                      I Have The Order &mdash; Mark as Picked Up
                    </GradientButton>
                  )}
                  {order.status === "out_for_delivery" && (
                    <GradientButton
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      variant="primary"
                      fullWidth={true}
                      className="py-5 text-xl font-black"
                    >
                      Order Delivered &mdash; Mark as Completed
                    </GradientButton>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "completed" && (
        <div className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <p className="text-gray-500 font-medium text-lg">No completed deliveries yet.</p>
            </div>
          ) : (
            <>
              {completedOrders.map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:shadow-md transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 tracking-tight">ORD-{order.id.substring(0, 8).toUpperCase()}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">{order.status.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">{order.customer_name} &bull; {order.items.length} items</p>
                    <p className="text-xs font-medium text-gray-500 leading-tight">
                      {order.address_snapshot?.full_address?.substring(0, 50)}...
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="font-black text-green-700 text-lg">₱{order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {page < totalPages && (
                <div className="mt-2">
                  <GradientButton
                    onClick={() => {
                      setPage((p) => p + 1);
                      fetchOrders(page + 1);
                    }}
                    variant="secondary"
                    fullWidth={true}
                    className="py-4 font-black"
                  >
                    Load More History
                  </GradientButton>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
