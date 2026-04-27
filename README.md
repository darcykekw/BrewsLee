# ☕ Tap N' Brew

A full-stack Coffee Shop Online Ordering & Delivery System built with **Next.js 14**, **Supabase** (PostgreSQL, Auth, Storage), **NextAuth.js**, and **Tailwind CSS**. 

This system features public menu browsing, a dynamic cart, user checkouts, an advanced admin dashboard for complete menu control (category, item, customization logic), rider management, and real-time capable data management.

---

## 🚀 How to Fully Set Up This Project

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Supabase Account** (Create a free project at [Supabase](https://supabase.com))
- **Google Cloud Platform Account** (for Google OAuth credentials)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` (or create a new `.env.local` file), and populate it:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://your_db_url:5432/postgres
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
ADMIN_EMAILS=your_email@domain.com,anotheradmin@example.com
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
This project has a programmatic setup file that spins up all the necessary SQL tables, RLS policies, and basic seed data onto your Supabase project.

Make sure your `DATABASE_URL` is set in your `.env.local` and run:

```bash
node setup-db.js
```

### 5. Run the Application
Launch the Next.js development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📚 Project Phases Documentation (What Has Been Done)

### Phase 1: Scaffolding, Styling, and Database Provisioning
- Established the base Next.js 14 App Router project.
- Styled using Tailwind CSS featuring a custom branded palette (brown, cream, gold).
- **Database Architecture (`setup-db.js`)**: Created a master migration script that automatically provisions `categories`, `menu_items`, `customization_groups`, `customization_options`, `profiles`, `riders`, `addresses`, `orders`, and more on Supabase PostgreSQL.
- Inserted strict Row Level Security (RLS) policies and connected an automatic `menu-items` public storage bucket via Supabase Storage.

### Phase 2: Authentication & Role Management (NextAuth + Supabase)
- **NextAuth Integration**: Used `authOptions` to securely manage JWT sessions in combination with direct database inserts using the `supabaseServer` pattern via Service Role.
- Set up a dual-provider Auth system: 
  - **Google OAuth** for Customers and Admins (Admins assigned dynamically using a whitelist in the `.env.local`).
  - **Credentials Provider** explicitly for **Riders**, mapping directly against the custom `riders` and `profiles` proxy table login identifiers.
- Added strict Next.js API Middleware to protect `/admin`, `/rider`, and `/profile` routes based on specific session roles.

### Phase 3: Admin Menu & Customizations Management
- Built a secure, optimistic admin panel under `/app/admin/menu/items`.
- Configured real-time, optimistic-loading UIs allowing the shop Admin to actively toggle features such as "Sold Out" or "Featured".
- **Nested Customizations**: Created a hierarchy interface for Admins to design "Required" vs "Optional" groups (e.g. Size, Sugar Level) holding multiple price-modifying options.
- Automated Cloud image FormData uploading handling direct item thumbnails strictly connected to Supabase Storage APIs.

### Phase 4: Admin Rider Management
- Developed the dashboard for Administrators to seamlessly provision new delivery accounts using `app/api/admin/riders/route.js`.
- Bypassed forced email authentication via internal emails format (`rider_[username]@coffeeshop.internal`) managed safely by the NextAuth credentials adapter.
- Exposed editing tools for updating rider metrics (photo, name, password reset) alongside a safe "soft deactivate" toggle flagging. Contains warning logic protecting deletions if a Rider currently has uncompleted `out_for_delivery` orders tied to them.

### Phase 5: User Menu Browsing & Cart System
- **Categories and Filtering**: Scaled the public landing page into a fully reactive display filtering dynamically by active menu items and linked categories.
- **Cart Context Provider**: Implemented a globally persisted cookie-based cart context (`CartContext.js` / `cartUtils.js`) storing data arrays efficiently between sessions.
- **Item Configurator**: Built an interactive modal that locks cart-addition depending on `Required` customization selections calculating price math recursively in real-time.
- **Global Drawer**: Created an aesthetic Cart sliding drawer enabling users to visually alter sub-totals and increment options securely.

### Phase 6: Checkout Process & Order Placement
- Built a fully robust 4-step Next.js guided Wizard validating state progressions.
- **Delivery vs Self-Pickup**: Smart UI forms switching between shop pickup timings or mapping out physical addresses dynamically populated via logged-in users' `addresses` relational table data.
- **API Transaction Payload (`/api/orders/place/route.js`)**: Resolves guest sessions actively utilizing random UUIDs if unauthenticated. Takes strict snapshots of delivery locations, commits full configurations of the user's cart into individual `order_items`, and successfully stamps down auditable records in `order_status_logs` returning a trackable ticket cleanly.
