import { createClient } from '@supabase/supabase-js';

export interface KycSignedUrlRequest {
  username?: string;
  password?: string;
  filePath?: string;
}

export interface KycSignedUrlResult {
  status: number;
  body: Record<string, unknown>;
}

export async function createKycSignedUrl(payload: KycSignedUrlRequest): Promise<KycSignedUrlResult> {
  const { username, password, filePath } = payload;

  if (!username || !password || !filePath) {
    return { status: 400, body: { error: 'Missing admin credentials or file path.' } };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return {
      status: 503,
      body: {
        error:
          'Server missing Supabase credentials. Add SUPABASE_SERVICE_ROLE_KEY for admin KYC previews.',
      },
    };
  }

  const verifyClient = createClient(supabaseUrl, anonKey);
  const { data: verified, error: verifyError } = await verifyClient.rpc('verify_admin', {
    p_username: username,
    p_password: password,
  });

  if (verifyError || verified !== true) {
    return { status: 401, body: { error: 'Invalid admin credentials.' } };
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data, error } = await adminClient.storage
    .from('kyc-documents')
    .createSignedUrl(String(filePath), 3600);

  if (error || !data?.signedUrl) {
    return { status: 404, body: { error: error?.message || 'Could not create signed URL.' } };
  }

  return { status: 200, body: { url: data.signedUrl } };
}
