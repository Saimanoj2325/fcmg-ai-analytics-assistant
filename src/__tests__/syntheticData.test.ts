import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTS,
  STORES,
  SALES_PROMOTIONS,
  INVENTORY,
  query_sales_promotions,
  query_inventory,
  query_regional_summary,
  query_product_performance,
  query_promo_impact,
} from '../data/syntheticData';

// ─────────────────────────────────────────────
// Master data integrity
// ─────────────────────────────────────────────

describe('Master data: PRODUCTS', () => {
  it('should contain exactly 15 SKUs', () => {
    assert.equal(PRODUCTS.length, 15);
  });

  it('every SKU should have a product_id matching BEV-0XX format', () => {
    const valid = PRODUCTS.every(p => /^BEV-\d{3}$/.test(p.product_id));
    assert.ok(valid, 'All product IDs must match BEV-0XX pattern');
  });

  it('should cover exactly 5 categories', () => {
    const categories = new Set(PRODUCTS.map(p => p.category));
    assert.equal(categories.size, 5);
  });

  it('every product should have a positive unit_price', () => {
    const valid = PRODUCTS.every(p => p.unit_price > 0);
    assert.ok(valid, 'All products must have a positive unit price');
  });
});

describe('Master data: STORES', () => {
  it('should contain exactly 40 stores', () => {
    assert.equal(STORES.length, 40);
  });

  it('should have exactly 4 regions', () => {
    const regions = new Set(STORES.map(s => s.region));
    assert.deepEqual(regions, new Set(['North', 'South', 'East', 'West']));
  });

  it('every region should contain exactly 10 stores', () => {
    const counts: Record<string, number> = {};
    STORES.forEach(s => { counts[s.region] = (counts[s.region] || 0) + 1; });
    Object.values(counts).forEach(count => assert.equal(count, 10));
  });
});

describe('Transaction tables', () => {
  it('SALES_PROMOTIONS should contain 31,200 records', () => {
    assert.equal(SALES_PROMOTIONS.length, 31200);
  });

  it('INVENTORY should contain 31,200 records', () => {
    assert.equal(INVENTORY.length, 31200);
  });

  it('all sales revenue values should be non-negative', () => {
    const valid = SALES_PROMOTIONS.every(r => r.revenue >= 0);
    assert.ok(valid, 'No negative revenue values allowed');
  });

  it('all inventory closing_stock values should be non-negative', () => {
    const valid = INVENTORY.every(r => r.closing_stock >= 0);
    assert.ok(valid, 'Closing stock cannot be negative');
  });
});

// ─────────────────────────────────────────────
// query_sales_promotions
// ─────────────────────────────────────────────

describe('query_sales_promotions', () => {
  it('should return at most 100 records', () => {
    const result = query_sales_promotions({});
    assert.ok(result.length <= 100, 'Result must be capped at 100 rows');
  });

  it('should filter correctly by region', () => {
    const result = query_sales_promotions({ region: 'North' });
    const allNorth = result.every(r => r.region === 'North');
    assert.ok(allNorth, 'All results must be from the North region');
  });

  it('should filter correctly by product_id', () => {
    const result = query_sales_promotions({ product_id: 'BEV-001' });
    const allBEV001 = result.every(r => r.product_id === 'BEV-001');
    assert.ok(allBEV001, 'All results must be for BEV-001');
  });

  it('should filter correctly by date range', () => {
    const result = query_sales_promotions({ week_start: '2024-03-01', week_end: '2024-03-31' });
    const inRange = result.every(r => r.week_start_date >= '2024-03-01' && r.week_start_date <= '2024-03-31');
    assert.ok(inRange, 'All results must fall within the specified date range');
  });

  it('should filter correctly by promo_type', () => {
    const result = query_sales_promotions({ promo_type: 'Price Cut' });
    const allPriceCut = result.every(r => r.promotion_type?.toLowerCase() === 'price cut');
    assert.ok(allPriceCut, 'All results must have promotion_type "Price Cut"');
  });
});

// ─────────────────────────────────────────────
// query_inventory
// ─────────────────────────────────────────────

describe('query_inventory', () => {
  it('should return at most 100 records', () => {
    const result = query_inventory({});
    assert.ok(result.length <= 100);
  });

  it('should return only stockout records when stockout_only is true', () => {
    const result = query_inventory({ stockout_only: true });
    const allStockout = result.every(r => r.stockout_weeks_count > 0);
    assert.ok(allStockout, 'stockout_only filter must return only stockout records');
  });

  it('should filter by region correctly', () => {
    const result = query_inventory({ region: 'East' });
    const allEast = result.every(r => r.region === 'East');
    assert.ok(allEast, 'All results must be from the East region');
  });
});

// ─────────────────────────────────────────────
// query_regional_summary
// ─────────────────────────────────────────────

describe('query_regional_summary', () => {
  it('should return exactly 4 region rows', () => {
    const result = query_regional_summary({});
    assert.equal(result.length, 4);
  });

  it('should cover all 4 regions', () => {
    const result = query_regional_summary({});
    const regions = new Set(result.map(r => r.region));
    assert.deepEqual(regions, new Set(['North', 'South', 'East', 'West']));
  });

  it('all regions should have positive total_revenue', () => {
    const result = query_regional_summary({});
    const valid = result.every(r => r.total_revenue > 0);
    assert.ok(valid, 'Every region must have positive total revenue');
  });
});

// ─────────────────────────────────────────────
// query_product_performance
// ─────────────────────────────────────────────

describe('query_product_performance', () => {
  it('should return 5 results by default', () => {
    const result = query_product_performance({});
    assert.equal(result.length, 5);
  });

  it('should respect the top_n parameter', () => {
    const result = query_product_performance({ top_n: 3 });
    assert.equal(result.length, 3);
  });

  it('should return results sorted by revenue descending', () => {
    const result = query_product_performance({ top_n: 5 });
    for (let i = 0; i < result.length - 1; i++) {
      assert.ok(result[i].revenue >= result[i + 1].revenue, 'Results must be sorted by revenue descending');
    }
  });

  it('should filter by category', () => {
    const result = query_product_performance({ category: 'Energy' });
    const allEnergy = result.every(r => r.category === 'Energy');
    assert.ok(allEnergy, 'All results must belong to the Energy category');
  });
});

// ─────────────────────────────────────────────
// query_promo_impact
// ─────────────────────────────────────────────

describe('query_promo_impact', () => {
  it('should return a result object with uplift_percentage', () => {
    const result = query_promo_impact({});
    assert.ok('uplift_percentage' in result, 'Result must contain uplift_percentage');
  });

  it('promo_period should have positive total_units', () => {
    const result = query_promo_impact({});
    assert.ok(result.promo_period.total_units > 0, 'Promo period must have total units sold');
  });

  it('baseline_period should have positive total_units', () => {
    const result = query_promo_impact({});
    assert.ok(result.baseline_period.total_units > 0, 'Baseline period must have total units sold');
  });

  it('should filter by product_id', () => {
    const result = query_promo_impact({ product_id: 'BEV-001' });
    assert.equal(result.product_id, 'BEV-001');
  });

  it('should filter by region', () => {
    const result = query_promo_impact({ region: 'South' });
    assert.equal(result.region, 'South');
  });
});
