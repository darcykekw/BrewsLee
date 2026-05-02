import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { menuItemId } = await req.json();

    if (!menuItemId) {
      return NextResponse.json({ error: "menuItemId is required" }, { status: 400 });
    }

    // Check if favorite exists
    const { data: existing, error: err } = await supabaseServer
      .from("user_favorites")
      .select("id")
      .eq("profile_id", session.user.id)
      .eq("menu_item_id", menuItemId)
      .single();

    if (existing) {
      // Remove it
      const { error: delError } = await supabaseServer
        .from("user_favorites")
        .delete()
        .eq("id", existing.id);
      
      if (delError) throw delError;
      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      // Add it
      const { error: insError } = await supabaseServer
        .from("user_favorites")
        .insert({
          profile_id: session.user.id,
          menu_item_id: menuItemId
        });
      
      if (insError) throw insError;
      return NextResponse.json({ success: true, isFavorite: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
