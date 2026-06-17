import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ChevronLeft, ChevronRight, Store as StoreIcon, Beer, Tag, MapPin } from 'lucide-react';
import { Product, Store } from '../types';

interface ProductExplorerProps {
  products: Product[];
  stores: Store[];
  onAskProductAI: (product: Product) => void;
  onAskAllProductsAI: () => void;
  onAskStoreAI: (store: Store) => void;
  onAskAllStoresAI: () => void;
}

const CATEGORIES = ['All', 'Carbonated', 'Energy', 'Juice', 'Water', 'Dairy'];
const REGIONS = ['All', 'North', 'South', 'East', 'West'];
const ITEMS_PER_PAGE = 8;

export default function ProductExplorer({
  products,
  stores,
  onAskProductAI,
  onAskAllProductsAI,
  onAskStoreAI,
  onAskAllStoresAI
}: ProductExplorerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'stores'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products in real time based on search input and category toggles
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p => 
          p.product_name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.product_id.toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, searchTerm, selectedCategory]);

  // Filter stores in real time
  const filteredStores = useMemo(() => {
    let result = stores;

    if (selectedRegion !== 'All') {
      result = result.filter(s => s.region.toLowerCase() === selectedRegion.toLowerCase());
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        s => 
          s.store_name.toLowerCase().includes(term) ||
          s.city.toLowerCase().includes(term) ||
          s.store_format.toLowerCase().includes(term) ||
          s.store_id.toLowerCase().includes(term)
      );
    }

    return result;
  }, [stores, searchTerm, selectedRegion]);

  // Get active lists based on tab
  const activeListLength = activeSubTab === 'products' ? filteredProducts.length : filteredStores.length;
  const totalListLength = activeSubTab === 'products' ? products.length : stores.length;

  const totalPages = Math.ceil(activeListLength / ITEMS_PER_PAGE) || 1;
  
  const paginatedItems = useMemo(() => {
    const page = Math.min(currentPage, totalPages);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    if (activeSubTab === 'products') {
      return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    } else {
      return filteredStores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
  }, [activeSubTab, filteredProducts, filteredStores, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleTabChange = (tab: 'products' | 'stores') => {
    setActiveSubTab(tab);
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f7ff] h-screen scrollbar-thin flex flex-col" id="directory-explorer-view">
      {/* Top Bar Header */}
      <header className="px-8 py-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10 shrink-0 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">FMCG Master Directories</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Browse corporate portfolios - {activeSubTab === 'products' ? 'Beverage SKU Catalog' : 'Store Retail Networks'} ({activeListLength} of {totalListLength} listed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-Tab Toggle Switches */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => handleTabChange('products')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'products'
                  ? 'bg-white text-indigo-650 shadow-sm'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <Beer className="w-3.5 h-3.5" />
              SKU Catalog
            </button>
            <button
              onClick={() => handleTabChange('stores')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'stores'
                  ? 'bg-white text-indigo-650 shadow-sm'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5" />
              Retail Stores
            </button>
          </div>

          <button
            id="directory-ask-all-ai"
            onClick={activeSubTab === 'products' ? onAskAllProductsAI : onAskAllStoresAI}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/15 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Portfolio
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 max-w-7xl mx-auto space-y-6 w-full flex-1 flex flex-col justify-start min-h-0">
        
        {/* Search and Filters Configured dynamically by Tab state */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          
          {/* Unified search input */}
          <div className="relative flex items-center lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              id="directory-search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={activeSubTab === 'products' ? "Search products, brands, or SKU numbers..." : "Search corporate store names, locations, types..."}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
            />
          </div>

          {/* Tab 1: Categories filter */}
          {activeSubTab === 'products' ? (
            <div className="flex flex-wrap items-center gap-2 lg:col-span-2 overflow-x-auto py-1 scrollbar-none" id="product-category-pills">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`cat-pill-${cat}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Tab 2: Region filter */
            <div className="flex flex-wrap items-center gap-2 lg:col-span-2 overflow-x-auto py-1 scrollbar-none" id="store-region-pills">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Region:
              </span>
              {REGIONS.map((reg) => {
                const isActive = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    id={`reg-pill-${reg}`}
                    onClick={() => {
                      setSelectedRegion(reg);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {reg} Region
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Data table container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col justify-between min-h-0 overflow-hidden" id="directory-table-container">
          <div className="overflow-y-auto flex-1 min-h-[300px] scrollbar-thin">
            
            {activeSubTab === 'products' ? (
              /* PRODUCT TABLE LAYOUT */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 sticky top-0 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] z-10 bg-white">
                    <th className="py-3 px-4 w-28">Product ID</th>
                    <th className="py-3 px-4 pl-2">Product Name</th>
                    <th className="py-3 px-4 pl-2">Brand</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Sub-Category</th>
                    <th className="py-3 px-4 text-center">Pack Size</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold italic">
                        No beverage products match your current filtering criteria.
                      </td>
                    </tr>
                  ) : (
                    (paginatedItems as Product[]).map((p) => (
                      <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors" id={`row-${p.product_id}`}>
                        <td className="py-4 px-4 font-mono font-bold text-slate-450 text-slate-400">{p.product_id}</td>
                        <td className="py-4 px-4 pl-2 font-bold text-slate-900">{p.product_name}</td>
                        <td className="py-4 px-4 pl-2 text-slate-500">{p.brand}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            p.category === 'Carbonated' ? 'bg-[#e0f2fe] text-[#0369a1]' :
                            p.category === 'Juice' ? 'bg-[#fef3c7] text-[#92400e]' :
                            p.category === 'Water' ? 'bg-[#ccfbf1] text-[#0f766e]' :
                            p.category === 'Energy' ? 'bg-[#f3e8ff] text-[#6b21a8]' :
                            'bg-[#fce7f3] text-[#9d174d]'
                          }`}>
                            {p.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{p.sub_category}</td>
                        <td className="py-4 px-4 text-center font-mono text-slate-600">{p.pack_size_ml}ml</td>
                        <td className="py-4 px-4 text-right font-black text-slate-900">£{p.unit_price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            id={`btn-ask-ai-${p.product_id}`}
                            onClick={() => onAskProductAI(p)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Ask AI
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              /* STORE LIST LAYOUT (F-13 Complete Implementation) */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 sticky top-0 border-b border-slate-100 text-slate-445 font-bold uppercase tracking-wider text-[10px] text-slate-400 z-10 bg-white">
                    <th className="py-3 px-6 w-28">Store ID</th>
                    <th className="py-3 px-4 pl-2">Store Name</th>
                    <th className="py-3 px-4">Operating Region</th>
                    <th className="py-3 px-4">Metro City</th>
                    <th className="py-3 px-4">Retail Format</th>
                    <th className="py-3 px-4 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold italic">
                        No retail stores match your current region or location filters.
                      </td>
                    </tr>
                  ) : (
                    (paginatedItems as Store[]).map((s) => (
                      <tr key={s.store_id} className="hover:bg-slate-50/50 transition-colors" id={`row-${s.store_id}`}>
                        <td className="py-4 px-6 font-mono font-bold text-slate-400">{s.store_id}</td>
                        <td className="py-4 px-4 pl-2 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                          {s.store_name}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            s.region === 'North' ? 'bg-[#ecfdf5] text-[#047857]' :
                            s.region === 'South' ? 'bg-[#eff6ff] text-[#1d4ed8]' :
                            s.region === 'East' ? 'bg-[#fff7ed] text-[#c2410c]' :
                            'bg-[#faf5ff] text-[#7e22ce]'
                          }`}>
                            {s.region}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-semibold">{s.city}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-[#475569] text-[10px] font-bold rounded">
                            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                            {s.store_format}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            id={`btn-ask-store-ai-${s.store_id}`}
                            onClick={() => onAskStoreAI(s)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Ask AI
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

          </div>

          {/* Unified Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50" id="directory-footer">
            <span className="text-[11px] text-slate-500 font-semibold">
              Showing {activeListLength > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, activeListLength)} of {activeListLength} items
            </span>

            <div className="flex items-center gap-2">
              <button
                id="directory-prev-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-bold text-slate-700 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <button
                id="directory-next-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
