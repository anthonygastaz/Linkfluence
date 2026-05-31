import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Copy, Check, Sparkles, DollarSign, MousePointerClick } from 'lucide-react';

/** Fixed-height hero side panel — scrolls only when focused or tapped */
export function HeroDashboardScrollPanel({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activate = () => setActive(true);

  const deactivate = () => {
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) {
        setActive(false);
      }
    });
  };

  return (
    <div className={`hero-dashboard-scroll relative flex flex-col min-h-0 flex-1 lg:h-full ${active ? 'is-active' : ''}`}>
      <div
        ref={panelRef}
        tabIndex={0}
        role="region"
        aria-label="Live workspace preview — tap or focus to scroll"
        className={`hero-dashboard-scroll__viewport h-full min-h-0 ${active ? 'is-active' : ''}`}
        onFocus={activate}
        onBlur={deactivate}
        onPointerDown={activate}
      >
        {children}
      </div>
      <div
        className={`hero-dashboard-scroll__fade pointer-events-none ${active ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />
      {!active && (
        <span className="absolute bottom-2.5 left-0 right-0 text-center text-[10px] text-gray-400/90 font-mono pointer-events-none select-none">
          Tap to explore
        </span>
      )}
    </div>
  );
}

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
  const [convRate, setConvRate] = useState(2.2);
  const [customUrl, setCustomUrl] = useState('https://shopify.com/enterprise-commerce');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [conversions, setConversions] = useState<Conversion[]>([
    { id: '1', brand: 'HubSpot', time: 'Just now', amount: 65.62 },
    { id: '2', brand: 'Semrush', time: '1m ago', amount: 80.26 },
    { id: '3', brand: 'HubSpot', time: '2m ago', amount: 74.83 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const brands = ['HubSpot', 'Webflow', 'Notion', 'Shopify', 'Semrush', 'Canva', 'ConvertKit'];
      const selectBrand = brands[Math.floor(Math.random() * brands.length)];
      const amount = parseFloat((Math.random() * 80 + 10).toFixed(2));

      const newConversion: Conversion = {
        id: Date.now().toString(),
        brand: selectBrand,
        time: 'Just now',
        amount,
      };

      setConversions((prev) => {
        const updated = prev.map((c) => {
          if (c.time === 'Just now') return { ...c, time: '1m ago' };
          if (c.time.includes('m ago')) {
            const minutes = parseInt(c.time, 10) + 1;
            return { ...c, time: `${minutes}m ago` };
          }
          return c;
        });
        return [newConversion, ...updated.slice(0, 2)];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const projectedWeeklySales = Math.max(1, Math.round(clicks * (convRate / 100)));
  const averageCommissionValue = parseFloat((selectedNiche.avgPrice * selectedNiche.rate).toFixed(2));
  const projectedWeeklyCommissions = Math.round(projectedWeeklySales * averageCommissionValue);

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    const randomizedParam = Math.random().toString(36).substring(7);
    setGeneratedLink(`linkfluence.co/ref/${randomizedParam}?utm_source=lf`);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="hero-dashboard-mockup"
      className="w-full min-w-0 flex flex-col gap-2.5 sm:gap-3.5 lg:gap-4 rounded-xl lg:rounded-2xl bg-[#FAFAF8]/90 lg:bg-[#FAFAF8] p-3 sm:p-4 lg:p-5 border border-gray-100/80 lg:border-gray-100"
    >
      {/* Top ledger cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 lg:p-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-1 text-gray-400 text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wide font-semibold mb-0.5 sm:mb-1">
            <span className="flex items-center gap-0.5 sm:gap-1 truncate">
              <DollarSign size={11} className="text-[#3CB371] shrink-0" />
              <span className="truncate">Available Payout</span>
            </span>
            <span className="text-[#3CB371] font-mono font-medium shrink-0">Active</span>
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-black font-sans leading-none tracking-tight">
            $1,482.50
          </span>
          <span className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-1.5 font-mono truncate">
            Next payout: Mon, 9:00 AM
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 lg:p-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-1 text-gray-400 text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wide font-semibold mb-0.5 sm:mb-1">
            <span className="flex items-center gap-0.5 sm:gap-1 truncate">
              <MousePointerClick size={11} className="text-[#3CB371] shrink-0" />
              <span className="truncate">Conversion CTR</span>
            </span>
            <span className="text-[#3CB371] font-mono font-medium bg-[#3CB371]/10 px-1 rounded shrink-0">+0.4%</span>
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-black font-sans leading-none tracking-tight">
            2.84%
          </span>
          <span className="text-[10px] sm:text-xs text-[#3CB371] mt-1 sm:mt-1.5 flex items-center gap-0.5 font-medium leading-tight">
            <TrendingUp size={11} className="shrink-0" />
            <span className="truncate">Outperforming avg (1.8%)</span>
          </span>
        </div>
      </div>

      {/* Commission estimator */}
      <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 flex flex-col gap-2.5 sm:gap-3 lg:gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Sparkles size={14} className="text-[#3CB371] shrink-0" />
            <h3 className="font-semibold text-xs sm:text-sm text-black truncate">Commission Estimator</h3>
          </div>
          <span className="text-[9px] sm:text-[11px] uppercase tracking-widest font-mono text-gray-400 shrink-0">
            Calculator
          </span>
        </div>

        <div className="flex flex-col gap-1 sm:gap-1.5">
          <label className="text-[10px] sm:text-xs text-gray-400 font-medium font-mono">
            1. Select Target Category
          </label>
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
            {CONST_NICHES.map((niche) => (
              <button
                key={niche.id}
                type="button"
                onClick={() => setSelectedNiche(niche)}
                className={`py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-md sm:rounded-lg border text-[10px] sm:text-xs font-medium text-left transition-all min-w-0 ${
                  selectedNiche.id === niche.id
                    ? 'border-[#3CB371] bg-[#3CB371]/5 text-black'
                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <div className="font-semibold truncate">{niche.name}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{niche.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <div className="flex items-center justify-between text-[10px] sm:text-xs gap-2">
              <span className="text-gray-400 font-mono shrink-0">2. Weekly Target Clicks</span>
              <span className="font-semibold font-mono text-black truncate">{clicks.toLocaleString()} clicks</span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={clicks}
              onChange={(e) => setClicks(Number(e.target.value))}
              className="w-full accent-[#3CB371] bg-gray-100 rounded-lg cursor-pointer h-1 sm:h-1.5"
            />
          </div>

          <div className="flex flex-col gap-1 sm:gap-1.5">
            <div className="flex items-center justify-between text-[10px] sm:text-xs gap-2">
              <span className="text-gray-400 font-mono shrink-0">3. Est. Convert Rate</span>
              <span className="font-semibold font-mono text-black">{convRate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8.0"
              step="0.1"
              value={convRate}
              onChange={(e) => setConvRate(Number(e.target.value))}
              className="w-full accent-[#3CB371] bg-gray-100 rounded-lg cursor-pointer h-1 sm:h-1.5"
            />
          </div>
        </div>

        <div className="bg-[#3CB371]/5 border border-[#3CB371]/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <span className="text-gray-500 text-[10px] sm:text-xs">Projected revenue rate</span>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#3CB371] font-sans tracking-tight leading-tight">
              ${projectedWeeklyCommissions.toLocaleString()}
              <span className="text-[10px] sm:text-xs text-gray-400 font-normal"> / week</span>
            </div>
          </div>
          <div className="text-[9px] sm:text-[11px] text-gray-400 flex flex-row sm:flex-col gap-x-3 sm:gap-x-0 uppercase tracking-wider font-mono shrink-0">
            <span>{projectedWeeklySales} orders / wk</span>
            <span>${averageCommissionValue} avg commission</span>
          </div>
        </div>
      </div>

      {/* Tracker link generator */}
      <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-[10px] sm:text-xs text-black uppercase tracking-wider font-mono text-left truncate">
            Generate Tracker Link
          </h4>
          <span className="text-[9px] sm:text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono shrink-0">
            Instant Sandbox
          </span>
        </div>

        <form onSubmit={handleGenerateLink} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            className="flex-1 min-w-0 text-[10px] sm:text-xs border border-gray-100 bg-gray-50 rounded-lg px-2.5 sm:px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono"
            placeholder="Paste brand offer URL..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white text-[10px] sm:text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors duration-200 min-h-[36px] sm:min-h-0"
          >
            Generate
          </button>
        </form>

        {generatedLink ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 sm:p-2.5 flex items-center justify-between gap-2 text-[10px] sm:text-xs min-w-0">
            <span className="font-mono text-[#3CB371] truncate font-medium min-w-0">{generatedLink}</span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 p-1.5 rounded-md shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold transition-colors duration-150"
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
          <p className="text-[10px] sm:text-[11px] text-gray-400 text-center py-0.5 leading-snug">
            Click &apos;Generate&apos; to see how instant tracking links are built.
          </p>
        )}
      </div>

      {/* Live payout activity */}
      <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 flex flex-col gap-2 sm:gap-2.5">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-wider font-semibold text-gray-400 gap-2">
          <span>Live Payout Activity</span>
          <span className="flex items-center gap-1 bg-gray-50 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3CB371] animate-pulse" />
            REAL-TIME
          </span>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          {conversions.map((conv, idx) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-lg border border-transparent min-w-0 ${
                idx === 0 ? 'bg-[#3CB371]/5 border-[#3CB371]/10' : 'hover:border-gray-50 hover:bg-gray-50/50'
              } transition-all`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center font-bold text-[9px] sm:text-[10px] text-gray-700 font-mono shrink-0">
                  {conv.brand.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-bold text-gray-800 flex items-center gap-1 truncate">
                    <span className="truncate">{conv.brand} Offer</span>
                    {idx === 0 && (
                      <span className="text-[8px] sm:text-[9px] bg-red-100 text-red-500 font-medium px-1 rounded font-mono shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono">{conv.time}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] sm:text-xs font-extrabold text-[#3CB371] font-mono bg-[#3CB371]/10 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                  +${conv.amount.toFixed(2)}
                </span>
                <div className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5 font-mono">Settle Pending</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
