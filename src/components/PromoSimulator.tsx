import React, { useState, useMemo } from 'react';
import { Sparkles, Sliders, Play, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, TrendingUp, HelpCircle as HelpIcon } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

interface PromoSimulatorProps {
  onAskAI: (prompt: string) => void;
}

const CATEGORIES = [
  { name: 'Carbonated', baseMargin: 0.58, basePrice: 1.80, defaultVol: 320 },
  { name: 'Energy', baseMargin: 0.65, basePrice: 2.50, defaultVol: 240 },
  { name: 'Juice', baseMargin: 0.45, basePrice: 2.20, defaultVol: 180 },
  { name: 'Water', baseMargin: 0.70, basePrice: 1.10, defaultVol: 450 },
  { name: 'Dairy', baseMargin: 0.40, basePrice: 2.90, defaultVol: 110 }
];

const PROMOTIONS = [
  { type: 'Price Cut', multiplierFormula: (pct: number) => 1 + (pct * 2.5), stockoutRiskFactor: 1.2 },
  { type: 'BOGO', multiplierFormula: (pct: number) => 2.4, stockoutRiskFactor: 1.8 },
  { type: 'Display Feature', multiplierFormula: (pct: number) => 1.45, stockoutRiskFactor: 0.9 },
  { type: 'Bundle', multiplierFormula: (pct: number) => 1.6, stockoutRiskFactor: 1.1 }
];

