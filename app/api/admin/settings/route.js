import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCachedSettings, clearSettingsCache } from "@/lib/settingsCache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settingsMap = await getCachedSettings();
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await req.json();

    // Validation
    for (const [key, value] of Object.entries(updates)) {
      if (key === "deliveryFee") {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0) {
          return NextResponse.json({ error: "deliveryFee must be a positive number" }, { status: 400 });
        }
      }
      if (typeof value === "string" && value.length > 500) {
        return NextResponse.json({ error: `${key} must be under 500 characters` }, { status: 400 });
      }
    }

    const upserts = Object.keys(updates).map(key => ({
      key,
      value: updates[key]
    }));

    if (upserts.length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabaseServer
      .from("settings")
      .upsert(upserts, { onConflict: "key" });

    if (error) throw error;

    clearSettingsCache();

    return NextResponse.json({ success: true, settings: updates });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
