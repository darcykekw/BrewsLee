const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// We need to encode the password if it has special characters (like single quotes)
let connectionString = process.env.DATABASE_URL;
if (connectionString) {
  // Try to repair the connection string password encoding automatically
  const match = connectionString.match(/postgresql:\/\/([^:]+):(.+)@(.+)/);
  if (match) {
    const [_, user, rawPassword, rest] = match;
    const encodedPassword = encodeURIComponent(rawPassword);
    connectionString = `postgresql://${user}:${encodedPassword}@${rest}`;
  }
}

const client = new Client({
  connectionString,
});

const sql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES table (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    photo_url TEXT,
    role TEXT CHECK (role IN ('customer', 'admin', 'rider')) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RIDERS table
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contact_number TEXT,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADDRESSES table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    full_address TEXT NOT NULL,
    floor_unit TEXT,
    landmark TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- MENU ITEMS table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CUSTOMIZATION GROUPS
CREATE TABLE customization_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false
);

-- CUSTOMIZATION OPTIONS
CREATE TABLE customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    price_modifier DECIMAL(10, 2) DEFAULT 0.00 NOT NULL
);

-- ORDERS table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_token UUID,
    status TEXT CHECK (status IN ('pending', 'preparing', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'picked_up', 'cancelled')) DEFAULT 'pending',
    delivery_method TEXT CHECK (delivery_method IN ('delivery', 'pickup')) NOT NULL,
    address_snapshot JSONB,
    total DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDER ITEMS table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    selected_options JSONB
);

-- ORDER STATUS LOGS table
CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RIDER ASSIGNMENTS table
CREATE TABLE rider_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(order_id)
);

-- SETTINGS table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- USER FAVORITES table
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE(profile_id, menu_item_id)
);

-- INDEXES for perf overrides
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_rider_assign_rider ON rider_assignments(rider_id);

-- BASIC RLS POLICIES (Enabling row-level security across tables)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active configuration, categories and menu items
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menu Items viewable by everyone" ON menu_items FOR SELECT USING (true);
ALTER TABLE customization_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customizations viewable by everyone" ON customization_groups FOR SELECT USING (true);
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customization options viewable by everyone" ON customization_options FOR SELECT USING (true);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);

-- Customer specific views policies (Allows reads for Profile and Order rows conditionally depending on Auth setup)
-- NOTE: True RLS with Auth matches would require Auth tokens linking -> auth.uid()
CREATE POLICY "Users can Read/Update their own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Setup defaults for shop configs
INSERT INTO settings (key, value) VALUES
  ('shop_name', 'Tap N'' Brew'),
  ('shop_address', '123 Coffee Street, Metro Manila'),
  ('contact_number', '+639123456789'),
  ('contact_email', 'hello@tapnbrew.com'),
  ('delivery_fee', '50.00'),
  ('est_delivery_time', '30-45 mins'),
  ('est_pickup_time', '15 mins'),
  ('operating_hours', '8:00 AM - 10:00 PM'),
  ('announcement_banner', 'Welcome to the Tap n'' Brew Online Store!');
`;

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully. Executing schema queries...');
    await client.query(sql);
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error executing database setup:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();
