-- Linkfluence: profiles auto-create, admin_users, RLS, admin RPC helpers

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Extend profiles with columns the app expects
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS kyc_submitted_file boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kyc_approved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kyc_doc_type text,
  ADD COLUMN IF NOT EXISTS kyc_doc_num text,
  ADD COLUMN IF NOT EXISTS kyc_file_name text,
  ADD COLUMN IF NOT EXISTS kyc_full_name text,
  ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS kyc_file_base64 text,
  ADD COLUMN IF NOT EXISTS active_plans jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS transactions jsonb DEFAULT '[]'::jsonb;

-- Ensure email uniqueness for upsert-on-conflict flows
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles (lower(email));

-- Independent admin credentials (not linked to profiles)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  password_hash text NOT NULL,
  display_name text DEFAULT 'System Administrator',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT admin_users_username_unique UNIQUE (username)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin accounts are managed in admin_users (insert via Supabase SQL editor or migration).

-- Auto-create profile row when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    country,
    phone,
    balance,
    total_profit,
    total_withdrawals,
    total_investments,
    kyc_status,
    kyc_submitted_file,
    kyc_approved,
    active_plans,
    transactions
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'country', 'United States'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    0,
    0,
    0,
    0,
    'Unregistered',
    false,
    false,
    '[]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- RLS: users manage their own profile; admins use SECURITY DEFINER RPCs
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin credential check (server-side only via RPC)
CREATE OR REPLACE FUNCTION public.verify_admin(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(username) = lower(trim(p_username))
      AND is_active = true
      AND password_hash = extensions.crypt(p_password, password_hash)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_assert(p_username text, p_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin(p_username, p_password) THEN
    RAISE EXCEPTION 'Invalid admin credentials';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_profiles(p_username text, p_password text)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  RETURN QUERY SELECT * FROM public.profiles ORDER BY email;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_profile(
  p_username text,
  p_password text,
  p_profile jsonb
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
  target_id uuid;
BEGIN
  PERFORM public.admin_assert(p_username, p_password);

  target_id := NULLIF(p_profile->>'id', '')::uuid;

  IF target_id IS NULL THEN
    SELECT id INTO target_id
    FROM public.profiles
    WHERE lower(email) = lower(trim(p_profile->>'email'))
    LIMIT 1;
  END IF;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Profile requires an existing auth user id or email';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    country,
    phone,
    balance,
    total_profit,
    total_withdrawals,
    total_investments,
    kyc_status,
    kyc_submitted_file,
    kyc_approved,
    kyc_doc_type,
    kyc_doc_num,
    kyc_file_name,
    kyc_full_name,
    kyc_submitted_at,
    kyc_file_base64,
    active_plans,
    transactions
  )
  VALUES (
    target_id,
    lower(trim(p_profile->>'email')),
    COALESCE(p_profile->>'name', split_part(p_profile->>'email', '@', 1)),
    COALESCE(p_profile->>'country', 'United States'),
    COALESCE(p_profile->>'phone', ''),
    COALESCE((p_profile->>'balance')::numeric, 0),
    COALESCE((p_profile->>'total_profit')::numeric, 0),
    COALESCE((p_profile->>'total_withdrawals')::numeric, 0),
    COALESCE((p_profile->>'total_investments')::numeric, 0),
    COALESCE(p_profile->>'kyc_status', 'Unregistered'),
    COALESCE((p_profile->>'kyc_submitted_file')::boolean, false),
    COALESCE((p_profile->>'kyc_approved')::boolean, false),
    p_profile->>'kyc_doc_type',
    p_profile->>'kyc_doc_num',
    p_profile->>'kyc_file_name',
    p_profile->>'kyc_full_name',
    NULLIF(p_profile->>'kyc_submitted_at', '')::timestamptz,
    p_profile->>'kyc_file_base64',
    COALESCE(p_profile->'active_plans', '[]'::jsonb),
    COALESCE(p_profile->'transactions', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    country = EXCLUDED.country,
    phone = EXCLUDED.phone,
    balance = EXCLUDED.balance,
    total_profit = EXCLUDED.total_profit,
    total_withdrawals = EXCLUDED.total_withdrawals,
    total_investments = EXCLUDED.total_investments,
    kyc_status = EXCLUDED.kyc_status,
    kyc_submitted_file = EXCLUDED.kyc_submitted_file,
    kyc_approved = EXCLUDED.kyc_approved,
    kyc_doc_type = EXCLUDED.kyc_doc_type,
    kyc_doc_num = EXCLUDED.kyc_doc_num,
    kyc_file_name = EXCLUDED.kyc_file_name,
    kyc_full_name = EXCLUDED.kyc_full_name,
    kyc_submitted_at = EXCLUDED.kyc_submitted_at,
    kyc_file_base64 = EXCLUDED.kyc_file_base64,
    active_plans = EXCLUDED.active_plans,
    transactions = EXCLUDED.transactions
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_profile(
  p_username text,
  p_password text,
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  DELETE FROM public.profiles WHERE lower(email) = lower(trim(p_email));
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_all_profiles(
  p_username text,
  p_password text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  PERFORM public.admin_assert(p_username, p_password);
  DELETE FROM public.profiles;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_assert(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_profiles(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_profile(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_profile(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_all_profiles(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.verify_admin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_profile(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_profile(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_all_profiles(text, text) TO anon, authenticated;
