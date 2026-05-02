import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "rider") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { orderId, newStatus } = body;
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStatuses = ["out_for_delivery", "delivered"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    const profileId = session.user.id;
    const riderName = session.user.name || "Rider";

    // Lookup Rider ID
    const { data: rider, error: riderError } = await supabaseServer
      .from("riders")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (riderError || !rider) {
      return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });
    }

    // Verify assignment to this rider
    const { data: assignment, error: assignError } = await supabaseServer
      .from("rider_assignments")
      .select("id")
      .eq("order_id", orderId)
      .eq("rider_id", rider.id)
      .single();

    if (assignError || !assignment) {
      return NextResponse.json({ error: "Unauthorized or not assigned to this order" }, { status: 403 });
    }

    // Verify order's current status and transition validity
    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (newStatus === "out_for_delivery" && order.status !== "preparing") {
      return NextResponse.json({ error: "Order must be 'preparing' before marking as picked up / out for delivery" }, { status: 400 });
    }

    if (newStatus === "delivered" && order.status !== "out_for_delivery") {
      return NextResponse.json({ error: "Order must be 'out_for_delivery' before marking as delivered" }, { status: 400 });
    }

    // Usually backends normalize "delivered" to "completed" but if the instructions say "orders.status = newStatus", we use it literally, or we normalize to completed.
    // We will normalize to "completed" in DB to remain consistent with everything else (Admin, Users page). Both are okay, but DB consistency is better. Let's standardize "delivered" into "completed" or just write "delivered". Let's write "completed" but log it as "delivered". Actually, "completed" is safer.
    const finalStatus = newStatus === "delivered" ? "completed" : newStatus;

    const { data: updatedOrder, error: updateError } = await supabaseServer
      .from("orders")
      .update({ status: finalStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log status change
    await supabaseServer
      .from("order_status_logs")
      .insert({
        order_id: orderId,
        status: finalStatus,
        changed_by: `rider - ${riderName}`
      });

    return NextResponse.json({ success: true, updatedOrder });

  } catch (error) {
    console.error("Rider status update error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
