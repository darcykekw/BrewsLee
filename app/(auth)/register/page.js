"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed. Please try again.");
    } else {
      router.push("/login?message=Account created! Please sign in.");
    }
  };

  const handleGoogleSignUp = () => {
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
          alt="Register Background"
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.25)" }}
        />
      </div>

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 right-1/4 h-72 w-72 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: '#C08552' }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full blur-3xl opacity-15"
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
          Create Account
        </h2>
        <p
          className="text-xs mb-6 text-center"
          style={{ color: '#FFF8F0', opacity: 0.55 }}
        >
          Join BrewNook and start ordering today
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(255,248,240,0.08)',
                color: '#FFF8F0',
                border: '1px solid rgba(192,133,82,0.25)',
              }}
            />
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
              placeholder="Password (min 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(255,248,240,0.08)',
                color: '#FFF8F0',
                border: '1px solid rgba(192,133,82,0.25)',
              }}
            />
            <input
              placeholder="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
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
            {/* Create account button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full font-semibold px-5 py-3 rounded-full text-sm transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(45deg, #8C5A3C, #C08552)',
                color: '#FFF8F0',
                boxShadow: '0 4px 12px rgba(192,133,82,0.3)',
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr className="flex-1" style={{ borderColor: 'rgba(192,133,82,0.15)' }} />
              <span className="text-xs" style={{ color: '#FFF8F0', opacity: 0.4 }}>or</span>
              <hr className="flex-1" style={{ borderColor: 'rgba(192,133,82,0.15)' }} />
            </div>

            {/* Google sign up */}
            <button
              onClick={handleGoogleSignUp}
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
              Sign up with Google
            </button>

            {/* Login link */}
            <div className="w-full text-center mt-1">
              <span className="text-xs" style={{ color: '#FFF8F0', opacity: 0.55 }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold underline transition"
                  style={{ color: '#C08552' }}
                >
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
