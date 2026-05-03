"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/menu");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/menu" });
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden w-full"
      style={{ backgroundColor: '#4B2E2B' }}
    >
      {/* Back button — top left */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button
            variant="link"
            className="flex items-center gap-1 transition hover:-translate-x-0.5"
            style={{ color: '#FFF8F0', opacity: 0.75 }}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            Go back
          </Button>
        </Link>
      </div>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/menu/BrewsLeeBackground.png"
          alt="Login Background"
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.25)" }}
        />
      </div>

      {/* Glow orbs for atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 left-1/4 h-72 w-72 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: '#C08552' }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: '#8C5A3C' }}
        />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-8 flex flex-col items-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(192,133,82,0.12) 0%, rgba(75,46,43,0.9) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(192,133,82,0.2)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full mb-4 shadow-lg"
          style={{ backgroundColor: 'rgba(192,133,82,0.2)', border: '1px solid rgba(192,133,82,0.4)' }}
        >
          <img
            src="/icon.png"
            alt="BrewNook logo"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-bold mb-1 text-center"
          style={{ color: '#FFF8F0' }}
        >
          Welcome Back
        </h2>
        <p
          className="text-xs mb-6 text-center"
          style={{ color: '#FFF8F0', opacity: 0.55 }}
        >
          Sign in to your BrewNook account
        </p>

        {/* Message Banner */}
        {message && (
          <div
            className="w-full text-center text-sm py-2 px-4 rounded-xl mb-4"
            style={{ backgroundColor: 'rgba(192,133,82,0.15)', color: '#C08552' }}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(255,248,240,0.08)',
                color: '#FFF8F0',
                border: '1px solid rgba(192,133,82,0.25)',
              }}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(255,248,240,0.08)',
                color: '#FFF8F0',
                border: '1px solid rgba(192,133,82,0.25)',
              }}
            />
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
          </div>

          <hr style={{ borderColor: 'rgba(192,133,82,0.15)' }} />

          <div className="flex flex-col gap-3">
            {/* Email sign in button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full font-semibold px-5 py-3 rounded-full text-sm transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(45deg, #8C5A3C, #C08552)',
                color: '#FFF8F0',
                boxShadow: '0 4px 12px rgba(192,133,82,0.3)',
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr className="flex-1" style={{ borderColor: 'rgba(192,133,82,0.15)' }} />
              <span className="text-xs" style={{ color: '#FFF8F0', opacity: 0.4 }}>or</span>
              <hr className="flex-1" style={{ borderColor: 'rgba(192,133,82,0.15)' }} />
            </div>

            {/* Google sign in */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(45deg, #4B2E2B, #6B3F3C)',
                color: '#FFF8F0',
                border: '1px solid rgba(192,133,82,0.2)',
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* Register link */}
            <div className="w-full text-center mt-1">
              <span className="text-xs" style={{ color: '#FFF8F0', opacity: 0.55 }}>
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold underline transition"
                  style={{ color: '#C08552' }}
                >
                  Create one free
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#4B2E2B', color: '#FFF8F0' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
