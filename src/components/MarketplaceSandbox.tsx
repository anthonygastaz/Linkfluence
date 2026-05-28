import React, { useState } from 'react';
import { Search, ExternalLink, Zap, Flame, DollarSign, Filter, Gift, CheckCircle } from 'lucide-react';

interface Offer {
  id: string;
  brand: string;
  category: string;
  rate: string;
  avgEarning: string;
  payoutTime: string;
  popularity: 'High' | 'Extremely High' | 'Trending';
  difficulty: 'Easy' | 'Medium';
}

const DEALS: Offer[] = [
  { id: '1', brand: 'Shopify Enterprise', category: 'SaaS', rate: '200% Bounty', avgEarning: '$150/convert', payoutTime: '7 Days', popularity: 'Extremely High', difficulty: 'Medium' },
  { id: '2', brand: 'Semrush Pro', category: 'SaaS', rate: '40% Recurring', avgEarning: '$48/month', payoutTime: 'Weekly', popularity: 'High', difficulty: 'Medium' },
  { id: '3', brand: 'Webflow Growth', category: 'SaaS', rate: '30% recurring', avgEarning: '$12/month', payoutTime: 'Weekly', popularity: 'Trending', difficulty: 'Easy' },
  { id: '4', brand: 'Notion Plus', category: 'SaaS', rate: '50% first-year', avgEarning: '$40/convert', payoutTime: 'Weekly', popularity: 'High', difficulty: 'Easy' },
  { id: '5', brand: 'Wise Multi-Currency', category: 'Finance', rate: '45% bounty', avgEarning: '$22/registrant', payoutTime: '7 Days', popularity: 'Trending', difficulty: 'Easy' },
  { id: '6', brand: 'Robinhood Premium', category: 'Finance', rate: '50% commission', avgEarning: '$60/transfer', payoutTime: 'Weekly', popularity: 'Extremely High', difficulty: 'Medium' },
  { id: '7', brand: 'Ledger Nano Storage', category: 'Finance', rate: '15% per hardware', avgEarning: '$22/sale', payoutTime: '7 Days', popularity: 'High', difficulty: 'Medium' },
  { id: '8', brand: 'ConvertKit Creator', category: 'SaaS', rate: '30% recurring', avgEarning: '$15/month', payoutTime: 'Weekly', popularity: 'Trending', difficulty: 'Easy' },
];

interface MarketplaceSandboxProps {
  onJoinClick: () => void;
}

export default function MarketplaceSandbox({ onJoinClick }: MarketplaceSandboxProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'SaaS' | 'Finance'>('All');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const filteredDeals = DEALS.filter(deal => {
    const matchesSearch = deal.brand.toLowerCase().includes(search.toLowerCase()) || deal.category.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || deal.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div id="marketplace-sandbox" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">
          Search and preview top commission deals. Join Affiliate Associate Program to copy your custom trackers.
        </p>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white px-4 py-2 rounded-2xl border border-gray-100">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            className="w-full text-xs font-sans pl-8 pr-3 py-2 border border-gray-100 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371]"
            placeholder="Search brand offers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search size={14} className="text-gray-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['All', 'SaaS', 'Finance'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Live Directory Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredDeals.length > 0 ? (
          filteredDeals.map(deal => (
            <div
              key={deal.id}
              onClick={() => setSelectedOffer(deal)}
              className={`p-4 border rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                selectedOffer?.id === deal.id
                  ? 'border-[#3CB371] bg-[#3CB371]/5 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 font-sans tracking-wide bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {deal.category}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame size={10} /> {deal.popularity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-black font-sans flex items-center gap-1.5">
                  {deal.brand}
                  <ExternalLink size={12} className="text-gray-400" />
                </h4>

                <div className="mt-3 grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">COMMISSION</span>
                    <span className="text-xs font-extrabold text-[#3CB371]">{deal.rate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">AVG PAYOUT</span>
                    <span className="text-xs font-bold text-gray-700">{deal.avgEarning}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-[10px] text-gray-500 font-mono">Payout settling: <b>{deal.payoutTime}</b></span>
                <span className="text-xs font-semibold text-[#3CB371] flex items-center gap-1">
                  View Offer details &rarr;
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-sm text-gray-400 font-mono">
            No brand offers found matching '{search}'.
          </div>
        )}
      </div>

      {selectedOffer && (
        <div className="border border-[#3CB371]/20 bg-[#3CB371]/5 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex-1">
            <h5 className="font-bold text-sm text-black flex items-center gap-1">
              <Gift size={16} className="text-[#3CB371]" /> Ready to promote {selectedOffer.brand}?
            </h5>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Earn an estimated <strong className="text-black">{selectedOffer.avgEarning}</strong> of commission per check. Every single conversion is instantly tracked and paid directly into your wallet.
            </p>
          </div>
          <button
            onClick={onJoinClick}
            type="button"
            className="bg-black hover:bg-gray-800 text-white font-semibold text-xs py-2.5 px-5 rounded-full shrink-0 flex items-center gap-1.5 transition-colors duration-150 shadow-sm"
          >
            Claim Referral Tracker <Zap size={12} className="text-[#3CB371] fill-[#3CB371]" />
          </button>
        </div>
      )}
    </div>
  );
}
