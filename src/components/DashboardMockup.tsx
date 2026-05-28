import React, { useState, useEffect } from 'react';
import { TrendingUp, Copy, Check, Sparkles, RefreshCw, Layers, DollarSign, MousePointerClick } from 'lucide-react';

interface Conversion {
  id: string;
  brand: string;
  time: string;
  amount: number;
}

const CONST_NICHES = [
  { id: 'saas', name: 'Software/SaaS', rate: 0.30, avgPrice: 120, label: '30% Commission' },
  { id: 'finance', name: 'Finance/Wealth', rate: 0.45, avgPrice: 200, label: '45% Commission' },
  { id: 'ecommerce', name: 'E-commerce', rate: 0.12, avgPrice: 85, label: '12% Commission' },
  { id: 'education', name: 'Ed-Tech/Courses', rate: 0.25, avgPrice: 150, label: '25% Commission' },
];

export default function DashboardMockup() {
  const [selectedNiche, setSelectedNiche] = useState(CONST_NICHES[0]);
  const [clicks, setClicks] = useState(2500);
  const [convRate, setConvRate] = useState(2.2); // Percentage
  const [customUrl, setCustomUrl] = useState('https://shopify.com/enterprise-commerce');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Live conversions list
  const [conversions, setConversions] = useState<Conversion[]>([
    { id: '1', brand: 'Shopify', time: 'Just now', amount: 36.00 },
    { id: '2', brand: 'ConvertKit', time: '2m ago', amount: 15.60 },
    { id: '3', brand: 'Notion', time: '5m ago', amount: 12.00 },
    { id: '4', brand: 'Semrush', time: '12m ago', amount: 59.40 },
  ]);

  // Handle live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const brands = ['HubSpot', 'Webflow', 'Notion', 'Shopify', 'Semrush', 'Canva', 'ConvertKit'];
      const selectBrand = brands[Math.floor(Math.random() * brands.length)];
      // calculate realistic commission based on selection or random
      const niche = CONST_NICHES.find(n => selectBrand.toLowerCase().includes(n.id)) || CONST_NICHES[0];
      const amount = parseFloat((Math.random() * 80 + 10).toFixed(2));
      
      const newConversion: Conversion = {
        id: Date.now().toString(),
        brand: selectBrand,
        time: 'Just now',
        amount: amount,
      };

      setConversions(prev => {
        // Update times for others
        const updated = prev.map(c => {
          if (c.time === 'Just now') return { ...c, time: '1m ago' };
          if (c.time.includes('m ago')) {
            const minutes = parseInt(c.time) + 1;
            return { ...c, time: `${minutes}m ago` };
          }
          return c;
        });
        return [newConversion, ...updated.slice(0, 3)];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Calculate live earnings
  // Click * (convRate / 100) * (Selected Niche Average Product Price) * Selected Niche Commission Rate
  const projectedWeeklySales = Math.max(1, Math.round(clicks * (convRate / 100)));
  const averageCommissionValue = parseFloat((selectedNiche.avgPrice * selectedNiche.rate).toFixed(2));
  const projectedWeeklyCommissions = Math.round(projectedWeeklySales * averageCommissionValue);

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    const cleanUrl = customUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    const randomizedParam = Math.random().toString(36).substring(7);
    const short = `linkfluence.co/ref/${randomizedParam}?utm_source=lf`;
    setGeneratedLink(short);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="hero-dashboard-mockup" className="w-full flex flex-col gap-5 rounded-2xl bg-[#FAFAF8] p-5 border border-gray-100 max-h-full overflow-y-auto">
      {/* Top Ledger Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
            <span className="flex items-center gap-1"><DollarSign size={12} className="text-[#3CB371]" /> Available Payout</span>
            <span className="text-[#3CB371] font-mono font-medium">Active</span>
          </div>
          <span className="text-2xl font-bold text-black font-sans leading-none tracking-tight">
            $1,482.50
          </span>
          <span className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 font-mono">
            Next payout: Mon, 9:00 AM
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
            <span className="flex items-center gap-1"><MousePointerClick size={12} className="text-[#3CB371]" /> Conversion CTR</span>
            <span className="text-[#3CB371] font-mono font-medium bg-[#3CB371]/10 px-1 rounded">+0.4%</span>
          </div>
          <span className="text-2xl font-bold text-black font-sans leading-none tracking-tight">
            2.84%
          </span>
          <span className="text-xs text-[#3CB371] mt-1.5 flex items-center gap-0.5 font-medium">
            <TrendingUp size={12} /> Outperforming average (1.8%)
          </span>
        </div>
      </div>

      {/* Estimator Engine */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#3CB371]" />
            <h3 className="font-semibold text-sm text-black">Commission Estimator</h3>
          </div>
          <span className="text-[11px] uppercase tracking-widest font-mono text-gray-400">Calculator</span>
        </div>

        {/* Niche Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400 font-medium font-mono">1. Select Target Category</label>
          <div className="grid grid-cols-2 gap-1.5">
            {CONST_NICHES.map(niche => (
              <button
                key={niche.id}
                type="button"
                onClick={() => setSelectedNiche(niche)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                  selectedNiche.id === niche.id
                    ? 'border-[#3CB371] bg-[#3CB371]/5 text-black'
                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <div className="font-semibold">{niche.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{niche.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Slivers sliders */}
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">2. Weekly Target Clicks</span>
              <span className="font-semibold font-mono text-black">{clicks.toLocaleString()} clicks</span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={clicks}
              onChange={e => setClicks(Number(e.target.value))}
              className="w-full accent-[#3CB371] bg-gray-100 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">3. Est. Convert Rate</span>
              <span className="font-semibold font-mono text-black">{convRate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8.0"
              step="0.1"
              value={convRate}
              onChange={e => setConvRate(Number(e.target.value))}
              className="w-full accent-[#3CB371] bg-gray-100 rounded-lg cursor-pointer h-1.5"
            />
          </div>
        </div>

        {/* Project Output Panel */}
        <div className="bg-[#3CB371]/5 border border-[#3CB371]/20 rounded-xl p-4 flex flex-col justify-between md:flex-row items-start md:items-center gap-3">
          <div>
            <span className="text-gray-500 text-xs">Projected revenue rate</span>
            <div className="text-3xl font-extrabold text-[#3CB371] font-sans tracking-tight">
              ${projectedWeeklyCommissions.toLocaleString()}
              <span className="text-xs text-gray-400 font-normal"> / week</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 flex flex-col justify-start md:items-end uppercase tracking-wider font-mono">
            <span>{projectedWeeklySales} orders / wk</span>
            <span>${averageCommissionValue} avg commission</span>
          </div>
        </div>
      </div>

      {/* Quick Instant Tracker generator */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-xs text-black uppercase tracking-wider font-mono text-left">Generate Tracker Link</h4>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">Instant Sandbox</span>
        </div>

        <form onSubmit={handleGenerateLink} className="flex gap-2">
          <input
            type="text"
            className="flex-1 text-xs border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono"
            placeholder="Paste brand offer URL page..."
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors duration-200"
          >
            Generate
          </button>
        </form>

        {generatedLink ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between gap-2.5 text-xs">
            <span className="font-mono text-[#3CB371] truncate font-medium">{generatedLink}</span>
            <button
              onClick={copyToClipboard}
              className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 p-1.5 rounded-md shrink-0 flex items-center gap-1 text-[11px] font-semibold transition-colors duration-150"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-[#3CB371]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-gray-400 text-center py-1">
            Click 'Generate' to see how instant tracking links are built.
          </div>
        )}
      </div>

      {/* Simulated Live conversion ledger */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold text-gray-400">
          <span>Live Payout Activity</span>
          <span className="flex items-center gap-1 bg-gray-50 text-[10px] px-1.5 py-0.5 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3CB371] animate-pulse"></div> REAL-TIME
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {conversions.map((conv, idx) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-gray-50 hover:bg-gray-50/50 transition-all ${
                idx === 0 ? 'bg-[#3CB371]/5 border-[#3CB371]/10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center font-bold text-[10px] text-gray-700 font-mono">
                  {conv.brand.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    {conv.brand} Offer
                    {idx === 0 && (
                      <span className="text-[9px] bg-red-100 text-red-500 font-medium px-1 rounded font-mono">NEW</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{conv.time}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-[#3CB371] font-mono bg-[#3CB371]/10 px-2 py-0.5 rounded-full">
                  +${conv.amount.toFixed(2)}
                </span>
                <div className="text-[9px] text-gray-400 mt-0.5 font-mono">Settle Pending</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
