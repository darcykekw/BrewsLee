import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id, email, name, photo_url, created_at")
    .eq("id", session.user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let { name, photo_url } = await req.json();

    if (name !== undefined) {
      name = name.trim();
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      if (name.length > 100) return NextResponse.json({ error: "Name must be under 100 characters" }, { status: 400 });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (photo_url !== undefined) updates.photo_url = photo_url;

    const { data, error } = await supabaseServer
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
