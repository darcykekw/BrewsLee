"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../../../components/ui/Button";
import Spinner from "../../../../../components/ui/Spinner";

export default function CustomizationsPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [data, setData] = useState({ item: null, groups: [] });
  const [loading, setLoading] = useState(true);

  const fetchCustomizations = async () => {
    try {
      const res = await fetch(`/api/admin/items/${id}/customizations`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomizations();
  }, [id]);

  const addGroup = async () => {
    const name = prompt("Group Name (e.g., Size, Sugar Level):");
    if (!name) return;
    const is_required = confirm("Is this group required to be selected before adding to cart?");
    
    await fetch(`/api/admin/items/${id}/customizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "group", name, is_required })
    });
    fetchCustomizations();
  };

  const deleteGroup = async (groupId) => {
    if (!confirm("Delete this group and all its options?")) return;
    await fetch(`/api/admin/items/${id}/customizations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "group", id: groupId })
    });
    fetchCustomizations();
  };

  const addOption = async (groupId) => {
    const label = prompt("Option Label (e.g., Large, 50% Sugar, Extra Shot):");
    if (!label) return;
    const price_modifier = parseFloat(prompt("Price Modifier (e.g., 15.00 for +15, 0 for free):", "0"));
    
    await fetch(`/api/admin/items/${id}/customizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "option", group_id: groupId, label, price_modifier: price_modifier || 0 })
    });
    fetchCustomizations();
  };

  const deleteOption = async (optionId) => {
    if (!confirm("Remove this option?")) return;
    await fetch(`/api/admin/items/${id}/customizations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "option", id: optionId })
    });
    fetchCustomizations();
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;
  if (!data.item) return <div className="text-red-500">Item not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.push("/admin/menu/items")} className="mb-4">
        &larr; Back to Menu Items
      </Button>

      <div className="bg-white p-6 rounded-lg shadow mb-8 flex items-center gap-6">
        <img src={data.item.image_url || "https://placehold.co/100"} alt={data.item.name} className="w-24 h-24 object-cover rounded-md" />
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">{data.item.name}</h1>
          <p className="text-gray-500">Base Price: ₱{data.item.price}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brown-dark">Customization Groups</h2>
        <Button onClick={addGroup}>+ Add Group</Button>
      </div>

      <div className="space-y-6">
        {data.groups.map(group => (
          <div key={group.id} className="bg-cream-dark p-4 rounded-lg">
            <div className="flex justify-between items-center border-b border-brown-light pb-2 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{group.name}</h3>
                {group.is_required && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded uppercase font-semibold">Required</span>}
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                <button onClick={() => deleteGroup(group.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
              </div>
            </div>

            <div className="bg-white rounded-md p-4">
              <ul className="space-y-2 mb-4">
                {group.customization_options?.map(opt => (
                  <li key={opt.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                    <span>{opt.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-green-700">
                        {opt.price_modifier > 0 ? `+₱${opt.price_modifier}` : "Free"}
                      </span>
                      <button onClick={() => deleteOption(opt.id)} className="text-red-400 hover:text-red-600 text-xl">&times;</button>
                    </div>
                  </li>
                ))}
                {(!group.customization_options || group.customization_options.length === 0) && (
                  <p className="text-sm text-gray-400 italic">No options added yet.</p>
                )}
              </ul>
              <Button variant="secondary" onClick={() => addOption(group.id)} className="w-full text-sm border-dashed">
                + Add Option
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}