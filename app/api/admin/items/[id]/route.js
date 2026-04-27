import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabaseServer";
import { getSession } from "../../../../../lib/getSession";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params;
  const body = await request.json();

  const { data, error } = await supabaseServer.from("menu_items").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Optional: Delete from storage if image exists. Handled externally usually depending on rules.
  
  const { error } = await supabaseServer.from("menu_items").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}