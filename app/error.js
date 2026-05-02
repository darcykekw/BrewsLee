"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 text-center">
      <span className="text-6xl mb-6">⚠️</span>
      <h2 className="text-4xl font-black text-brown-dark tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        We encountered an unexpected error. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-lg shadow-sm transition"
        >
          Try Again
        </button>
        <Link 
          href="/"
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
