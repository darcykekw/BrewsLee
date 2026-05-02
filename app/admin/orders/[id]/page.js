"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminOrderDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeRiders, setActiveRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const res = await fetch("/api/admin/riders");
      if (res.ok) {
        const data = await res.json();
        setActiveRiders(data.filter(r => r.is_active));
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchOrder();
      await fetchRiders();
    };
    loadData();
  }, [id]);

  const handleAction = async (endpoint, method, body = null) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/orders/${id}/${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });

      if (res.ok) {
        await fetchOrder();
        if (endpoint === "assign-rider") {
          setSelectedRider("");
        }
        toast.success("Action successful!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Action failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !order) return <p className="text-center py-20 text-gray-600">Loading Order...</p>;
  if (!order) return <p className="text-center py-20 text-red-600">Order not found.</p>;

  const customerName = order.profiles?.name || "Guest";
  const customerEmail = order.profiles?.email || "No Email";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      <Link href="/admin/orders" className="text-brown-600 hover:text-brown-800 underline mb-4 inline-block font-semibold">
        &larr; Back to Orders
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden mb-6">
        <div className="bg-brown-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="font-mono text-sm opacity-80 mt-1">{order.id}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span className="px-3 py-1 bg-white text-brown-900 font-bold rounded-full text-sm uppercase tracking-wide inline-block">
              {order.status.replace(/_/g, " ")}
            </span>
            <p className="text-sm mt-2 opacity-90">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Customer Info</h2>
            <p className="text-gray-700"><strong>Name:</strong> {customerName}</p>
            <p className="text-gray-700"><strong>Email:</strong> {customerEmail}</p>
            {order.delivery_method === "delivery" && order.address_snapshot && (
              <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-700">
                <p><strong>Delivery Address:</strong></p>
                <p>{order.address_snapshot.full_address}</p>
                {order.address_snapshot.notes && <p className="mt-1"><em>Note: {order.address_snapshot.notes}</em></p>}
              </div>
            )}
            <p className="text-gray-700 mt-2"><strong>Method:</strong> <span className="capitalize">{order.delivery_method}</span></p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Order Items</h2>
            <ul className="space-y-4">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-bold text-gray-800">{item.quantity}x {item.name}</p>
                    {item.selected_options && Object.entries(item.selected_options).map(([key, val]) => (
                      <p key={key} className="text-xs text-gray-500 ml-4">- {key}: {val}</p>
                    ))}
                  </div>
                  <p className="font-bold text-gray-700">₱{(item.unit_price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-lg font-bold text-brown-900">
              <span>Total</span>
              <span>₱{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Admin Actions</h2>
          <div className="space-y-3">
            {order.status === "pending" && (
              <button
                onClick={() => handleAction("confirm", "PATCH")}
                disabled={actionLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition disabled:opacity-50"
              >
                Confirm Order (Set Preparing)
              </button>
            )}

            {order.status === "preparing" && order.delivery_method === "delivery" && (
              <div className="border border-orange-200 p-4 rounded-lg bg-orange-50">
                <label className="block text-sm font-bold text-gray-700 mb-2">Assign Rider</label>
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full border rounded p-2 mb-3 bg-white"
                >
                  <option value="">-- Select a Rider --</option>
                  {activeRiders.map(r => (
                    <option key={r.id} value={r.id}>{r.profiles?.name || "Unnamed Rider"} (ID: {r.id.slice(0,6)})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAction("assign-rider", "POST", { riderId: selectedRider })}
                  disabled={!selectedRider || actionLoading}
                  className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded font-semibold transition disabled:opacity-50"
                >
                  Assign Rider
                </button>
              </div>
            )}

            {order.status === "preparing" && order.delivery_method === "pickup" && (
              <button
                onClick={() => handleAction("status", "PATCH", { status: "ready" })}
                disabled={actionLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition disabled:opacity-50"
              >
                Mark as Ready for Pickup
              </button>
            )}

            {(order.status === "ready" || order.status === "out_for_delivery") && (
              <button
                onClick={() => handleAction("status", "PATCH", { status: "completed" })}
                disabled={actionLoading}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition disabled:opacity-50"
              >
                Mark as Completed
              </button>
            )}

            {!["completed", "cancelled"].includes(order.status) && (
             <button
               onClick={() => {
                 if (confirm("Are you sure you want to cancel this order?")) {
                   handleAction("cancel", "PATCH");
                 }
               }}
               disabled={actionLoading}
               className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold transition mt-4 disabled:opacity-50"
             >
               Cancel Order
             </button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Status Logs</h2>
          <ul className="space-y-4">
            {order.logs.map(log => (
              <li key={log.id} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-bold text-gray-800 uppercase block">{log.status.replace(/_/g, " ")}</span>
                  <span className="text-gray-500 italic">by {log.changed_by}</span>
                </div>
                <span className="text-gray-400 text-xs text-right mt-1 w-24">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </li>
            ))}
            {order.logs.length === 0 && <p className="text-gray-500">No logs found.</p>}
          </ul>

          {order.rider && order.rider.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-bold text-gray-800 mb-2">Assigned Rider</h3>
              <p className="text-sm text-gray-700"><strong>Name:</strong> {order.rider[0]?.riders?.profiles?.name || "Unknown"}</p>
              <p className="text-sm text-gray-700"><strong>Contact:</strong> {order.rider[0]?.riders?.contact_number || "N/A"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
