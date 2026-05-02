import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("addresses")
    .select("*")
    .eq("profile_id", session.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addresses: data });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { label, full_address, floor_unit, landmark, is_default } = await req.json();

    // Check count for user
    const { count, error: countError } = await supabaseServer
      .from("addresses")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", session.user.id);
      
    if (countError) throw countError;

    if (count >= 5) {
      return NextResponse.json({ error: "Maximum of 5 addresses allowed." }, { status: 400 });
    }

    let defaultStatus = is_default;
    if (count === 0) defaultStatus = true; // First address is always default

    // If requested to be default, unset others first
    if (defaultStatus) {
      await supabaseServer
        .from("addresses")
        .update({ is_default: false })
        .eq("profile_id", session.user.id);
    }

    const { data, error } = await supabaseServer
      .from("addresses")
      .insert([{
        profile_id: session.user.id,
        label,
        full_address,
        floor_unit,
        landmark,
        is_default: defaultStatus
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, address: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
