import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(req, { params }) {
  try {
    const { id } = params; // This is riders.id
    const body = await req.json();
    const { name, contact_number, photo_url, is_active, new_password } = body;

    // Get the rider's profile_id to update auth password and profile name
    const { data: rider, error: fetchError } = await supabaseServer
      .from("riders")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (fetchError || !rider) throw new Error("Rider not found");

    const profileId = rider.profile_id;

    if (typeof name !== 'undefined') {
      await supabaseServer.from("profiles").update({ name }).eq("id", profileId);
    }

    if (new_password) {
      await supabaseServer.auth.admin.updateUserById(profileId, { password: new_password });
    }

    const updates = {};
    if (typeof contact_number !== 'undefined') updates.contact_number = contact_number;
    if (typeof photo_url !== 'undefined') updates.photo_url = photo_url;
    if (typeof is_active !== 'undefined') updates.is_active = is_active;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseServer
        .from("riders")
        .update(updates)
        .eq("id", id);
      if (updateError) throw updateError;
    }

    return NextResponse.json({ message: "Rider updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    // Check active orders
    const { data: activeOrders, error: orderError } = await supabaseServer
      .from("orders")
      .select("id")
      .eq("rider_id", id)
      .eq("status", "out_for_delivery");

    if (orderError) throw orderError;

    if (activeOrders && activeOrders.length > 0 && !force) {
      return NextResponse.json({ 
        warning: `This rider has ${activeOrders.length} active deliveries.`,
        activeCount: activeOrders.length 
      }, { status: 409 });
    }

    const { data: rider, error: fetchError } = await supabaseServer
      .from("riders")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (fetchError || !rider) throw new Error("Rider not found");

    // Deactivate rider
    await supabaseServer.from("riders").update({ is_active: false }).eq("id", id);
    
    // Disable auth
    // Note: To prevent login conceptually without deleting, we change password or user app_metadata,
    // we can also rely on login check. Supabase doesn't have a direct 'ban' in JS easily without ban API,
    // so we rely on the credential provider check "if (!is_active)"
    
    return NextResponse.json({ message: "Rider deactivated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}