import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "rider") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const profileId = session.user.id;

    // Get rider ID
    const { data: rider, error: riderError } = await supabaseServer
      .from("riders")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (riderError || !rider) return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });

    const page = parseInt(req.nextUrl?.searchParams?.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    // Get all assignments for this rider and their related order details
    const { data: assignments, error: assignError } = await supabaseServer
      .from("rider_assignments")
      .select(`
        order_id,
        orders (
          id, created_at, status, total, delivery_method, address_snapshot, guest_token,
          profiles (name, contact_number),
          items:order_items (
            id, quantity, unit_price, selected_options, menu_item_id,
            menu_items (name)
          )
        )
      `)
      .eq("rider_id", rider.id)
      .order("created_at", { ascending: false });

    if (assignError) throw assignError;

    const active = [];
    const completed = [];

    assignments.forEach((assignment) => {
      const o = assignment.orders;
      if (!o) return;

      const orderData = {
        id: o.id,
        created_at: o.created_at,
        status: o.status,
        total: o.total,
        delivery_method: o.delivery_method,
        address_snapshot: typeof o.address_snapshot === 'string' ? JSON.parse(o.address_snapshot) : o.address_snapshot,
        customer_name: o.profiles ? o.profiles.name : "Guest",
        contact_number: o.profiles ? o.profiles.contact_number : "N/A",
        items: o.items.map((i) => ({
          ...i,
          name: i.menu_items ? i.menu_items.name : "Unknown Item",
          selected_options: typeof i.selected_options === 'string' ? JSON.parse(i.selected_options) : i.selected_options
        }))
      };

      if (["preparing", "out_for_delivery"].includes(orderData.status)) {
        active.push(orderData);
      } else if (["delivered", "completed", "picked_up"].includes(orderData.status)) {
        completed.push(orderData);
      }
    });

    // Sort active to show newest on top
    active.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // Sort completed
    completed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Manually paginate completed orders
    const paginatedCompleted = completed.slice(offset, offset + limit);

    return NextResponse.json({
      active,
      completed: paginatedCompleted,
      completedTotal: completed.length,
      page,
      totalPages: Math.ceil(completed.length / limit) || 1
    });

  } catch (error) {
    console.error("fetch rider orders error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
