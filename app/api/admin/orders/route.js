import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabaseServer
      .from("orders")
      .select(`
        id, created_at, status, total, delivery_method, guest_token, profile_id,
        profiles(name),
        items:order_items(id)
      `, { count: "exact" });

    if (status && status !== "All") {
      query = query.eq("status", status.toLowerCase());
    }

    const { data: orders, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedOrders = orders.map(o => ({
      id: o.id,
      created_at: o.created_at,
      status: o.status,
      total: o.total,
      delivery_method: o.delivery_method,
      customer_name: o.profiles ? o.profiles.name : "Guest",
      item_count: o.items.length,
      guest_token: o.guest_token
    }));

    return NextResponse.json({
      orders: formattedOrders,
      totalCount: count,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
