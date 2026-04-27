"use client";

import { useEffect, useState } from "react";
import ItemCard from "../components/menu/ItemCard";
import ItemModal from "../components/menu/ItemModal";
import Spinner from "../components/ui/Spinner";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Future: fetch from generic settings endpoint
  const announcement = "☕ Free delivery on orders over ₱500! Order now! 🚀";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const allItems = categories.flatMap(c => c.items || []);

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "All") return matchesSearch;
    const cat = categories.find(c => c.id === activeTab);
    const matchesCategory = cat?.items?.some(i => i.id === item.id);
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-cream flex flex-col pt-12 sm:pt-[72px]"> 
      {/* 72px padding top represents standard navbar height, assuming Navbar is fixed */}
      
      {announcement && (
        <div className="bg-brown text-white text-center py-2 text-sm font-semibold tracking-wide shadow-md">
          {announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-2 tracking-tight">Our Menu</h1>
            <p className="text-gray-600 font-medium text-lg">Freshly brewed and crafted for you.</p>
          </div>
          
          <div className="relative w-full md:w-96 shadow-sm rounded-full overflow-hidden border border-gray-200 bg-white group hover:border-gold transition-colors">
            <input 
              type="text"
              placeholder="Search for coffee, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 outline-none focus:ring-0 text-gray-700 bg-transparent placeholder-gray-400 group-hover:placeholder-gray-500 font-medium"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-3 snap-x">
          <button
            onClick={() => setActiveTab("All")}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 snap-start shadow-sm border ${
              activeTab === "All" 
                ? 'bg-brown-dark text-white border-transparent scale-105' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-brown hover:text-brown'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 snap-start shadow-sm border ${
                activeTab === cat.id 
                  ? 'bg-brown-dark text-white border-transparent scale-105' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brown hover:text-brown'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center flex-col items-center py-24">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-cream-dark border-t-gold rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex justify-center items-center text-brown-dark font-bold text-xs pt-1">
                 TN'B
               </div>
             </div>
             <span className="ml-4 text-xl font-bold text-brown mt-4 tracking-widest uppercase animate-pulse">Brewing...</span>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} onOpenModal={handleOpenModal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-cream mt-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-cream/10 pattern-dots transform rotate-45 scale-150"></div>
            <div className="relative z-10">
              <svg className="mx-auto h-20 w-20 text-gray-300 mb-6 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v3m0 0v3m0-3h3m-3 0h-3m9-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-400 font-medium">Try adjusting your search or category filters.</p>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </main>
  );
}