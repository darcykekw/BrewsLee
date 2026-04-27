"use client";

export default function ItemCard({ item, onOpenModal }) {
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
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
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

        {/* Favorite Button placeholder */}
        <button 
          onClick={(e) => { e.stopPropagation(); /* TODO favorites logic */ }}
          className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white backdrop-blur rounded-full shadow-sm transition"
        >
           <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
           </svg>
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 flex-1 line-clamp-2">{item.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-brown-dark">₱{item.price}</span>
          <button 
            disabled={!item.is_available}
            onClick={(e) => { e.stopPropagation(); onOpenModal(item); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${item.is_available ? 'bg-brown-dark text-white hover:bg-brown-light' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}