"use client";

import { useState } from "react";

export default function AnnouncementBanner({ text }) {
  const [visible, setVisible] = useState(true);

  if (!visible || !text) return null;

  return (
    <div className="bg-gold-light text-brown-dark text-center p-2 relative text-sm font-medium">
      {text}
      <button 
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-dark hover:text-black font-bold"
      >
        ✕
      </button>
    </div>
  );
}
