"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TABS = ["All", "pending", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchOrders = async (currentTab, currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?status=${currentTab}&page=${currentPage}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error("Error fetching admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchOrders(selectedTab, page);
    }, 0);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders(selectedTab, page);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedTab, page]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brown-900">Order Management</h1>
        <div className="text-sm text-gray-500">
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setSelectedTab(tab); setPage(1); }}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors duration-200 ${
              selectedTab === tab
                ? "bg-brown-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "All" ? "All Orders" : tab.replace(/_/g, " ").toUpperCase()}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-center text-gray-600 py-10">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 py-10">No orders found for this status.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-left bg-white">
            <thead className="bg-brown-50 text-brown-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-sm">Order ID</th>
                <th className="py-3 px-4 font-semibold text-sm">Date</th>
                <th className="py-3 px-4 font-semibold text-sm">Customer</th>
                <th className="py-3 px-4 font-semibold text-sm">Items</th>
                <th className="py-3 px-4 font-semibold text-sm">Total</th>
                <th className="py-3 px-4 font-semibold text-sm">Method</th>
                <th className="py-3 px-4 font-semibold text-sm">Status</th>
                <th className="py-3 px-4 font-semibold text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-orange-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-gray-600">{order.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">{order.customer_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.item_count} items</td>
                  <td className="py-3 px-4 text-sm font-bold text-green-700">₱{order.total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{order.delivery_method}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md uppercase ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "preparing" ? "bg-blue-100 text-blue-800" :
                      order.status === "out_for_delivery" ? "bg-purple-100 text-purple-800" :
                      order.status === "completed" ? "bg-green-100 text-green-800" :
                      order.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-brown-600 hover:text-brown-800 font-semibold text-sm underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
