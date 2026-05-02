import { supabaseServer } from "@/lib/supabaseServer";
import TrackClient from "./TrackClient";
import Link from "next/link";

export default async function TrackPage({ params }) {
  const { orderToken } = params;
  let formattedOrder = null;
  let errState = false;
  let orderNotFound = false;

  try {
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
      .eq("id", orderToken)
      .single();

    if (error || !order) {
      orderNotFound = true;
    } else {
      formattedOrder = {
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
    }
  } catch (err) {
    console.error(err);
    errState = true;
  }

  if (errState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold text-red-600">Something went wrong fetching order tracking data.</h1>
      </div>
    );
  }

  if (orderNotFound || !formattedOrder) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-brown-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          We couldn&apos;t locate an order with the provided tracking link. It may be invalid or the order was removed.
        </p>
        <Link href="/menu" className="bg-brown-600 hover:bg-brown-700 text-white font-bold py-3 px-6 rounded-lg transition">
          Return to Menu
        </Link>
      </div>
    );
  }

  return <TrackClient initialOrder={formattedOrder} token={orderToken} />;
}
