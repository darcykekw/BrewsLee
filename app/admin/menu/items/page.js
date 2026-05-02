"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../../components/ui/Button";
import Spinner from "../../../../components/ui/Spinner";
import toast from "react-hot-toast";

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("");

  const fetchData = async () => {
    try {
      const catRes = await fetch("/api/admin/categories");
      const cats = await catRes.json();
      setCategories(cats);

      const itemsRes = await fetch(`/api/admin/items${filterCat ? `?categoryId=${filterCat}` : ""}`);
      const data = await itemsRes.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [filterCat]);

  const toggleStatus = async (id, field, value) => {
    try {
      const res = await fetch(`/api/admin/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !value })
      });
      if (res.ok) {
        setItems(items.map(item => item.id === id ? { ...item, [field]: !value } : item));
      }
    } catch (e) {}
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brown-dark">Menu Items</h1>
        <div className="flex gap-4">
          <select 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-brown p-2"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button onClick={() => toast("Add Item modal pending")}>+ Add Item</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Photo</th>
                <th className="px-6 py-3 text-left">Name & Price</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-center">Available</th>
                <th className="px-6 py-3 text-center">Featured</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                     <img src={item.image_url || "https://placehold.co/50"} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <p>{item.name}</p>
                    <p className="text-gray-500 text-sm">₱{item.price}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.categories?.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleStatus(item.id, 'is_available', item.is_available)} className={`px-3 py-1 rounded-full text-xs font-semibold ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.is_available ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleStatus(item.id, 'is_featured', item.is_featured)} className={`px-3 py-1 rounded-full text-xs font-semibold ${item.is_featured ? 'bg-gold-light text-brown-dark' : 'bg-gray-100 text-gray-800'}`}>
                      {item.is_featured ? "Featured" : "-"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => router.push(`/admin/menu/items/${item.id}/customizations`)} className="text-purple-600 hover:text-purple-900 mx-2 text-sm">Customizations</button>
                    <button className="text-blue-600 hover:text-blue-900 mx-2 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-900 text-sm">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}