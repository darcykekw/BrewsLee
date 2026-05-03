"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import GradientButton from "@/components/ui/GradientButton";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  
  // Data States
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);

  // Forms
  const [editName, setEditName] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const [newAddress, setNewAddress] = useState({ label: "", full_address: "", floor_unit: "", landmark: "", is_default: false });

  const fetchData = async () => {
    try {
      setTimeout(() => setLoading(true), 0);
      // Fetch profile
      const profRes = await fetch("/api/profile");
      const profData = await profRes.json();
      setProfile(profData);
      setEditName(profData.name || "");
      setEditPhotoUrl(profData.photo_url || "");

      // Fetch addresses
      const addrRes = await fetch("/api/profile/addresses");
      const addrData = await addrRes.json();
      setAddresses(addrData.addresses || []);

      // Fetch orders
      const ordersRes = await fetch("/api/profile/orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders || []);

      // Fetch favorites
      const favRes = await fetch("/api/profile/favorites");
      const favData = await favRes.json();
      setFavorites(favData.favorites || []);
      
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setTimeout(() => fetchData(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, photo_url: editPhotoUrl })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add address");
      }
      toast.success("Address added");
      setNewAddress({ label: "", full_address: "", floor_unit: "", landmark: "", is_default: false });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      toast.success("Address deleted");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSetDefaultAddress = async (id, currentData) => {
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentData, is_default: true })
      });
      if (!res.ok) throw new Error("Failed to set default");
      toast.success("Default address updated");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveFavorite = async (menuItemId) => {
    try {
      const res = await fetch("/api/profile/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId })
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
      fetchData();
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brown-dark mb-8">My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Tabs Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
              {['profile', 'addresses', 'orders', 'favorites'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-left font-medium capitalize transition border-b border-gray-100 last:border-0 ${
                    activeTab === tab 
                      ? 'bg-brown-dark text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow p-6">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && profile && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden shadow-inner flex items-center justify-center">
                      {editPhotoUrl ? (
                         <img src={editPhotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                         <span className="text-gray-400 text-sm">No Photo</span>
                      )}
                    </div>
                    {/* Mock File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                      <input 
                        type="text" 
                        value={editPhotoUrl}
                        onChange={(e) => setEditPhotoUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full p-2 border rounded focus:ring-brown-dark focus:border-brown-dark"
                      />
                      <p className="text-xs text-gray-500 mt-1">For now, just paste an image URL.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 text-xs">(Read Only)</span></label>
                    <input 
                      type="text" 
                      value={profile.email} 
                      disabled 
                      className="w-full p-2 border rounded bg-gray-50 text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-brown-dark focus:border-brown-dark" 
                      required
                    />
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>

                  <GradientButton type="submit" variant="primary">
                    Save Changes
                  </GradientButton>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold">Saved Addresses</h2>
                   <span className="text-sm text-gray-500">{addresses.length} / 5</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {addresses.map(addr => (
                    <div key={addr.id} className={`p-4 border rounded-xl flex justify-between items-start transition ${addr.is_default ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold">{addr.label}</span>
                           {addr.is_default && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Default</span>}
                         </div>
                         <p className="text-sm text-gray-600">{addr.full_address}</p>
                         {(addr.floor_unit || addr.landmark) && (
                           <p className="text-xs text-gray-500 mt-1">
                             {addr.floor_unit && <span>Unit: {addr.floor_unit} </span>}
                             {addr.landmark && <span>Landmark: {addr.landmark}</span>}
                           </p>
                         )}
                      </div>
                      <div className="flex items-center gap-3">
                         {!addr.is_default && (
                           <button onClick={() => handleSetDefaultAddress(addr.id, addr)} className="text-sm text-gold font-bold hover:underline">Set Default</button>
                         )}
                         <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm text-red-700 font-bold hover:underline">Delete</button>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && <p className="text-gray-500 italic">No saved addresses.</p>}
                </div>

                {addresses.length < 5 && (
                  <div className="border-t pt-6">
                    <h3 className="font-bold mb-4">Add New Address</h3>
                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Label (e.g. Home, Work)</label>
                        <input type="text" required value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Address (Street, City)</label>
                        <input type="text" required value={newAddress.full_address} onChange={e => setNewAddress({...newAddress, full_address: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Floor / Unit (Optional)</label>
                        <input type="text" value={newAddress.floor_unit} onChange={e => setNewAddress({...newAddress, floor_unit: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                        <input type="text" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 mt-2">
                        <input type="checkbox" id="is_default" checked={newAddress.is_default} onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})} className="rounded text-brown-dark" />
                        <label htmlFor="is_default" className="text-sm">Set as default address</label>
                      </div>
                      <div className="md:col-span-2 mt-2">
                        <GradientButton type="submit" variant="primary">Save Address</GradientButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Order History</h2>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className="font-bold font-mono">#{order.guest_token.slice(0, 5).toUpperCase()}</span>
                           <span className="text-xs px-2 py-1 bg-gray-100 rounded font-semibold capitalize">{order.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{new Date(order.created_at).toLocaleString()}</p>
                        <p className="text-sm text-gray-700 space-x-1 font-medium">
                          {order.order_items?.map((oi, i) => (
                             <span key={oi.id}>{oi.quantity}x {oi.menu_items?.name}{(i < order.order_items.length - 1) ? ',' : ''}</span>
                          ))}
                        </p>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                         <span className="font-bold text-lg">₱{order.total}</span>
                         <GradientButton href={`/track/${order.guest_token}`} variant="secondary" className="!py-1.5 !px-4 !text-sm">
                           Track / View
                         </GradientButton>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-gray-500 italic">No orders found.</p>}
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Favorites</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map(fav => {
                    const item = fav.menu_items;
                    if (!item) return null;
                    return (
                      <div key={fav.id} className="border rounded-xl p-3 flex flex-col gap-2 relative group">
                         <div className="h-32 w-full bg-gray-100 rounded-lg overflow-hidden relative">
                           {item.image_url ? (
                             <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                           )}
                           <button 
                             onClick={() => handleRemoveFavorite(item.id)}
                             className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white shadow text-[#C08552] transition-transform hover:scale-110"
                           >
                             {/* Filled Heart */}
                             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                             </svg>
                           </button>
                         </div>
                         <div>
                           <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                           <p className="text-brown-dark font-semibold text-sm">â‚±{item.price}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
                {favorites.length === 0 && <p className="text-gray-500 italic">No favorites added yet.</p>}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
