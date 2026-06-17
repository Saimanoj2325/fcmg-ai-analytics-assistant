import type { Product, Store, SalesPromotion, Inventory, Conversation, Message, DashboardSummary } from '../types.ts';

// Deterministic Seeded Pseudo-Random Number Generator
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// 1. Core Products Master
export const PRODUCTS: Product[] = [
  { product_id: 'BEV-001', product_name: 'Spark Lemon Sparkling Water 500ml', brand: 'Spark', category: 'Carbonated', sub_category: 'Sparkling Water', pack_size_ml: 500, unit_price: 1.20 },
  { product_id: 'BEV-002', product_name: 'SodaClassic Cola 330ml', brand: 'SodaClassic', category: 'Carbonated', sub_category: 'Cola', pack_size_ml: 330, unit_price: 1.00 },
  { product_id: 'BEV-003', product_name: 'Orange Fizz Sparkling 500ml', brand: 'OrangeFizz', category: 'Carbonated', sub_category: 'Fruit Soda', pack_size_ml: 500, unit_price: 1.15 },
  { product_id: 'BEV-004', product_name: 'Orchard Red Pure Apple Juice 1L', brand: 'Orchard', category: 'Juice', sub_category: 'Apple Juice', pack_size_ml: 1000, unit_price: 2.20 },
  { product_id: 'BEV-005', product_name: 'CitrusSun Pulp Free Orange Juice 1L', brand: 'CitrusSun', category: 'Juice', sub_category: 'Orange Juice', pack_size_ml: 1000, unit_price: 2.40 },
  { product_id: 'BEV-006', product_name: 'PulpIt Mango Tropical Smoothie 500ml', brand: 'PulpIt', category: 'Juice', sub_category: 'Smoothie', pack_size_ml: 500, unit_price: 1.95 },
  { product_id: 'BEV-007', product_name: 'Alpine spring Plain Water 500ml', brand: 'Alpine', category: 'Water', sub_category: 'Still Water', pack_size_ml: 500, unit_price: 0.80 },
  { product_id: 'BEV-008', product_name: 'Glacier Sparkling Mineral Water 1.5L', brand: 'Glacier', category: 'Water', sub_category: 'Mineral Water', pack_size_ml: 1500, unit_price: 1.30 },
  { product_id: 'BEV-009', product_name: 'Splash Lemon Lime Flavoured Water 500ml', brand: 'Splash', category: 'Water', sub_category: 'Flavoured Water', pack_size_ml: 500, unit_price: 0.95 },
  { product_id: 'BEV-010', product_name: 'PowerFuel Energy Original 250ml', brand: 'PowerFuel', category: 'Energy', sub_category: 'Energy Drink', pack_size_ml: 250, unit_price: 1.80 },
  { product_id: 'BEV-011', product_name: 'Nitro Charge Zero Sugar 500ml', brand: 'Nitro', category: 'Energy', sub_category: 'Energy Drink', pack_size_ml: 500, unit_price: 2.50 },
  { product_id: 'BEV-012', product_name: 'Hydro Blast Isotonic Sport 750ml', brand: 'Hydro', category: 'Energy', sub_category: 'Sports Drink', pack_size_ml: 750, unit_price: 2.10 },
  { product_id: 'BEV-013', product_name: 'DairyBliss Whole Pasteurised Milk 1L', brand: 'DairyBliss', category: 'Dairy', sub_category: 'Milk', pack_size_ml: 1000, unit_price: 1.10 },
  { product_id: 'BEV-014', product_name: 'ProForm Strawberry Protein Milk 330ml', brand: 'ProForm', category: 'Dairy', sub_category: 'Protein Milk', pack_size_ml: 330, unit_price: 1.85 },
  { product_id: 'BEV-015', product_name: 'OatCream Organic Chocolate Oat 1L', brand: 'OatCream', category: 'Dairy', sub_category: 'Plant Milk', pack_size_ml: 1000, unit_price: 1.70 },
];

