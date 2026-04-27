"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Button from "../../../components/ui/Button";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-brown-dark flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-xl p-8 text-center border-t-4 border-gold">
        <h1 className="text-3xl font-bold text-brown-dark mb-2 tracking-wider">TAP N' BREW</h1>
        <p className="text-gray-500 mb-8 uppercase text-sm font-semibold tracking-widest">Admin Portal</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error === "AccessDenied" ? "Access denied. This Google account is not authorized as admin." : "An error occurred during sign in."}
          </div>
        )}

        <Button 
          variant="primary" 
          onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
          className="w-full py-3"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
