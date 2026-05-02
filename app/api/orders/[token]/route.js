import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { token } = params;

    const { data: order, error } = await supabaseServer
      .from("orders")
      .select(`
        *,
        profiles:profiles(name, email, contact_number),
        items:order_items(
          id, quantity, unit_price, selected_options, menu_item_id,
          menu_items:menu_items(name, image_url)
        ),
        logs:order_status_logs(
          id, status, created_at, changed_by
        ),
        rider:rider_assignments(
          rider_id, riders:riders(profile_id, contact_number, profiles:profiles(name, image_url))
        )
      `)
      .eq("guest_token", token)
      .single();

    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const formattedOrder = {
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total: order.total,
      delivery_method: order.delivery_method,
      guest_token: order.guest_token,
      address_snapshot: typeof order.address_snapshot === 'string' ? JSON.parse(order.address_snapshot) : order.address_snapshot,
      customer_name: order.profiles ? order.profiles.name : "Guest",
      contact_number: order.profiles ? order.profiles.contact_number : "N/A",
      notes: order.notes,
      logs: order.logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      items: order.items.map(i => ({
        ...i,
        name: i.menu_items ? i.menu_items.name : "Unknown Item",
        image_url: i.menu_items ? i.menu_items.image_url : null,
        selected_options: typeof i.selected_options === 'string' ? JSON.parse(i.selected_options) : i.selected_options
      })),
      riderAssignment: order.rider && order.rider.length > 0 ? {
        name: order.rider[0].riders?.profiles?.name,
        contact: order.rider[0].riders?.contact_number,
        photoUrl: order.rider[0].riders?.profiles?.image_url
      } : null
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