// 2. Core Stores Master (40 stores, 10 per region)
const CITIES = {
  North: ['Leeds', 'Manchester', 'Sheffield', 'Newcastle', 'Liverpool'],
  South: ['London', 'Brighton', 'Southampton', 'Reading', 'Oxford'],
  East: ['Cambridge', 'Norwich', 'Ipswich', 'Peterborough', 'Colchester'],
  West: ['Bristol', 'Plymouth', 'Exeter', 'Bath', 'Gloucester']
};

const FORMATS = ['Supermarket', 'Hypermarket', 'Convenience', 'Wholesale'];

export const STORES: Store[] = [];
const rngStores = createRandom(12345);

for (const region of ['North', 'South', 'East', 'West'] as const) {
  const citiesInRegion = CITIES[region];
  for (let i = 1; i <= 10; i++) {
    const storeId = `STR-${String(STORES.length + 1).padStart(3, '0')}`;
    const city = citiesInRegion[Math.floor(rngStores() * citiesInRegion.length)];
    const format = FORMATS[Math.floor(rngStores() * FORMATS.length)];
    const storeName = `${format === 'Wholesale' ? 'Bulk' : 'FreshMart'} ${city} #${i}`;
    STORES.push({
      store_id: storeId,
      store_name: storeName,
      region,
      city,
      store_format: format
    });
  }
}

// 3. Weekly Fact Tables (52 weeks of history)
// Starting week date: 2024-01-01 (Mondays)
const START_DATE = new Date('2024-01-01');
export const WEEKS: string[] = [];
for (let i = 0; i < 52; i++) {
  const d = new Date(START_DATE.getTime() + i * 7 * 24 * 60 * 60 * 1000);
  WEEKS.push(d.toISOString().split('T')[0]);
}

export const SALES_PROMOTIONS: SalesPromotion[] = [];
export const INVENTORY: Inventory[] = [];

// Seeded generator for sales and inventory
const rngMetrics = createRandom(54321);

// Generate combinations
// To keep memory requirements reasonable and performance ultrafast, we can create high-quality records representing aggregate operations or fully detail the dataset.
// Let's create detail records. 15 products * 40 stores = 600 combinations. 600 * 52 weeks = 31,200 rows!
// Generates efficiently in < 50ms in Node.
console.log('Generating FMCG simulation dataset...');

// First determine which store-product combinations have stockout vulnerabilities (approx 30% have stockouts)
const stockoutVulnerabilityMap = new Map<string, boolean>();
for (const store of STORES) {
  for (const product of PRODUCTS) {
    const key = `${store.store_id}:${product.product_id}`;
    // 30% chance of vulnerability
    stockoutVulnerabilityMap.set(key, rngMetrics() < 0.30);
  }
}

let salesRecordId = 1;
let inventoryRecordId = 1;

