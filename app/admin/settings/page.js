"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState({
    shopName: "",
    shopAddress: "",
    contactNumber: "",
    email: "",
    deliveryFee: "",
    estimatedDeliveryTime: "",
    estimatedPickupTime: "",
    operatingHours: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        // Merge fetched data gracefully
        setSettings(prev => ({
          ...prev,
          shopName: data.shopName || "",
          shopAddress: data.shopAddress || "",
          contactNumber: data.contactNumber || "",
          email: data.email || "",
          deliveryFee: data.deliveryFee || "",
          estimatedDeliveryTime: data.estimatedDeliveryTime || "",
          estimatedPickupTime: data.estimatedPickupTime || "",
          operatingHours: data.operatingHours || ""
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.push("/");
    } else if (status === "authenticated") {
      const loadSettings = async () => {
        await fetchSettings();
      };
      loadSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTimeout(() => setSaving(false), 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
        <div className="animate-spin w-8 h-8 border-4 border-brown border-t-gold rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px] pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brown-dark tracking-tight mb-8">Store Settings</h1>

        <form onSubmit={handleSaveAll} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          
          {/* Section 1: Shop Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Shop Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Shop Name</label>
                <input 
                  type="text" 
                  name="shopName" 
                  value={settings.shopName} 
                  onChange={handleChange} 
                  placeholder="BrewsLee"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  name="contactNumber" 
                  value={settings.contactNumber} 
                  onChange={handleChange} 
                  placeholder="+63 912 345 6789"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={settings.email} 
                  onChange={handleChange} 
                  placeholder="admin@brewslee.com"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Shop Address</label>
                <textarea 
                  name="shopAddress" 
                  value={settings.shopAddress} 
                  onChange={handleChange} 
                  placeholder="123 Coffee St, Bean City, 1000"
                  rows={3}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light resize-none" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ordering Settings */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Ordering Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">â‚±</span>
                  <input 
                    type="number" 
                    name="deliveryFee" 
                    value={settings.deliveryFee} 
                    onChange={handleChange} 
                    placeholder="50"
                    min={0}
                    className="w-full pl-8 p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Est. Delivery Time</label>
                <input 
                  type="text" 
                  name="estimatedDeliveryTime" 
                  value={settings.estimatedDeliveryTime} 
                  onChange={handleChange} 
                  placeholder="30-45 mins"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Est. Pickup Time</label>
                <input 
                  type="text" 
                  name="estimatedPickupTime" 
                  value={settings.estimatedPickupTime} 
                  onChange={handleChange} 
                  placeholder="15-20 mins"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Display Settings */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Display Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Operating Hours</label>
                <input 
                  type="text" 
                  name="operatingHours" 
                  value={settings.operatingHours} 
                  onChange={handleChange} 
                  placeholder="Mon - Sun: 7:00 AM - 10:00 PM"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brown-light focus:border-brown-light" 
                />
                <p className="text-xs text-gray-500 mt-1">This will display in the footer or contact section of the store.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center min-w-[200px]"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save All Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
