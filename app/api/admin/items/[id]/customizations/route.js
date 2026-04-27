import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../../../lib/supabaseServer";
import { getSession } from "../../../../../../lib/getSession";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params;

  const { data: item } = await supabaseServer.from("menu_items").select("*").eq("id", id).single();
  const { data: groups, error } = await supabaseServer
    .from("customization_groups")
    .select("*, customization_options(*)")
    .eq("menu_item_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item, groups });
}

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params;
  const body = await request.json();

  if (body.type === "group") {
    const { data, error } = await supabaseServer
      .from("customization_groups")
      .insert([{ menu_item_id: id, name: body.name, is_required: body.is_required }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else if (body.type === "option") {
    const { data, error } = await supabaseServer
      .from("customization_options")
      .insert([{ group_id: body.group_id, label: body.label, price_modifier: body.price_modifier }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { id, type, ...updates } = body;

  let table = type === "group" ? "customization_groups" : "customization_options";
  const { data, error } = await supabaseServer.from(table).update(updates).eq("id", id).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { id, type } = body;

  let table = type === "group" ? "customization_groups" : "customization_options";
  const { error } = await supabaseServer.from(table).delete().eq("id", id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
