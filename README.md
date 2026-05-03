# Brews Lee

A full-stack Coffee Shop Online Ordering & Delivery System built with **Next.js 14**, **Supabase** (PostgreSQL, Auth, Storage), **NextAuth.js**, and **Tailwind CSS**. 

This system features a highly interactive and visually stunning public landing page with modern "Quiet Luxury" aesthetics, seamless Framer Motion animations, a dynamic cart, user checkouts, an advanced admin dashboard for complete menu control (category, item, customization logic), rider management, and real-time capable data management.

---

## How to Set Up This Project

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
*(Note: Running this command will automatically download and install all required packages, including recent UI additions like `@radix-ui/react-slot` and `class-variance-authority`, because they are natively tracked in the `package.json` file. You do not need to install them individually.)*

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

## Recent Updates & UI Enhancements

- **Brand Evolution**: Complete rebranding from "Tap N' Brew" to **"Brews Lee"**, integrating high-quality, AI-processed transparent PNG assets for menu items.
- **Quiet Luxury Aesthetics**: Refined the visual hierarchy utilizing a custom coffee-shop color palette (`#FFF8F0`, `#C08552`, `#8C5A3C`, `#4B2E2B`), glassmorphism effects, and elegant dark overlays.
- **Cinematic Landing Page**:
  - Implemented a smooth, auto-playing dual-row **Text Marquee** using `framer-motion` to showcase brand messaging ("Taste the Passion", "The Taste That Lingers") with inline icon separators.
  - Added the Shadcn **BlurFade** component to gracefully animate the hero section elements, taglines, and pricing pill badges as they scroll into view.
  - Integrated an interactive **Menu Scroll Gallery** component built on WebGL and scroll-triggered animations to beautifully parade the featured beverages without page navigation.
  - Upgraded the **Hero Section** with a dynamic Shutter Text effect and a dark-mode optimized background.
- **High-End Authentication Overhaul**:
  - Completely redesigned the Login and Register pages using a premium "Quiet Luxury" **Glassmorphism** component featuring gold-tinted borders, dynamic glow orbs, and a cinematic `BrewsLeeBackground.png` overlay.
  - Implemented a clean **Go Back** UI button utilizing `@radix-ui` and Tailwind variants, allowing seamless navigation back to the hero landing page.
  - Suppressed the global navigation bar (`ConditionalNav`) from appearing over the authentication pages to preserve visual immersion.
- **Route Protection & Middleware**: 
  - The `/menu` ordering page is now strictly protected. Unauthenticated users (guests) attempting to access the menu or any static assets within `/public/menu/` are gracefully redirected to the `/login` flow.
  - Replaced native `next/image` components with standard HTML `<img>` tags on heavily styled landing page backgrounds to bypass deep Next.js JIT cache/optimization bugs and ensure 100% render reliability on massive (7.1 MB) background assets.
- **Component & Dependency Cleanup**: 
  - Safely removed deprecated experimental WebGL components (`CircularGallery`, `LightRays`, `Beams`, `FluidParticlesBackground`) to strictly adhere to the polished design system.
  - Natively purged heavy, unused server-side AI packages (`@imgly/background-removal-node`, `color-diff`, `pg`) and wiped the `.next` local cache, successfully reclaiming over **2 Gigabytes** of project disk space.
- **Order Tracking Updates**: Updated the order tracking UI to dynamically reflect the new Brews Lee branding during both Delivery and Self-Pickup flows.
