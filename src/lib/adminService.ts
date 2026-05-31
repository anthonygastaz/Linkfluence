import { supabase, isSupabaseConfigured } from './supabaseClient';

const ADMIN_CREDS_KEY = 'linkfluence_admin_creds';

export interface AdminCredentials {
  username: string;
  password: string;
}

export function storeAdminCredentials(creds: AdminCredentials): void {
  sessionStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
  sessionStorage.setItem('linkfluence_admin_authenticated', 'true');
}

export function getAdminCredentials(): AdminCredentials | null {
  const raw = sessionStorage.getItem(ADMIN_CREDS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return null;
  }
}

export function clearAdminCredentials(): void {
  sessionStorage.removeItem(ADMIN_CREDS_KEY);
  sessionStorage.removeItem('linkfluence_admin_authenticated');
}

export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Admin login requires Supabase configuration.');
    return false;
  }

  const { data, error } = await supabase.rpc('verify_admin', {
    p_username: username,
    p_password: password,
  });

  if (error) {
    console.error('Admin verification failed:', error);
    return false;
  }

  return data === true;
}

export async function adminListProfiles(creds: AdminCredentials): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase.rpc('admin_list_profiles', {
    p_username: creds.username,
    p_password: creds.password,
  });

  if (error) throw error;
  return data || [];
}

export async function adminUpsertProfile(
  creds: AdminCredentials,
  profile: Record<string, unknown>
): Promise<any> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.rpc('admin_upsert_profile', {
    p_username: creds.username,
    p_password: creds.password,
    p_profile: profile,
  });

  if (error) throw error;
  return data;
}

export async function adminDeleteProfile(creds: AdminCredentials, email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { data, error } = await supabase.rpc('admin_delete_profile', {
    p_username: creds.username,
    p_password: creds.password,
    p_email: email,
  });

  if (error) throw error;
  return data === true;
}

export async function adminDeleteAllProfiles(creds: AdminCredentials): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const { data, error } = await supabase.rpc('admin_delete_all_profiles', {
    p_username: creds.username,
    p_password: creds.password,
  });

  if (error) throw error;
  return data || 0;
}

export async function fetchKycSignedUrl(
  creds: AdminCredentials,
  filePath: string
): Promise<string | null> {
  const res = await fetch('/api/admin/kyc-signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: creds.username,
      password: creds.password,
      filePath,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.url || null;
}

// --- Investment plan catalog (admin) ---

export async function adminListInvestmentPlans(creds: AdminCredentials): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.rpc('admin_list_investment_plans', {
    p_username: creds.username,
    p_password: creds.password,
  });
  if (error) throw error;
  return data || [];
}

export async function adminUpsertInvestmentPlan(creds: AdminCredentials, plan: Record<string, unknown>) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc('admin_upsert_investment_plan', {
    p_username: creds.username,
    p_password: creds.password,
    p_plan: plan,
  });
  if (error) throw error;
  return data;
}

export async function adminDeleteInvestmentPlan(creds: AdminCredentials, id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { data, error } = await supabase.rpc('admin_delete_investment_plan', {
    p_username: creds.username,
    p_password: creds.password,
    p_id: id,
  });
  if (error) throw error;
  return data === true;
}

// --- Payment methods catalog (admin) ---

export async function adminListPaymentMethods(creds: AdminCredentials): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.rpc('admin_list_payment_methods', {
    p_username: creds.username,
    p_password: creds.password,
  });
  if (error) throw error;
  return data || [];
}

export async function adminUpsertPaymentMethod(creds: AdminCredentials, method: Record<string, unknown>) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc('admin_upsert_payment_method', {
    p_username: creds.username,
    p_password: creds.password,
    p_method: method,
  });
  if (error) throw error;
  return data;
}

export async function adminDeletePaymentMethod(creds: AdminCredentials, id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { data, error } = await supabase.rpc('admin_delete_payment_method', {
    p_username: creds.username,
    p_password: creds.password,
    p_id: id,
  });
  if (error) throw error;
  return data === true;
}
