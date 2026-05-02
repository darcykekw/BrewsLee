import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get start and end of today in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startIso = today.toISOString();
  const endIso = tomorrow.toISOString();

  try {
    // Today's orders
    const { data: todayOrdersData, error: err1 } = await supabaseServer
      .from("orders")
      .select("total, status")
      .gte("created_at", startIso)
      .lt("created_at", endIso);
    
    if (err1) throw err1;

    const todayOrders = todayOrdersData.length;
    const revenueToday = todayOrdersData
      .filter(order => order.status === "delivered")
      .reduce((acc, order) => acc + (Number(order.total) || 0), 0);

    // Pending orders (all time, or just today? Usually all pending)
    const { count: pendingOrders, error: err2 } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    
    if (err2) throw err2;

    // Out for delivery
    const { count: outForDelivery, error: err3 } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "out_for_delivery");
    
    if (err3) throw err3;

    return NextResponse.json({
      todayOrders,
      pendingOrders,
      outForDelivery,
      revenueToday
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
