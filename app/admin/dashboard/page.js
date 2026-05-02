"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Chart from "chart.js/auto";
import { formatTimeAgo } from "@/lib/formatters";
import Spinner from "@/components/ui/Spinner";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Summary state
  const [stats, setStats] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Chart state
  const [chartData, setChartData] = useState([]);
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  // Recent Orders State
  const [recentOrders, setRecentOrders] = useState([]);

  // Banner State
  const [bannerText, setBannerText] = useState("");
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerSaving, setBannerSaving] = useState(false);

  async function fetchSummary() {
    try {
      const res = await fetch("/api/admin/stats/summary");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Summary fetch error", err);
    }
  }

  async function fetchWeeklyOrders() {
    try {
      const res = await fetch("/api/admin/stats/weekly-orders");
      if (res.ok) {
        const data = await res.json();
        // Return format: [{ date: "Mon Apr 21", count: 12 }, ...]
        setChartData(data);
      }
    } catch (err) {
      console.error("Weekly chart error", err);
    }
  }

  async function fetchRecentOrders() {
    try {
      const res = await fetch("/api/admin/orders?limit=10");
      if (res.ok) {
        const data = await res.json();
        setRecentOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Recent orders error", err);
    } finally {
      setTimeout(() => setOrdersLoading(false), 0);
    }
  }

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setBannerText(data.announcement_banner || "");
        setBannerActive(data.banner_active === "true");
      }
    } catch (err) {
      console.error("Settings error", err);
    } finally {
      setTimeout(() => setBannerLoading(false), 0);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.push("/");
    } else if (status === "authenticated") {
      const loadAll = async () => {
        fetchSummary();
        fetchWeeklyOrders();
        fetchRecentOrders();
        fetchSettings();
      };
      loadAll();

      // Polls
      const summaryInterval = setInterval(() => {
        fetchSummary();
      }, 60000);
      
      const ordersInterval = setInterval(() => {
        fetchRecentOrders();
      }, 30000);

      return () => {
        clearInterval(summaryInterval);
        clearInterval(ordersInterval);
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  // Handle Chart Creation whenever chartData changes state
  useEffect(() => {
    if (chartData.length > 0 && canvasRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chartData.map(d => d.date),
          datasets: [{
            label: "Orders",
            data: chartData.map(d => d.count),
            backgroundColor: "#C8963E",
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }
  }, [chartData]);

  const handleConfirmOrder = async (id) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/confirm`, {
        method: "PATCH"
      });
      if (!res.ok) throw new Error("Failed to confirm");
      
      // Update local state optimistic
      setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status: "preparing" } : o));
      toast.success("Order confirmed!");
      // Optionally trigger re-fetch of stats
      fetchSummary();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveBanner = async () => {
    try {
      setBannerSaving(true);
      const payload = {
        announcement_banner: bannerText,
        banner_active: bannerActive ? "true" : "false"
      };
      
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Announcement updated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTimeout(() => setBannerSaving(false), 0);
    }
  };

  const handleClearBanner = () => {
    setBannerText("");
    setBannerActive(false);
    // Let user click save manually, or do it auto:
    // handleSaveBanner()
  };

  if (status === "loading" || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brown border-t-gold rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-brown-dark tracking-tight">Admin Dashboard</h1>
          <Link href="/admin/settings" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-bold transition">
            Store Settings
          </Link>
        </div>

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 hover:-translate-y-1 transition duration-300 cursor-default">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-blue-900 font-bold text-sm uppercase tracking-wider">Today&apos;s Orders</h3>
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.todayOrders}</p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm border border-orange-100 p-5 transition duration-300 cursor-default ${stats.pendingOrders > 0 ? 'hover:-translate-y-1 shadow-orange-100 border-orange-300 animate-pulse' : 'hover:-translate-y-1'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-orange-900 font-bold text-sm uppercase tracking-wider">Pending</h3>
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-cyan-100 p-5 hover:-translate-y-1 transition duration-300 cursor-default">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-cyan-900 font-bold text-sm uppercase tracking-wider">Out for Delivery</h3>
              <div className="p-2 bg-cyan-50 text-cyan-500 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.outForDelivery}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 hover:-translate-y-1 transition duration-300 cursor-default">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-green-900 font-bold text-sm uppercase tracking-wider">Revenue Today</h3>
              <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">â‚±{stats.revenueToday?.toFixed(2)}</p>
          </div>
        </div>

        {/* 2. Chart Section */}
        <div className="bg-cream rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-brown-dark mb-6">Orders â€” Last 7 Days</h2>
          <div className="h-[300px] w-full">
            <canvas ref={canvasRef}></canvas>
          </div>
        </div>

        {/* 3. Two columns for Orders & Banners */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders (takes 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h2 className="text-xl font-bold text-brown-dark">Recent Orders</h2>
               <Link href="/admin/orders" className="text-sm font-bold text-gold hover:text-brown transition">View All &rarr;</Link>
             </div>
             
             {ordersLoading ? (
                <div className="p-12 text-center text-gray-400">Loading orders...</div>
             ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order / Time</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="p-4">
                            <div className="font-mono font-bold text-gray-900 border border-gray-200 rounded px-2 py-0.5 inline-block text-xs bg-white mb-1">
                               {order.guest_token.substring(0, 8).toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">{formatTimeAgo(order.created_at)}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{order.customer_name}</div>
                            <div className="text-xs text-gray-500">{order.item_count} items</div>
                          </td>
                          <td className="p-4 font-bold text-brown-dark flex items-center h-full">â‚±{order.total}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider
                              ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                               ${order.status === 'preparing' ? 'bg-blue-100 text-blue-800' : ''}
                               ${order.status === 'ready' ? 'bg-yellow-100 text-yellow-800' : ''}
                               ${order.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' : ''}
                               ${order.status === 'delivered' || order.status === 'picked_up' ? 'bg-green-100 text-green-800' : ''}
                               ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => handleConfirmOrder(order.id)}
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
                              >
                                Confirm
                              </button>
                            )}
                            <Link 
                                href={`/admin/orders/${order.id}`}
                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg transition inline-block"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {recentOrders.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No orders recently.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             )}
          </div>

          {/* Banner Setting (takes 1 column) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
             <h2 className="text-xl font-bold text-brown-dark mb-4">Announcement Banner</h2>
             <p className="text-sm text-gray-500 mb-6">Display a public announcement on the top of the homepage to all customers.</p>
             
             {bannerLoading ? (
               <div className="flex-1 flex justify-center items-center"><Spinner /></div>
             ) : (
               <div className="flex-1 flex flex-col gap-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                   <textarea
                     value={bannerText}
                     onChange={(e) => setBannerText(e.target.value)}
                     maxLength={200}
                     rows={4}
                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold resize-none"
                     placeholder="e.g., ðŸŽ‰ Shop is closed today due to holiday."
                   />
                   <div className="text-right text-xs text-gray-400 mt-1">{bannerText.length}/200</div>
                 </div>

                 <label className="flex items-center gap-3 cursor-pointer mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-brown-dark rounded"
                      checked={bannerActive}
                      onChange={(e) => setBannerActive(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-gray-800">Show on site</span>
                 </label>

                 <div className="mt-auto pt-6 flex gap-3">
                    <button 
                      onClick={handleClearBanner}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={handleSaveBanner}
                      disabled={bannerSaving}
                      className="flex-1 px-4 py-2 bg-brown-dark hover:bg-brown-light text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex justify-center items-center"
                    >
                      {bannerSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                    </button>
                 </div>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
