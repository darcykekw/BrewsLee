"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export function ConditionalNav() {
  const pathname = usePathname();
  // Hide global navbar for rider routes, auth pages, and landing page (/)
  if (pathname?.startsWith("/rider") || pathname === "/" || pathname === "/login" || pathname === "/register") return null;
  return <Navbar />;
}
