import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idsOnly = searchParams.get("idsOnly") === "true";

  if (idsOnly) {
    const { data, error } = await supabaseServer
      .from("user_favorites")
      .select("menu_item_id")
      .eq("profile_id", session.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ids: data.map(d => d.menu_item_id) });
  } else {
    const { data, error } = await supabaseServer
      .from("user_favorites")
      .select("id, menu_item_id, menu_items(*)")
      .eq("profile_id", session.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ favorites: data });
  }
}
