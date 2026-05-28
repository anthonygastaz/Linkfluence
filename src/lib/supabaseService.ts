import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface UserProfile {
  id: string; // auth.uid()
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
  kyc_status: 'Unsubmitted' | 'Pending' | 'Approved' | 'Rejected';
  kyc_doc_type?: string;
  kyc_doc_num?: string;
  kyc_file_name?: string;
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

/**
 * Service to handle Supabase database synchronizations.
 * If Supabase is not configured (empty keys), it automatically maps to existing localStorage caches
 * to protect preview environment fidelity.
 */
export const supabaseService = {
  // 1. Authentication Integration Helpers
  async signUp(email: string, password: string, metadata: { name: string; country: string; phone: string }) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in the environment variables.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in the environment variables.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  // 2. Profile Sync Functions
  async fetchProfile(userId: string, email: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile does not exist, let's create it representing this user
          const defaultProfile: UserProfile = {
            id: userId,
            name: email.split('@')[0],
            email,
            country: 'United States',
            phone: '',
            balance: 0.00,
            total_profit: 0.00,
            total_withdrawals: 0.00,
            total_investments: 0.00,
            kyc_submitted_file: false,
            kyc_approved: false,
            kyc_status: 'Unsubmitted',
          };
          
          await this.saveProfile(defaultProfile);
          return defaultProfile;
        }
        throw error;
      }
      return data as UserProfile;
    } catch (err) {
      console.error('Error fetching Supabase user profile:', err);
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving profile to Supabase:', err);
      return false;
    }
  },

  // 3. Transactions Database
  async fetchTransactions(userId: string): Promise<DbTransaction[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data || []) as DbTransaction[];
    } catch (err) {
      console.error('Error fetching transactions from Supabase:', err);
      return [];
    }
  },

  async insertTransaction(transaction: DbTransaction): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert(transaction);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error inserting transaction into Supabase:', err);
      return false;
    }
  }
};
