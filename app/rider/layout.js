"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function RiderLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if user accesses protected route while unauthenticated
  if (status === "unauthenticated" && pathname !== "/rider/login") {
    router.push("/rider/login");
    return null;
  }

  // Show loading spinner while session initializes
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-brown-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Login page should not display the authenticated rider layout navbar
  if (pathname === "/rider/login") {
    return <>{children}</>;
  }

  // Double check authorization: make sure a non-rider authenticated user is kicked to home page
  if (session && session.user.role !== "rider") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-brown-900 text-cream p-4 shadow-md sticky top-0 z-30 flex justify-between items-center">
        <Link href="/rider/dashboard">
          <h1 className="text-xl font-bold tracking-wider text-gold">
            TAP N&apos; BREW <span className="text-sm font-normal text-orange-200">| Rider Portal</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border border-gold" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-brown-900 font-bold">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "R"}
              </div>
            )}
            <span className="font-semibold hidden sm:inline">{session?.user?.name || "Rider"}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/rider/login" })} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
