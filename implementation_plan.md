# Implementation Plan - AniGames Store

This document outlines the architecture, database design, visual design system, and step-by-step implementation strategy for the **AniGames Store** eCommerce platform. 

## Goal Description

We will build a high-performance, responsive, and visually stunning eCommerce platform inspired by Temu, AliExpress, and Amazon, specifically tailored for the anime, gaming, and geek culture. 
The platform will feature:
1. **Premium Dark Neon Visuals**: Custom styling with glassmorphism, animated glow effects, and micro-interactions.
2. **Robust Backend Integration**: Supplying full PostgreSQL SQL migrations for Supabase (tables, indices, triggers, and Row Level Security) and a frontend service layer that works in **dual-mode** (real Supabase or interactive mock mode if environment variables are not yet configured).
3. **Advanced Customer Features**: Search with filters, custom products catalog, multi-step checkout (address, shipping method, mock payment, confirmation), digital wallet with cashback, rewards/loyalty points, refer-a-friend system, tracking shipments, and real-time live support chat mock.
4. **Professional Admin Dashboard**: Manage inventory, products CRUD (with variants, prices, and tags), order processing, coupons, blogs, banners, and view analytics reports.
5. **SEO & PWA**: Friendly URLs, schema.org JSON-LD microdata, metadata tags, sitemap, and progressive web app setup.

---

## User Review Required

We recommend focusing reviews on the following aspects:
> [!IMPORTANT]
> **Dual-Mode Backend Architecture:** To ensure the project runs out-of-the-box, the services (Auth, Database, Storage) will check for `.env` credentials. If missing, it falls back to an in-memory/localStorage mock state. Setting up Supabase variables in `.env` will instantly activate the real Supabase integration.
> 
> **Edge Functions & Payment Mocking:** The Edge Functions for Culqi, Mercado Pago, Stripe, Yape/Plin, and PayPal will be provided as SQL script skeletons and simulated frontend calls.
> 
> **TypeScript Transition:** We will convert the project dependencies to support TypeScript, configuring `tsconfig.json` and changing files to `.ts`/`.tsx` where appropriate.

---

## Open Questions

> [!NOTE]
> 1. **Local Dev Server Port**: The current `vite.config.js` is configured to run on port `3000` with Render configurations. We will preserve this but make sure TypeScript support does not break it.
> 2. **Logo & Asset Generation**: We will generate high-fidelity branding assets (logo, banners, product mockups) using the image generation tool to ensure professional visual feedback.

---

## Proposed Changes

We will group our work into structured phases to maintain codebase stability.

### 1. Project Infrastructure & TypeScript Configuration

We will transition the project to TypeScript, install the necessary dependencies, and set up the directory structure.

#### [MODIFY] [package.json](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/package.json)
- Add TypeScript (`typescript`, `tsc`, `@types/react`, `@types/react-dom`, `@types/react-router-dom`).
- Add Zustand, Lucide React, Framer Motion, and Supabase client libraries (`@supabase/supabase-js`, `zustand`, `lucide-react`, `framer-motion`).
- Keep existing styling libraries (Tailwind CSS 3.x, PostCSS, Autoprefixer).

#### [NEW] [tsconfig.json](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/tsconfig.json)
- Standard TypeScript configuration for Vite React projects.

#### [MODIFY] [vite.config.js](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/vite.config.js) -> Rename to [vite.config.ts](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/vite.config.ts)
- Add alias support (`@` to `src`) and TypeScript-compatible settings.

---

### 2. Database Schema (Supabase & PostgreSQL)

We will create the database tables, indices, RLS policies, triggers, and realistic seed data under a new `supabase/` folder.

#### [NEW] [migrations.sql](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/migrations/01_schema.sql)
Create relational structures:
- **Core Accounts**: `profiles`, `roles`, `user_roles`, `addresses`.
- **Catalog**: `categories`, `subcategories`, `brands`, `products`, `product_images`, `product_variants`, `tags`, `product_tags`.
- **Transactions**: `carts`, `cart_items`, `wishlists`, `wishlist_items`, `favorites`, `orders`, `order_items`, `payments`, `shipments`, `shipment_tracking`.
- **Promotions & Rewards**: `coupons`, `coupon_usages`, `rewards` (loyalty points), `reward_movements`, `wallet` (cashback), `wallet_movements`.
- **Customer Interactions**: `reviews`, `review_images`, `questions`, `answers`, `notifications`, `chat_rooms`, `chat_messages`.
- **Marketing & Content**: `blogs`, `banners`, `campaigns`, `referrals`, `audit_logs`.

#### [NEW] [rls_policies.sql](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/policies/rls_policies.sql)
- Enable RLS on all tables.
- Define row-level policies checking authentication state and user roles (Superadmin, Admin, Vendedor, Cliente, Soporte).

#### [NEW] [triggers_functions.sql](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/triggers/triggers_functions.sql)
- **Profile creation**: Sync from `auth.users`.
- **Stock updates**: Automatically reduce stock upon payment confirmation, block orders exceeding stock limit.
- **Cashback & Wallet**: Automatically credit cashback percentage upon order completion.
- **Auditing**: Log actions to `audit_logs`.

#### [NEW] [seed.sql](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/seed.sql)
- Populate categories (One Piece, Naruto, Dragon Ball, Demon Slayer, Pokémon, Genshin Impact, Gaming, Tecnología, Coleccionables, Figuras, Llaveros, Posters, etc.).
- Inject 15+ rich product datasets, specifications, variants, pricing, and stock.
- Populate initial banners, blog entries, and promotional coupons.