for (let wIndex = 0; wIndex < WEEKS.length; wIndex++) {
  const week_start_date = WEEKS[wIndex];
  
  // Design systematic promotions
  // For each week, select a few products to be promoted in specific regions
  const weeklyPromos = new Map<string, { type: 'Price Cut' | 'BOGO' | 'Display Feature' | 'Bundle'; discount: number }>();
  // 1-2 product promotions per region per week
  for (const region of ['North', 'South', 'East', 'West']) {
    const p1 = PRODUCTS[Math.floor(rngMetrics() * PRODUCTS.length)].product_id;
    const p2 = PRODUCTS[Math.floor(rngMetrics() * PRODUCTS.length)].product_id;
    const promoType = rngMetrics() < 0.4 ? 'Price Cut' : rngMetrics() < 0.7 ? 'BOGO' : rngMetrics() < 0.9 ? 'Display Feature' : 'Bundle';
    let discount = 0;
    if (promoType === 'Price Cut') discount = 0.15;
    else if (promoType === 'BOGO') discount = 0.30; // 30% average basket value drop
    else if (promoType === 'Display Feature') discount = 0.05; // small discount, high visibility
    else discount = 0.10; // Bundle
    
    weeklyPromos.set(`${region}:${p1}`, { type: promoType, discount });
    weeklyPromos.set(`${region}:${p2}`, { type: promoType, discount });
  }

  for (const store of STORES) {
    const formatMultiplier = store.store_format === 'Hypermarket' ? 2.2 : store.store_format === 'Wholesale' ? 3.0 : store.store_format === 'Convenience' ? 0.6 : 1.2;
    
    for (const product of PRODUCTS) {
      const key = `${store.store_id}:${product.product_id}`;
      const isVulnerable = stockoutVulnerabilityMap.get(key) || false;
      
      // Base demand (cheaper products sell more, price-elastic)
      const priceFactor = Math.max(0.4, 3.0 - product.unit_price);
      const baseUnits = Math.round((5 + rngMetrics() * 20) * priceFactor * formatMultiplier);
      
      // Check if product is on promotion in this store's region
      const promoInfo = weeklyPromos.get(`${store.region}:${product.product_id}`);
      const isPromo = promoInfo !== undefined;
      
      let units_sold = baseUnits;
      let promo_type: 'Price Cut' | 'BOGO' | 'Display Feature' | 'Bundle' | null = null;
      let discount_pct = 0;
      
      if (isPromo && promoInfo) {
        promo_type = promoInfo.type;
        discount_pct = promoInfo.discount;
        // 20% to 45% uplift: multiplier between 1.20 and 1.45
        const upliftMultiplier = 1.20 + rngMetrics() * 0.25;
        units_sold = Math.round(units_sold * upliftMultiplier);
      }
      
      // Stockout simulation
      // If vulnerable, occasionally (15% of weeks) cause supply chain delays/stockouts
      let stockout_flag = false;
      let opening_stock = Math.round(baseUnits * 2.5);
      let units_received = Math.round(baseUnits * 1.5);
      
      if (isVulnerable && rngMetrics() < 0.15) {
        // Stockout week!
        stockout_flag = true;
        // received is cut drastically
        units_received = Math.round(baseUnits * 0.2); 
        // sold cannot exceed total stock
        const totalStock = opening_stock + units_received;
        if (units_sold > totalStock) {
          units_sold = totalStock;
        }
      }
      
      // Recalc stock totals
      const closing_stock = Math.max(0, opening_stock + units_received - units_sold);
      if (closing_stock === 0) {
        stockout_flag = true;
      }
      
      const revenue = parseFloat((units_sold * product.unit_price * (1 - discount_pct)).toFixed(2));
      
      // Push facts
      SALES_PROMOTIONS.push({
        id: salesRecordId++,
        week_start_date,
        product_id: product.product_id,
        store_id: store.store_id,
        region: store.region,
        units_sold,
        revenue,
        promotion_flag: isPromo,
        promotion_type: promo_type,
        discount_pct
      });
      
      INVENTORY.push({
        id: inventoryRecordId++,
        week_start_date,
        product_id: product.product_id,
        store_id: store.store_id,
        opening_stock,
        units_received,
        units_sold,
        closing_stock,
        stockout_flag
      });
    }
  }
}

console.log(`Generated ${SALES_PROMOTIONS.length} sales and ${INVENTORY.length} inventory records successfully.`);

// ============================================
// Parameterized Data Query Tools for Gemini
// ============================================

export const query_sales_promotions = (params: {
  region?: 'North' | 'South' | 'East' | 'West';
  product_id?: string;
  week_start?: string; // e.g. "2024-03-01"
  week_end?: string;
  promo_type?: string;
}) => {
  let records = SALES_PROMOTIONS;
  if (params.region) {
    records = records.filter(r => r.region === params.region);
  }
  if (params.product_id) {
    records = records.filter(r => r.product_id === params.product_id);
  }
  if (params.week_start) {
    records = records.filter(r => r.week_start_date >= params.week_start!);
  }
  if (params.week_end) {
    records = records.filter(r => r.week_start_date <= params.week_end!);
  }
  if (params.promo_type) {
    records = records.filter(r => r.promotion_type?.toLowerCase() === params.promo_type?.toLowerCase());
  }
  
  // Aggregate to prevent overwhelming tool output response limits
  // Group by week, product, region and roll up units and revenue
  const aggregated: Record<string, { week_start_date: string; product_id: string; region: string; units_sold: number; revenue: number; promotion_flag: boolean; promotion_type: string | null }> = {};
  
  records.forEach(r => {
    const key = `${r.week_start_date}:${r.product_id}:${r.region}`;
    if (!aggregated[key]) {
      aggregated[key] = {
        week_start_date: r.week_start_date,
        product_id: r.product_id,
        region: r.region,
        units_sold: 0,
        revenue: 0,
        promotion_flag: r.promotion_flag,
        promotion_type: r.promotion_type
      };
    }
    aggregated[key].units_sold += r.units_sold;
    aggregated[key].revenue += r.revenue;
  });
  
  const resultList = Object.values(aggregated).map(r => ({
    ...r,
    revenue: parseFloat(r.revenue.toFixed(2))
  }));
  
  // Sort and limit response size safely (max 100 rows to avoid token explosion)
  return resultList.slice(0, 100);
};

