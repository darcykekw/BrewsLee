import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    // Note: To fetch nested relations, we use the foreign key relationships established in the DB schema
    const { data: categories, error } = await supabaseServer
      .from("categories")
      .select(`
        id, 
        name, 
        display_order,
        items:menu_items (
          id, 
          name, 
          description, 
          price, 
          image_url, 
          is_available, 
          is_featured,
          customizationGroups:customization_groups (
            id, 
            name, 
            is_required,
            customizationOptions:customization_options (
              id, 
              label, 
              price_modifier
            )
          )
        )
      `)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(error);
      throw error;
    }

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
