import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req, { params }) {
  try {
    const { token } = params;

    // Get order items from previous order
    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .select(`
        id, guest_token,
        items:order_items(
          menu_item_id, quantity, selected_options,
          menu_items(id, name, is_available, price, image_url, category_id)
        )
      `)
      .eq("guest_token", token)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const availableItems = [];
    const unavailableItems = [];

    order.items.forEach(item => {
      const menuItem = item.menu_items;
      if (!menuItem) return;

      if (menuItem.is_available) {
        const selectedOptions = typeof item.selected_options === 'string' 
          ? JSON.parse(item.selected_options || '{}') 
          : item.selected_options || {};

        availableItems.push({
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          image_url: menuItem.image_url,
          options: selectedOptions
        });
      } else {
        unavailableItems.push(menuItem.name);
      }
    });

    return NextResponse.json({ availableItems, unavailableItems });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