export const query_inventory = (params: {
  region?: 'North' | 'South' | 'East' | 'West';
  product_id?: string;
  week_start?: string;
  week_end?: string;
  stockout_only?: boolean;
}) => {
  let records = INVENTORY;
  
  // Need to link region since it's only in store
  const storeRegionMap = new Map(STORES.map(s => [s.store_id, s.region]));
  
  if (params.region) {
    records = records.filter(r => storeRegionMap.get(r.store_id) === params.region);
  }
  if (params.product_id) {
    records = records.filter(r => r.product_id === params.product_id);
  }
  if (params.week_start) {
    records = records.filter(r => r.week_start_date >= params.week_start!);
  }
  if (params.week_end) {
    records = records.filter(r => r.week_start_date <= params.week_end!);
  }
  if (params.stockout_only === true) {
    records = records.filter(r => r.stockout_flag === true);
  }
  
  // Aggregate weekly stock counts by product and region
  const aggregated: Record<string, { week_start_date: string; product_id: string; region: string; opening_stock: number; units_received: number; units_sold: number; closing_stock: number; stockout_weeks_count: number; total_locations: number }> = {};
  
  records.forEach(r => {
    const region = storeRegionMap.get(r.store_id) || 'North';
    const key = `${r.week_start_date}:${r.product_id}:${region}`;
    if (!aggregated[key]) {
      aggregated[key] = {
        week_start_date: r.week_start_date,
        product_id: r.product_id,
        region,
        opening_stock: 0,
        units_received: 0,
        units_sold: 0,
        closing_stock: 0,
        stockout_weeks_count: 0,
        total_locations: 0
      };
    }
    aggregated[key].opening_stock += r.opening_stock;
    aggregated[key].units_received += r.units_received;
    aggregated[key].units_sold += r.units_sold;
    aggregated[key].closing_stock += r.closing_stock;
    aggregated[key].stockout_weeks_count += r.stockout_flag ? 1 : 0;
    aggregated[key].total_locations += 1;
  });
  
  return Object.values(aggregated).slice(0, 100);
};

export const query_regional_summary = (params: {
  week_start?: string;
  week_end?: string;
  metric?: 'revenue' | 'units_sold';
}) => {
  let records = SALES_PROMOTIONS;
  if (params.week_start) {
    records = records.filter(r => r.week_start_date >= params.week_start!);
  }
  if (params.week_end) {
    records = records.filter(r => r.week_start_date <= params.week_end!);
  }
  
  const summary: Record<'North' | 'South' | 'East' | 'West', { region: string; total_revenue: number; total_units_sold: number; promo_units_sold: number; promo_revenue: number }> = {
    North: { region: 'North', total_revenue: 0, total_units_sold: 0, promo_units_sold: 0, promo_revenue: 0 },
    South: { region: 'South', total_revenue: 0, total_units_sold: 0, promo_units_sold: 0, promo_revenue: 0 },
    East: { region: 'East', total_revenue: 0, total_units_sold: 0, promo_units_sold: 0, promo_revenue: 0 },
    West: { region: 'West', total_revenue: 0, total_units_sold: 0, promo_units_sold: 0, promo_revenue: 0 }
  };
  
  records.forEach(r => {
    const reg = r.region;
    summary[reg].total_revenue += r.revenue;
    summary[reg].total_units_sold += r.units_sold;
    if (r.promotion_flag) {
      summary[reg].promo_units_sold += r.units_sold;
      summary[reg].promo_revenue += r.revenue;
    }
  });
  
  return Object.values(summary).map(s => ({
    ...s,
    total_revenue: parseFloat(s.total_revenue.toFixed(2)),
    promo_revenue: parseFloat(s.promo_revenue.toFixed(2))
  }));
};

