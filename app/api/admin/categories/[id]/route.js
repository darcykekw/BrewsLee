import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabaseServer";
import { getSession } from "../../../../../lib/getSession";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params;
  const body = await request.json();

  const { data, error } = await supabaseServer
    .from("categories")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params;

  // Check for items
  const { count, error: countError } = await supabaseServer
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
  
  if (count > 0) {
    // If we wanted to warn only, we could return a 400 with a warning message to prompt a force-delete.
    // For now, let Supabase handle cascade/set null rules depending on DB setup. (DB is SET NULL)
  }

  const { error } = await supabaseServer.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ success: true });
}