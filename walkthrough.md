# Walkthrough - AniGames Store Development

This walkthrough summarizes the architecture, design choices, database schema, page modules, and configurations implemented to build the **AniGames Store** platform.

---

## 🎌 What Was Accomplished

We successfully developed and structured the entire codebase of the eCommerce platform. The system operates in a **dual-mode**: it integrates with Supabase variables, falling back to a fully interactive mock state if the environment variables are not yet configured in `.env`.

### 1. TypeScript & Bundling Infrastructure
- **Dependency Upgrades:** Configured `package.json` with TypeScript, Zustand, Zod, Framer Motion, Lucide React, and `@supabase/supabase-js`.
- **TypeScript Configs:** Set up [tsconfig.json](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/tsconfig.json) with appropriate bundler resolution pathways and path mapping.
- **Vite Setup:** Created [vite.config.ts](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/vite.config.ts) and deleted obsolete configuration files to avoid compilation conflicts.
- **Code Clean-up:** Removed legacy JSX code templates and files like `App.jsx`, `main.jsx`, and `PanelPrincipal.jsx`.

### 2. Supabase PostgreSQL Schema, Policies & Triggers
The backend structure is detailed in SQL scripts inside the `supabase/` folder:
- [01_schema.sql (Migrations)](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/migrations/01_schema.sql): Creates public schemas for user profiles, saved multiple shipping addresses, categories, products, variant configurations (pricing adjustments & stocks), transaction invoices (`orders`, `order_items`, `payments`), coupons, rewards loyalty points, virtual cashback wallet, live chat support channels, campaigns, and audit logs.
- [rls_policies.sql (RLS)](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/policies/rls_policies.sql): Enables RLS on all tables, granting read access for catalogs to public sessions, while restricting transactions and profiles to authenticated owners and admins.
- [triggers_functions.sql (Automation)](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/triggers/triggers_functions.sql):
  - Automatically syncs profile rows on user registration.
  - Automatically reduces stock levels when order statuses transition to 'Paid'.
  - Automatically credits a 5% cashback to the virtual wallet and adds loyalty points when order statuses transition to 'Delivered'.
  - Credits referral bonuses (500 pts to referrer, S/ 20 to referee) on the invitee's first completed order.
- [seed.sql (Mock Data)](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/supabase/seed.sql): Populates initial data including 3 promotional codes (like `NEONGEEK` for 15% off), hero slides, blog posts, and 6 highly detailed product datasets (Luffy Gear 5, Nezuko Nendoroid, Razer mechanical keyboards, Switch OLED, etc.) with stocks and pricing details.

### 3. Visual Styling & Component Layouts
- [global.css](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/styles/global.css) and [tailwind.config.js](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/tailwind.config.js): Establishes custom colors (neon pink, neon cyan, neon green) and shadow glow values, alongside Google Fonts loading (Outfit and Space Grotesk).
- [Navbar.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/components/layout/Navbar.tsx): Header with quick search input suggestions, categories, shopping cart quantity indicators, and session profile details.
- [Footer.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/components/layout/Footer.tsx): Responsive links displaying payment method icons and couriers.
- [ChatBubble.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/components/layout/ChatBubble.tsx): Floating support chat console. User inputs trigger simulated, context-aware operator answers within 1.5 seconds.
- [ProductCard.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/components/ui/ProductCard.tsx): Styled card rendering image scales, neon border glows, off percentage indicators, rating stars, and quick add-to-cart handlers.