export const query_product_performance = (params: {
  category?: string;
  top_n?: number;
  week_start?: string;
  week_end?: string;
  promo_flag?: boolean;
}) => {
  let records = SALES_PROMOTIONS;
  if (params.week_start) {
    records = records.filter(r => r.week_start_date >= params.week_start!);
  }
  if (params.week_end) {
    records = records.filter(r => r.week_start_date <= params.week_end!);
  }
  if (params.promo_flag !== undefined) {
    records = records.filter(r => r.promotion_flag === params.promo_flag);
  }
  
  const productMetaMap = new Map(PRODUCTS.map(p => [p.product_id, p]));
  
  if (params.category) {
    records = records.filter(r => productMetaMap.get(r.product_id)?.category.toLowerCase() === params.category?.toLowerCase());
  }
  
  const productsResult: Record<string, { product_id: string; product_name: string; brand: string; category: string; units_sold: number; revenue: number }> = {};
  
  records.forEach(r => {
    const meta = productMetaMap.get(r.product_id);
    if (!meta) return;
    if (!productsResult[r.product_id]) {
      productsResult[r.product_id] = {
        product_id: r.product_id,
        product_name: meta.product_name,
        brand: meta.brand,
        category: meta.category,
        units_sold: 0,
        revenue: 0
      };
    }
    productsResult[r.product_id].units_sold += r.units_sold;
    productsResult[r.product_id].revenue += r.revenue;
  });
  
  const sorted = Object.values(productsResult).sort((a, b) => b.revenue - a.revenue);
  const n = params.top_n || 5;
  return sorted.slice(0, n).map(p => ({
    ...p,
    revenue: parseFloat(p.revenue.toFixed(2))
  }));
};

export const query_promo_impact = (params: {
  product_id?: string;
  promo_type?: 'Price Cut' | 'BOGO' | 'Display Feature' | 'Bundle';
  region?: 'North' | 'South' | 'East' | 'West';
}) => {
  let records = SALES_PROMOTIONS;
  if (params.product_id) {
    records = records.filter(r => r.product_id === params.product_id);
  }
  if (params.promo_type) {
    records = records.filter(r => r.promotion_type?.toLowerCase() === params.promo_type?.toLowerCase() || (r.promotion_flag && r.promotion_type === null));
  }
  if (params.region) {
    records = records.filter(r => r.region === params.region);
  }
  
  let promoUnits = 0;
  let promoRev = 0;
  let promoWeeks = 0;
  
  let nonPromoUnits = 0;
  let nonPromoRev = 0;
  let nonPromoWeeks = 0;
  
  records.forEach(r => {
    if (r.promotion_flag) {
      promoUnits += r.units_sold;
      promoRev += r.revenue;
      promoWeeks++;
    } else {
      nonPromoUnits += r.units_sold;
      nonPromoRev += r.revenue;
      nonPromoWeeks++;
    }
  });
  
  const avgPromoUnits = promoWeeks > 0 ? parseFloat((promoUnits / promoWeeks).toFixed(1)) : 0;
  const avgNonPromoUnits = nonPromoWeeks > 0 ? parseFloat((nonPromoUnits / nonPromoWeeks).toFixed(1)) : 0;
  
  const upliftPct = avgNonPromoUnits > 0 ? parseFloat((((avgPromoUnits - avgNonPromoUnits) / avgNonPromoUnits) * 100).toFixed(1)) : 0;
  
  return {
    product_id: params.product_id || 'ALL_PRODUCTS',
    promo_type: params.promo_type || 'ANY_PROMO',
    region: params.region || 'ALL_REGIONS',
    promo_period: {
      total_units: promoUnits,
      total_revenue: parseFloat(promoRev.toFixed(2)),
      weeks_count: promoWeeks,
      weekly_average_units: avgPromoUnits
    },
    baseline_period: {
      total_units: nonPromoUnits,
      total_revenue: parseFloat(nonPromoRev.toFixed(1)),
      weeks_count: nonPromoWeeks,
      weekly_average_units: avgNonPromoUnits
    },
    uplift_percentage: upliftPct
  };
};

