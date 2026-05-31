import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { supabaseService } from '../lib/supabaseService';
import { DEFAULT_COUNTRY, CountrySelect } from '../lib/countries';

interface AuthModalProps {
  initialTab?: 'signup' | 'signin';
  onSuccess: (userData: { name: string; email: string; country: string; phone: string }) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  'w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3CB371]/30 focus:border-[#3CB371] text-black transition-shadow';
const LABEL_CLASS = 'text-xs font-semibold text-gray-600';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={LABEL_CLASS}>{children}</label>;
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
      {children}
    </span>
  );
}

export default function AuthModal({ initialTab = 'signup', onSuccess, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [errorText, setErrorText] = useState<string | null>(null);
  const [infoText, setInfoText] = useState<string | null>(null);

  const handleToggleTab = (tab: 'signup' | 'signin') => {
    setActiveTab(tab);
    setErrorText(null);
    setInfoText(null);
  };

  const completeAuth = async (
    userId: string,
    userEmail: string,
    fallback: { name: string; country: string; phone: string }
  ) => {
    await supabaseService.updateProfileFields(userId, {
      name: fallback.name,
      country: fallback.country,
      phone: fallback.phone,
      email: userEmail.toLowerCase().trim(),
    });

    const profile = await supabaseService.fetchProfile(userId, userEmail);
    onSuccess({
      name: profile?.name || fallback.name,
      email: profile?.email || userEmail.toLowerCase().trim(),
      country: profile?.country || fallback.country,
      phone: profile?.phone || fallback.phone,
    });
    setLoading(false);
    onClose();
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setInfoText(null);

    if (!fullName.trim()) {
      setErrorText('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorText('Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      setErrorText('Please accept the terms to continue.');
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      setErrorText('Supabase is not configured. Registration is unavailable.');
      return;
    }

    try {
      const data = await supabaseService.signUp(email, password, {
        name: fullName,
        country,
        phone,
      });

      if (!data.user) {
        throw new Error('Registration failed. Please try again.');
      }

      if (data.session) {
        await completeAuth(data.user.id, data.user.email || email, {
          name: fullName,
          country,
          phone,
        });
      } else {
        setLoading(false);
        setInfoText('Account created. Check your email to confirm, then sign in.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorText(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setInfoText(null);

    if (!signInEmail.trim() || !signInEmail.includes('@')) {
      setErrorText('Please enter your registered email address.');
      return;
    }
    if (!signInPassword) {
      setErrorText('Please enter your password.');
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      setErrorText('Supabase is not configured. Sign in is unavailable.');
      return;
    }

    try {
      const data = await supabaseService.signIn(signInEmail, signInPassword);
      if (!data.user) {
        throw new Error('Sign in failed. Please check your credentials.');
      }

      await completeAuth(data.user.id, data.user.email || signInEmail, {
        name: data.user.user_metadata?.name || signInEmail.split('@')[0],
        country: data.user.user_metadata?.country || DEFAULT_COUNTRY,
        phone: data.user.user_metadata?.phone || '',
      });
    } catch (err: any) {
      setLoading(false);
      setErrorText(err.message || 'Sign in failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 text-left w-full font-sans">
      {/* Tab switcher */}
      <div className="shrink-0 px-4 sm:px-5 pt-4 pb-3">
        <div className="flex bg-[#E6F7F0]/65 p-1 rounded-xl border border-[#3CB371]/10">
          <button
            type="button"
            onClick={() => handleToggleTab('signup')}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'signup'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => handleToggleTab('signin')}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'signin'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(errorText || infoText) && (
        <div className="shrink-0 px-4 sm:px-5 pb-3 space-y-2">
          {errorText && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 text-xs text-red-600 font-medium">
              {errorText}
            </div>
          )}
          {infoText && (
            <div className="bg-[#E6F7F0] border border-[#3CB371]/20 rounded-xl px-3.5 py-3 text-xs text-[#2E8B57] font-medium">
              {infoText}
            </div>
          )}
        </div>
      )}

      {activeTab === 'signup' ? (
        <form onSubmit={handleSignUpSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 pb-4 space-y-3.5">
            <div className="flex gap-3 items-start bg-white border border-gray-100 rounded-xl p-3.5">
              <div className="p-1.5 bg-[#E6F7F0] rounded-lg text-[#3CB371] shrink-0">
                <ShieldCheck size={16} />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Join thousands of creators earning through tracked affiliate links with transparent payouts.
              </p>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Full name</FieldLabel>
              <div className="relative">
                <IconWrap><User size={16} /></IconWrap>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Liam Harris"
                  className={INPUT_CLASS}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <IconWrap><Mail size={16} /></IconWrap>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Country</FieldLabel>
              <CountrySelect
                className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3CB371]/30 focus:border-[#3CB371] text-black cursor-pointer transition-shadow"
                value={country}
                onChange={setCountry}
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </FieldLabel>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 012-3456"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3CB371]/30 focus:border-[#3CB371] text-black transition-shadow"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Password</FieldLabel>
              <div className="relative">
                <IconWrap><Lock size={16} /></IconWrap>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className={`${INPUT_CLASS} pr-10`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#3CB371] focus:ring-[#3CB371] shrink-0"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to the{' '}
                <span className="text-[#3CB371] font-semibold">Terms of Service</span> and{' '}
                <span className="text-[#3CB371] font-semibold">Privacy Policy</span>. I will promote
                offers honestly, use tracking links as intended, and follow applicable advertising and
                privacy laws in my country.
              </span>
            </label>
          </div>

          <div className="shrink-0 px-4 sm:px-5 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm space-y-3 safe-area-pb">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3CB371] hover:bg-[#2E8B57] disabled:bg-[#3CB371]/60 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center min-h-[48px]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create free account'
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggleTab('signin')}
                className="text-[#3CB371] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignInSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 pb-4 space-y-3.5 flex flex-col justify-center">
            <div className="space-y-1.5">
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <IconWrap><Mail size={16} /></IconWrap>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center gap-2">
                <FieldLabel>Password</FieldLabel>
                <button
                  type="button"
                  onClick={() =>
                    setInfoText('If an account exists, reset instructions will be sent to your email.')
                  }
                  className="text-xs text-gray-400 hover:text-[#3CB371] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <IconWrap><Lock size={16} /></IconWrap>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={`${INPUT_CLASS} pr-10`}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 px-4 sm:px-5 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm space-y-3 safe-area-pb">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-black/60 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center min-h-[48px]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              New here?{' '}
              <button
                type="button"
                onClick={() => handleToggleTab('signup')}
                className="text-[#3CB371] font-semibold hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