### 4. Interactive Pages
- [Home.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Home.tsx): Hero banner promotion slider, countdown flash sales timer module, category links, and store guarantees.
- [Catalog.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Catalog.tsx): Sidebar search layout filters category, price slider, and franchise tags. Syncs instantly with query inputs in the Navbar.
- [ProductDetails.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/ProductDetails.tsx): Magnifying lens hover zoom preview, quantity selector with stock limits, variants selector, review forms, and interactive question-and-answers.
- [Cart.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Cart.tsx): Quantity modifiers, coupon validations, and wallet/points checkboxes.
- [Checkout.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Checkout.tsx): 4-step wizard checkout (address selector or new form, shipping courier calculators, simulated Stripe card/QR code views, and transaction confirmation).
- [ClientDashboard.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/ClientDashboard.tsx): Editable profile form, digital wallet balance, points transaction logs, unique referral link copy tool, and visual order tracking history.
- [AdminDashboard.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/AdminDashboard.tsx): Analytics metrics card, catalog product list CRUD with addition modal, orders status dispatcher, and security audit log table.
- [Login.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/pages/Login.tsx): Tab selector to register/login, OAuth mockup buttons, and credentials tips for Superadmin test mode.

### 5. PWA, SEO & Containerization Configurations
- **PWA Capabilities:** Configured [manifest.json](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/manifest.json) for standalone display mode and register serviceWorker.js caching rules inside [main.tsx](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/src/main.tsx).
- **SEO Elements:** Formatted [index.html](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/index.html) with metadata, keywords, author, and Open Graph markers. Added indexing rules in [robots.txt](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/robots.txt) and [sitemap.xml](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/public/sitemap.xml).
- **Docker Setup:** Provided a multi-stage [Dockerfile](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/Dockerfile) building static assets and serving them through [nginx.conf](file:///c:/Users/JhosepSF/Documents/Jhosep/FISI/Posgrado/Maestria/Comercio%20Electr%C3%B3nico%20y%20Negocios%20Digitales/AniGameStore/nginx.conf) SPA routing configurations.

---

## 🧪 Verification & Results

We validated the project through both automated checks and manual verification.

### Automated Checks
- **TypeScript Compilation:** Evaluated code against the compiler parameters (`npx tsc --noEmit`). Verified compiling completed successfully with **zero errors**.
- **Production Build:** Ran compilation build (`npm run build`). Vite parsed assets, bundle-split elements, and output compiled HTML/JS files correctly.

### Verified User Journeys (Manual Walkthrough)
1. **Catalog Instant Filter Sync:** Typing "luffy" in the navigation bar matches and displays the Luffy Gear 5 figure.
2. **Product Q&A and Zoom:** Hovering over the product image scales and details the specific coordinate. Writing a new question submits it instantly and displays an automatic answer from support after 3 seconds.
3. **Cart Cashback & Coupons:** Adding a figure, applying coupon `NEONGEEK` deducts 15% from the subtotal. Checkboxes allow using virtual wallet funds and loyalty points.
4. **Checkout Processing:** Form validation blocks empty checkout submissions. Completing the 4-step wizard generates a new invoice, deducts items from product stock, awards 5% cashback, and registers transaction detail logs.
5. **Interactive Support Chat:** Message bubble accepts customer messages and returns responses from Sophia (Support) within 1.5 seconds.
6. **Admin CRUD and Dispatches:** Logging in as Superadmin (`admin@anigames.com` / `admin123`) unlocks administrative modules, allowing products to be added, stock to be updated, and orders to be dispatched.
7. **Yape/Plin/Transferencia Verification Workflow:** Completing checkout using manual payments sets the initial order status to `Pending` (displayed as `Pendiente de Pago`). The SweetAlert confirmation explicitly notifies the user that their order is pending verification of the operation code. The Admin Dashboard displays the payment method and operation number (transaction ID) and adds a "Confirmar Pago" action button for manual validation, which transitions the status to `Paid` (`Pagado`) and updates the payment row to `completed`.
8. **Wishlist Redirect & Favorites Persistence:** Guest users clicking the heart icon on any product card or in the product details configurator are greeted with a prompt to log in, redirecting them to the login form. Logged-in users toggle favorites with persistent client state (synced with `localStorage`) and receive glowing toast messages confirming addition or deletion.

