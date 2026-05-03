"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GradientButton from "@/components/ui/GradientButton";

export default function RiderLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "rider") {
      router.push("/rider/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/rider/dashboard");
    }
    
    setIsLoading(false);
  };

  if (status === "loading") {
    return <div className="h-screen flex items-center justify-center"><p className="text-xl">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 border-t-4 border-brown-dark">
        <h1 className="text-center text-3xl font-bold text-brown-dark mb-2 tracking-wider">BREWS LEE</h1>
        <p className="text-center text-gray-500 mb-8 uppercase text-sm font-semibold tracking-widest">Rider Portal</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <GradientButton variant="primary" type="submit" disabled={isLoading} fullWidth={true} className="py-3 mt-4">
            {isLoading ? "Signing in..." : "Sign In"}
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
