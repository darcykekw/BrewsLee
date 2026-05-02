import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // local time for consistent labeling

  try {
    for (let i = 6; i >= 0; i--) {
      // Calculate start of 'this' day
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - i);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const startIso = targetDate.toISOString();
      const endIso = nextDate.toISOString();

      const { count, error } = await supabaseServer
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startIso)
        .lt("created_at", endIso);

      if (error) throw error;
      
      const parts = targetDate.toDateString().split(" ");
      // e.g. "Mon Apr 21"
      const label = `${parts[0]} ${parts[1]} ${parts[2]}`;

      result.push({
        date: label,
        count: count || 0
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
