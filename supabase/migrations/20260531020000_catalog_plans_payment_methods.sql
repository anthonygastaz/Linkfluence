-- Investment plan catalog + payment methods (admin-managed, user-readable)

CREATE TABLE IF NOT EXISTS public.investment_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  yield_percent numeric NOT NULL DEFAULT 1.5,
  duration_days integer NOT NULL DEFAULT 30,
  min_amount numeric NOT NULL DEFAULT 30,
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  method_type text NOT NULL DEFAULT 'crypto',
  address text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active investment plans" ON public.investment_plans;
CREATE POLICY "Anyone can read active investment plans"
  ON public.investment_plans FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read enabled payment methods" ON public.payment_methods;
CREATE POLICY "Anyone can read enabled payment methods"
  ON public.payment_methods FOR SELECT
  USING (enabled = true);

-- Seed defaults (idempotent)
INSERT INTO public.investment_plans (id, name, yield_percent, duration_days, min_amount, description, sort_order)
VALUES
  ('p1', 'Starter Plan', 1.5, 30, 30, 'Ideal for aspiring creators starting to monetize their link shares. Standard click & geo tracking with weekly Monday payouts.', 1),
  ('p2', 'Growth Plan', 2.2, 60, 50, 'Perfect for growing content makers with an active click flow. Includes full device and link analytics.', 2),
  ('p3', 'Pro Premier Plan', 3.0, 90, 100, 'Optimized for professional creators seeking maximum daily yield. Includes real-time dashboard API hook and custom UTM Sub-IDs.', 3),
  ('p4', 'Executive Plan', 4.5, 180, 200, 'Engineered for high-volume networks, agencies, and large publishers. Comes with on-demand payouts and custom DNS cloaked domains.', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_methods (id, name, method_type, address, enabled, description, sort_order)
VALUES
  ('usdt-trc', 'USDT (TRC20)', 'crypto', 'TLeS3Z9rXv89U6p7YQ18n5DmVyF9oWk2bX', true, 'TRON low-fee stablecoin network settlement.', 1),
  ('usdt-erc', 'USDT (ERC20)', 'crypto', '0x78a9c3b88d01ef0023a8901cb001f3df91a8291f', true, 'Ethereum standard network stablecoin transaction routing.', 2),
  ('btc', 'Bitcoin (BTC)', 'crypto', 'bc1q9p3a5d8f6k7m2x1y8g9n3w4r0t5y8j0u2a', true, 'Direct Satoshi on-chain allocation address.', 3),
  ('credit', 'Credit Card', 'gateway', 'Visa / Mastercard Automated Terminal', true, 'Instant fiat billing using secure merchant APIs.', 4),
  ('paypal', 'PayPal Gateway', 'gateway', 'paypal-sandbox@linkfluence.com', true, 'Simulated fast authentication payment flow.', 5),
  ('bank', 'Bank Wire', 'bank', 'BENEFICIARY: LINKFLUENCE GLOBAL LTD, Bank Ref: LF-PORTAL', true, 'Settle institutional wires through bank routing.', 6)
ON CONFLICT (id) DO NOTHING;

-- Admin catalog RPCs (same auth model as profiles)
CREATE OR REPLACE FUNCTION public.admin_list_investment_plans(p_username text, p_password text)
RETURNS SETOF public.investment_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  RETURN QUERY SELECT * FROM public.investment_plans ORDER BY sort_order, name;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_investment_plan(
  p_username text, p_password text, p_plan jsonb
)
RETURNS public.investment_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result public.investment_plans;
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  INSERT INTO public.investment_plans (
    id, name, yield_percent, duration_days, min_amount, description, is_active, sort_order, updated_at
  ) VALUES (
    COALESCE(NULLIF(p_plan->>'id', ''), 'plan-' || extract(epoch from now())::bigint::text),
    p_plan->>'name',
    COALESCE((p_plan->>'yield_percent')::numeric, (p_plan->>'yield')::numeric, 1.5),
    COALESCE((p_plan->>'duration_days')::integer, (p_plan->>'days')::integer, 30),
    COALESCE((p_plan->>'min_amount')::numeric, (p_plan->>'min')::numeric, 30),
    COALESCE(p_plan->>'description', p_plan->>'desc', ''),
    COALESCE((p_plan->>'is_active')::boolean, true),
    COALESCE((p_plan->>'sort_order')::integer, 0),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    yield_percent = EXCLUDED.yield_percent,
    duration_days = EXCLUDED.duration_days,
    min_amount = EXCLUDED.min_amount,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_investment_plan(
  p_username text, p_password text, p_id text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  DELETE FROM public.investment_plans WHERE id = p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_payment_methods(p_username text, p_password text)
RETURNS SETOF public.payment_methods
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  RETURN QUERY SELECT * FROM public.payment_methods ORDER BY sort_order, name;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_payment_method(
  p_username text, p_password text, p_method jsonb
)
RETURNS public.payment_methods
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result public.payment_methods;
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  INSERT INTO public.payment_methods (
    id, name, method_type, address, enabled, description, sort_order, updated_at
  ) VALUES (
    COALESCE(NULLIF(p_method->>'id', ''), 'gateway-' || extract(epoch from now())::bigint::text),
    p_method->>'name',
    COALESCE(p_method->>'method_type', p_method->>'type', 'crypto'),
    COALESCE(p_method->>'address', ''),
    COALESCE((p_method->>'enabled')::boolean, true),
    COALESCE(p_method->>'description', p_method->>'desc', ''),
    COALESCE((p_method->>'sort_order')::integer, 0),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    method_type = EXCLUDED.method_type,
    address = EXCLUDED.address,
    enabled = EXCLUDED.enabled,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    updated_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_payment_method(
  p_username text, p_password text, p_id text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  DELETE FROM public.payment_methods WHERE id = p_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_investment_plans(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_investment_plan(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_investment_plan(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_payment_methods(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_payment_method(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_payment_method(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_investment_plans(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_investment_plan(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_investment_plan(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_payment_methods(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_payment_method(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_payment_method(text, text, text) TO anon, authenticated;

GRANT SELECT ON public.investment_plans TO anon, authenticated;
GRANT SELECT ON public.payment_methods TO anon, authenticated;

-- Realtime sync for user dashboards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'investment_plans'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.investment_plans;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_methods'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_methods;
  END IF;
END $$;
