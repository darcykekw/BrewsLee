import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ addresses: [] });
    }

    const { data: addresses, error } = await supabaseServer
      .from("addresses")
      .select("*")
      .eq("profile_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ addresses });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}