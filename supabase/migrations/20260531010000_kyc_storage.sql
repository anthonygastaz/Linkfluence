-- KYC document storage bucket + profile file path column

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_file_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "KYC users insert own folder" ON storage.objects;
CREATE POLICY "KYC users insert own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "KYC users read own folder" ON storage.objects;
CREATE POLICY "KYC users read own folder"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "KYC users update own folder" ON storage.objects;
CREATE POLICY "KYC users update own folder"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "KYC users delete own folder" ON storage.objects;
CREATE POLICY "KYC users delete own folder"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Extend admin upsert to persist storage path
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
    id, email, name, country, phone,
    balance, total_profit, total_withdrawals, total_investments,
    kyc_status, kyc_submitted_file, kyc_approved,
    kyc_doc_type, kyc_doc_num, kyc_file_name, kyc_full_name,
    kyc_submitted_at, kyc_file_base64, kyc_file_path,
    active_plans, transactions
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
    p_profile->>'kyc_file_path',
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
    kyc_file_path = EXCLUDED.kyc_file_path,
    active_plans = EXCLUDED.active_plans,
    transactions = EXCLUDED.transactions
  RETURNING * INTO result;

  RETURN result;
END;
$$;
