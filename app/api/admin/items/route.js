import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";
import { getSession } from "../../../../lib/getSession";

export async function GET(request) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  let query = supabaseServer.from("menu_items").select("*, categories(name)");
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { data, error } = await supabaseServer.from("menu_items").insert([body]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
