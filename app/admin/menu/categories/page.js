"use client";
import { useState, useEffect } from "react";
import GradientButton from "@/components/ui/GradientButton";
import Spinner from "../../../../components/ui/Spinner";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
    };
    loadData();
  }, []);

  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        setCategories(categories.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brown-dark">Menu Categories</h1>
        <GradientButton onClick={() => toast("Add Category modal pending")} variant="primary" className="!px-4 !py-2 !text-sm">+ Add Category</GradientButton>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat, idx) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.display_order}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.menu_items?.[0]?.count || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button 
                     onClick={() => toggleActive(cat.id, cat.is_active)}
                     className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                   >
                     {cat.is_active ? "Active" : "Inactive"}
                   </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gold font-bold hover:underline mr-3">Edit</button>
                  <button className="text-red-700 font-bold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}