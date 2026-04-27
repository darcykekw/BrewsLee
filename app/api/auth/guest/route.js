import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const guestToken = uuidv4();
    
    // Set cookie (7 days expiry)
    cookies().set("guest_token", guestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true, guestToken });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create guest session" }, { status: 500 });
  }
}
