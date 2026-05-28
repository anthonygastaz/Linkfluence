import React, { useState } from 'react';
import { User, Mail, Globe, Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  initialTab?: 'signup' | 'signin';
  onSuccess: (userData: { name: string; email: string; country: string; phone: string }) => void;
  onClose: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
];

export default function AuthModal({ initialTab = 'signup', onSuccess, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Validation feedback
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleToggleTab = (tab: 'signup' | 'signin') => {
    setActiveTab(tab);
    setErrorText(null);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    // Basic Validation
    if (!fullName.trim()) {
      setErrorText('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorText('Please enter your phone number.');
      return;
    }
    if (password.length < 6) {
      setErrorText('Password must be at least 6 characters long.');
      return;
    }
    if (!termsAccepted) {
      setErrorText('You must accept the terms of service.');
      return;
    }

    setLoading(true);

    // Simulate database interaction
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        name: fullName,
        email: email,
        country: country,
        phone: phone,
      });
      onClose();
    }, 1200);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!signInEmail.trim() || !signInEmail.includes('@')) {
      setErrorText('Please enter your registered email address.');
      return;
    }
    if (!signInPassword) {
      setErrorText('Please enter your password.');
      return;
    }

    setLoading(true);

    // Simulate database interaction containing mock check
    setTimeout(() => {
      setLoading(false);
      // Simulate login for Marcus Thorne or Liam Harris or newly created
      onSuccess({
        name: signInEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
        email: signInEmail,
        country: 'United States',
        phone: '+1 (555) 019-2831',
      });
      onClose();
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-lg mx-auto font-sans">
      
      {/* Dynamic Tab Switcher */}
      <div className="flex bg-[#E6F7F0]/65 p-1 rounded-2xl border border-[#3CB371]/10">
        <button
          type="button"
          onClick={() => handleToggleTab('signup')}
          className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'signup'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Create Partner Account
        </button>
        <button
          type="button"
          onClick={() => handleToggleTab('signin')}
          className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Returning Sign In
        </button>
      </div>

      {/* Alert Header bar */}
      <div className="bg-white border border-gray-150 rounded-2xl p-4.5 flex gap-3 items-start">
        <div className="p-1.5 bg-[#E6F7F0] rounded-lg text-[#3CB371] shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-black uppercase tracking-wider font-mono">
            {activeTab === 'signup' ? 'Institutional Linkfluence Partner Access' : 'Secure Session Access'}
          </h4>
          <p className="text-gray-500 text-xs mt-1 leading-normal">
            {activeTab === 'signup' 
              ? 'Join 10k+ verified affiliates receiving reliable tracking models with zero hidden payout processing fees.' 
              : 'Enter your credentials to manage active campaigns, audit instant clicks, and initiate rapid withdrawal cycles.'}
          </p>
        </div>
      </div>

      {/* Error display */}
      {errorText && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs text-red-600 font-medium animate-[fadeIn_0.2s_ease-out]">
          ⚠ {errorText}
        </div>
      )}

      {activeTab === 'signup' ? (
        /* Sign Up Form */
        <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
          
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Liam Harris"
                className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="liam.harris@example.com"
                className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Country Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Country</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Globe size={16} />
                </span>
                <select
                  className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black appearance-none"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.dial})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2831"
                  className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Secure Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full border border-gray-150 rounded-xl pl-10 pr-10 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-black cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Minimum 6 characters with a combination of letters and numbers.
            </p>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 mt-2 select-none cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded text-[#3CB371] focus:ring-[#3CB371]"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
            />
            <span className="text-xs text-gray-500 leading-relaxed font-sans font-medium">
              I agree to comply with traffic regulatory rules, click transparency audits, and verify that all dynamic redirects are directed at standard compliance campaigns.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#3CB371] hover:bg-[#2E8B57] disabled:bg-[#3CB371]/60 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create My Free Account'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-2">
            Already verified?{' '}
            <button
              type="button"
              onClick={() => handleToggleTab('signin')}
              className="text-[#3CB371] font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>

        </form>
      ) : (
        /* Sign In Form */
        <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4">
          
          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="liam.harris@example.com"
                className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                value={signInEmail}
                onChange={e => setSignInEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500">Password</label>
              <button 
                type="button" 
                onClick={() => setErrorText('Password reset instructions have been forwarded to your registered email address.')}
                className="text-xs text-gray-400 hover:text-[#3CB371] transition cursor-pointer font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full border border-gray-150 rounded-xl pl-10 pr-10 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black"
                value={signInPassword}
                onChange={e => setSignInPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-black cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-black hover:bg-gray-800 disabled:bg-black/60 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Secure Sign In'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-2">
            New here?{' '}
            <button
              type="button"
              onClick={() => handleToggleTab('signup')}
              className="text-[#3CB371] font-bold hover:underline cursor-pointer"
            >
              Apply as Partner
            </button>
          </p>

        </form>
      )}

    </div>
  );
}
