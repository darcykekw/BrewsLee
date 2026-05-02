import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    const body = await req.json();
    const { cartItems, deliveryMethod, addressData, selectedAddressId, orderNotes, deliveryFee } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (deliveryMethod !== "delivery" && deliveryMethod !== "pickup") {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const profileId = session?.user?.id;

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to order." }, { status: 401 });
    }

    // Calculate total from cartItems
    const itemsTotal = cartItems.reduce((acc, item) => acc + item.itemSubtotal, 0);
    const grandTotal = itemsTotal + (deliveryMethod === "delivery" ? deliveryFee : 0);

    let finalAddressSnapshot = null;
    let savedAddressId = null;

    if (deliveryMethod === "delivery") {
      if (selectedAddressId) {
         // Fetch the selected address to snapshot it
         const { data: addressObj, error: addrErr } = await supabaseServer
           .from("addresses")
           .select("*")
           .eq("id", selectedAddressId)
           .single();
         if (addrErr || !addressObj) throw new Error("Invalid address selected");
         
         finalAddressSnapshot = JSON.stringify({
            full_address: addressObj.full_address,
            floor_unit: addressObj.floor_unit,
            landmark: addressObj.landmark,
            label: addressObj.label
         });
      } else if (addressData) {
         if (!addressData.fullAddress || addressData.fullAddress.trim() === "") {
            return NextResponse.json({ error: "Full address is required for delivery" }, { status: 400 });
         }
         finalAddressSnapshot = JSON.stringify({
            full_address: addressData.fullAddress,
            floor_unit: addressData.floorUnit,
            landmark: addressData.landmark,
            label: addressData.label || "Manual"
         });

         // Optionally save it if requested & logged in
         if (profileId && addressData.saveAddress) {
            const { data: newAddress, error: saveErr } = await supabaseServer
              .from("addresses")
              .insert({
                 profile_id: profileId,
                 label: addressData.label || "Other",
                 full_address: addressData.fullAddress,
                 floor_unit: addressData.floorUnit || null,
                 landmark: addressData.landmark || null
              })
              .select("id")
              .single();
            if (!saveErr && newAddress) {
               savedAddressId = newAddress.id;
            }
         }
      } else {
         return NextResponse.json({ error: "No address provided for delivery" }, { status: 400 });
      }
    } else {
      finalAddressSnapshot = JSON.stringify({ shop: true });
    }

    // 1. Insert into orders table
    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .insert({
        profile_id: profileId,
        status: "pending",
        delivery_method: deliveryMethod,
        address_snapshot: finalAddressSnapshot,
        total: grandTotal,
        delivery_fee: deliveryMethod === "delivery" ? deliveryFee : 0,
        notes: orderNotes || null
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItemsData = cartItems.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.basePrice,
      selected_options: JSON.stringify(item.selectedOptions) // Storing exact config snapshot
    }));

    const { error: itemsError } = await supabaseServer
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // 3. Insert order_status_logs
    const { error: logError } = await supabaseServer
      .from("order_status_logs")
      .insert({
        order_id: order.id,
        status: "pending",
        changed_by: profileId
      });

    if (logError) throw logError;

    return NextResponse.json({ success: true, orderToken: order.id });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}