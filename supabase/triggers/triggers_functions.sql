-- Supabase Migrations - AniGames Store
-- triggers_functions.sql: SQL Triggers, Store Procedures and Hooks

-- 1. Function: Automatically update "updated_at" timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to main operational tables
CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. Function & Trigger: Sync public.profiles when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id INT;
BEGIN
    -- Insert a profile row
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, avatar_url, points_balance, wallet_balance)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url',
        100, -- 100 free points on sign up!
        0.00
    );

    -- Get Cliente role ID
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'Cliente';
    
    -- Assign default role
    IF default_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.id, default_role_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth users
CREATE OR REPLACE TRIGGER trigger_sync_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Function & Trigger: Manage Stock Deductions upon Order Payment
CREATE OR REPLACE FUNCTION public.manage_stock_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    has_sufficient_stock BOOLEAN := true;
BEGIN
    -- Check if order transitioned to 'Paid' (payment completed)
    IF NEW.status = 'Paid' AND OLD.status = 'Pending' THEN
        
        -- Loop order items and check stock levels
        FOR item IN (SELECT product_id, variant_id, quantity, name FROM public.order_items WHERE order_id = NEW.id) LOOP
            -- Check variants stock if variant_id is provided
            IF item.variant_id IS NOT NULL THEN
                IF (SELECT stock FROM public.product_variants WHERE id = item.variant_id) < item.quantity THEN
                    RAISE EXCEPTION 'Stock insuficiente para el producto/variante: %', item.name;
                END IF;
            ELSE
                -- Check standard product stock
                IF (SELECT stock FROM public.products WHERE id = item.product_id) < item.quantity THEN
                    RAISE EXCEPTION 'Stock insuficiente para el producto: %', item.name;
                END IF;
            END IF;
        END LOOP;

        -- Deduct stock since levels are valid
        FOR item IN (SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = NEW.id) LOOP
            IF item.variant_id IS NOT NULL THEN
                UPDATE public.product_variants
                SET stock = stock - item.quantity
                WHERE id = item.variant_id;
            END IF;

            UPDATE public.products
            SET stock = stock - item.quantity,
                sales_count = sales_count + item.quantity
            WHERE id = item.product_id;
        END LOOP;

        -- Create a audit entry for order paid
        INSERT INTO public.audit_logs (user_id, action, table_name, row_id, new_values)
        VALUES (NEW.user_id, 'ORDER_PAID_STOCK_DEDUCTED', 'orders', NEW.id::text, json_build_object('order_number', NEW.order_number, 'total', NEW.total));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_order_stock_reduction
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.manage_stock_on_payment();


-- 4. Function & Trigger: Cashback Rewards & Loyalty Points Crediting
CREATE OR REPLACE FUNCTION public.process_rewards_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
    calc_cashback DECIMAL(10, 2);
    calc_points INT;
    referral_record RECORD;
BEGIN
    -- Trigger when order is marked 'Delivered' (successfully completed)
    IF NEW.status = 'Delivered' AND OLD.status <> 'Delivered' THEN
        -- Calculate cashback (5% of order subtotal)
        calc_cashback := ROUND((NEW.subtotal * 0.05)::numeric, 2);
        -- Calculate points (1 point per dollar/sol of subtotal)
        calc_points := FLOOR(NEW.subtotal)::INT;

        -- Save calculations inside order columns
        UPDATE public.orders
        SET cashback_earned = calc_cashback,
            points_earned = calc_points
        WHERE id = NEW.id;

        -- Add cashback to user's wallet
        UPDATE public.profiles
        SET wallet_balance = wallet_balance + calc_cashback,
            points_balance = points_balance + calc_points
        WHERE id = NEW.user_id;

        -- Record cashback movement
        INSERT INTO public.wallet_movements (user_id, amount, type, description)
        VALUES (NEW.user_id, calc_cashback, 'cashback_credit', 'Cashback acumulado por compra ' || NEW.order_number);

        -- Record points movement
        INSERT INTO public.reward_movements (user_id, amount, type, description)
        VALUES (NEW.user_id, calc_points, 'purchase_earned', 'Puntos acumulados por compra ' || NEW.order_number);

        -- Handle Referral check (if this is the user's first completed order)
        IF NOT EXISTS (
            SELECT 1 FROM public.orders 
            WHERE user_id = NEW.user_id 
              AND status = 'Delivered' 
              AND id <> NEW.id
        ) THEN
            -- Find if user was referred by someone
            SELECT * INTO referral_record FROM public.referrals 
            WHERE referred_id = NEW.user_id AND status = 'registered' LIMIT 1;
            
            IF referral_record.id IS NOT NULL THEN
                -- Credit 500 reward points to referrer (inviter)
                UPDATE public.profiles
                SET points_balance = points_balance + 500
                WHERE id = referral_record.referrer_id;

                INSERT INTO public.reward_movements (user_id, amount, type, description)
                VALUES (referral_record.referrer_id, 500, 'referral_bonus', 'Bono por referido registrado completando compra.');

                -- Credit 20.00 wallet currency to referred (invitee)
                UPDATE public.profiles
                SET wallet_balance = wallet_balance + 20.00
                WHERE id = NEW.user_id;

                INSERT INTO public.wallet_movements (user_id, amount, type, description)
                VALUES (NEW.user_id, 20.00, 'referral_bonus', 'Bono de bienvenida por invitación de referido.');

                -- Update referral status
                UPDATE public.referrals
                SET status = 'purchase_completed', points_credited = true
                WHERE id = referral_record.id;
            END IF;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_order_rewards
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.process_rewards_on_delivery();
