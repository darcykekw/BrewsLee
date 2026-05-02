require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAuthUser(email, password, name, role) {
  let { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });

  if (authErr) {
    console.log(`User ${email} already exists or error. Fetching existing from admin API...`);
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
    if (usersData?.users) {
      const existingUser = usersData.users.find(u => u.email === email);
      if (existingUser) {
        console.log(`Found existing user ${email} with ID ${existingUser.id}`);
        await supabase.from('profiles').upsert({ id: existingUser.id, email, name, role });
        return existingUser.id;
      }
    }
    console.error("Error creating user:", email, authErr.message);
    return null;
  }

  const userId = authData.user.id;
  console.log(`Created user ${email} with ID ${userId}`);

  // Force update profile just to be safe
  await supabase.from('profiles').upsert({ id: userId, email, name, role });
  return userId;
}

async function seed() {
  console.log("Starting seed process...");

  // 1. Create Users
  const adminId = await createAuthUser("admin@tapnbrew.com", "password123", "Admin User", "admin");
  const custId = await createAuthUser("customer@tapnbrew.com", "password123", "Valued Customer", "customer");
  
  const riderUsername = "speedy";
  const riderEmail = `rider_${riderUsername}@coffeeshop.internal`;
  const riderId = await createAuthUser(riderEmail, "password123", "Speedy Rider", "rider");

  if (riderId) {
    // Upsert rider
    await supabase.from('riders').upsert({ profile_id: riderId, contact_number: "09123456789", is_active: true }, { onConflict: "profile_id" });
    console.log("Rider setup complete.");
  }

  // 2. Settings
  console.log("Seeding settings...");
  await supabase.from('settings').upsert([
    { key: "shopName", value: "BrewsLee" },
    { key: "announcementBanner", value: "Welcome to our new online ordering system! 🎉" },
    { key: "deliveryFee", value: "50" }
  ], { onConflict: "key" });

  // 3. Categories
  console.log("Seeding categories...");
  const categoriesToInsert = [
    { name: "Coffee", display_order: 1, is_active: true },
    { name: "Tea", display_order: 2, is_active: true },
    { name: "Pastries", display_order: 3, is_active: true }
  ];

  // Clear existing data to avoid constraint issues
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: cats, error: catErr } = await supabase.from('categories').insert(categoriesToInsert).select();
  if (catErr) console.error("Cat error:", catErr);

  const coffeeCatId = cats?.find(c => c.name === "Coffee")?.id;
  const pastriesCatId = cats?.find(c => c.name === "Pastries")?.id;

  if (!coffeeCatId || !pastriesCatId) {
     console.error("Failed to fetch category IDs.");
     return;
  }

  // 4. Menu Items
  console.log("Seeding menu items...");
  const menuItems = [
    { category_id: coffeeCatId, name: "Americano", description: "Classic black coffee", price: 120, is_available: true, is_featured: true },
    { category_id: coffeeCatId, name: "Iced Latte", description: "Espresso with milk over ice", price: 150, is_available: true, is_featured: true },
    { category_id: pastriesCatId, name: "Butter Croissant", description: "Flaky and buttery", price: 85, is_available: true, is_featured: false },
    { category_id: pastriesCatId, name: "Chocolate Chip Cookie", description: "Soft baked cookie", price: 60, is_available: true, is_featured: false }
  ];

  // Try to insert cleanly. We could delete existing ones first to avoid duplicates or just insert.
  // Since we don't have a unique constraint on name, let's delete all items first.
  await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: items, error: itemsErr } = await supabase.from('menu_items').insert(menuItems).select();
  if (itemsErr) console.error("Items error:", itemsErr);

  const latteId = items?.find(i => i.name === "Iced Latte")?.id;

  // 5. Customizations
  if (latteId) {
    console.log("Seeding customizations...");
    const { data: group } = await supabase.from('customization_groups').insert({
      menu_item_id: latteId,
      name: "Milk Options",
      is_required: false
    }).select().single();

    if (group) {
      await supabase.from('customization_options').insert([
        { group_id: group.id, label: "Oat Milk", price_modifier: 40 },
        { group_id: group.id, label: "Almond Milk", price_modifier: 35 }
      ]);
    }
  }

  // 6. Test Orders
  if (custId && riderId) {
    console.log("Seeding orders...");
    
    // Create an active order
    const { data: order1 } = await supabase.from('orders').insert({
      profile_id: custId,
      status: "out_for_delivery",
      delivery_method: "delivery",
      address_snapshot: JSON.stringify({ full_address: "123 Main St, Tech City", floor_unit: "Apt 4B", notes: "Leave at door" }),
      total: 250,
      delivery_fee: 50
    }).select().single();

    if (order1) {
      // Assign rider
      const { data: realRider } = await supabase.from('riders').select('id').eq('profile_id', riderId).single();
      if (realRider) {
        await supabase.from('orders').update({ rider_id: realRider.id }).eq('id', order1.id);
        await supabase.from('rider_assignments').insert({ order_id: order1.id, rider_id: realRider.id });
      }

      await supabase.from('order_items').insert([
        { order_id: order1.id, menu_item_id: latteId || null, quantity: 1, unit_price: 150, selected_options: JSON.stringify([{"groupName": "Milk Options", "label": "Oat Milk"}]) }
      ]);
    }

    // Create a completed order
    const { data: order2 } = await supabase.from('orders').insert({
      profile_id: custId,
      status: "delivered",
      delivery_method: "delivery",
      address_snapshot: JSON.stringify({ full_address: "123 Main St, Tech City", floor_unit: "Apt 4B" }),
      total: 120,
      delivery_fee: 50
    }).select().single();

    if (order2) {
      const { data: realRider } = await supabase.from('riders').select('id').eq('profile_id', riderId).single();
      if (realRider) {
        await supabase.from('orders').update({ rider_id: realRider.id }).eq('id', order2.id);
        await supabase.from('rider_assignments').insert({ order_id: order2.id, rider_id: realRider.id });
      }
    }
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("Test Accounts:");
  console.log("Customer: customer@tapnbrew.com / password123");
  console.log("Admin: admin@tapnbrew.com / password123");
  console.log("Rider (Credentials): speedy / password123\n");
}

seed().catch(console.error);
