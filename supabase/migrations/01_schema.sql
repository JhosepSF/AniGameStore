-- Supabase Migrations - AniGames Store
-- 01_schema.sql: Core Relational Database Design

-- Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Populate Default Roles
INSERT INTO public.roles (name, description) VALUES
('Superadmin', 'Access to all platform modules, configurations, and administrative actions.'),
('Administrador', 'Manage products, inventory, users, and reports.'),
('Vendedor', 'Manage products, store inventory, and review orders.'),
('Soporte', 'Access user questions, reviews, and platform support chats.'),
('Cliente', 'Default registered buyer profile.')
ON CONFLICT (name) DO NOTHING;

-- Create Profiles Table (extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),
    avatar_url TEXT,
    points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Roles Table (Many-to-Many mapping)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id INT REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role_id)
);

-- Addresses Table (Multiple shipping options)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) DEFAULT 'Mi dirección', -- e.g., Casa, Trabajo
    full_name VARCHAR(200) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Peru' NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    internal_code VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    long_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    franchise VARCHAR(150), -- e.g., One Piece, Naruto
    price_normal DECIMAL(10, 2) NOT NULL CHECK (price_normal >= 0),
    price_offer DECIMAL(10, 2) CHECK (price_offer >= 0),
    price_wholesale DECIMAL(10, 2) CHECK (price_wholesale >= 0),
    discount_percentage INT DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    stock_reserved INT DEFAULT 0 CHECK (stock_reserved >= 0),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'out_of_stock')),
    rating_avg DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_avg BETWEEN 0.00 AND 5.00),
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    display_order INT DEFAULT 0 NOT NULL
);

-- Product Videos Table
CREATE TABLE IF NOT EXISTS public.product_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    video_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Product Variants Table (Sizes, Colors, Editions)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    sku_variant VARCHAR(100) UNIQUE NOT NULL,
    variant_type VARCHAR(100) NOT NULL, -- e.g., Talla, Color, Edición
    variant_value VARCHAR(100) NOT NULL, -- e.g., XL, Neon Green, Collector
    price_adjustment DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    stock INT DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL
);

-- Product Tags Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.product_tags (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (product_id, tag_id)
);

-- Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- Support guest carts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wishlists Table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) DEFAULT 'Favoritos' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(wishlist_id, product_id)
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
    min_purchase DECIMAL(10, 2) DEFAULT 0.00 CHECK (min_purchase >= 0.00),
    max_discount DECIMAL(10, 2) CHECK (max_discount >= 0.00),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT CHECK (usage_limit >= 0),
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., AG-202606-XXXX
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Preparing', 'Sent', 'In Transit', 'Delivered', 'Cancelled', 'Returned')),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00 CHECK (shipping_cost >= 0),
    tax DECIMAL(10, 2) DEFAULT 0.00 CHECK (tax >= 0),
    discount DECIMAL(10, 2) DEFAULT 0.00 CHECK (discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    coupon_id UUID REFERENCES public.coupons(id),
    shipping_address JSONB NOT NULL, -- Snapshots shipping address details
    shipping_method VARCHAR(100),
    tracking_code VARCHAR(100),
    notes TEXT,
    cashback_earned DECIMAL(10, 2) DEFAULT 0.00 CHECK (cashback_earned >= 0),
    points_earned INT DEFAULT 0 CHECK (points_earned >= 0),
    wallet_amount_used DECIMAL(10, 2) DEFAULT 0.00 CHECK (wallet_amount_used >= 0),
    points_amount_used INT DEFAULT 0 CHECK (points_amount_used >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    gateway VARCHAR(100) NOT NULL, -- Culqi, Mercado Pago, Stripe, PayPal, Yape, Plin, Transfer
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    courier VARCHAR(100) NOT NULL, -- Olva Courier, Shalom, Marvisur, Serpost
    tracking_code VARCHAR(100),
    cost DECIMAL(10, 2) DEFAULT 0.00 CHECK (cost >= 0),
    status VARCHAR(50) DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'failed', 'returned')),
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shipment Tracking History
CREATE TABLE IF NOT EXISTS public.shipment_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status_description TEXT NOT NULL,
    checkpoint_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Coupon Usages
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reward Movements (Loyalty Points Transactions)
CREATE TABLE IF NOT EXISTS public.reward_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INT NOT NULL, -- positive for credit, negative for debit
    type VARCHAR(50) NOT NULL, -- purchase_earned, purchase_redeemed, referral_bonus, adjustments
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallet Movements (Virtual Cashback Balance Transactions)
CREATE TABLE IF NOT EXISTS public.wallet_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- positive for credit, negative for debit
    type VARCHAR(50) NOT NULL, -- cashback_credit, purchase_redeemed, refund, manual_adjustment
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Referrals System
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The inviter
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL, -- The invitee
    status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'purchase_completed', 'rewarded')),
    points_credited BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true, -- Admin moderation option
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Review Images
CREATE TABLE IF NOT EXISTS public.review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL
);

-- Product Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Question Answers
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Live Chat Support System
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Platform Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, order_update, promo, referral
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts (Marketing Content)
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Promo Banners (Home Hero Slider)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url VARCHAR(255),
    display_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Promotional Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    discount_percentage INT DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Platform Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- e.g., UPDATE_PRODUCT_STOCK
    table_name VARCHAR(100) NOT NULL,
    row_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Efficient SQL Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_franchise ON public.products(franchise);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_movements_user ON public.wallet_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_movements_user ON public.reward_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