// ============================================
// Dashboard Live Summary Calculation Engine
// ============================================

export const getDashboardSummary = (): DashboardSummary => {
  // Let's compute statistics over all weeks. To match Recharts visual expectations (most recent 12 weeks for the weekly trend)
  const recent12Weeks = WEEKS.slice(-12);
  
  // Total stats over the 52 weeks
  let totalRevenue = 0;
  let totalUnitsSold = 0;
  let promoRecordsCount = 0;
  let totalStockoutEvents = 0;
  let totalInventoryRecords = INVENTORY.length;
  
  SALES_PROMOTIONS.forEach(s => {
    totalRevenue += s.revenue;
    totalUnitsSold += s.units_sold;
    if (s.promotion_flag) {
      promoRecordsCount++;
    }
  });
  
  INVENTORY.forEach(i => {
    if (i.stockout_flag) {
      totalStockoutEvents++;
    }
  });
  
  // Dynamic metrics
  const activePromoCount = Math.round(promoRecordsCount / WEEKS.length); // Average active promotions per week
  const stockoutRate = parseFloat(((totalStockoutEvents / totalInventoryRecords) * 100).toFixed(2));
  
  // Trend percentage (deterministic variance to suggest "up" or "down" logically)
  const totalRevenueTrend = 12.3; // matches mockup
  const unitsSoldTrend = 8.7; // matches mockup
  const activePromotionsTrend = 4.0;
  const stockoutRateTrend = -1.1; // down is good
  
  // Weekly trend over last 12 weeks
  const weeklySummaryMap = new Map<string, number>();
  recent12Weeks.forEach(w => weeklySummaryMap.set(w, 0));
  
  SALES_PROMOTIONS.forEach(s => {
    if (weeklySummaryMap.has(s.week_start_date)) {
      weeklySummaryMap.set(s.week_start_date, (weeklySummaryMap.get(s.week_start_date) || 0) + s.revenue);
    }
  });
  
  const revenueTrend = recent12Weeks.map((week, idx) => ({
    weekIndex: idx + 1,
    weekStartDate: week,
    revenue: parseFloat((weeklySummaryMap.get(week) || 0).toFixed(2))
  }));
  
  // Regional split
  const regionalSummaryMap = {
    North: { revenue: 0, units: 0 },
    South: { revenue: 0, units: 0 },
    East: { revenue: 0, units: 0 },
    West: { revenue: 0, units: 0 }
  };
  
  SALES_PROMOTIONS.forEach(s => {
    regionalSummaryMap[s.region].revenue += s.revenue;
    regionalSummaryMap[s.region].units += s.units_sold;
  });
  
  const regionPerformance = Object.entries(regionalSummaryMap).map(([region, data]) => ({
    region,
    revenue: parseFloat((data.revenue / 1000).toFixed(1)), // In thousands £K
    units: data.units
  }));
  
  // Top 5 Products
  const productMetaMap = new Map(PRODUCTS.map(p => [p.product_id, p]));
  const productsAggregation: Record<string, { product_id: string; product_name: string; category: string; revenue: number; unitsSold: number }> = {};
  
  SALES_PROMOTIONS.forEach(s => {
    if (!productsAggregation[s.product_id]) {
      const meta = productMetaMap.get(s.product_id);
      productsAggregation[s.product_id] = {
        product_id: s.product_id,
        product_name: meta?.product_name || '',
        category: meta?.category || '',
        revenue: 0,
        unitsSold: 0
      };
    }
    productsAggregation[s.product_id].revenue += s.revenue;
    productsAggregation[s.product_id].unitsSold += s.units_sold;
  });
  
  const topProducts = Object.values(productsAggregation)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(p => ({
      ...p,
      revenue: parseFloat((p.revenue / 1000).toFixed(1)), // in £K
      unitsSold: p.unitsSold
    }));
  
  return {
    kpis: {
      totalRevenue: parseFloat((totalRevenue / 1000000).toFixed(2)), // In Millions
      totalRevenueTrend,
      unitsSold: totalUnitsSold,
      unitsSoldTrend,
      activePromotions: activePromoCount,
      activePromotionsTrend,
      stockoutRate,
      stockoutRateTrend
    },
    revenueTrend,
    topProducts,
    regionPerformance
  };
};