---

### 3. Frontend Development & Design System

We will implement the dark futuristic theme with neon highlights in CSS and create layout/UI components.

#### [NEW] [global.css](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/styles/global.css)
- Dark-theme setup: Primary background `#0d0e17`, card background `#171926`.
- Accent glow utility classes: Neon pink `#ff007f`, cyan `#00f0ff`, lime green `#39ff14`.
- Glassmorphic card styling.

#### [NEW] [supabaseClient.ts](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/lib/supabaseClient.ts)
- Connect to Supabase Auth and Database using environmental variables.

#### [NEW] [Service Layers](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/services/)
Create TypeScript stateful client wrappers containing fallback mock data:
- `authService.ts`, `productService.ts`, `cartService.ts`, `orderService.ts`, `paymentService.ts`, `couponService.ts`, `wishlistService.ts`, `reviewService.ts`, `notificationService.ts`, `adminService.ts`, `chatService.ts`.

#### [NEW] [Zustand Stores](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/stores/)
- `authStore.ts` (Active user, role, address profile).
- `cartStore.ts` (Real-time cart additions, sync with mock/live database, quantity checks, discount code states).
- `searchStore.ts` (Query states, filters, sorting criteria).

#### [NEW] [Components Layout & UI](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/components/)
- **Layout**: Navbar (categories dropdown, live glowing search bar, user menu, cart preview badge), Footer (links, social, payment methods badge), ChatBubble (live floating agent chat).
- **Core UI**: Button, Input, Modal, Badge, Card (with custom hover neon border glowing animation).

---

### 4. Pages & Functional Flows

#### [NEW] [Home Page](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Home.tsx)
- Hero section (carousel banner with animations).
- Category badges.
- Flash sales module (with neon countdown timer).
- Dynamic tabs: Bestsellers, Recommendations, New Arrivals.
- Anime and Gaming featured category galleries.
- Brands slider & Newsletter.

#### [NEW] [Catalog / Advanced Search Page](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Catalog.tsx)
- Sidebar filters (Categories, Anime/Franquicia, Brand, Price Range Slider, Customer Rating, Discount).
- Real-time instant-search results with neon indicators.
- Grid/List layouts.

#### [NEW] [Product Details Page](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/ProductDetails.tsx)
- Image gallery with magnifying hover zoom.
- Price highlights (normal price vs flash discount + savings badge).
- Dynamic variants selector (Size, Color, Edition) with stock constraints.
- Shipping options (Olva, Shalom, Shalom tracking estimation).
- Review section: Stars distribution, photo reviews, questions and answers block.

#### [NEW] [Checkout Flow Page](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Checkout.tsx)
4-Step Form Wizard:
- **Step 1 (Shipping Address)**: Form valid with multiple saved addresses.
- **Step 2 (Shipping Method)**: Options (Olva Courier, Shalom, Express Delivery) with real-time cost calculator.
- **Step 3 (Payment Method)**: Select Stripe, PayPal, Yape/Plin, Mercado Pago, Bank Transfer. Render mock modals with inputs.
- **Step 4 (Confirmation)**: Final invoice breakdown (Items total, shipping, applied coupon, cashback/rewards used, order ID).

#### [NEW] [Client Panel](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/ClientDashboard.tsx)
- Profile updates.
- Orders tracking history (Interactive stepper: Pending -> Paid -> Preparing -> Sent -> In Transit -> Delivered).
- Wallet (Virtual cash balance, cashbacks earned history).
- Referral Dashboard (Unique referral link, count of referrals, points gained).

#### [NEW] [Admin Panel Dashboard](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/AdminDashboard.tsx)
- Analytics tab: Dynamic mock charts (Sales curves, active users, top-performing categories).
- Products Management tab: Full CRUD (Add, edit stock/pricing, assign tags/images, set variants).
- Orders Management tab: Status transitions selector (Preparing, Shipped, etc.) and tracking code assignments.
- Coupons and Campaigns management tabs.

---

### 5. PWA, SEO & Deployment

#### [NEW] [manifest.json](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/manifest.json) & [serviceWorker.js](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/sw.js)
- Core service worker caching offline assets and basic offline page indicator.

#### [NEW] [sitemap.xml](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/sitemap.xml) & [robots.txt](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/robots.txt)
- Search Engine Optimizations guidelines.

---

## Verification Plan

We will conduct strict manual validation steps.

### Automated Checks
- **TypeScript Compilation**: Run `tsc --noEmit` to ensure type checks pass.
- **Production Build**: Run `npm run build` to verify standard compiling with Vite.

### Manual Verification
- Test registration/login (both Supabase Auth simulation and real client connection).
- Test catalog filter matching (filtering by category "Naruto", sorting by price low-to-high).
- Test checkout flow: add item to cart, apply coupon code "NEONGEEK" (15% off), complete checkout, verify order is saved in the active state, check product stock depletion, verify customer wallet accrues 5% cashback.
- Test tracking module: input a tracking code (e.g. `SH-9837482`) and ensure visual status updates accordingly.
- Test Admin panel: modify product stock and confirm details instantly refresh in the catalog.
- Verify responsive layout across Desktop, Tablet, and Mobile widths.
