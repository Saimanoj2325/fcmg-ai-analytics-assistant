import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  ArrowRight, 
  Loader2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardSummary } from '../types';

interface DashboardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onAskAI: (prompt: string) => void;
}

export default function Dashboard({
  summary,
  isLoading,
  error,
  onRefresh,
  onAskAI
}: DashboardProps) {

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f7ff] h-screen" id="dashboard-loading">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Crunching beverage sales data...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f7ff] p-8 h-screen" id="dashboard-error">
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-100 max-w-md text-center border border-slate-100">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load analytics</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            There was an error loading the synthetic FMCG database metrics. {error}
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Data Generation
          </button>
        </div>
      </div>
    );
  }

  const { kpis, revenueTrend, topProducts, regionPerformance } = summary;

  // Custom tooltips matching the design aesthetic
  const formatRevenueCurrency = (val: number) => {
    if (val >= 1000) return `£${(val / 1000).toFixed(1)}M`;
    return `£${val.toLocaleString()}`;
  };

  const CustomTrendBadge = ({ value, label, isReversed = false }: { value: number; label: string; isReversed?: boolean }) => {
    const isUp = value >= 0;
    const isPositiveChange = isReversed ? !isUp : isUp;
    
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
        isPositiveChange 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'bg-rose-50 text-rose-700'
      }`}>
        {isUp ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
        {Math.abs(value)}%
        <span className="text-[10px] text-slate-400 font-normal ml-0.5">{label}</span>
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f7ff] h-screen scrollbar-thin" id="dashboard-view">
      {/* Top Bar Header */}
      <header className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">FMCG Business Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">饮料品类分析大盘 · General Beverage Category · 12 Weeks Trend · 40 Stores</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-semibold">
            Last 52 weeks
          </span>
          <button 
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
            title="Re-seed synthetic records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-grid">
          
          {/* Card 1: TOTAL REVENUE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Total Revenue</span>
            <div className="my-3">
              <span className="text-2xl font-black text-slate-900">£{kpis.totalRevenue}M</span>
            </div>
            <div className="border-t border-slate-50 pt-3 flex items-center">
              <CustomTrendBadge value={kpis.totalRevenueTrend} label="Last 52w" />
            </div>
          </div>

          {/* Card 2: UNITS SOLD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Units Sold</span>
            <div className="my-3">
              <span className="text-2xl font-black text-slate-900">{kpis.unitsSold.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-50 pt-3 flex items-center">
              <CustomTrendBadge value={kpis.unitsSoldTrend} label="Last 52w" />
            </div>
          </div>

          {/* Card 3: ACTIVE PROMOTIONS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Active Promotions</span>
            <div className="my-3">
              <span className="text-2xl font-black text-slate-900">{kpis.activePromotions}</span>
            </div>
            <div className="border-t border-slate-50 pt-3 flex items-center">
              <CustomTrendBadge value={kpis.activePromotionsTrend} label="This week" />
            </div>
          </div>

          {/* Card 4: STOCKOUT RATE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Stockout Rate</span>
            <div className="my-3">
              <span className="text-2xl font-black text-slate-900">{kpis.stockoutRate}%</span>
            </div>
            <div className="border-t border-slate-50 pt-3 flex items-center">
              <CustomTrendBadge value={kpis.stockoutRateTrend} label="vs last period" isReversed={true} />
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Trend Line / Bar Chart (12 Weeks) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm leading-tight">Revenue Trend</h3>
                <span className="text-xs text-slate-400">Weekly revenue — most recent 12 weeks (£000s)</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-505 bg-indigo-600"></span>
                Weekly Revenue
              </span>
            </div>
            
            <div className="flex-1 h-64 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="weekStartDate" 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`£${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Week Starting: ${label}`}
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontSize: '11px', color: '#1e293b' }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Comparison Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-tight">Region Performance</h3>
                  <span className="text-xs text-slate-400">Total consolidated revenue by region</span>
                </div>
              </div>

              {/* Custom Horizontal Bar Charts */}
              <div className="space-y-4">
                {regionPerformance.map((item) => {
                  // Percentage calculation relative to max revenue
                  const maxRevenue = Math.max(...regionPerformance.map(r => r.revenue));
                  const percentageWidth = (item.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={item.region} className="space-y-1" id={`region-bar-${item.region}`}>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{item.region}</span>
                        <span>£{item.revenue.toLocaleString()}K</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentageWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-50 pt-5 mt-4">
              <button
                id="ask-ai-regions"
                onClick={() => onAskAI("Which beverage categories and specific stores drove the top sales in each region last month?")}
                className="w-full flex items-center justify-center gap-2 group text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors. cursor-pointer"
              >
                Ask AI about regions
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="top-products-panel">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">Top 5 Products by Revenue</h3>
              <span className="text-xs text-slate-400">Ranked by overall generated contribution for full 52 weeks</span>
            </div>
            <button
              id="ask-ai-products"
              onClick={() => onAskAI("Analyze the top 5 highest-revenue beverage products. What was their promotional uplift percentage?")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Ask AI about products
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 text-center w-12">#</th>
                  <th className="pb-3 pl-2">Product</th>
                  <th className="pb-3 pl-2">Category</th>
                  <th className="pb-3 pr-4 text-right">Consolidated Revenue</th>
                  <th className="pb-3 text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {topProducts.map((p, idx) => {
                  const isGold = idx === 0;
                  return (
                    <tr 
                      key={p.product_id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => onAskAI(`What is the sales performance of ${p.product_name} BEV-00${idx+1}? Is there any stockout warnings?`)}
                    >
                      <td className="py-4 text-center">
                        {isGold ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-50 text-amber-500 rounded-full font-bold">
                            <Trophy className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-4 pl-2 font-bold text-slate-950">
                        {p.product_name}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{p.product_id}</span>
                      </td>
                      <td className="py-4 pl-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          p.category === 'Carbonated' ? 'bg-[#e0f2fe] text-[#0369a1]' :
                          p.category === 'Juice' ? 'bg-[#fef3c7] text-[#92400e]' :
                          p.category === 'Water' ? 'bg-[#ccfbf1] text-[#0f766e]' :
                          p.category === 'Energy' ? 'bg-[#f3e8ff] text-[#6b21a8]' :
                          'bg-[#fce7f3] text-[#9d174d]'
                        }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right font-bold text-slate-900">
                        £{(p.revenue).toFixed(1)}K
                      </td>
                      <td className="py-4 text-right font-mono text-slate-500">
                        {p.unitsSold.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
