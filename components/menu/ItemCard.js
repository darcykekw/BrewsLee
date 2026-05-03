"use client";

import Image from "next/image";
import GradientButton from "@/components/ui/GradientButton";

export default function ItemCard({ item, onOpenModal, isFavorite, onToggleFavorite }) {
  const handleCardClick = (e) => {
    // Prevent opening modal if clicking specific action buttons like favorite
    if (e.target.tagName !== "BUTTON" && !e.target.closest('button')) {
      onOpenModal(item);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative bg-white rounded-xl shadow cursor-pointer transition-transform hover:scale-105 border border-gray-100 flex flex-col h-full overflow-hidden ${!item.is_available ? 'opacity-70' : ''}`}
    >
      <div className="relative h-48 w-full bg-gray-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        
        {item.is_featured && (
          <div className="absolute top-2 left-2 bg-gold text-brown-dark text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            Best Seller
          </div>
        )}

        {!item.is_available && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white font-bold px-3 py-1 bg-red-600 rounded text-sm uppercase tracking-wider">Sold Out</span>
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                onToggleFavorite(); 
            }}
            className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white backdrop-blur rounded-full shadow-sm transition"
          >
             <svg 
               className={`w-5 h-5 transition-colors ${isFavorite ? 'text-[#C08552] fill-current' : 'text-gray-400 hover:text-[#C08552]'}`} 
               fill={isFavorite ? "currentColor" : "none"} 
               stroke="currentColor" 
               viewBox="0 0 24 24"
             >
               {isFavorite ? (
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
               ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
               )}
             </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 flex-1 line-clamp-2">{item.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-brown-dark">â‚±{item.price}</span>
          <GradientButton 
            disabled={!item.is_available}
            onClick={(e) => { e.stopPropagation(); onOpenModal(item); }}
            variant="primary"
          >
            Add
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