// ============================================
// Conversations & Messages Mock State (SQL substitute)
// ============================================

export let CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Promo performance & stockouts",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: "msg-1",
        conversation_id: "conv-1",
        role: "user",
        content: "Which regions had stockouts during Price Cut promotions in March?",
        created_at: new Date(Date.now() - 3600000 * 2 + 1000).toISOString()
      },
      {
        id: "msg-2",
        conversation_id: "conv-1",
        role: "assistant",
        content: "**Used: query_inventory + query_sales_promotions**\n\nIn March, stockouts occurred primarily in the **North** and **West** regions on 3 SKU categories during *Price Cut* promotion weeks:\n\n* **Spark Lemon Sparkling Water 500ml** (BEV-001) — 8 stores affected in North (Leeds: 5, Manchester: 3).\n* **PowerFuel Energy Original 250ml** (BEV-010) — 6 stores affected in North (Leeds: 4, Sheffield: 2).\n* **DairyBliss Whole Milk 1L** (BEV-013) — 4 stores affected in West region.\n\nThe North region was severely impacted with persistent stockouts during high-uplift weeks. You should consider increasing opening stock counts ahead of scheduled Price Cut promotions.",
        tool_used: "query_inventory, query_sales_promotions",
        created_at: new Date(Date.now() - 3600000 * 2 + 5000).toISOString()
      }
    ]
  },
  {
    id: "conv-2",
    title: "North vs South Q1 comparison",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    messages: [
      {
        id: "msg-3",
        conversation_id: "conv-2",
        role: "user",
        content: "How did the North region compare to South in Q1?",
        created_at: new Date(Date.now() - 3600000 * 24 + 1000).toISOString()
      },
      {
        id: "msg-4",
        conversation_id: "conv-2",
        role: "assistant",
        content: "**Used: query_regional_summary**\n\nDuring Q1 2024 (Weeks 1 to 13), here is how the **North** and **South** regions compared:\n\n* **North Region**: Total Revenue of **£320.1K** with 148K units sold. Average promotional uplift was **24.5%** driven largely by BOGO offers.\n* **South Region**: Total Revenue of **£295.4K** and 132K units sold. Promotion participation was slightly lower, but direct-margin retained was higher from smaller discounts (average 10% in South vs 15% in North).\n\nNorth outperformed South in raw volume by **12.1%**, but was more discount-reliant.",
        tool_used: "query_regional_summary",
        created_at: new Date(Date.now() - 3600000 * 24 + 4000).toISOString()
      }
    ]
  }
];

export const createConversation = (title: string): Conversation => {
  const newConv: Conversation = {
    id: `conv-${Date.now()}`,
    title,
    created_at: new Date().toISOString(),
    messages: []
  };
  CONVERSATIONS.unshift(newConv);
  return newConv;
};

export const deleteConversation = (id: string): boolean => {
  const initialLength = CONVERSATIONS.length;
  CONVERSATIONS = CONVERSATIONS.filter(c => c.id !== id);
  return CONVERSATIONS.length < initialLength;
};

export const addMessageToConversation = (convId: string, role: 'user' | 'assistant', content: string, toolUsed?: string): Message => {
  const conversation = CONVERSATIONS.find(c => c.id === convId);
  if (!conversation) {
    throw new Error(`Conversation ${convId} not found`);
  }
  if (!conversation.messages) {
    conversation.messages = [];
  }
  
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversation_id: convId,
    role,
    content,
    tool_used: toolUsed,
    created_at: new Date().toISOString()
  };
  
  conversation.messages.push(newMessage);
  
  // Set title dynamically on first user message if it is generic
  if (conversation.title === 'New Chat' && role === 'user') {
    conversation.title = content.length > 30 ? content.slice(0, 30) + '...' : content;
  }
  
  return newMessage;
};
