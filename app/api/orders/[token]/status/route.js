import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { token } = params;

    const { data: order, error } = await supabaseServer
      .from("orders")
      .select(`
        status,
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

    const formattedResponse = {
      status: order.status,
      statusLogs: order.logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      riderAssignment: order.rider && order.rider.length > 0 ? {
        name: order.rider[0].riders?.profiles?.name,
        contact: order.rider[0].riders?.contact_number,
        photoUrl: order.rider[0].riders?.profiles?.image_url
      } : null
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
