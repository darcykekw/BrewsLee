import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 text-center">
      <span className="text-6xl mb-6">☕</span>
      <h2 className="text-4xl font-black text-brown-dark tracking-tight mb-2">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Oops! We couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="px-8 py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-lg shadow-sm transition"
      >
        Go to Menu
      </Link>
    </div>
  );
}
