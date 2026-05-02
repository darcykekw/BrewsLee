import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const adminName = session.user.name || "admin";

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["ready", "completed"];
    if (!validStatuses.includes(status)) throw new Error("Invalid status update from admin");

    const { data: updated, error: updateError } = await supabaseServer
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    await supabaseServer
      .from("order_status_logs")
      .insert({
        order_id: id,
        status,
        changed_by: adminName
      });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
