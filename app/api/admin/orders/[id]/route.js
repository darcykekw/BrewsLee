import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { data: order, error } = await supabaseServer
      .from("orders")
      .select(`
        *,
        profiles:profiles(name, email),
        items:order_items(
          id, quantity, unit_price, selected_options, menu_item_id,
          menu_items:menu_items(name)
        ),
        logs:order_status_logs(
          id, status, changed_by, created_at
        ),
        rider:rider_assignments(
          rider_id, riders:riders(profile_id, contact_number, profiles:profiles(name))
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    const formattedOrder = {
      ...order,
      logs: order.logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      items: order.items.map(i => ({
        ...i,
        name: i.menu_items ? i.menu_items.name : "Unknown Item",
        selected_options: typeof i.selected_options === 'string' ? JSON.parse(i.selected_options) : i.selected_options
      }))
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
