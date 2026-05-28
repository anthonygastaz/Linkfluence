export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  popular: boolean;
  tagline: string;
  features: string[];
}

export interface CreatorMarqueeItem {
  name: string;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: string;
  fontSize: string;
  textTransform?: string;
}

export interface BrandMarqueeItem {
  name: string;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: string;
  fontSize: string;
  textTransform?: string;
}

export interface InteractiveNiche {
  id: string;
  name: string;
  commissionRate: number; // e.g., 20%
  avgProductPrice: number; // e.g., $150
  iconName: string;
}
