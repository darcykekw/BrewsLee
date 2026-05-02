"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/menu");
    }
  }, [status, router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    const res = await signIn("customer-credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      router.push("/menu");
    }
    setIsLoading(false);
  };

  if (status === "loading" || status === "authenticated") {
    return <div className="h-screen flex items-center justify-center bg-cream"><p className="text-xl font-medium text-brown">Loading...</p></div>;
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center border-t-4 border-gold">
        <h1 className="text-3xl font-bold text-brown-dark mb-2 tracking-wider uppercase">TAP N&apos; BREW</h1>
        <p className="text-gray-500 mb-8">Sign in to order your favorite coffee.</p>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-6">
          <input 
            type="email" 
            name="email"
            placeholder="Email address" 
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-gold outline-none transition text-left" 
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-gold outline-none transition text-left" 
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brown-dark text-white rounded-lg px-4 py-3 font-bold hover:bg-brown transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-sm text-gray-600 mb-6">
          Don&apos;t have an account? <Link href="/register" className="text-gold font-bold hover:underline">Register here</Link>
        </div>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          onClick={() => signIn("google", { callbackUrl: "/menu" })}
          className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-3 font-bold hover:bg-gray-50 transition flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.13-10.36 7.13-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
