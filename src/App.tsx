import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Check, Play, Sparkles, BookOpen, Clock, Activity, Menu, X, User } from 'lucide-react';
import LogoIcon from './components/LogoIcon';
import DashboardMockup from './components/DashboardMockup';
import Modal from './components/Modal';
import OnboardingStepForm from './components/OnboardingStepForm';
import MarketplaceSandbox from './components/MarketplaceSandbox';
import AuthModal from './components/AuthModal';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';

// Hero Brands list
const HERO_BRANDS = [
  { name: 'Shopify', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'Notion', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'HubSpot', style: { fontFamily: '"Trebuchet MS", sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px' } },
  { name: 'Canva', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'ConvertKit', style: { fontFamily: 'Palatino, serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'Webflow', style: { fontFamily: 'Impact, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Semrush', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } }
];

// Creator Brands list
const CREATOR_BRANDS = [
  { name: 'NicheHackers', style: { fontFamily: '"Times New Roman", serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'GROWTHLAB', style: { fontFamily: '"Arial Black", sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'PASSIVE', style: { fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'SideHustle', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'AffiliateOS', style: { fontFamily: 'Helvetica, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'CREATORHQ', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'LINKWISE', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'ScaleCo', style: { fontFamily: 'Palatino, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } }
];

export default function App() {
  // Modal configurations
  const [activeModal, setActiveModal] = useState<'none' | 'onboarding' | 'plans' | 'marketplace' | 'help' | 'signup' | 'signin' | 'admin'>('none');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; country: string; phone: string } | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>('Pro');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Help center chat bot
  const [helpSearch, setHelpSearch] = useState('');
  const [helpAnswer, setHelpAnswer] = useState<string | null>(null);

  // Auto restore sessions and sync profile details
  useEffect(() => {
    const activeEmail = localStorage.getItem('linkfluence_active_user_email');
    if (activeEmail) {
      try {
        const saved = localStorage.getItem(`linkfluence_user_profile_${activeEmail}`);
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to restore current user", e);
      }
    }
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleChoosePlan = (planName: string) => {
    setSelectedPlanName(planName);
    setActiveModal('signup');
    triggerToast(`Selected ${planName} Plan! Let's complete your registration...`);
  };

  const handleUnlockProAccess = () => {
    setActiveModal('signup');
  };

  const handleOnboardingSuccess = (recommendedPlan: string) => {
    setSelectedPlanName(recommendedPlan);
    triggerToast(`Welcome to Linkfluence! Pre-approved account successfully registered!`);
  };

  const handleAuthSuccess = (userData: { name: string; email: string; country: string; phone: string }) => {
    localStorage.setItem('linkfluence_active_user_email', userData.email);
    localStorage.setItem(`linkfluence_user_profile_${userData.email}`, JSON.stringify(userData));
    
    // Add to roster index
    let roster: string[] = [];
    const savedRoster = localStorage.getItem('linkfluence_users_roster');
    if (savedRoster) {
      try { roster = JSON.parse(savedRoster); } catch (e) {}
    }
    if (!roster.includes(userData.email)) {
      roster.push(userData.email);
      localStorage.setItem('linkfluence_users_roster', JSON.stringify(roster));
    }

    setCurrentUser(userData);
    triggerToast(`Welcome back, ${userData.name}! Secure session initiated successfully.`);
  };

  const handleHelpQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpSearch) return;
    const query = helpSearch.toLowerCase();
    if (query.includes('payout') || query.includes('money') || query.includes('pay')) {
      setHelpAnswer("Payouts settle every single Monday at 9:00 AM UTC. Supported payout methods include PayPal, direct Wire Transfer, and USDC cryptocurrency. The minimum withdrawal limit is just $20.");
    } else if (query.includes('tax') || query.includes('fee') || query.includes('cost')) {
      setHelpAnswer("There are absolutely no hidden withdrawal fees. The flat subscription covers your account maintenance. Depending on your tier, we charge between 0% to 15% platform take on raw commission settlements.");
    } else if (query.includes('link') || query.includes('limit') || query.includes('traffic')) {
      setHelpAnswer("The Pro & Scale subscriptions unlock unlimited generated tracking links. The Starter package is capped at 10 active trackers. All campaigns support custom click routing and geographical sub-IDs.");
    } else {
      setHelpAnswer("All Linkfluence links pass through our secure proxy Cloaking servers to prevent link hijacking. Yes, you can safely share your links across YouTube, TikTok, newsletters, or blogs. To register, simply click on 'Start Earning'.");
    }
  };

  if (activeModal === 'admin') {
    return (
      <div id="linkfluence-app-root" className="flex flex-col bg-[#FAFAF7] relative min-h-screen">
        <div className="flex-1 w-full max-w-[90rem] mx-auto p-4 sm:p-6 md:p-8">
          <AdminPanel
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => {
              if (updated && updated.email) {
                localStorage.setItem(`linkfluence_user_profile_${updated.email}`, JSON.stringify(updated));
              }
              setCurrentUser(updated);
            }}
            triggerToast={triggerToast}
            onClose={() => setActiveModal('none')}
          />
        </div>

        {/* Dynamic Activity Toast notifications */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-55 bg-[#111111] border border-gray-800 text-white font-medium text-xs md:text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-[fadeIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <Check size={16} className="text-[#3CB371]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (currentUser) {
    return (
      <div id="linkfluence-app-root" className="flex flex-col bg-[#FAFAF7] relative min-h-screen">
        {/* Static Navbar */}
        <nav id="global-navbar" className="sticky top-0 w-full z-50 px-4 md:px-6 py-2 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
          <div className="max-w-[88rem] mx-auto flex items-center justify-between">
            {/* Left branding */}
            <div className="flex items-center gap-2 cursor-pointer">
              <LogoIcon className="text-[#3CB371]" size="30" />
              <span className="text-2xl font-semibold tracking-tight text-black font-sans">
                Linkfluence
              </span>
            </div>

            {/* Right Pillar CTA & Mobile layout Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 bg-white border border-gray-100 rounded-full p-1 sm:pl-2.5 sm:pr-3.5 sm:py-1 shadow-xs">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E6F7F0] text-[#3CB371] font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <div className="hidden xs:flex flex-col text-left">
                  <span className="text-xs font-bold text-black font-sans leading-none truncate max-w-[65px] sm:max-w-[120px]">{currentUser.name}</span>
                  <span className="text-[9px] font-mono font-semibold text-gray-400 capitalize mt-0.5 hidden sm:inline-block">{currentUser.country}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    triggerToast("Signed out of your Linkfluence account session.");
                  }}
                  type="button"
                  className="text-[10px] sm:text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full font-bold px-2 py-0.5 sm:py-1 cursor-pointer font-sans transition-all duration-150"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <UserDashboard
          user={currentUser}
          onUpdateUser={(updated) => {
            if (updated && updated.email) {
              localStorage.setItem(`linkfluence_user_profile_${updated.email}`, JSON.stringify(updated));
            }
            setCurrentUser(updated);
          }}
          onLogout={() => {
            localStorage.removeItem('linkfluence_active_user_email');
            setCurrentUser(null);
            triggerToast("Signed out of your Linkfluence account session.");
          }}
          triggerToast={triggerToast}
          onOpenAdmin={() => setActiveModal('admin')}
        />

        {/* Dynamic Activity Toast notifications */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-55 bg-[#111111] border border-gray-800 text-white font-medium text-xs md:text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-[fadeIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <Check size={16} className="text-[#3CB371]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="linkfluence-app-root" className="flex flex-col bg-[#FAFAF7] relative min-h-screen">
      
      {/* Styles Injection for seamless double brand marquees loop */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 24s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes creators-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .creators-track {
          display: flex;
          width: max-content;
          animation: creators-marquee 32s linear infinite;
        }
        .creators-track:hover {
          animation-play-state: paused;
        }
      ` }} />

      {/* 1. Transparent Navbar (absolute over hero on desktop, relative flow on mobile) */}
      <nav id="global-navbar" className="relative md:absolute top-0 left-0 right-0 z-40 px-4 md:px-6 py-4 md:py-5">
        <div className="max-w-[88rem] mx-auto flex items-center justify-between">
          
          {/* Left branding */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <LogoIcon className="text-[#3CB371] hover:scale-105 transition-transform" size="30" />
            <span className="text-2xl font-semibold tracking-tight text-black font-sans">
              Linkfluence
            </span>
          </div>

          {/* Center Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8 text-base">

            <button
              onClick={() => {
                document.getElementById('pricing-preview-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              type="button"
              className="text-gray-750 hover:text-black font-semibold transition-colors duration-200 cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => setActiveModal('help')}
              type="button"
              className="text-gray-750 hover:text-black font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              Help <HelpCircle size={15} className="text-gray-400" />
            </button>
          </div>

          {/* Right Pillar CTA & Mobile layout Toggle */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3 bg-white border border-gray-150 rounded-full pl-3 pr-4 py-1.5 shadow-sm">
                <span className="w-8 h-8 rounded-full bg-[#E6F7F0] text-[#3CB371] font-bold text-sm flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-black font-sans leading-none">{currentUser.name}</span>
                  <span className="text-[10px] font-mono font-semibold text-gray-400 capitalize">{currentUser.country}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    triggerToast("Signed out of your Linkfluence account session.");
                  }}
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer font-sans"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setActiveModal('signin')}
                  type="button"
                  className="text-gray-750 hover:text-black font-semibold text-sm cursor-pointer mr-2 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveModal('signup')}
                  type="button"
                  className="bg-[#3CB371] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#2E8B57] transition-all hover:shadow-md cursor-pointer shrink-0"
                >
                  Start Earning
                </button>
              </div>
            )}
            
            {/* Mobile Nav toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2.5 text-black md:hidden rounded-2xl hover:bg-gray-100 transition border border-gray-100 bg-white shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel overlay (beautiful glassmorphism styling) */}
        {mobileMenuOpen && (
          <div className="absolute top-18 md:top-22 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-150 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 z-50 animate-[fadeIn_0.15s_ease-out] md:hidden text-left">
            <div className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider mb-1 px-1">
              Main Menu
            </div>
            

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('pricing-preview-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-gray-700 hover:text-black font-semibold text-sm py-2 px-3 rounded-xl hover:bg-[#E6F7F0]/40 transition text-left cursor-pointer"
            >
              <Clock size={18} className="text-[#3CB371]" />
              <span>View Tiers & Pricing</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveModal('help');
              }}
              className="flex items-center gap-3 text-gray-700 hover:text-black font-semibold text-sm py-2 px-3 rounded-xl hover:bg-[#E6F7F0]/40 transition text-left cursor-pointer justify-between"
            >
              <span className="flex items-center gap-3">
                <HelpCircle size={18} className="text-[#3CB371]" />
                <span>Integrations & Help Desk</span>
              </span>
            </button>

            <div className="border-t border-gray-100 mt-2 pt-4">
              {currentUser ? (
                <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#E6F7F0] text-[#3CB371] font-bold text-base flex items-center justify-center font-sans">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-black font-sans leading-none">{currentUser.name}</span>
                      <span className="text-[11px] font-mono font-semibold text-gray-400 capitalize mt-1">{currentUser.country}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentUser(null);
                      triggerToast("Signed out of your Linkfluence account session.");
                    }}
                    type="button"
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl text-center text-xs cursor-pointer transition"
                  >
                    Logout Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveModal('signin');
                    }}
                    type="button"
                    className="border border-gray-200 text-black font-bold py-3.5 rounded-2xl text-center text-sm cursor-pointer hover:bg-gray-50 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveModal('signup');
                    }}
                    type="button"
                    className="bg-[#3CB371] text-white font-bold py-3.5 rounded-2xl text-center text-sm cursor-pointer hover:bg-[#2E8B57] transition"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section Grouped Wrapper */}
      <div className="h-auto lg:h-screen flex flex-col justify-end overflow-hidden w-full max-w-[88rem] mx-auto px-4 md:px-6 relative mb-4 md:mb-12">
        <div 
          className="relative w-full rounded-2xl overflow-hidden bg-white border border-gray-200 mt-2 md:mt-14 h-auto lg:h-[calc(100vh-84px)]"
        >
          {/* Premium Abstract mesh gradients behind the card bounds */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-bl from-[#3CB371]/10 via-[#FAFAF7]/5 to-transparent pointer-events-none hidden lg:block z-0" />

          {/* Core content grid split */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-stretch p-6 md:p-12 pt-10 md:pt-14 lg:pt-16">
            
            {/* Left Col - Product Messaging */}
            <div className="lg:col-span-7 flex flex-col justify-start lg:justify-between h-full text-left gap-4 lg:gap-0">
              <div className="flex flex-col items-start gap-4 md:gap-6">
                
                {/* Micro heading alert badge */}
                <div className="flex items-center gap-1 bg-[#3CB371]/10 text-[#3CB371] px-3.5 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                  <Sparkles size={14} /> Global Affiliate Platform Launching
                </div>

                <h1 className="text-black text-4xl md:text-6xl font-semibold leading-[1.08] max-w-xl" style={{ letterSpacing: '-0.04em' }}>
                  Share Links.<br />
                  <span className="text-[#3CB371]">Earn</span> Daily.
                </h1>

                <p 
                  className="text-black/70 text-sm md:text-lg max-w-lg leading-relaxed md:-mt-1"
                  style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
                >
                  One subscription unlocks thousands of premium affiliate offers. Drop a link, track every click, and get paid the moment someone buys.
                </p>

                {/* Primary Button group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mt-2">
                  <button
                    onClick={() => setActiveModal('signup')}
                    type="button"
                    className="inline-flex items-center justify-between sm:justify-start gap-3 bg-black text-white text-base font-semibold pl-8 pr-2.5 py-2.5 rounded-full hover:bg-gray-800 transition-all group cursor-pointer"
                  >
                    <span>Join the program</span>
                    <span className="bg-[#3CB371] rounded-full p-2 text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={18} />
                    </span>
                  </button>
                </div>

                {/* Customer Trust count line */}
                <p className="text-black/55 text-xs font-medium flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3CB371] inline-block mr-2 animate-ping" />
                  Over 12,000 creators paid out this month.
                </p>
              </div>

              {/* Seamless Infinite Brand Marquee Track */}
              <div className="mt-2.5 lg:mt-6 w-full max-w-md overflow-hidden pb-1 lg:pb-4">
                <span className="text-black/40 text-[10.5px] uppercase tracking-widest font-bold block mb-1.5 lg:mb-3.5 font-sans">
                  Partner brands you can promote
                </span>
                
                <div className="relative w-full flex items-center overflow-hidden">
                  {/* Left & Right gradient bounds to blur edge entries */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                  <div className="marquee-track flex items-center">
                    {/* Render standard brand items list twice */}
                    {[...HERO_BRANDS, ...HERO_BRANDS].map((brand, i) => (
                      <span
                        key={i}
                        className="mx-7 shrink-0 text-black/60 whitespace-nowrap select-none transition-colors duration-150 hover:text-[#3CB371]"
                        style={brand.style}
                      >
                        {brand.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Interactive Fintech panel visible on desktop */}
            <div className="hidden lg:col-span-5 h-full relative lg:flex flex-col justify-center py-6 pr-4 overflow-hidden z-10">
              <div className="w-full max-h-[100%] overflow-hidden flex flex-col justify-center">
                <DashboardMockup />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. How It Works Section */}
      <section id="how-it-works-section" className="bg-[#FAFAF7] px-6 pt-10 pb-20 md:py-24 border-t border-gray-100 text-left">
        <div className="max-w-[88rem] mx-auto">
          
          {/* Row 1 Grid split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
            
            <div className="flex flex-col items-start">
              <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest mb-3 block font-mono">
                How Linkfluence works
              </span>
              <h2 className="text-black text-4xl md:text-5xl font-semibold leading-[1.12] mb-8 font-sans" style={{ letterSpacing: '-0.03em' }}>
                From signup<br />
                to first payout.
              </h2>
              
              <button
                onClick={() => {
                  document.getElementById('pricing-preview-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                type="button"
                className="inline-flex items-center gap-3 bg-black text-white text-base font-semibold pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-all group"
              >
                <span>See pricing</span>
                <span className="bg-[#3CB371] text-white rounded-full p-2 group-hover:rotate-45 transition-transform">
                  <ArrowRight size={16} />
                </span>
              </button>
            </div>

            <div>
              <p className="text-black/70 text-xl md:text-3.5xl font-normal leading-relaxed md:pt-4">
                Subscribe to a plan, browse the affiliate marketplace, grab your trackable link, and share it anywhere. We handle the tracking, attribution, and payouts.
              </p>
            </div>
          </div>

          {/* Row 2 - 3-col step card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 lg:p-6 min-h-[17rem] flex flex-col justify-start hover:shadow-lg hover:border-gray-300 transition-all duration-300">
              <div className="flex flex-col items-start gap-3.5">
                <span className="inline-flex w-10 h-10 rounded-full bg-[#3CB371]/10 text-[#3CB371] text-sm font-extrabold items-center justify-center font-mono">
                  01
                </span>
                <h3 className="text-black text-2xl font-semibold leading-snug tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  Create an account
                </h3>
              </div>
              <p className="text-black/70 text-sm md:text-base leading-relaxed mt-3">
                Sign up for Linkfluence in under two minutes to gain instant access to our real-time tracking suite and exclusive affiliate network.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 lg:p-6 min-h-[17rem] flex flex-col justify-start hover:shadow-lg hover:border-gray-300 transition-all duration-300">
              <div className="flex flex-col items-start gap-3.5">
                <span className="inline-flex w-10 h-10 rounded-full bg-[#3CB371]/10 text-[#3CB371] text-sm font-extrabold items-center justify-center font-mono">
                  02
                </span>
                <h3 className="text-black text-2xl font-semibold leading-snug tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  Choose a plan
                </h3>
              </div>
              <p className="text-black/70 text-sm md:text-base leading-relaxed mt-3">
                Select from our flexible pricing tiers—Starter, Growth, Pro, or Executive—designed to fit your scale and speed of operations.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 lg:p-6 min-h-[17rem] flex flex-col justify-start hover:shadow-lg hover:border-gray-300 transition-all duration-300">
              <div className="flex flex-col items-start gap-3.5">
                <span className="inline-flex w-10 h-10 rounded-full bg-[#3CB371]/10 text-[#3CB371] text-sm font-extrabold items-center justify-center font-mono">
                  03
                </span>
                <h3 className="text-black text-2xl font-semibold leading-snug tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  Start earning returns
                </h3>
              </div>
              <p className="text-black/70 text-sm md:text-base leading-relaxed mt-3">
                Promote top high-converting offers with dynamic links and watch your commissions settle automatically every single week.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Trusted By Section (marquee row) */}
      <section id="trusted-by-section" className="bg-[#FAFAF7] px-6 text-left">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center py-16 border-t border-b border-gray-200">
          
          <div className="md:col-span-1">
            <p className="text-black/75 text-sm md:text-base leading-relaxed font-semibold">
              Trusted by creators, agencies, and review sites worldwide.
            </p>
          </div>

          <div className="md:col-span-3 overflow-hidden relative">
            {/* Blurry horizontal entry blockers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FAFAF7] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAFAF7] to-transparent z-10 pointer-events-none" />

            <div className="creators-track flex items-center">
              {/* Loop the creator brand components twice */}
              {[...CREATOR_BRANDS, ...CREATOR_BRANDS].map((brand, idx) => (
                <span
                  key={idx}
                  className="mx-10 shrink-0 text-black/50 select-none whitespace-nowrap hover:text-black transition-colors"
                  style={brand.style}
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4.5. User Reviews Section */}
      <section id="user-reviews-section" className="bg-white px-6 py-24 text-left border-t border-b border-gray-100">
        <div className="max-w-[88rem] mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-[fadeIn_0.5s_ease-out]">
            <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest mb-3 block font-mono">
              Reviews
            </span>
            <h2 className="text-black text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-5 font-sans tracking-tight" style={{ letterSpacing: '-0.04em' }}>
              Review's from our users
            </h2>
            <p className="text-[#111111]/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
              Testimonials from our users around the globe who love our easy withdrawal mechanisms, reliable track recording, and sheer ease of use.
            </p>
          </div>

          {/* Testimonial Cards columns matching the attached layout style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 items-start">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6">
              
              <div className="bg-[#FAFAF7] border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Liam Harris"
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-black text-sm font-bold font-sans">Liam Harris</h4>
                    <p className="text-gray-400 text-xs font-mono">Affiliate Creator @liam_h</p>
                  </div>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-sans">
                  "Most other link trackers I have tested always miss conversion pixel events, which loses my money. Linkfluence has been incredibly reliable—I've seen absolute parity on my click registers and zero lost events. Also, seeing payouts hit my feed perfectly on Monday mornings makes planning so easy."
                </p>
                <span className="text-[10px] font-mono text-gray-400 mt-4 block">11:04 AM · Apr 12, 2026</span>
              </div>

              <div className="bg-[#FAFAF7] border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Chloe Stanford"
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-black text-sm font-bold font-sans">Chloe Stanford</h4>
                    <p className="text-gray-400 text-xs font-mono font-sans">SEO Expert @chloe_stan</p>
                  </div>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-sans">
                  "The pure ease of use on this panel is phenomenal. Getting my cloaked sub-IDs and redirect tracking links configured takes about 30 seconds total. Simple, intuitive dashboard and fast withdrawals without unnecessary delay hurdles."
                </p>
                <span className="text-[10px] font-mono text-gray-400 mt-4 block">3:15 PM · May 18, 2026</span>
              </div>

            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-6 font-sans">

              <div className="bg-[#FAFAF7] border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Marcus Thorne"
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-black text-sm font-bold font-sans">Marcus Thorne</h4>
                    <p className="text-gray-400 text-xs font-mono">Niche Site Mod @marcus_t</p>
                  </div>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-sans">
                  "If you run high volume organic or paid operations, redirect responsiveness is crucial. Linkfluence is extremely fast, which boosts my conversion ratios. Fast automated withdrawal options are great, and tracking transparency is stellar."
                </p>
                <span className="text-[10px] font-mono text-gray-400 mt-4 block">9:22 AM · Mar 02, 2026</span>
              </div>

              <div className="bg-[#FAFAF7] border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Sophia Albright"
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-black text-sm font-bold font-sans">Sophia Albright</h4>
                    <p className="text-gray-400 text-xs font-mono">Social Influencer @sophia_al</p>
                  </div>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-sans">
                  "I love a platform that values my cash flow schedule. Weekly capital gets paid directly every single Monday on time without manual chasing. Solidly built software with absolute click reliability."
                </p>
                <span className="text-[10px] font-mono text-gray-400 mt-4 block">4:40 AM · May 20, 2026</span>
              </div>

            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-6">

              <div className="bg-[#FAFAF7] border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Emma Vance"
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-black text-sm font-bold font-sans">Emma Vance</h4>
                    <p className="text-gray-400 text-xs font-mono">Newsletter Writer @emma_vance</p>
                  </div>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-sans">
                  "Absolute ease of use. I just paste link destinations, click generate, and look at the real-time device logs. Fast settlements are highly predictable, and that gives me total confidence to scale my newsletters."
                </p>
                <span className="text-[10px] font-mono text-gray-400 mt-4 block">1:04 PM · Apr 29, 2026</span>
              </div>

              <div className="bg-[#FAFAF7] border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="David Beck"
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-black text-sm font-bold font-sans">David Beck</h4>
                    <p className="text-gray-400 text-xs font-mono">Creative Strategist @david_beck</p>
                  </div>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-sans">
                  "Most click frameworks require advanced developer settings to prevent false positives. Linkfluence handles redirects perfectly without any lag. Super simple payout flow on Mondays; completely trouble-free platform."
                </p>
                <span className="text-[10px] font-mono text-gray-400 mt-4 block">8:12 AM · May 05, 2026</span>
              </div>

            </div>

          </div>

          {/* Solid Light-Mint Pill Capsule for Stats matching the layout image */}
          <div className="bg-[#E6F7F0]/65 border border-[#3CB371]/15 rounded-3xl p-8 md:p-10 max-w-5xl mx-auto text-center mt-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-[#3CB371]/15">
              
              <div className="flex flex-col items-center justify-center">
                <span className="text-black text-3xl md:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight mb-1.5" style={{ letterSpacing: '-0.03em' }}>
                  10k+
                </span>
                <span className="text-gray-500 text-[11px] md:text-xs font-semibold uppercase tracking-wider font-sans">
                  Users in a month
                </span>
              </div>

              <div className="flex flex-col items-center justify-center pt-5 md:pt-0">
                <span className="text-[#3CB371] text-3xl md:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight mb-1.5" style={{ letterSpacing: '-0.03em' }}>
                  97%
                </span>
                <span className="text-gray-500 text-[11px] md:text-xs font-semibold uppercase tracking-wider font-sans">
                  Success rate
                </span>
              </div>

              <div className="flex flex-col items-center justify-center pt-5 md:pt-0">
                <span className="text-black text-3xl md:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight mb-1.5" style={{ letterSpacing: '-0.03em' }}>
                  22M+
                </span>
                <span className="text-gray-500 text-[11px] md:text-xs font-semibold uppercase tracking-wider font-sans">
                  Paid out globally
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. Pricing & Detailed In-Page Comparison Section */}
      <section id="pricing-preview-section" className="bg-[#FAFAF7] px-6 py-24 text-left border-t border-gray-100">
        <div className="max-w-[88rem] mx-auto">
          
          {/* Centered Headers */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-[fadeIn_0.5s_ease-out]">
            <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest mb-3 block font-mono">
              Simple customizable tiers
            </span>
            <h2 className="text-black text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-5 font-sans tracking-tight" style={{ letterSpacing: '-0.04em' }}>
              Affordable plans for every budget
            </h2>
            <p className="text-[#111111]/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
              Explore our range of pricing options designed to fit any budget, offering exceptional value and flexibility to meet your unique needs.
            </p>
          </div>

          {/* 5 Plans Grid container - compact layout on desktop */}
          <div className="max-w-[76rem] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 xl:gap-4.5 items-stretch mb-20">
            
            {/* Plan 1 - Starter $30 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 lg:p-4 xl:p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div>
                <span className="text-[#3CB371] text-[10px] font-bold uppercase tracking-widest block mb-1.5 font-mono">
                  Starter Plan
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl lg:text-3xl xl:text-4xl font-extrabold text-black font-sans tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    $30
                  </span>
                </div>
                <p className="text-black/70 text-xs leading-relaxed mb-4 font-sans">
                  Ideal for aspiring creators starting to monetize their link shares.
                </p>

                <div className="border-t border-gray-100 my-3"></div>
                
                <h4 className="text-black text-[11px] font-bold uppercase tracking-wider mb-2.5 font-sans">
                  Core Features
                </h4>
                <ul className="flex flex-col gap-2.5 mb-4">
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Max 15 active tracking links</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Weekly Monday payouts</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Standard click & geo tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-400 text-xs text-black/30 font-sans">
                    <X size={12} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>No custom DNS domains</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleChoosePlan('Starter')}
                type="button"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 text-center tracking-tight text-sm cursor-pointer mt-2"
              >
                Get Started
              </button>
            </div>

            {/* Plan 2 - Growth $50 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 lg:p-4 xl:p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div>
                <span className="text-[#3CB371] text-[10px] font-bold uppercase tracking-widest block mb-1.5 font-mono">
                  Growth Plan
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl lg:text-3xl xl:text-4xl font-extrabold text-black font-sans tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    $50
                  </span>
                </div>
                <p className="text-black/70 text-xs leading-relaxed mb-4 font-sans">
                  Perfect for growing content makers with an active click flow.
                </p>

                <div className="border-t border-gray-100 my-3"></div>
                
                <h4 className="text-black text-[11px] font-bold uppercase tracking-wider mb-2.5 font-sans">
                  Core Features
                </h4>
                <ul className="flex flex-col gap-2.5 mb-4">
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Max 50 active tracking links</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Weekly Monday payouts</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Full device & link analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Access to SaaS categories</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleChoosePlan('Growth')}
                type="button"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 text-center tracking-tight text-sm cursor-pointer mt-2"
              >
                Get Started
              </button>
            </div>

            {/* Plan 3 - Pro Premier $100 (Highlighted) */}
            <div className="bg-[#111111] text-white border-2 border-[#3CB371] rounded-2xl p-5 lg:p-4 xl:p-5 flex flex-col justify-between shadow-2xl scale-100 xl:scale-103 hover:scale-102 xl:hover:scale-105 transition-all duration-300 relative z-10">
              <span className="absolute -top-3 right-6 bg-[#3CB371] text-black text-[9px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider font-sans shadow-sm ring-2 ring-[#FAFAF7]">
                Best Value
              </span>
              <div>
                <span className="text-[#3CB371] text-[10px] font-bold uppercase tracking-widest block mb-1.5 font-mono">
                  Pro Premier Plan
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl lg:text-3xl xl:text-4xl font-extrabold text-white font-sans tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    $100
                  </span>
                </div>
                <p className="text-white/80 text-xs leading-relaxed mb-4 font-sans">
                  Optimized for professional creators seeking maximum daily yield.
                </p>

                <div className="border-t border-white/10 my-3"></div>
                
                <h4 className="text-[#3CB371] text-[11px] font-bold uppercase tracking-wider mb-2.5 font-sans">
                  Core Features
                </h4>
                <ul className="flex flex-col gap-2.5 mb-4">
                  <li className="flex items-start gap-2 text-white/90 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-[#3CB371] text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px] text-black" />
                    </div>
                    <span>Unlimited tracking links</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-[#3CB371] text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px] text-black" />
                    </div>
                    <span>Priority fast Monday payouts</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-[#3CB371] text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px] text-black" />
                    </div>
                    <span>Real-time dashboard API hook</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-[#3CB371] text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px] text-black" />
                    </div>
                    <span>Custom UTM Sub-IDs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleChoosePlan('Pro')}
                type="button"
                className="w-full bg-[#3CB371] hover:bg-emerald-400 text-black font-bold py-2.5 px-3 rounded-lg transition-all duration-200 text-center tracking-tight text-sm cursor-pointer mt-2"
              >
                Get Started
              </button>
            </div>

            {/* Plan 4 - Executive $200 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 lg:p-4 xl:p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div>
                <span className="text-[#3CB371] text-[10px] font-bold uppercase tracking-widest block mb-1.5 font-mono">
                  Executive Plan
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl lg:text-3xl xl:text-4xl font-extrabold text-black font-sans tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    $200
                  </span>
                </div>
                <p className="text-black/70 text-xs leading-relaxed mb-4 font-sans">
                  Engineered for high-volume networks, agencies, and large publishers.
                </p>

                <div className="border-t border-gray-100 my-3"></div>
                
                <h4 className="text-black text-[11px] font-bold uppercase tracking-wider mb-2.5 font-sans">
                  Core Features
                </h4>
                <ul className="flex flex-col gap-2.5 mb-4">
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Unlimited links + sub-attributes</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>On-Demand payout withdrawals</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Custom DNS cloaked domains</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Shared Slack partner channel</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleChoosePlan('Executive')}
                type="button"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 text-center tracking-tight text-sm cursor-pointer mt-2"
              >
                Get Started
              </button>
            </div>

            {/* Plan 5 - Custom */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 lg:p-4 xl:p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div>
                <span className="text-[#3CB371] text-[10px] font-bold uppercase tracking-widest block mb-1.5 font-mono">
                  Custom
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl lg:text-2xl xl:text-3xl font-extrabold text-black font-sans tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    Enterprise
                  </span>
                </div>
                <p className="text-black/70 text-xs leading-relaxed mb-4 font-sans">
                  Tailored infrastructure for integrations & high-cap payouts.
                </p>

                <div className="border-t border-gray-100 my-3"></div>
                
                <h4 className="text-black text-[11px] font-bold uppercase tracking-wider mb-2.5 font-sans">
                  Core Features
                </h4>
                <ul className="flex flex-col gap-2.5 mb-4">
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Fully dedicated custom proxy servers</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>Data Webhook streaming feeds</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>0% platform commission takes</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-xs font-sans">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="stroke-[3px]" />
                    </div>
                    <span>24/7 designated phone advisor</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleChoosePlan('Enterprise')}
                type="button"
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 text-center tracking-tight text-sm cursor-pointer mt-2"
              >
                Contact Sales
              </button>
            </div>

          </div>

          {/* Detailed Specifications Table inline */}
          <div className="mt-20 bg-white border border-gray-150 rounded-3xl p-6 md:p-10 shadow-sm animate-[fadeIn_0.5s_ease-out]">
            <div className="mb-8">
              <h3 className="text-black text-xl md:text-2xl font-semibold tracking-tight mb-2">
                Detailed feature matrix
              </h3>
              <p className="text-gray-500 text-xs md:text-sm">
                Compare limits, settlement parameters, and technical parameters side-by-side. 
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                    <th className="py-4 px-3 font-semibold text-left">Platform Capability</th>
                    <th className="py-4 px-3 text-center">Starter ($30)</th>
                    <th className="py-4 px-3 text-center">Growth ($50)</th>
                    <th className="py-4 px-3 text-center text-black font-bold bg-[#3CB371]/5 rounded-t-xl">Pro ($100)</th>
                    <th className="py-4 px-3 text-center">Executive ($200)</th>
                    <th className="py-4 px-3 text-center">Enterprise (Custom)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs md:text-sm">
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4.5 px-3 font-medium text-gray-900">Active tracking links</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">15 links</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">50 links</td>
                    <td className="py-4.5 px-3 font-bold text-black text-center bg-[#3CB371]/5">Unlimited</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Unlimited</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Custom limits</td>
                  </tr>
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4.5 px-3 font-medium text-gray-900">Payout speed</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Weekly Mondays</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Weekly Mondays</td>
                    <td className="py-4.5 px-3 font-bold text-emerald-600 text-center bg-[#3CB371]/5">Priority Mon (9 AM)</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">On-Demand</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Immediate Wire</td>
                  </tr>
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4.5 px-3 font-medium text-gray-900">Platform commission fee</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">5% take</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">3% take</td>
                    <td className="py-4.5 px-3 font-bold text-black text-center bg-[#3CB371]/5">1% take</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">0.5% take</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">0% take</td>
                  </tr>
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4.5 px-3 font-medium text-gray-900">Analytics scope</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Standard stats</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Geo & Device depth</td>
                    <td className="py-4.5 px-3 font-bold text-black text-center bg-[#3CB371]/5">Real-time LEDGER</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Full log feeds</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Custom stream</td>
                  </tr>
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4.5 px-3 font-medium text-gray-900">Custom domains (DNS)</td>
                    <td className="py-4.5 px-3 text-center">
                      <X size={15} className="text-rose-500 mx-auto" />
                    </td>
                    <td className="py-4.5 px-3 text-center">
                      <X size={15} className="text-rose-500 mx-auto" />
                    </td>
                    <td className="py-4.5 px-3 text-center bg-[#3CB371]/5">
                      <Check size={16} className="text-[#3CB371] stroke-[3px] mx-auto" />
                    </td>
                    <td className="py-4.5 px-3 text-center">
                      <Check size={16} className="text-[#3CB371] stroke-[3px] mx-auto" />
                    </td>
                    <td className="py-4.5 px-3 text-center">
                      <Check size={16} className="text-[#3CB371] stroke-[3px] mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4.5 px-3 font-medium text-gray-900">Dedicated assistance</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Email help</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Priority ticket</td>
                    <td className="py-4.5 px-3 font-bold text-black text-center bg-[#3CB371]/5">1-on-1 performance guru</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">Slack Partner room</td>
                    <td className="py-4.5 px-3 text-gray-500 text-center">24/7 SLA + Phone</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[10px] font-mono text-gray-400 mt-6 text-center">
              * Plan upgrades, downgrades, and billing cycles scale instantly. Fees are automatically prorated cleanly.
            </p>
          </div>

        </div>
      </section>

      {/* 5.5. Premium Footer Section containing CTA Banner and Structured Links */}
      <div className="bg-[#FAFAF7] pb-24 px-6 pt-4 text-center">
        
        {/* Black CTA Banner matching the attached layout */}
        <div className="max-w-[88rem] mx-auto mb-16 animate-[fadeIn_0.5s_ease-out]">
          <div className="relative overflow-hidden bg-black text-white rounded-[2rem] px-8 py-20 text-center shadow-xl">
            {/* Soft medium sea-green radial glowing effect as specified in brand rules */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(60,179,113,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-white text-3xl md:text-5xl font-semibold tracking-tight leading-tight mb-4 font-sans" style={{ letterSpacing: '-0.04em' }}>
                Affiliate Marketing made Seamless.
              </h2>
              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto font-sans font-medium">
                Linkfluence makes it effortless to track dynamic click data, protect affiliate rewards, and withdraw payouts on autopilot.
              </p>
              <button 
                type="button"
                onClick={() => setActiveModal('signup')}
                className="bg-white hover:bg-gray-100 text-black font-semibold px-8 py-3 rounded-xl transition duration-200 cursor-pointer shadow-md hover:shadow-lg text-sm md:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Structured White Card Footer Link Directory */}
        <div className="max-w-[88rem] mx-auto">
          <div className="bg-white border border-gray-150 rounded-[2rem] p-8 md:p-14 relative overflow-hidden shadow-sm">
            
            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 relative z-10 mb-12">
              
              {/* Brand brief column (Left) */}
              <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <LogoIcon className="text-[#3CB371]" size="28" />
                  <span className="text-xl font-bold text-black font-sans tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    Linkfluence
                  </span>
                </div>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-sans mt-2">
                  Linkfluence helps creators and high-yield performance teams transform complex click redirect streams into safe, transparent reward streams — everything you need in one simple platform.
                </p>
              </div>

              {/* Navigation link directories column (Right) */}
              <div className="lg:col-span-7 grid grid-cols-3 gap-4 md:gap-10 text-left">
                
                {/* Product list */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider font-mono">Product</h4>
                  <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-500 font-medium font-sans">
                    <li>
                      <button type="button" onClick={() => setActiveModal('marketplace')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Features
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { document.getElementById('pricing-preview-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Pricing
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('help')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Integrations
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('marketplace')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Updates
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Resources list */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider font-mono">Resources</h4>
                  <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-500 font-medium font-sans">
                    <li>
                      <button type="button" onClick={() => setActiveModal('help')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Documentation
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('help')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Guides
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('help')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Blog
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('help')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Support
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Company list */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider font-mono">Company</h4>
                  <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-500 font-medium font-sans">
                    <li>
                      <button type="button" onClick={() => setActiveModal('onboarding')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        About
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('onboarding')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Careers
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('help')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Contact
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('onboarding')} className="hover:text-[#3CB371] transition text-left cursor-pointer">
                        Partners
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setActiveModal('admin')} className="hover:text-rose-500 text-rose-500 font-semibold transition text-left cursor-pointer flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        Admin Panel
                      </button>
                    </li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Divider line */}
            <div className="border-t border-gray-100 my-8"></div>

            {/* Legal strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#111] relative z-10 font-sans">
              <div className="text-gray-500">
                <span>© 2026 Linkfluence. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <button type="button" onClick={() => setActiveModal('help')} className="text-gray-500 hover:text-[#3CB371] transition cursor-pointer">
                  Terms of Service
                </button>
                <button type="button" onClick={() => setActiveModal('help')} className="text-gray-500 hover:text-[#3CB371] transition cursor-pointer">
                  Privacy Policy
                </button>
                <button type="button" onClick={() => setActiveModal('admin')} className="hover:bg-rose-150/40 hover:text-rose-600 text-rose-500 font-semibold transition cursor-pointer flex items-center gap-1 bg-rose-50/50 border border-rose-100/40 px-2.5 py-1.5 rounded-xl text-xs">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  Admin Portal
                </button>
              </div>
            </div>



          </div>
        </div>

      </div>

      {/* --- ALL POPUP DRAWERS / MODALS --- */}
      
      {/* Signup Portal */}
      <Modal
        isOpen={activeModal === 'signup'}
        onClose={() => setActiveModal('none')}
        title="Join Linkfluence Partner Network"
      >
        <AuthModal
          initialTab="signup"
          onSuccess={handleAuthSuccess}
          onClose={() => setActiveModal('none')}
        />
      </Modal>

      {/* Sign In Portal */}
      <Modal
        isOpen={activeModal === 'signin'}
        onClose={() => setActiveModal('none')}
        title="Sign In to Member Portal"
      >
        <AuthModal
          initialTab="signin"
          onSuccess={handleAuthSuccess}
          onClose={() => setActiveModal('none')}
        />
      </Modal>

      {/* 1. Onboarding Stepper Modal */}
      <Modal
        isOpen={activeModal === 'onboarding'}
        onClose={() => setActiveModal('none')}
        title="Apply for Linkfluence Partnership"
      >
        <OnboardingStepForm
          onSuccess={handleOnboardingSuccess}
          onClose={() => setActiveModal('none')}
        />
      </Modal>



      {/* 3. Marketplace Active Offers Showcase */}
      <Modal
        isOpen={activeModal === 'marketplace'}
        onClose={() => setActiveModal('none')}
        title="Linkfluence Active Offer Marketplace"
      >
        <MarketplaceSandbox
          onJoinClick={() => setActiveModal('onboarding')}
        />
      </Modal>

      {/* 4. Support Desk & Answer hub */}
      <Modal
        isOpen={activeModal === 'help'}
        onClose={() => setActiveModal('none')}
        title="Linkfluence Instant Help & Compliance Desk"
      >
        <div id="help-modal-content" className="flex flex-col gap-5 text-left">
          <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col gap-2">
            <h4 className="font-bold text-sm text-black flex items-center gap-1">
              💡 Common Partner Inquiries
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setHelpSearch("How do payouts settle?");
                  setHelpAnswer("Payouts settle every single Monday at 9:00 AM UTC. Supported payout methods include PayPal, direct Wire Transfer, and USDC cryptocurrency. The minimum withdrawal limit is just $20.");
                }}
                className="p-3 text-xs bg-gray-50 hover:bg-gray-150 border border-gray-100 rounded-xl text-left font-medium text-gray-700"
              >
                Weekly Payout Dates
              </button>
              <button
                type="button"
                onClick={() => {
                  setHelpSearch("What are the subscription commissions?");
                  setHelpAnswer("There are absolutely no hidden withdrawal fees. The flat subscription covers your account maintenance. Depending on your tier, we charge between 0% to 15% platform take on raw commission settlements.");
                }}
                className="p-3 text-xs bg-gray-50 hover:bg-gray-150 border border-gray-100 rounded-xl text-left font-medium text-gray-700"
              >
                Platform Cuts & Fees
              </button>
              <button
                type="button"
                onClick={() => {
                  setHelpSearch("Do you limit daily clicks?");
                  setHelpAnswer("The Pro & Scale subscriptions unlock unlimited generated tracking links. The Starter package is capped at 10 active trackers. All campaigns support custom click routing and geographical sub-IDs.");
                }}
                className="p-3 text-xs bg-gray-50 hover:bg-gray-150 border border-gray-100 rounded-xl text-left font-medium text-gray-700"
              >
                Link Tracking Capacities
              </button>
              <button
                type="button"
                onClick={() => {
                  setHelpSearch("Are custom social slugs allowed?");
                  setHelpAnswer("All Linkfluence links pass through our secure proxy Cloaking servers to prevent link hijacking. Yes, you can safely share your links across YouTube, TikTok, newsletters, or blogs. To register, simply click on 'Start Earning'.");
                }}
                className="p-3 text-xs bg-gray-50 hover:bg-gray-150 border border-gray-100 rounded-xl text-left font-medium text-gray-700"
              >
                Affiliate Promotion Safety
              </button>
            </div>
          </div>

          <form onSubmit={handleHelpQuery} className="flex flex-col gap-2">
            <label className="text-xs font-mono font-bold text-gray-400 uppercase">Ask a custom query</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                placeholder="Type 'payouts', 'fees', or anything else..."
                value={helpSearch}
                onChange={e => setHelpSearch(e.target.value)}
              />
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition"
              >
                Search
              </button>
            </div>
          </form>

          {helpAnswer && (
            <div className="bg-[#3CB371]/5 border border-[#3CB371]/15 p-4.5 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
              <div className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#3CB371] rounded-full"></div> Response Desk Answer
              </div>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-sans font-medium">
                {helpAnswer}
              </p>
            </div>
          )}
        </div>
      </Modal>



      {/* Dynamic Activity Toast notifications */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] border border-gray-800 text-white font-medium text-xs md:text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-[fadeIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
          <Check size={16} className="text-[#3CB371]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
