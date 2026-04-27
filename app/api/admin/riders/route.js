import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data: riders, error } = await supabaseServer
      .from("riders")
      .select(`
        id,
        contact_number,
        is_active,
        photo_url,
        profiles!inner(id, name, email)
      `);

    if (error) throw error;

    // We can also fetch active orders for these riders, assuming orders has a rider_id
    const { data: activeOrders, error: orderError } = await supabaseServer
      .from("orders")
      .select("id, rider_id, status")
      .eq("status", "out_for_delivery");

    const activeOrderMap = {};
    if (!orderError && activeOrders) {
      activeOrders.forEach(o => {
        if (!activeOrderMap[o.rider_id]) activeOrderMap[o.rider_id] = [];
        activeOrderMap[o.rider_id].push(o.id);
      });
    }

    const formattedRiders = riders.map(r => ({
      id: r.id,
      profile_id: r.profiles.id,
      name: r.profiles.name,
      email: r.profiles.email,
      username: r.profiles.email.replace("rider_", "").replace("@coffeeshop.internal", ""),
      contact_number: r.contact_number,
      is_active: r.is_active,
      photo_url: r.photo_url,
      active_deliveries: activeOrderMap[r.id] || []
    }));

    return NextResponse.json(formattedRiders);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, username, password, contact_number, photo_url } = body;

    if (!name || !username || !password || !contact_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const internalEmail = `rider_${username}@coffeeshop.internal`;

    // 1. Create auth user with Admin API
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true,
      user_metadata: { name, role: "rider" }
    });

    if (authError) throw authError;

    const supabaseUserId = authData.user.id;

    // 2. Insert into profiles (may fail if trigger creates it, so we upsert or handle gracefully)
    // Some setups auto-create profile via trigger. Let's try upsert.
    const { error: profileError } = await supabaseServer
      .from("profiles")
      .upsert({ id: supabaseUserId, name: name, role: "rider", email: internalEmail });

    if (profileError) {
       console.warn("Profile upsert warning (trigger may have acted):", profileError);
    }

    // 3. Insert into riders table
    const { data: riderData, error: riderError } = await supabaseServer
      .from("riders")
      .insert({ profile_id: supabaseUserId, contact_number, is_active: true, photo_url: photo_url || null })
      .select()
      .single();

    if (riderError) throw riderError;

    return NextResponse.json({ message: "Rider created successfully", rider: riderData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}