"use client";

import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import toast from "react-hot-toast";

export default function AdminRidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    contact_number: "",
    photo_url: ""
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Riders
  const fetchRiders = async () => {
    try {
      const res = await fetch("/api/admin/riders");
      const data = await res.json();
      setRiders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchRiders();
    }, 0);
  }, []);

  const openAddModal = () => {
    setEditMode(false);
    setSelectedRider(null);
    setFormData({ name: "", username: "", password: "", confirmPassword: "", contact_number: "", photo_url: "" });
    setModalOpen(true);
  };

  const openEditModal = (rider) => {
    setEditMode(true);
    setSelectedRider(rider);
    setFormData({
      name: rider.name,
      username: rider.username,
      password: "",
      confirmPassword: "",
      contact_number: rider.contact_number,
      photo_url: rider.photo_url || ""
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setFormLoading(false);
      return;
    }

    try {
      if (editMode) {
        const payload = {
          name: formData.name,
          contact_number: formData.contact_number,
          photo_url: formData.photo_url
        };
        if (formData.password) payload.new_password = formData.password;

        await fetch(`/api/admin/riders/${selectedRider.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/admin/riders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
            password: formData.password,
            contact_number: formData.contact_number,
            photo_url: formData.photo_url
          })
        });
      }
      setModalOpen(false);
      toast.success("Rider saved successfully!");
      fetchRiders();
    } catch (err) {
      toast.error("Error saving rider.");
    } finally {
      setFormLoading(false);
    }
  };

  const deactivateRider = async (riderId, activeDeliveries) => {
    if (activeDeliveries.length > 0) {
      const confirmStr = `This rider has ${activeDeliveries.length} active deliveries. Deactivating them will not cancel those orders. Are you sure?`;
      if (!window.confirm(confirmStr)) return;
      
      await fetch(`/api/admin/riders/${riderId}?force=true`, { method: "DELETE" });
    } else {
      if (!window.confirm("Are you sure you want to deactivate this rider?")) return;
      
      await fetch(`/api/admin/riders/${riderId}`, { method: "DELETE" });
    }
    fetchRiders();
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brown-dark">Rider Management</h1>
        <Button onClick={openAddModal}>+ Add Rider</Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Rider</th>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Contact</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Active Deliveries</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {riders.map(r => (
              <tr key={r.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {r.photo_url ? <img src={r.photo_url} alt={r.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <span className="font-medium text-gray-900">{r.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{r.username}</td>
                <td className="px-6 py-4 text-gray-500">{r.contact_number}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {r.active_deliveries.length > 0 ? r.active_deliveries.length : "None"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEditModal(r)} className="text-blue-600 hover:text-blue-900 mx-2 text-sm font-medium">Edit</button>
                  {r.is_active && (
                    <button onClick={() => deactivateRider(r.id, r.active_deliveries)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {riders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">No riders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Rider" : "Add Rider"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown sm:text-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input required={!editMode} disabled={editMode} type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown sm:text-sm p-2 disabled:bg-gray-100" />
                {!editMode && <p className="text-xs text-gray-500 mt-1">Used to log in.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password {editMode && "(Leave blank to keep current)"}</label>
                <input required={!editMode} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown sm:text-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input required={!editMode && formData.password !== ""} type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown sm:text-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input required type="text" value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown sm:text-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo URL (Optional)</label>
                <input type="url" value={formData.photo_url} onChange={(e) => setFormData({...formData, photo_url: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown sm:text-sm p-2" placeholder="https://..." />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? "Saving..." : "Save Rider"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}