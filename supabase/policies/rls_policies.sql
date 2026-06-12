-- Supabase Migrations - AniGames Store
-- rls_policies.sql: Row Level Security Configuration

-- Helper Function to check if a user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid 
          AND r.name IN ('Superadmin', 'Administrador')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to check if a user is support staff
CREATE OR REPLACE FUNCTION public.is_support(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid 
          AND r.name IN ('Superadmin', 'Administrador', 'Vendedor', 'Soporte')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Profiles Table Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow users to update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admin full control on profiles" 
ON public.profiles FOR ALL 
USING (public.is_admin(auth.uid()));


-- 2. Addresses Table Policies
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own addresses" 
ON public.addresses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own addresses" 
ON public.addresses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own addresses" 
ON public.addresses FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own addresses" 
ON public.addresses FOR DELETE 
USING (auth.uid() = user_id);


-- 3. Catalog (Products, Categories, Brands, Variants, Tags) - Read-Only for Public, Write for Admin/Vendedor
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Public Category Read" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Public Subcategory Read" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public Brand Read" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public Product Read" ON public.products FOR SELECT USING (status = 'active' OR public.is_admin(auth.uid()));
CREATE POLICY "Public Product Images Read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public Product Videos Read" ON public.product_videos FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Public Product Variants Read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public Tags Read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public Product Tags Read" ON public.product_tags FOR SELECT USING (true);

-- Admin CRUD write policies
CREATE POLICY "Admin Category Write" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin Subcategory Write" ON public.subcategories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin Brand Write" ON public.brands FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin Product Write" ON public.products FOR ALL USING (public.is_support(auth.uid()));
CREATE POLICY "Admin Product Images Write" ON public.product_images FOR ALL USING (public.is_support(auth.uid()));
CREATE POLICY "Admin Product Videos Write" ON public.product_videos FOR ALL USING (public.is_support(auth.uid()));
CREATE POLICY "Admin Product Variants Write" ON public.product_variants FOR ALL USING (public.is_support(auth.uid()));
CREATE POLICY "Admin Tags Write" ON public.tags FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin Product Tags Write" ON public.product_tags FOR ALL USING (public.is_support(auth.uid()));


-- 4. Carts and Cart Items Table Policies
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carts owner view" ON public.carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Carts owner insert" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Carts owner update" ON public.carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Carts owner delete" ON public.carts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Cart Items owner select" ON public.cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Cart Items owner insert" ON public.cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Cart Items owner update" ON public.cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Cart Items owner delete" ON public.cart_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);


-- 5. Orders & Transactions Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;

-- Orders RLS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_support(auth.uid()));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin updates orders" ON public.orders FOR UPDATE USING (public.is_support(auth.uid()));

-- Order Items RLS
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_support(auth.uid())))
);
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

-- Payments RLS
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND (user_id = auth.uid() OR public.is_support(auth.uid())))
);
CREATE POLICY "System/Admin manage payments" ON public.payments FOR ALL USING (public.is_support(auth.uid()));

-- Shipments RLS
CREATE POLICY "Users view own shipments" ON public.shipments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = shipments.order_id AND (user_id = auth.uid() OR public.is_support(auth.uid())))
);
CREATE POLICY "Admin manage shipments" ON public.shipments FOR ALL USING (public.is_support(auth.uid()));

-- Shipment Tracking RLS
CREATE POLICY "Public view tracking history" ON public.shipment_tracking FOR SELECT USING (true);
CREATE POLICY "Admin manage tracking checkpoints" ON public.shipment_tracking FOR ALL USING (public.is_support(auth.uid()));


-- 6. Marketing, Wallet, Rewards & Referrals Policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Coupons View" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admin Coupons All" ON public.coupons FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users view own coupon usage" ON public.coupon_usages FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users log coupon usage" ON public.coupon_usages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own reward movements" ON public.reward_movements FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users view own wallet movements" ON public.wallet_movements FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);


-- 7. Reviews, Questions, & Answers (Interactions)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone views approved reviews" ON public.reviews FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR public.is_support(auth.uid()));
CREATE POLICY "Auth users write reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner/Admin update reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id OR public.is_support(auth.uid()));

CREATE POLICY "Everyone views review images" ON public.review_images FOR SELECT USING (true);
CREATE POLICY "Review owner uploads images" ON public.review_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.reviews WHERE id = review_images.review_id AND user_id = auth.uid())
);

CREATE POLICY "Everyone views active questions" ON public.questions FOR SELECT USING (is_active = true OR public.is_support(auth.uid()));
CREATE POLICY "Auth users ask questions" ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone views answers" ON public.answers FOR SELECT USING (true);
CREATE POLICY "Admin/Support write answers" ON public.answers FOR INSERT WITH CHECK (public.is_support(auth.uid()));


-- 8. Real-time Live Chat & Notifications Policies
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chat rooms" ON public.chat_rooms FOR SELECT USING (auth.uid() = user_id OR public.is_support(auth.uid()));
CREATE POLICY "Users open chat room" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agents assign chat rooms" ON public.chat_rooms FOR UPDATE USING (public.is_support(auth.uid()));

CREATE POLICY "Chat message select policy" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = chat_messages.room_id AND (user_id = auth.uid() OR public.is_support(auth.uid())))
);
CREATE POLICY "Chat message insert policy" ON public.chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = chat_messages.room_id AND (user_id = auth.uid() OR public.is_support(auth.uid())))
);

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications (mark read)" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- 9. Blogs, Banners, Campaigns (Marketing Core)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select blogs" ON public.blogs FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public select banners" ON public.banners FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admin manage banners" ON public.banners FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public select campaigns" ON public.campaigns FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admin manage campaigns" ON public.campaigns FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin read audits" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));
