"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";

export default function ItemModal({ item, onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [errorGroup, setErrorGroup] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize selected options based on group requirements, or empty
  useEffect(() => {
    if (item.customizationGroups) {
      const initial = {};
      item.customizationGroups.forEach((g) => {
        // Find existing selected, or maybe leave it blank for now
      });
      setSelectedOptions(initial);
    }
  }, [item]);

  const handleOptionChange = (groupId, optionId, isMultiple) => {
    setErrorGroup(null);
    setSelectedOptions((prev) => {
      const copy = { ...prev };
      if (isMultiple) {
        if (!copy[groupId]) copy[groupId] = [];
        if (copy[groupId].includes(optionId)) {
          copy[groupId] = copy[groupId].filter((id) => id !== optionId);
        } else {
          copy[groupId].push(optionId);
        }
      } else {
        copy[groupId] = optionId;
      }
      return copy;
    });
  };

  const calculateSubtotal = () => {
    let sub = item.price;
    if (item.customizationGroups) {
      item.customizationGroups.forEach((g) => {
        const selected = selectedOptions[g.id];
        if (selected) {
          if (Array.isArray(selected)) {
            selected.forEach((optId) => {
              const opt = g.customizationOptions?.find((o) => o.id === optId);
              if (opt && opt.price_modifier) sub += opt.price_modifier;
            });
          } else {
            const opt = g.customizationOptions?.find((o) => o.id === selected);
            if (opt && opt.price_modifier) sub += opt.price_modifier;
          }
        }
      });
    }
    return sub * quantity;
  };

  const handleAddToCart = () => {
    // Validate required groups
    for (const g of item.customizationGroups || []) {
      if (g.is_required && !selectedOptions[g.id]) {
        setErrorGroup(g.id);
        return;
      }
    }

    const subtotal = calculateSubtotal();
    
    // Resolve full option objects for cart display
    const resolvedOptions = [];
    (item.customizationGroups || []).forEach(g => {
      const selected = selectedOptions[g.id];
      if (selected) {
        if (Array.isArray(selected)) {
          selected.forEach(optId => {
            const opt = g.customizationOptions?.find(o => o.id === optId);
            if (opt) resolvedOptions.push({ groupId: g.id, groupName: g.name, id: opt.id, label: opt.label, priceModifier: opt.price_modifier });
          });
        } else {
          const opt = g.customizationOptions?.find(o => o.id === selected);
          if (opt) resolvedOptions.push({ groupId: g.id, groupName: g.name, id: opt.id, label: opt.label, priceModifier: opt.price_modifier });
        }
      }
    });

    const cartItemId = `${item.id}_${Date.now()}`; // Or generate a stable key based on options

    addItem({
      cartItemId,
      id: item.id,
      name: item.name,
      basePrice: item.price,
      selectedOptions: resolvedOptions,
      quantity,
      itemSubtotal: subtotal,
      image_url: item.image_url
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1000);
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition shadow text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="h-64 sm:h-80 w-full bg-cream-light relative shrink-0">
          {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
            <h2 className="text-3xl font-bold text-white mb-1">{item.name}</h2>
            <p className="text-gold font-bold text-xl">₱{item.price}</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
           {item.description && <p className="text-gray-600 leading-relaxed text-sm md:text-base">{item.description}</p>}

           {item.customizationGroups?.map(group => (
             <div key={group.id} className={`p-4 rounded-xl border-2 transition ${errorGroup === group.id ? 'border-red-400 bg-red-50' : 'border-cream bg-cream/10'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-brown-dark text-lg flex items-center gap-2">
                    {group.name}
                    {group.is_required && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Required</span>}
                    {!group.is_required && <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Optional</span>}
                  </h3>
                  {errorGroup === group.id && <span className="text-red-500 text-sm font-medium animate-pulse">Required selection</span>}
                </div>

                <div className="space-y-2">
                  {group.customizationOptions?.map(opt => {
                    const isChecked = group.is_required 
                      ? selectedOptions[group.id] === opt.id 
                      : (selectedOptions[group.id] || []).includes(opt.id);

                    return (
                      <label key={opt.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${isChecked ? 'border-brown bg-brown/5' : 'border-gray-200 hover:border-cream-dark'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type={group.is_required ? "radio" : "checkbox"}
                            name={`group_${group.id}`}
                            checked={isChecked}
                            onChange={() => handleOptionChange(group.id, opt.id, !group.is_required)}
                            className={`w-5 h-5 text-brown focus:ring-brown border-gray-300 ${!group.is_required && 'rounded'}`}
                          />
                          <span className={`${isChecked ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{opt.label}</span>
                        </div>
                        {opt.price_modifier > 0 && <span className="text-gold font-bold text-sm">+₱{opt.price_modifier}</span>}
                      </label>
                    );
                  })}
                </div>
             </div>
           ))}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="flex items-center items-stretch rounded-lg border border-gray-200 bg-gray-50 h-14 shrink-0 overflow-hidden w-full sm:w-auto">
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 hover:bg-gray-100 transition text-gray-600 font-bold w-12 sm:w-auto">-</button>
               <div className="flex items-center justify-center font-bold text-lg text-brown-dark w-12 bg-white">{quantity}</div>
               <button onClick={() => setQuantity(quantity + 1)} className="px-5 hover:bg-gray-100 transition text-gray-600 font-bold w-12 sm:w-auto">+</button>
             </div>

             <button 
                onClick={handleAddToCart}
                disabled={showSuccess}
                className={`flex-1 w-full h-14 rounded-lg font-bold text-white text-lg transition-all flex items-center justify-center gap-2 ${showSuccess ? 'bg-green-500 scale-95' : 'bg-brown-dark hover:bg-brown focus:ring-4 ring-brown/30 active:scale-95'}`}
             >
               {showSuccess ? (
                 <>
                   <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                   Added!
                 </>
               ) : (
                 <>
                   Add to Cart • ₱{calculateSubtotal()}
                 </>
               )}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}