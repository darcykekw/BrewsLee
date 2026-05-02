import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const adminName = session.user.name || "admin";

    const { id } = params;
    const body = await req.json();
    const { riderId } = body;

    if (!riderId) throw new Error("Rider ID is required");

    const { data: rider, error: riderError } = await supabaseServer
      .from("riders")
      .select("is_active, profiles(name)")
      .eq("id", riderId)
      .single();

    if (riderError || !rider) throw new Error("Rider not found");
    if (!rider.is_active) throw new Error("Rider is not active");

    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    if (orderError || !order) throw new Error("Order not found");
    if (order.status !== "preparing") throw new Error("Order must be preparing before assignment");

    const { error: assignError } = await supabaseServer
      .from("rider_assignments")
      .upsert({ order_id: id, rider_id: riderId });

    if (assignError) throw assignError;

    // Based on requirements, keeping order status as "preparing" but adding a log entry for rider assignment
    await supabaseServer
      .from("order_status_logs")
      .insert({
        order_id: id,
        status: "preparing",
        changed_by: `${adminName} - assigned rider ${rider.profiles?.name || riderId}`
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