export default function PromoSimulator({ onAskAI }: PromoSimulatorProps) {
  const [selectedCategory, setSelectedCategory] = useState('Carbonated');
  const [selectedPromo, setSelectedPromo] = useState('Price Cut');
  const [discountPct, setDiscountPct] = useState(20); // as percentage 0..50
  const [storeCount, setStoreCount] = useState(15); // out of 40 stores
  const [stockRatingCap, setStockRatingCap] = useState(100); // simulated shelf space stock

  const catMeta = useMemo(() => {
    return CATEGORIES.find(c => c.name === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  const promoMeta = useMemo(() => {
    return PROMOTIONS.find(p => p.type === selectedPromo) || PROMOTIONS[0];
  }, [selectedPromo]);

  // Compute calculated metrics
  const simResults = useMemo(() => {
    const baseVolWeekly = catMeta.defaultVol;
    const price = catMeta.basePrice;
    const marginRatio = catMeta.baseMargin;
    
    // Multipliers
    let discountFraction = discountPct / 100;
    if (selectedPromo === 'BOGO') {
      discountFraction = 0.50; // BOGO is inherently 50% discount
    } else if (selectedPromo === 'Display Feature') {
      discountFraction = 0.05; // displays have minimal direct discounts
    }

    const multiplier = promoMeta.multiplierFormula(discountPct);
    const promoVolWeekly = Math.round(baseVolWeekly * multiplier);
    
    // Baseline scenario (full 52-week single week equivalent)
    const baselineUnits = baseVolWeekly * storeCount;
    const baselineRev = baselineUnits * price;
    const baselineProfit = baselineRev * marginRatio;

    // Promo scenario (weekly scale)
    const promoUnits = promoVolWeekly * storeCount;
    const promoUnitPrice = price * (1 - discountFraction);
    const promoRev = promoUnits * promoUnitPrice;
    // Profit = (Revenue) - (Units * COGS)
    const cogsPerUnit = price * (1 - marginRatio);
    const promoProfit = promoUnits * (promoUnitPrice - cogsPerUnit);

    const revLift = ((promoRev - baselineRev) / baselineRev) * 100;
    const volLift = ((promoUnits - baselineUnits) / baselineUnits) * 100;
    const profitLift = ((promoProfit - baselineProfit) / baselineProfit) * 100;

    // Stockout risk hazard
    const totalVolumeStore = promoVolWeekly;
    const maxCapacity = stockRatingCap;
    const ratio = totalVolumeStore / maxCapacity;
    let riskScore = Math.min(100, Math.max(0, Math.round(ratio * 50 * promoMeta.stockoutRiskFactor)));
    
    let stockoutRiskLabel = 'Low Risk';
    let stockoutColor = 'text-emerald-605 bg-emerald-50 border-emerald-100 text-emerald-700';
    if (riskScore > 75) {
      stockoutRiskLabel = 'Critical Danger';
      stockoutColor = 'text-rose-600 bg-rose-55 bg-rose-50 border-rose-100 text-rose-700 animate-pulse';
    } else if (riskScore > 40) {
      stockoutRiskLabel = 'Moderate Concern';
      stockoutColor = 'text-amber-600 bg-amber-50 border-amber-100 text-amber-700';
    }

    return {
      baselineUnits,
      baselineRev,
      baselineProfit,
      promoUnits,
      promoRev,
      promoProfit,
      volLift: Math.round(volLift),
      revLift: Math.round(revLift),
      profitLift: Math.round(profitLift),
      riskScore,
      stockoutRiskLabel,
      stockoutColor,
      promoUnitPrice,
      price
    };
  }, [selectedCategory, selectedPromo, discountPct, storeCount, catMeta, promoMeta, stockRatingCap]);

  // Generate chart data over a range of discounts (0% to 50%)
  const elasticityChartData = useMemo(() => {
    const baseVolWeekly = catMeta.defaultVol;
    const price = catMeta.basePrice;
    const marginRatio = catMeta.baseMargin;
    const cogsPerUnit = price * (1 - marginRatio);

    return Array.from({ length: 11 }, (_, i) => {
      const disc = i * 5; // 0, 5, 10...50
      let dFraction = disc / 100;
      if (selectedPromo === 'BOGO') {
        dFraction = 0.50;
      } else if (selectedPromo === 'Display Feature') {
        dFraction = 0.05;
      }

      const mult = promoMeta.multiplierFormula(disc);
      const units = Math.round(baseVolWeekly * mult) * storeCount;
      const finalPrice = price * (1 - dFraction);
      const revenue = units * finalPrice;
      const profit = units * (finalPrice - cogsPerUnit);

      return {
        discount: `${disc}%`,
        Revenue: Math.round(revenue / 100) / 10, // in thousands
        Profit: Math.round(profit / 100) / 10
      };
    });
  }, [selectedCategory, selectedPromo, storeCount, catMeta, promoMeta]);

  const triggerAICritique = () => {
    let discDesc = `${discountPct}% Discount`;
    if (selectedPromo === 'BOGO') discDesc = 'BOGO Deal (50% direct reduction)';
    if (selectedPromo === 'Display Feature') discDesc = `In-Store Stand + 5% reduction`;

    const prompt = `Simulate and critique the following promotional campaign scenario:
- **Product Category**: Beverages ${selectedCategory}
- **Promo Mechanics**: ${selectedPromo} (${discDesc})
- **Scope**: ${storeCount} Stores
- **Calculated Volume Lift**: ${simResults.volLift}%
- **Calculated Net Revenue Lift**: ${simResults.revLift}%
- **Stockout Risk Rating**: ${simResults.stockoutRiskLabel} (${simResults.riskScore}/100)

Using the PostgreSQL FMCG database tools, critique this projection:
1. Compare this to historical performance in the database for similar categories/promotions.
2. Recommend the optimal discount level to avoid stockouts while maximizing category net profit contributions.`;
    onAskAI(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f7ff] h-screen scrollbar-thin flex flex-col" id="simulator-view">
      {/* Top Bar Header */}
      <header className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Promo What-If Simulator</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">饮料品类促销模拟器 · Dynamic Pricing Elasticity & Supply Chain Hazard Testing</p>
        </div>
        <button
          onClick={triggerAICritique}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/15 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          AI Scenario Critique
        </button>
      </header>

      {/* Main Container */}
      <main className="p-8 max-w-7xl mx-auto space-y-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT PANEL: INPUT INTERFACE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Campaign Configuration</h3>
            </div>

            {/* Product Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Consumer Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      if (cat.name === 'Water') setStockRatingCap(500);
                      else if (cat.name === 'Dairy') setStockRatingCap(150);
                      else setStockRatingCap(250);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedCategory === cat.name
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Promo Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-sans">Promo Mechanics</label>
              <div className="grid grid-cols-2 gap-2">
                {PROMOTIONS.map(promo => (
                  <button
                    key={promo.type}
                    onClick={() => {
                      setSelectedPromo(promo.type);
                      if (promo.type === 'BOGO') setDiscountPct(50);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedPromo === promo.type
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    {promo.type}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Area */}
            <div className="space-y-5 pt-3">
              {/* Discount Percentage slider (if not constant like BOGO) */}
              {selectedPromo !== 'BOGO' && selectedPromo !== 'Display Feature' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Discount Level</span>
                    <span className="text-indigo-600 font-mono font-black">{discountPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
                    <span>Conservative (5%)</span>
                    <span>Aggressive (50%)</span>
                  </div>
                </div>
              )}

              {/* Number of targeted stores */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-wider">Target Outlets</span>
                  <span className="text-indigo-600 font-mono font-black">{storeCount} / 40 Stores</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={storeCount}
                  onChange={(e) => setStoreCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
                  <span>Pilot (1)</span>
                  <span>National Rollout (40)</span>
                </div>
              </div>

              {/* simulated baseline capacity constraint for supply alerts */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-wider">Store Inventory Buffer</span>
                  <span className="text-indigo-600 font-mono font-black">{stockRatingCap} Units / Store</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="600"
                  step="20"
                  value={stockRatingCap}
                  onChange={(e) => setStockRatingCap(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
                  <span>Tight Shelf Space</span>
                  <span>Deep Backroom Storage</span>
                </div>
              </div>
            </div>

            {/* Simulated Action button for review */}
            <div className="pt-3">
              <button
                onClick={triggerAICritique}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-650 transition-colors shadow-md hover:bg-slate-800 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Submit Configuration to Gemini
              </button>
            </div>
          </div>

          {/* RIGHT PANELS: SIMULATED IMPACT OUTPUTS */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              {/* Card 1: Units Uplift */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Projected Volume Lift</span>
                <span className="text-2xl font-black text-indigo-600 block my-1 font-mono">+{simResults.volLift}%</span>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Estimated {simResults.promoUnits.toLocaleString()} units sold vs baseline {simResults.baselineUnits.toLocaleString()}
                </p>
              </div>

              {/* Card 2: Revenue Lift */}
              <div className="bg-white p-5 rounded-2xl border border-slate-150 border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Expected Revenue Impact</span>
                <span className={`text-2xl font-black block my-1 font-mono ${simResults.revLift >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {simResults.revLift >= 0 ? '+' : ''}{simResults.revLift}%
                </span>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Projecting £{Math.round(simResults.promoRev).toLocaleString()} total value across targeted stores this week
                </p>
              </div>

              {/* Card 3: Stockout Danger Score */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Supply Chain Risk</span>
                  <span className="text-2xl font-black text-slate-900 block my-1 font-mono">{simResults.riskScore} <span className="text-xs text-slate-400 font-normal">/100</span></span>
                </div>
                <div className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg border leading-tight ${simResults.stockoutColor}`}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{simResults.stockoutRiskLabel}</span>
                </div>
              </div>
            </div>

            {/* INTEGRATED GRAPH: ELASTICITY CURVE OUTLET */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col justify-between min-h-[280px]">
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Elasticity Profitability Maximizer</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Projected single-week category net performance across standard markdown indices (£00s value)
                </p>
              </div>

              <div className="flex-1 h-56 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={elasticityChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="discount" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `£${val}k`} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: number) => [`£${(value * 100).toLocaleString()}`, '']}
                      contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontSize: '11px', color: '#1e293b' }}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PREDICTIVE AI FEEDBACK SUMMARY ACCORDION */}
            <div className="bg-indigo-900 text-indigo-50 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="inline-flex items-center gap-1 bg-indigo-800 text-indigo-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Gemini Predictive Guidance
                </span>
                <h4 className="text-xs font-bold leading-relaxed mt-2 text-white">
                  {simResults.riskScore > 75 ? (
                    '⚠️ Supply danger detected! Rapid baseline shelf depletion will cause out-of-stock events at 15+ hypermarkets and supermarkets. Reduce markdown or provision additional inventory reserves.'
                  ) : simResults.profitLift < 0 ? (
                    '💡 Value leakage. The volume uplift of BOGO deals is too weak to cover standard manufacturing COGS margins. Choose a 15-20% Price Cut promotion instead.'
                  ) : (
                    '✅ Optimal balance found. Net contribution margins remain positive while supply chains remain intact without triggering critical localized out-of-stocks.'
                  )}
                </h4>
              </div>
              <button
                onClick={triggerAICritique}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white text-indigo-900 rounded-xl text-xs font-extrabold hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                Ask AI to adjust
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
