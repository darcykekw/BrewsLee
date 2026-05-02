import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Create user in Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email: trimmedEmail,
      password: password,
      email_confirm: true,
      user_metadata: { name: name.trim() }
    });

    if (authError) {
      if (authError.message.includes("already exists") || authError.message.includes("already registered")) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into profiles table
    const { error: profileError } = await supabaseServer.from("profiles").insert({
      id: userId,
      email: trimmedEmail,
      name: name.trim(),
      role: "customer"
    });

    if (profileError) {
      // Rollback auth user creation if profile insert fails
      await supabaseServer.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Failed to setup profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
