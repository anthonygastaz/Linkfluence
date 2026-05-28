import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck, Mail, Users, ArrowUpRight } from 'lucide-react';

interface OnboardingStepFormProps {
  onSuccess: (planName: string) => void;
  onClose: () => void;
}

export default function OnboardingStepForm({ onSuccess, onClose }: OnboardingStepFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    handle: '',
    niche: 'saas',
    trafficVolume: 10000,
    agreedToTerms: false
  });

  const [applied, setApplied] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      setApplied(true);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  // Projected earnings formula
  const projectedWeeklyConversions = Math.round(formData.trafficVolume * 0.02);
  const avgNicheCommission = formData.niche === 'saas' ? 36 : formData.niche === 'finance' ? 90 : formData.niche === 'ecommerce' ? 10.2 : 37.5;
  const potentialWeekly = projectedWeeklyConversions * avgNicheCommission;

  return (
    <div id="onboarding-step-form" className="w-full">
      {!applied ? (
        <div className="flex flex-col">
          {/* Stepper indicator dots */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-[#3CB371]' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
            <span className="text-xs font-mono text-gray-400 ml-auto uppercase">Step {step} of 3</span>
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-black tracking-tight">Tell us about your audience</h4>
                <p className="text-sm text-gray-500">We optimize deals to match what your followers or site visitors love.</p>
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm border border-gray-100 bg-white rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-sans"
                    placeholder="Alex Mercer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-sm border border-gray-100 bg-white rounded-xl pl-10 pr-4 py-3 text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-sans"
                      placeholder="alex@domain.com"
                    />
                    <Mail size={16} className="text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                    Primary Social Handle / Website URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.handle}
                    onChange={e => setFormData({ ...formData, handle: e.target.value })}
                    className="w-full text-sm border border-gray-100 bg-white rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono"
                    placeholder="e.g. @yourcreatorname or customblog.com"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!formData.name || !formData.email || !formData.handle}
                onClick={handleNext}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 text-white py-3.5 rounded-full font-semibold transition-all duration-200 text-center mt-6 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-black tracking-tight">Select your main marketing category</h4>
                <p className="text-sm text-gray-500">Pick the sector that aligns best with your traffic.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { id: 'saas', name: 'Software / SaaS', desc: 'Shopify, Canva, Notion etc.', comm: 'Up to 30%' },
                  { id: 'finance', name: 'Fintech & Wealth', desc: 'Sleek banks, credit, stock tools', comm: 'Up to 45%' },
                  { id: 'ecommerce', name: 'E-commerce Deals', desc: 'Direct-to-consumer gear', comm: 'Up to 12%' },
                  { id: 'education', name: 'Education/Courses', desc: 'E-learning, premium workshops', comm: 'Up to 25%' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, niche: item.id })}
                    className={`p-4 rounded-2xl border text-left flex flex-col transition-all duration-200 ${
                      formData.niche === item.id
                        ? 'border-[#3CB371] bg-[#3CB371]/5 ring-1 ring-[#3CB371]'
                        : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-bold text-black">{item.name}</span>
                    <span className="text-xs text-gray-400 mt-1">{item.desc}</span>
                    <span className="inline-block mt-3 text-xs font-semibold text-[#3CB371] bg-[#3CB371]/10 px-2 py-0.5 rounded-full max-w-max">
                      {item.comm}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-full font-semibold transition-all duration-200 text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-full font-semibold transition-all duration-200 text-center"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-black tracking-tight">Est. Monthly Link Visitors</h4>
                <p className="text-sm text-gray-500">Estimate how many link clicks you expect per month.</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-1.5"><Users size={16} /> Target Traffic</span>
                  <span className="text-lg font-semibold text-black">{formData.trafficVolume.toLocaleString()} visitors/mo</span>
                </div>

                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="2000"
                  value={formData.trafficVolume}
                  onChange={e => setFormData({ ...formData, trafficVolume: Number(e.target.value) })}
                  className="w-full accent-[#3CB371] bg-gray-100 rounded-lg cursor-pointer h-2"
                />

                <div className="border-t border-gray-50 pt-4 mt-2">
                  <span className="text-xs uppercase tracking-widest font-mono text-gray-400 block mb-1">Your Projected Earnings</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-extrabold text-[#3CB371] tracking-tight">
                      ${potentialWeekly.toLocaleString()}
                      <span className="text-xs font-normal text-gray-400 font-mono"> / week</span>
                    </span>
                    <span className="text-xs text-gray-400 text-right">Based on standard 2.0% CR</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 mt-2">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={formData.agreedToTerms}
                  onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 accent-[#3CB371]"
                />
                <label htmlFor="agree-checkbox" className="text-xs text-gray-500 leading-snug cursor-pointer select-none">
                  I agree to Linkfluence's Terms of Service and Payout Integrity Policy. I confirm I will promote offers ethically without artificial clicks.
                </label>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-full font-semibold transition-all duration-200 text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!formData.agreedToTerms}
                  onClick={handleNext}
                  className="flex-1 bg-[#3CB371] hover:bg-[#2E8B57] disabled:bg-gray-100 disabled:text-gray-400 text-white py-3 rounded-full font-semibold transition-all duration-200 text-center"
                >
                  Verify Account
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-6 animate-[fadeIn_0.4s_ease-out]">
          <div className="w-16 h-16 bg-[#3CB371]/10 rounded-full flex items-center justify-center text-[#3CB371] mb-5">
            <ShieldCheck size={36} />
          </div>

          <h3 className="text-2xl font-bold text-black tracking-tight mb-2">Congratulations, {formData.name}!</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
            Your Linkfluence application for <span className="font-mono font-medium text-black">{formData.handle}</span> has been provisionally pre-approved!
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 w-full text-left flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono">Commission Stream</span>
              <span className="font-semibold text-black uppercase tracking-wider">{formData.niche}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono">Setup Status</span>
              <span className="text-[#3CB371] font-semibold flex items-center gap-1">
                <CheckCircle size={12} /> Ready to Link
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono">Estimated Commission Payout</span>
              <span className="font-extrabold text-[#3CB371] font-mono">+${potentialWeekly.toLocaleString()}/wk</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onSuccess('Pro');
              onClose();
            }}
            className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-full font-semibold transition-all duration-200 text-center flex items-center justify-center gap-1.5"
          >
            Claim Creator Sandbox Account <ArrowUpRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
