import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  phone: string;
  balance: number;
  total_profit: number;
  total_withdrawals: number;
  total_investments: number;
  kyc_submitted_file: boolean;
  kyc_approved: boolean;
  kyc_status: 'Unregistered' | 'Pending' | 'Approved' | 'Rejected';
  kyc_doc_type?: string;
  kyc_doc_num?: string;
  kyc_file_name?: string;
  kyc_full_name?: string;
  kyc_submitted_at?: string;
  kyc_file_base64?: string;
  kyc_file_path?: string;
  active_plans?: unknown[];
  transactions?: unknown[];
}

export interface DashboardKyc {
  status: 'Unregistered' | 'Pending' | 'Approved' | 'Rejected';
  fullName: string;
  documentType: string;
  documentNumber: string;
  country: string;
  submittedAt?: string;
  uploadedFileName?: string;
  uploadedFileBase64?: string;
  uploadedFilePath?: string;
}

export interface DashboardState {
  authUserId: string;
  balance: number;
  totalProfit: number;
  totalWithdrawals: number;
  totalInvestments: number;
  activePlans: unknown[];
  kyc: DashboardKyc;
  transactions: unknown[];
}

export interface DbTransaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'yield';
  amount: number;
  method_or_plan: string;
  destination_or_detail?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Declined';
  reference: string;
}

const KYC_BUCKET = 'kyc-documents';

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export function mapProfileToDashboardState(profile: UserProfile): DashboardState {
  return {
    authUserId: profile.id,
    balance: Number(profile.balance) || 0,
    totalProfit: Number(profile.total_profit) || 0,
    totalWithdrawals: Number(profile.total_withdrawals) || 0,
    totalInvestments: Number(profile.total_investments) || 0,
    activePlans: parseJsonField(profile.active_plans, []),
    kyc: {
      status: profile.kyc_status || 'Unregistered',
      fullName: profile.kyc_full_name || profile.name || '',
      documentType: profile.kyc_doc_type || 'National ID Card',
      documentNumber: profile.kyc_doc_num || '',
      country: profile.country || 'United States',
      submittedAt: profile.kyc_submitted_at,
      uploadedFileName: profile.kyc_file_name,
      uploadedFileBase64: profile.kyc_file_base64,
      uploadedFilePath: profile.kyc_file_path,
    },
    transactions: parseJsonField(profile.transactions, []),
  };
}

export function buildProfilePayload(
  authUserId: string,
  user: { name: string; email: string; country: string; phone: string },
  state: {
    balance: number;
    totalProfit: number;
    totalWithdrawals: number;
    totalInvestments: number;
    activePlans: unknown[];
    kyc: DashboardKyc;
    transactions: unknown[];
  }
): UserProfile {
  return {
    id: authUserId,
    name: user.name,
    email: user.email.toLowerCase().trim(),
    country: user.country,
    phone: user.phone,
    balance: state.balance,
    total_profit: state.totalProfit,
    total_withdrawals: state.totalWithdrawals,
    total_investments: state.totalInvestments,
    kyc_status: state.kyc.status,
    kyc_submitted_file: state.kyc.status !== 'Unregistered',
    kyc_approved: state.kyc.status === 'Approved',
    kyc_doc_type: state.kyc.documentType,
    kyc_doc_num: state.kyc.documentNumber,
    kyc_file_name: state.kyc.uploadedFileName,
    kyc_file_base64: state.kyc.uploadedFileBase64,
    kyc_file_path: state.kyc.uploadedFilePath,
    kyc_full_name: state.kyc.fullName,
    kyc_submitted_at: state.kyc.submittedAt,
    active_plans: state.activePlans,
    transactions: state.transactions,
  };
}

export const supabaseService = {
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },

  async signUp(
    email: string,
    password: string,
    metadata: { name: string; country: string; phone: string }
  ) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in the environment variables.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in the environment variables.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  async fetchProfile(userId: string, email: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as UserProfile;

      await new Promise((resolve) => setTimeout(resolve, 500));
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (retryError) throw retryError;
      if (retryData) return retryData as UserProfile;

      const defaultProfile: UserProfile = {
        id: userId,
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        country: 'United States',
        phone: '',
        balance: 0,
        total_profit: 0,
        total_withdrawals: 0,
        total_investments: 0,
        kyc_submitted_file: false,
        kyc_approved: false,
        kyc_status: 'Unregistered',
        active_plans: [],
        transactions: [],
      };

      const saved = await this.saveProfile(defaultProfile);
      return saved ? defaultProfile : null;
    } catch (err) {
      console.error('Error fetching Supabase user profile:', err);
      return null;
    }
  },

  async fetchDashboardState(userId: string, email: string): Promise<DashboardState | null> {
    const profile = await this.fetchProfile(userId, email);
    if (!profile) return null;
    return mapProfileToDashboardState(profile);
  },

  async updateProfileFields(
    userId: string,
    fields: Partial<Pick<UserProfile, 'name' | 'country' | 'phone' | 'email'>>
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    const { error } = await supabase.from('profiles').update(fields).eq('id', userId);
    if (error) {
      console.error('Error updating profile fields:', error);
      return false;
    }
    return true;
  },

  async saveProfile(profile: UserProfile): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving profile to Supabase:', err);
      return false;
    }
  },

  async uploadKycDocument(
    userId: string,
    file: File
  ): Promise<{ path: string; fileName: string } | null> {
    if (!isSupabaseConfigured()) return null;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(KYC_BUCKET).upload(storagePath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      console.error('KYC upload failed:', error);
      throw error;
    }

    return { path: storagePath, fileName: file.name };
  },

  async uploadDepositProof(
    userId: string,
    file: File
  ): Promise<{ path: string; fileName: string } | null> {
    if (!isSupabaseConfigured()) return null;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `${userId}/deposits/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(KYC_BUCKET).upload(storagePath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      console.error('Deposit proof upload failed:', error);
      throw error;
    }

    return { path: storagePath, fileName: file.name };
  },

  async getKycSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    if (!isSupabaseConfigured() || !filePath) return null;

    const { data, error } = await supabase.storage
      .from(KYC_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Failed to create KYC signed URL:', error);
      return null;
    }

    return data.signedUrl;
  },

  async insertTransaction(transaction: DbTransaction): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('transactions').insert(transaction);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error inserting transaction into Supabase:', err);
      return false;
    }
  },
};
