export interface Product {
  product_id: string;
  product_name: string;
  brand: string;
  category: string;
  sub_category: string;
  pack_size_ml: number;
  unit_price: number;
}

export interface Store {
  store_id: string;
  store_name: string;
  region: 'North' | 'South' | 'East' | 'West';
  city: string;
  store_format: string;
}

export interface SalesPromotion {
  id: number;
  week_start_date: string; // ISO format e.g. "2024-01-01"
  product_id: string;
  store_id: string;
  region: 'North' | 'South' | 'East' | 'West';
  units_sold: number;
  revenue: number;
  promotion_flag: boolean;
  promotion_type: 'Price Cut' | 'BOGO' | 'Display Feature' | 'Bundle' | null;
  discount_pct: number;
}

export interface Inventory {
  id: number;
  week_start_date: string; // ISO format e.g. "2024-01-01"
  product_id: string;
  store_id: string;
  opening_stock: number;
  units_received: number;
  units_sold: number;
  closing_stock: number;
  stockout_flag: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_used?: string; // name(s) of tools called for transparency
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages?: Message[];
}

export interface DashboardSummary {
  kpis: {
    totalRevenue: number;
    totalRevenueTrend: number; // % change vs previous or benchmark
    unitsSold: number;
    unitsSoldTrend: number;
    activePromotions: number;
    activePromotionsTrend: number;
    stockoutRate: number; // % of combo-weeks with a stockout
    stockoutRateTrend: number;
  };
  revenueTrend: {
    weekIndex: number;
    weekStartDate: string;
    revenue: number;
  }[];
  topProducts: {
    product_id: string;
    product_name: string;
    category: string;
    revenue: number;
    unitsSold: number;
  }[];
  regionPerformance: {
    region: string;
    revenue: number;
    units: number;
  }[];
}
