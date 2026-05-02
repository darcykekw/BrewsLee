import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const { label, full_address, floor_unit, landmark, is_default } = await req.json();

    // Verify ownership
    const { data: currentAddress, error: checkError } = await supabaseServer
      .from("addresses")
      .select("profile_id, is_default")
      .eq("id", id)
      .single();

    if (checkError || !currentAddress) throw new Error("Address not found");
    if (currentAddress.profile_id !== session.user.id) throw new Error("Forbidden");

    // If making default, unset others first
    if (is_default && !currentAddress.is_default) {
      await supabaseServer
        .from("addresses")
        .update({ is_default: false })
        .eq("profile_id", session.user.id);
    } // wait, if they say is_default: false, and it is the ONLY one, maybe prevent it? We will just let them unset it, or we could prevent it but whatever.

    const { data, error } = await supabaseServer
      .from("addresses")
      .update({ label, full_address, floor_unit, landmark, is_default })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, address: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    // Verify ownership
    const { data: currentAddress, error: checkError } = await supabaseServer
      .from("addresses")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (checkError || !currentAddress) throw new Error("Address not found");
    if (currentAddress.profile_id !== session.user.id) throw new Error("Forbidden");

    const { error } = await supabaseServer
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
