import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface InvestmentPlan {
  id: string;
  name: string;
  yield: number;
  days: number;
  min: number;
  desc: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  address: string;
  enabled: boolean;
  desc: string;
  sort_order?: number;
}

export const CATALOG_UPDATED_EVENT = 'linkfluence_catalog_updated';

export function dispatchCatalogUpdated() {
  window.dispatchEvent(new CustomEvent(CATALOG_UPDATED_EVENT));
}

export function mapPlanRow(row: Record<string, unknown>): InvestmentPlan {
  return {
    id: String(row.id),
    name: String(row.name),
    yield: Number(row.yield_percent) || 0,
    days: Number(row.duration_days) || 0,
    min: Number(row.min_amount) || 0,
    desc: String(row.description || ''),
    is_active: row.is_active !== false,
    sort_order: Number(row.sort_order) || 0,
  };
}

export function mapPaymentRow(row: Record<string, unknown>): PaymentMethod {
  return {
    id: String(row.id),
    name: String(row.name),
    type: String(row.method_type || 'crypto'),
    address: String(row.address || ''),
    enabled: row.enabled !== false,
    desc: String(row.description || ''),
    sort_order: Number(row.sort_order) || 0,
  };
}

export function planToDbPayload(plan: InvestmentPlan) {
  return {
    id: plan.id,
    name: plan.name,
    yield_percent: plan.yield,
    duration_days: plan.days,
    min_amount: plan.min,
    description: plan.desc,
    is_active: plan.is_active !== false,
    sort_order: plan.sort_order ?? 0,
  };
}

export function paymentMethodToDbPayload(method: PaymentMethod) {
  return {
    id: method.id,
    name: method.name,
    method_type: method.type,
    address: method.address,
    enabled: method.enabled,
    description: method.desc,
    sort_order: method.sort_order ?? 0,
  };
}


export const catalogService = {
  async fetchInvestmentPlans(): Promise<InvestmentPlan[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch investment plans:', error);
      return [];
    }

    return (data || []).map(mapPlanRow);
  },

  async fetchPaymentMethods(): Promise<PaymentMethod[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('enabled', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }

    return (data || []).map(mapPaymentRow);
  },

  subscribeToCatalog(onChange: () => void) {
    if (!isSupabaseConfigured()) {
      const handler = () => onChange();
      window.addEventListener(CATALOG_UPDATED_EVENT, handler);
      return () => window.removeEventListener(CATALOG_UPDATED_EVENT, handler);
    }

    const channel = supabase
      .channel('catalog-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investment_plans' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_methods' }, onChange)
      .subscribe();

    const localHandler = () => onChange();
    window.addEventListener(CATALOG_UPDATED_EVENT, localHandler);

    return () => {
      window.removeEventListener(CATALOG_UPDATED_EVENT, localHandler);
      supabase.removeChannel(channel);
    };
  },
};
