import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Check, 
  User, 
  Settings, 
  Lock, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Upload, 
  Search, 
  Globe, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CreditCard,
  Banknote,
  DollarSign,
  Activity,
  FileText,
  UserCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'yield';
  amount: number;
  methodOrPlan: string;
  destinationOrDetail: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Approved' | 'failed';
  reference: string;
}

interface ActivePlan {
  id: string;
  name: string;
  amount: number;
  dailyYieldPercent: number;
  accruedInterest: number;
  daysActive: number;
  totalDays: number;
  dateStarted: string;
}

interface KYCData {
  status: 'Unregistered' | 'Pending' | 'Approved';
  fullName: string;
  documentType: string;
  documentNumber: string;
  country: string;
  submittedAt?: string;
  uploadedFileName?: string;
  uploadedFileBase64?: string;
}

interface UserDashboardProps {
  user: {
    name: string;
    email: string;
    country: string;
    phone: string;
  };
  onUpdateUser: (userData: { name: string; email: string; country: string; phone: string }) => void;
  onLogout: () => void;
  triggerToast: (msg: string) => void;
  onOpenAdmin?: () => void;
}

const PLANS_CONFIG = [
  { id: 'p1', name: 'Starter Plan', yield: 1.5, days: 30, min: 30, desc: 'Ideal for aspiring creators starting to monetize their link shares. Standard click & geo tracking with weekly Monday payouts.' },
  { id: 'p2', name: 'Growth Plan', yield: 2.2, days: 60, min: 50, desc: 'Perfect for growing content makers with an active click flow. Includes full device and link analytics.' },
  { id: 'p3', name: 'Pro Premier Plan', yield: 3.0, days: 90, min: 100, desc: 'Optimized for professional creators seeking maximum daily yield. Includes real-time dashboard API hook and custom UTM Sub-IDs.' },
  { id: 'p4', name: 'Executive Plan', yield: 4.5, days: 180, min: 200, desc: 'Engineered for high-volume networks, agencies, and large publishers. Comes with on-demand payouts and custom DNS cloaked domains.' }
];

export default function UserDashboard({ user, onUpdateUser, onLogout, triggerToast, onOpenAdmin }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'deposit' | 'withdraw' | 'transactions' | 'profile'>('home');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState<boolean>(false);
  const [isMenuHidden, setIsMenuHidden] = useState<boolean>(false);
  
  // Dynamic Plans state synchronized with Admin Panel
  const [plans, setPlans] = useState<any[]>(() => {
    const saved = localStorage.getItem('linkfluence_investment_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back to constants
      }
    }
    return PLANS_CONFIG;
  });

  useEffect(() => {
    const saved = localStorage.getItem('linkfluence_investment_plans');
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTab]);
  
  // Persisted financial state
  const [balance, setBalance] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [totalInvestments, setTotalInvestments] = useState<number>(0);

  // Active Plans state
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);

  // KYC state
  const [kyc, setKyc] = useState<KYCData>({
    status: 'Unregistered',
    fullName: '',
    documentType: 'Nationwide Identity Card',
    documentNumber: '',
    country: user.country || 'United States'
  });

  // Transactions logs
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load from LocalStorage if available or reset to zero if new account
  useEffect(() => {
    const key = `linkfluence_user_data_${user.email}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.balance !== undefined) setBalance(parsed.balance);
        if (parsed.totalProfit !== undefined) setTotalProfit(parsed.totalProfit);
        if (parsed.totalWithdrawals !== undefined) setTotalWithdrawals(parsed.totalWithdrawals);
        if (parsed.totalInvestments !== undefined) setTotalInvestments(parsed.totalInvestments);
        if (parsed.activePlans !== undefined) setActivePlans(parsed.activePlans);
        if (parsed.kyc !== undefined) setKyc(parsed.kyc);
        if (parsed.transactions !== undefined) setTransactions(parsed.transactions);
      } catch (e) {
        console.error("Failed to load user state from storage", e);
      }
    } else {
      // New account structure - empty
      setBalance(0);
      setTotalProfit(0);
      setTotalWithdrawals(0);
      setTotalInvestments(0);
      setActivePlans([]);
      setKyc({
        status: 'Unregistered',
        fullName: '',
        documentType: 'Nationwide Identity Card',
        documentNumber: '',
        country: user.country || 'United States'
      });
      setTransactions([]);
    }
  }, [user.email]);

  // Listen for admin panel changes on user balance, plans, transactions, kyc, or gateways
  useEffect(() => {
    const handleAdminSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Synchronize active user state if the changed email matches
      if (customEvent.detail && customEvent.detail.email === user.email) {
        const key = `linkfluence_user_data_${user.email}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.balance !== undefined) setBalance(parsed.balance);
            if (parsed.totalProfit !== undefined) setTotalProfit(parsed.totalProfit);
            if (parsed.totalWithdrawals !== undefined) setTotalWithdrawals(parsed.totalWithdrawals);
            if (parsed.totalInvestments !== undefined) setTotalInvestments(parsed.totalInvestments);
            if (parsed.activePlans !== undefined) setActivePlans(parsed.activePlans);
            if (parsed.kyc !== undefined) setKyc(parsed.kyc);
            if (parsed.transactions !== undefined) setTransactions(parsed.transactions);
          } catch (err) {
            console.error("Failed to sync on administrative event", err);
          }
        }
      }
      
      // Also sync active investment plans config changes if any
      const plansSaved = localStorage.getItem('linkfluence_investment_plans');
      if (plansSaved) {
        try {
          setPlans(JSON.parse(plansSaved));
        } catch (err) {}
      }
    };

    window.addEventListener('linkfluence_data_updated', handleAdminSync);
    return () => {
      window.removeEventListener('linkfluence_data_updated', handleAdminSync);
    };
  }, [user.email]);

  // Listen for admin panel demoFundBoost changes
  const prevBoostRef = React.useRef<number>(0);
  React.useEffect(() => {
    const currentBoost = (user as any)?.demoFundBoost || 0;
    if (currentBoost > prevBoostRef.current) {
      const delta = currentBoost - prevBoostRef.current;
      prevBoostRef.current = currentBoost;
      
      setBalance(prev => {
        const nextBalance = parseFloat((prev + delta).toFixed(2));
        const key = `linkfluence_user_data_${user.email}`;
        const stateObj = {
          balance: nextBalance,
          totalProfit,
          totalWithdrawals,
          totalInvestments,
          activePlans,
          kyc,
          transactions
        };
        localStorage.setItem(key, JSON.stringify(stateObj));
        return nextBalance;
      });
    }
  }, [(user as any)?.demoFundBoost, user.email]);

  // Save to LocalStorage whenever changes happen
  const saveState = (
    newBalance: number,
    newProfit: number,
    newWithdrawals: number,
    newInvestments: number,
    newPlans: ActivePlan[],
    newKyc: KYCData,
    newTx: Transaction[]
  ) => {
    const key = `linkfluence_user_data_${user.email}`;
    const stateObj = {
      balance: newBalance,
      totalProfit: newProfit,
      totalWithdrawals: newWithdrawals,
      totalInvestments: newInvestments,
      activePlans: newPlans,
      kyc: newKyc,
      transactions: newTx
    };
    localStorage.setItem(key, JSON.stringify(stateObj));
  };

  // Real-time Yield accumulation tick simulator (increment accrued interest every 15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activePlans.length === 0) return;
      
      let extraProfit = 0;
      const updatedPlans = activePlans.map(plan => {
        // yield divided down to smaller simulator increments
        const accrual = parseFloat(((plan.amount * (plan.dailyYieldPercent / 100)) / 100).toFixed(6));
        extraProfit += accrual;
        return {
          ...plan,
          accruedInterest: parseFloat((plan.accruedInterest + accrual).toFixed(6))
        };
      });

      const nextProfit = parseFloat((totalProfit + extraProfit).toFixed(6));
      const nextBalance = parseFloat((balance + extraProfit).toFixed(6));
      
      setBalance(nextBalance);
      setTotalProfit(nextProfit);
      setActivePlans(updatedPlans);

      // Save subtle update
      saveState(nextBalance, nextProfit, totalWithdrawals, totalInvestments, updatedPlans, kyc, transactions);
    }, 12000);

    return () => clearInterval(interval);
  }, [activePlans, balance, totalProfit, totalWithdrawals, totalInvestments, kyc, transactions]);

  // KYC submission handler
  const [kycFullName, setKycFullName] = useState('');
  const [kycDocNum, setKycDocNum] = useState('');
  const [kycDocType, setKycDocType] = useState('Nationwide Identity Card');
  const [kycSubmittedFile, setKycSubmittedFile] = useState(false);
  const [kycFileName, setKycFileName] = useState('');
  const [kycFileBase64, setKycFileBase64] = useState('');
  const [kycLoading, setKycLoading] = useState(false);
  const kycFileInputRef = useRef<HTMLInputElement>(null);

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName.trim() || !kycDocNum.trim()) {
      triggerToast("Please complete all KYC input parameters.");
      return;
    }
    setKycLoading(true);
    setTimeout(() => {
      const nextKyc: KYCData = {
        status: 'Pending',
        fullName: kycFullName,
        documentType: kycDocType,
        documentNumber: kycDocNum,
        country: user.country,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        uploadedFileName: kycSubmittedFile ? kycFileName : undefined,
        uploadedFileBase64: kycSubmittedFile ? kycFileBase64 : undefined,
      };
      setKyc(nextKyc);
      setKycLoading(false);
      triggerToast("KYC Application submitted! Status set to 'Pending Review'.");
      
      saveState(balance, totalProfit, totalWithdrawals, totalInvestments, activePlans, nextKyc, transactions);
    }, 1500);
  };

  // Deposit Action states
  const [depositAmt, setDepositAmt] = useState<string>('250');
  const [depositMethod, setDepositMethod] = useState<string>('usdt-trc');
  const [depositSimulating, setDepositSimulating] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Dynamic Payment Gateways state synchronized from administration registers
  const [paymentGateways, setPaymentGateways] = useState<any[]>(() => {
    const saved = localStorage.getItem('linkfluence_payment_methods');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'usdt-trc', name: 'USDT (TRC20)', type: 'crypto', address: 'TLeS3Z9rXv89U6p7YQ18n5DmVyF9oWk2bX', enabled: true, desc: 'TRON low-fee stablecoin network settlement.' },
      { id: 'usdt-erc', name: 'USDT (ERC20)', type: 'crypto', address: '0x78a9c3b88d01ef0023a8901cb001f3df91a8291f', enabled: true, desc: 'Ethereum standard network stablecoin transaction routing.' },
      { id: 'btc', name: 'Bitcoin (BTC)', type: 'crypto', address: 'bc1q9p3a5d8f6k7m2x1y8g9n3w4r0t5y8j0u2a', enabled: true, desc: 'Direct Satoshis on-chain allocation address.' },
      { id: 'credit', name: 'Credit Card', type: 'gateway', address: 'Visa / Mastercard Automated Terminal', enabled: true, desc: 'Instant fiat billing using secure merchant APIs.' },
      { id: 'paypal', name: 'PayPal Gateway', type: 'gateway', address: 'paypal-sandbox@linkfluence.com', enabled: true, desc: 'Simulated fast authentication payment flow.' },
      { id: 'bank', name: 'Bank Wire', type: 'bank', address: 'BENEFICIARY: LINKFLUENCE GLOBAL LTD, Bank Ref: LF-PORTAL', enabled: true, desc: 'Settle institutional wires through bank routing.' }
    ];
  });

  // Reload payment gateways when user shifts views to dynamic tabs
  useEffect(() => {
    const saved = localStorage.getItem('linkfluence_payment_methods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPaymentGateways(parsed);
        // Automatically default selected gateway if original is deactivated or deleted
        if (parsed.length > 0 && !parsed.some((g: any) => g.id === depositMethod && g.enabled)) {
          const firstActive = parsed.find((g: any) => g.enabled);
          if (firstActive) setDepositMethod(firstActive.id);
        }
      } catch (e) {}
    }
  }, [activeTab]);

  const handleDepositConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmt);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast("Please input a positive numeric deposit value.");
      return;
    }
    if (amountNum < 10) {
      triggerToast("Minimum deposit constraint: $10.");
      return;
    }

    setDepositSimulating(true);

    setTimeout(() => {
      const txRef = 'TXN-' + Math.floor(100000 + Math.random() * 900000) + '-LF';
      const matchedGateway = paymentGateways.find(g => g.id === depositMethod);
      const actualMethodLabel = matchedGateway ? matchedGateway.name : 'Administrative Gate';

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        type: 'deposit',
        amount: amountNum,
        methodOrPlan: actualMethodLabel,
        destinationOrDetail: matchedGateway ? (matchedGateway.address || 'Routing Terminal') : 'Proxy Address',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pending',
        reference: txRef
      };

      const nextTxList = [newTx, ...transactions];

      setTransactions(nextTxList);
      setDepositSimulating(false);
      setDepositAmt('250');
      triggerToast(`Deposit of $${amountNum} initiated! Awaiting operator validation.`);

      saveState(balance, totalProfit, totalWithdrawals, totalInvestments, activePlans, kyc, nextTxList);
      setActiveTab('home');
    }, 2500);
  };

  // Withdrawal States
  const [withdrawAmt, setWithdrawAmt] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('usdt-trc');
  const [withdrawDetail, setWithdrawDetail] = useState<string>('');
  const [withdrawSimulating, setWithdrawSimulating] = useState(false);

  // Bank transfer states
  const [bankName, setBankName] = useState<string>('');
  const [bankAccountHolder, setBankAccountHolder] = useState<string>('');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankRouting, setBankRouting] = useState<string>('');

  useEffect(() => {
    if (withdrawMethod === 'bank') {
      const details = [
        bankName ? `Bank Name: ${bankName}` : '',
        bankAccountHolder ? `Account Holder: ${bankAccountHolder}` : '',
        bankAccountNumber ? `Account Number/IBAN: ${bankAccountNumber}` : '',
        bankRouting ? `SWIFT/Routing: ${bankRouting}` : ''
      ].filter(Boolean).join('\n');
      setWithdrawDetail(details);
    }
  }, [bankName, bankAccountHolder, bankAccountNumber, bankRouting, withdrawMethod]);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmt);
    if (isNaN(amt) || amt <= 0) {
      triggerToast("Please input a valid positive amount.");
      return;
    }
    if (amt > balance) {
      triggerToast("Insufficient funds to execute this withdrawal request.");
      return;
    }
    if (amt < 20) {
      triggerToast("Minimum withdrawal threshold is $20.");
      return;
    }

    if (withdrawMethod === 'bank') {
      if (!bankName.trim() || !bankAccountHolder.trim() || !bankAccountNumber.trim() || !bankRouting.trim()) {
        triggerToast("Please complete all bank transfer details (Bank Name, Holder name, IBAN/Account, and SWIFT/Routing Code).");
        return;
      }
    } else {
      if (!withdrawDetail.trim()) {
        triggerToast("Please mention your payment recipient address or account credentials.");
        return;
      }
    }

    setWithdrawSimulating(true);

    setTimeout(() => {
      const txRef = 'TXN-' + Math.floor(100000 + Math.random() * 900000) + '-LF';
      const actualMethodLabel = withdrawMethod === 'usdt-trc' ? 'USDT (TRC20)' :
                                withdrawMethod === 'usdt-erc' ? 'USDT (ERC20)' :
                                withdrawMethod === 'btc' ? 'Bitcoin (BTC)' :
                                withdrawMethod === 'paypal' ? 'PayPal Payout' : 'Bank Transfer';

      const finalDetails = withdrawMethod === 'bank' ? 
        `Bank: ${bankName} | Acc: ${bankAccountNumber} | SWIFT: ${bankRouting}` : 
        withdrawDetail;

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        type: 'withdrawal',
        amount: amt,
        methodOrPlan: actualMethodLabel,
        destinationOrDetail: finalDetails,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pending',
        reference: txRef
      };

      const nextBalance = parseFloat((balance - amt).toFixed(2));
      const nextWithdrawStats = parseFloat((totalWithdrawals + amt).toFixed(2));
      const nextTxList = [newTx, ...transactions];

      setBalance(nextBalance);
      setTotalWithdrawals(nextWithdrawStats);
      setTransactions(nextTxList);
      setWithdrawSimulating(false);
      setWithdrawAmt('');
      setWithdrawDetail('');
      setBankName('');
      setBankAccountHolder('');
      setBankAccountNumber('');
      setBankRouting('');
      triggerToast(`Withdrawal of $${amt} submitted and logged as Pending.`);

      saveState(nextBalance, totalProfit, nextWithdrawStats, totalInvestments, activePlans, kyc, nextTxList);
      setActiveTab('home');

      // Withdrawal is queued for manual administrator vetting in the console
      // High-volume transfers require compliant security validation on our gateway ledger.

    }, 2000);
  };

  // Plan Investment modal/state
  const [selectedPlanConfig, setSelectedPlanConfig] = useState<any | null>(null);
  const [investAmt, setInvestAmt] = useState<string>('');
  const [investSimulating, setInvestSimulating] = useState(false);
  const [referralBonusEnabled, setReferralBonusEnabled] = useState(true);

  const handleOpenInvest = (p: any) => {
    setSelectedPlanConfig(p);
    setInvestAmt(p.min.toString());
  };

  const handleExecuteInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanConfig) return;
    const amountNum = parseFloat(investAmt);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast("Please input a valid positive investment amount.");
      return;
    }
    if (amountNum < selectedPlanConfig.min) {
      triggerToast(`Minimum investment on ${selectedPlanConfig.name} is $${selectedPlanConfig.min}.`);
      return;
    }
    if (amountNum > balance) {
      triggerToast("Insufficient account balance. Please top up your wallet first!");
      return;
    }

    setInvestSimulating(true);

    setTimeout(() => {
      const txRef = 'TXN-' + Math.floor(100000 + Math.random() * 900000) + '-LF';
      
      const newPlanObj: ActivePlan = {
        id: 'ap-' + Date.now(),
        name: selectedPlanConfig.name,
        amount: amountNum,
        dailyYieldPercent: selectedPlanConfig.yield,
        accruedInterest: 0,
        daysActive: 0,
        totalDays: selectedPlanConfig.days,
        dateStarted: new Date().toISOString().substring(0, 10)
      };

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        type: 'investment',
        amount: amountNum,
        methodOrPlan: selectedPlanConfig.name,
        destinationOrDetail: `Contract Activated (${selectedPlanConfig.days} Days)`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Completed',
        reference: txRef
      };

      const nextBalance = parseFloat((balance - amountNum).toFixed(2));
      const nextInvestmentTotal = parseFloat((totalInvestments + amountNum).toFixed(2));
      const nextPlansList = [...activePlans, newPlanObj];
      const nextTxList = [newTx, ...transactions];

      setBalance(nextBalance);
      setTotalInvestments(nextInvestmentTotal);
      setActivePlans(nextPlansList);
      setTransactions(nextTxList);
      setInvestSimulating(false);
      setSelectedPlanConfig(null);
      triggerToast(`Successfully subscribed to ${selectedPlanConfig.name} with $${amountNum}!`);

      saveState(nextBalance, totalProfit, totalWithdrawals, nextInvestmentTotal, nextPlansList, kyc, nextTxList);
    }, 1800);
  };

  // Profile Form State
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileCountry, setProfileCountry] = useState(user.country);
  const [language, setLanguage] = useState('English (US)');
  const [twoFactor, setTwoFactor] = useState(false);
  const [simPassword, setSimPassword] = useState('');
  const [simNewPassword, setSimNewPassword] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      country: profileCountry
    });
    triggerToast("Personal profile parameters updated successfully!");
  };

  const handlePasswordResetSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPassword || !simNewPassword) {
      triggerToast("Please input current and new passwords.");
      return;
    }
    triggerToast("Security credentials successfully refreshed!");
    setSimPassword('');
    setSimNewPassword('');
  };

  // Dynamic status styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-150 animate-pulse';
      case 'Failed':
      case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  // Dynamic type icons
  const getTxTypeElement = (type: string) => {
    switch (type) {
      case 'deposit': 
        return (
          <div className="flex items-center gap-1.5 font-bold text-emerald-600 font-sans text-xs sm:text-sm">
            <span className="p-1 sm:p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg"><ArrowDownLeft size={14} /></span>
            <span>Credit Deposit</span>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="flex items-center gap-1.5 font-bold text-rose-600 font-sans text-xs sm:text-sm">
            <span className="p-1 sm:p-1.5 bg-rose-50 border border-rose-100 rounded-lg"><ArrowUpRight size={14} /></span>
            <span>Debit Payout</span>
          </div>
        );
      case 'investment':
        return (
          <div className="flex items-center gap-1.5 font-bold text-indigo-600 font-sans text-xs sm:text-sm">
            <span className="p-1 sm:p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg"><Layers size={14} /></span>
            <span>Plan Investment</span>
          </div>
        );
      case 'yield':
        return (
          <div className="flex items-center gap-1.5 font-bold text-[#3CB371] font-sans text-xs sm:text-sm">
            <span className="p-1 sm:p-1.5 bg-[#E6F7F0] border border-[#3CB371]/15 rounded-lg"><TrendingUp size={14} /></span>
            <span>Yield Interest</span>
          </div>
        );
      default:
        return <span>Generic Tx</span>;
    }
  };

  // Search and filter logs state
  const [logFilter, setLogFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'investment'>('all');
  const [logSearch, setLogSearch] = useState('');
  const filteredTxs = transactions.filter(t => {
    const matchFilter = logFilter === 'all' || t.type === logFilter;
    const matchSearch = t.methodOrPlan.toLowerCase().includes(logSearch.toLowerCase()) || 
                        t.reference.toLowerCase().includes(logSearch.toLowerCase()) ||
                        t.destinationOrDetail.toLowerCase().includes(logSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="w-full bg-[#FAFAF8] min-h-screen pt-6 md:pt-8 pb-24 lg:pb-12 px-4 md:px-8 max-w-[88rem] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 transition-all duration-300">
      
      {/* SIDEBAR NAVIGATION PANEL (DESKTOP ONLY) */}
      {!isMenuHidden && (
        <aside className={`hidden lg:flex transition-all duration-300 ease-in-out shrink-0 h-auto ${
          isMenuCollapsed ? 'lg:w-[78px]' : 'lg:w-64'
        } bg-white border border-gray-100/50 rounded-2xl p-4 flex-col gap-1.5 lg:h-[75vh] lg:sticky lg:top-20 shadow-sm z-10`}>
          
          {/* User profile capsule in sidebar */}
          <div className="px-1 py-1 mb-3 border-b border-gray-50/50 pb-3">
            <div className={`flex items-center ${isMenuCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-xl bg-[#E6F7F0] text-[#3CB371] font-bold text-lg flex items-center justify-center border border-[#3CB371]/10 flex-shrink-0 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isMenuCollapsed && (
                <div className="flex flex-col text-left truncate">
                  <h4 className="text-sm font-bold text-black font-sans leading-none truncate w-32 flex items-center gap-1">
                    <span>{user.name}</span>
                    {kyc.status === 'Approved' && (
                      <CheckCircle2 size={12} className="text-[#3CB371] shrink-0" title="KYC Approved" />
                    )}
                  </h4>
                  {kyc.status === 'Approved' ? (
                    <span className="text-[10px] font-mono text-[#3CB371] font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-[#3CB371] rounded-full inline-block" /> KYC Approved
                    </span>
                  ) : kyc.status === 'Pending' ? (
                    <span className="text-[10px] font-mono text-amber-500 font-bold mt-1 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" /> KYC Pending
                    </span>
                  ) : kyc.status === 'Rejected' ? (
                    <span className="text-[10px] font-mono text-rose-500 font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block" /> KYC Rejected
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-400 font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" /> Unverified
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation tab links */}
          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            title={isMenuCollapsed ? "Overview" : ""}
            className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'home' ? 'bg-[#3CB371] text-white shadow-sm shadow-[#3CB371]/10' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Activity size={18} />
            {!isMenuCollapsed && <span>Overview</span>}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('plans')}
            title={isMenuCollapsed ? "Investment Plans" : ""}
            className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'plans' ? 'bg-[#3CB371] text-white shadow-sm shadow-[#3CB371]/10' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Layers size={18} />
            {!isMenuCollapsed && <span>Investment Plans</span>}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('deposit')}
            title={isMenuCollapsed ? "Deposit Wallet" : ""}
            className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'deposit' ? 'bg-[#3CB371] text-white shadow-sm shadow-[#3CB371]/10' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ArrowDownLeft size={18} />
            {!isMenuCollapsed && <span>Deposit Wallet</span>}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('withdraw')}
            title={isMenuCollapsed ? "Withdraw Payout" : ""}
            className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'withdraw' ? 'bg-[#3CB371] text-white shadow-sm shadow-[#3CB371]/10' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ArrowUpRight size={18} />
            {!isMenuCollapsed && <span>Withdraw Payout</span>}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('transactions')}
            title={isMenuCollapsed ? "Transaction Records" : ""}
            className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'transactions' ? 'bg-[#3CB371] text-white shadow-sm shadow-[#3CB371]/10' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <FileText size={18} />
            {!isMenuCollapsed && <span>Transaction Records</span>}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            title={isMenuCollapsed ? "Profile Settings" : ""}
            className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'profile' ? 'bg-[#3CB371] text-white shadow-sm shadow-[#3CB371]/10' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Settings size={18} />
            {!isMenuCollapsed && <span>Profile Settings</span>}
          </button>

          {/* Collapsible interface controls at sidebar footer */}
          <div className="border-t border-gray-100/80 mt-auto pt-3 flex flex-col gap-1">
            
            {/* Collapse/Expand toggle for desktop screens */}
            <button 
              type="button"
              onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
              title={isMenuCollapsed ? "Expand Sidebar menu" : "Collapse Sidebar menu"}
              className={`hidden lg:flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2 rounded-xl text-left text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer transition-colors duration-150`}
            >
              {isMenuCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!isMenuCollapsed && <span className="font-medium">Collapse Menu</span>}
            </button>

            {/* Hide Navigation completely button */}
            <button 
              type="button"
              onClick={() => setIsMenuHidden(true)}
              title="Hide Navigation Panel"
              className={`flex items-center ${isMenuCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'} py-2 rounded-xl text-left text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer transition-colors duration-150`}
            >
              <EyeOff size={16} />
              {!isMenuCollapsed && <span className="font-medium">Hide Navigation</span>}
            </button>
          </div>
        </aside>
      )}

      {/* ACTIONABLE MAIN WORKSPACE PAGE CONTENT */}
      <main className="flex-1 min-w-0 flex flex-col gap-5">
        
        {/* Navigation Menu restore pill element */}
        {isMenuHidden && (
          <div className="flex items-center justify-between pb-1 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setIsMenuHidden(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-55 text-gray-700 font-sans font-semibold text-xs rounded-full shadow-sm border border-gray-100 transition-all duration-150 hover:scale-[1.02] cursor-pointer"
            >
              <Menu size={14} className="text-[#3CB371]" />
              <span>Show Navigation Menu</span>
            </button>
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Workspace Max View Active
            </span>
          </div>
        )}
        
        {/* TAB 1: OVERVIEW HUB (HOME SCREEN) */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.2s_ease-out]">
            
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-100/40 p-6 rounded-2xl shadow-xs">
              <div className="flex flex-col">
                <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest font-mono">Affiliate Capital workspace</span>
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-black mt-1 flex items-center gap-2 flex-wrap">
                  <span>Hello, {user.name}</span>
                  {kyc.status === 'Approved' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#3CB371] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-150 uppercase tracking-widest shadow-2xs font-mono">
                      <CheckCircle2 size={11} className="text-[#3CB371] shrink-0" /> Verified Partner
                    </span>
                  )}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Track your passive affiliate yield and verify transaction payouts seamlessly.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className="flex-1 sm:flex-initial bg-black text-white hover:bg-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowDownLeft size={14} className="text-[#3CB371]" /> Deposit
                </button>
                <button 
                  onClick={() => setActiveTab('withdraw')}
                  className="flex-1 sm:flex-initial border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowUpRight size={14} className="text-rose-500" /> Withdraw
                </button>
              </div>
            </div>

            {/* SIX-BENTO GRID PILLARS AND METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Metric 1: Account Balance */}
              <div className="bg-white border border-gray-100/45 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-semibold font-sans tracking-wide uppercase">Account Balance</span>
                  <div className="p-1.5 bg-[#E6F7F0] text-[#3CB371] rounded-lg"><Wallet size={16} /></div>
                </div>
                <div className="mt-4">
                  <span className="text-xl sm:text-2xl font-black text-black font-sans leading-none tracking-tight">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono mt-1 pr-1.5">Auto-accruing interest enabled</span>
                </div>
              </div>

              {/* Metric 2: Total deposits */}
              <div className="bg-white border border-gray-100/45 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-semibold font-sans tracking-wide uppercase">Total deposits</span>
                  <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg"><Layers size={16} /></div>
                </div>
                <div className="mt-4">
                  <span className="text-xl sm:text-2xl font-black text-slate-800 font-sans leading-none tracking-tight">
                    ${totalInvestments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-semibold block font-sans mt-1">
                    {activePlans.length} active allocation chains
                  </span>
                </div>
              </div>

              {/* Metric 3: Total Profit */}
              <div className="bg-white border border-gray-100/45 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-semibold font-sans tracking-wide uppercase">Total Profit</span>
                  <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><TrendingUp size={16} /></div>
                </div>
                <div className="mt-4">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 font-sans leading-none tracking-tight">
                    +${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono mt-1">Real-time passive yield streams</span>
                </div>
              </div>

              {/* Metric 4: Total Withdrawals */}
              <div className="bg-white border border-gray-100/45 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-semibold font-sans tracking-wide uppercase">Total Withdrawals</span>
                  <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><ArrowUpRight size={16} /></div>
                </div>
                <div className="mt-4">
                  <span className="text-xl sm:text-2xl font-black text-slate-800 font-sans leading-none tracking-tight">
                    ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-medium block font-mono mt-1">0% platform commission taken</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: KYC & Active Plans */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* KYC Verification Container */}
                <div className="bg-white border border-gray-100/40 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                    <h3 className="font-bold text-sm sm:text-base text-black flex items-center gap-1.5">
                      <UserCheck size={18} className="text-[#3CB371]" />
                      <span>KYC Registration</span>
                    </h3>
                    <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      kyc.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      kyc.status === 'Pending' ? 'bg-amber-50 text-amber-500 border-amber-100 animate-pulse' :
                      kyc.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 font-semibold' :
                      'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {kyc.status}
                    </span>
                  </div>

                  {kyc.status === 'Unregistered' || kyc.status === 'Rejected' ? (
                    <form onSubmit={handleKYCSubmit} className="flex flex-col gap-3">
                      {kyc.status === 'Rejected' && (
                        <div className="mb-2 p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-left flex items-start gap-2.5 shadow-2xs">
                          <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-rose-800 tracking-tight leading-none">KYC Verification Rejected</span>
                            <p className="text-[10px] sm:text-[11px] text-rose-600 font-medium leading-relaxed mt-1">
                              Your documents were analyzed by our compliance team and were unfortunately rejected. Please review your details and submit high-resolution document scans again below.
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 leading-relaxed mb-1 text-left">
                        Submit verification documents to verify legal affiliation, remove limits, and unlock rapid international withdrawal systems.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">Full Name as shown on ID</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Liam Harris" 
                            className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-sans"
                            value={kycFullName}
                            onChange={e => setKycFullName(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">Document Class type</label>
                          <select 
                            className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371]"
                            value={kycDocType}
                            onChange={e => setKycDocType(e.target.value)}
                          >
                            <option>Nationwide Identity Card</option>
                            <option>Digital Driver Licence</option>
                            <option>International Passport Booklet</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">Document / License ID Code</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. DL-902348A" 
                            className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-black font-mono focus:outline-none"
                            value={kycDocNum}
                            onChange={e => setKycDocNum(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1 justify-end">
                          <input 
                            type="file" 
                            ref={kycFileInputRef} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setKycSubmittedFile(true);
                                setKycFileName(file.name);
                                const r = new FileReader();
                                r.onloadend = () => {
                                  if (typeof r.result === 'string') {
                                    setKycFileBase64(r.result);
                                  }
                                };
                                r.readAsDataURL(file);
                                triggerToast(`Picture "${file.name}" uploaded successfully!`);
                              }
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              kycFileInputRef.current?.click();
                            }}
                            className={`w-full py-2 border rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              kycSubmittedFile ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Upload size={14} /> 
                            {kycSubmittedFile ? (kycFileName ? `${kycFileName} Attached` : 'Picture Attached') : 'Upload a picture'}
                          </button>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={kycLoading || !kycSubmittedFile}
                        className="w-full bg-[#3CB371] hover:bg-[#2E8B57] disabled:bg-gray-100 disabled:text-gray-400 font-semibold py-2.5 rounded-lg text-center text-xs text-white transition mt-2 cursor-pointer shadow-sm"
                      >
                        {kycLoading ? 'Processing Verification Documents...' : 'Submit Credentials for instant Verification'}
                      </button>
                    </form>
                  ) : kyc.status === 'Pending' ? (
                    <div className="flex flex-col items-center justify-center py-4 bg-amber-50/50 border border-amber-100/50 rounded-xl text-center">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-2">
                        <Clock size={18} className="animate-spin" />
                      </div>
                      <h4 className="text-xs font-bold text-black font-sans">Verification Application Pending Review</h4>
                      <p className="text-[11px] text-gray-400 max-w-sm px-4 mt-1">
                        Our compliance team is auditing your details (ID Num: {kyc.documentNumber}). Setup will automatically clear shortly.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 text-left">
                      <div className="w-10 h-10 bg-[#E6F7F0] rounded-xl flex items-center justify-center text-[#3CB371] border border-[#3CB371]/10">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black font-sans flex items-center gap-1">
                          Verified Legal Identity: {kyc.fullName}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                          Document verification cleared. International wires, bulk crypto, and instant Mondays settlement are fully unlocked of all limits.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Plans yield tracker */}
                <div className="bg-white border border-gray-100/40 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                    <h3 className="font-bold text-sm sm:text-base text-black flex items-center gap-1.5">
                      <Layers size={18} className="text-[#3CB371]" />
                      <span>Active Investment Plans</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('plans')}
                      className="text-xs text-[#3CB371] hover:underline font-bold flex items-center gap-0.5"
                    >
                      Browse More Plans <ArrowRight size={12} />
                    </button>
                  </div>

                  {activePlans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                      <p className="text-xs font-mono">No active investment contract parameters found.</p>
                      <button 
                        onClick={() => setActiveTab('plans')}
                        className="mt-3 bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Invest in first Plan
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {activePlans.map(plan => {
                        const progress = Math.min(100, (plan.daysActive / plan.totalDays) * 100);
                        return (
                          <div key={plan.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 hover:bg-gray-50 transition">
                            <div className="flex items-start justify-between text-left">
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-black tracking-tight">{plan.name}</h4>
                                <span className="text-[10px] text-gray-400 font-mono block mt-1">Starting Allocation: ${plan.amount.toLocaleString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-[#3CB371] block">+{plan.dailyYieldPercent}% daily yield</span>
                                <span className="text-[10px] text-indigo-500 font-semibold block mt-0.5">Accrued: +${plan.accruedInterest.toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
                                <span>Yield Contract Progress</span>
                                <span>Day {plan.daysActive} of {plan.totalDays}</span>
                              </div>
                              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#3CB371] h-full" style={{ width: `${progress === 0 ? 10 : progress}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
              
              {/* Right Column: Transactions Mini log */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-gray-100/40 rounded-2xl p-5 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                    <h3 className="font-bold text-sm sm:text-base text-black flex items-center gap-1.5">
                      <FileText size={18} className="text-[#3CB371]" />
                      <span>Recent Activity logs</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-xs text-[#3CB371] hover:underline font-bold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[30rem] lg:max-h-none pr-1">
                    {transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="p-3 border border-gray-100 rounded-xl bg-[#FAFAF8] flex flex-col gap-2 hover:border-gray-150 transition">
                        <div className="flex justify-between items-center text-xs">
                          {getTxTypeElement(tx.type)}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeClass(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end text-left pt-1">
                          <div>
                            <span className="text-xs font-bold text-black font-sans leading-none block">{tx.methodOrPlan}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-1 block">{tx.destinationOrDetail}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs sm:text-sm font-extrabold font-mono ${
                              tx.type === 'deposit' || tx.type === 'yield' ? 'text-emerald-500' : 'text-slate-800'
                            }`}>
                              {tx.type === 'deposit' || tx.type === 'yield' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-1 block font-mono">{tx.date.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: INVESTMENT PLANS */}
        {activeTab === 'plans' && (
          <div className="flex flex-col text-left gap-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-gray-100/40 p-6 rounded-2xl shadow-xs text-left">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest font-mono">Affiliate High-yield Pools</span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-black mt-1">Strategic Allocation Plans</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Choose a secure validator plan to allocate capital and generate dynamic daily returns automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((p: any) => {
                const alreadyInvested = activePlans.filter(ap => ap.name === p.name);
                return (
                  <div key={p.id} className="bg-white border border-gray-100/40 rounded-2xl p-6 shadow-xs hover:border-[#3CB371]/40 hover:shadow-xs transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#3CB371] bg-[#E6F7F0] border border-[#3CB371]/15 px-2.5 py-1 rounded-md font-mono">
                          {p.days} Days Term
                        </span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-black leading-none">{p.yield}%</span>
                          <span className="text-[10px] text-gray-400 block font-semibold mt-0.5">Estimated Daily ROI</span>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-black tracking-tight">{p.name}</h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed min-h-[2.5rem]">{p.desc}</p>

                      <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl my-4 text-xs font-mono">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold font-sans">Min Allocation</span>
                        <span className="font-extrabold text-gray-800">${p.min.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-left flex flex-col gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleOpenInvest(p)}
                        className="w-full bg-[#3CB371] hover:bg-[#2E8B57] text-white py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-center transition cursor-pointer shadow-sm"
                      >
                        Invest in this Plan
                      </button>
                      
                      {alreadyInvested.length > 0 && (
                        <div className="text-[10px] text-[#3CB371] flex items-center gap-1 font-sans justify-center mt-1">
                          <CheckCircle2 size={12} /> You currently have ${alreadyInvested.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} active in this contract.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Plan dialog */}
            {selectedPlanConfig && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-gray-100/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left">
                  <h3 className="font-extrabold text-lg text-black font-sans mb-1">Confirm Plan Purchase</h3>
                  <span className="text-xs text-indigo-600 font-mono block mb-4 uppercase">{selectedPlanConfig.name}</span>
                  
                  <form onSubmit={handleExecuteInvestment} className="flex flex-col gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 block font-sans">Available Wallet Funds</span>
                        <span className="text-base font-bold text-black font-sans">${balance.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block font-sans">Daily yield return</span>
                        <span className="text-base font-extrabold text-[#3CB371] font-mono">+{selectedPlanConfig.yield}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-mono text-gray-400">
                        <label>Enter Investment Amount ($)</label>
                        <span>Min: ${selectedPlanConfig.min}</span>
                      </div>
                      <input 
                        type="number" 
                        required
                        min={selectedPlanConfig.min}
                        className="border border-gray-150 bg-white rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono mt-1"
                        placeholder={`${selectedPlanConfig.min}`}
                        value={investAmt}
                        onChange={e => setInvestAmt(e.target.value)}
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                      Funds will lock for {selectedPlanConfig.days} days and accrue interest automatically. Minimum fee of 0% take applied at complete withdrawal resolution.
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setSelectedPlanConfig(null)}
                        className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl text-center text-xs cursor-pointer transition"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={investSimulating}
                        className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl text-center text-xs cursor-pointer transition"
                      >
                        {investSimulating ? 'Establishing Contract...' : 'Confirm purchase'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEPOSIT */}
        {activeTab === 'deposit' && (
          <div className="flex flex-col text-left gap-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-gray-100/40 p-6 rounded-2xl shadow-xs text-left">
              <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest font-mono">Wallet Top-up</span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-black mt-1">Fund Account Wallet</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Deposit funds instantly using secure payment methods below to lock high-yield affiliate plans.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Payment selection list & Form */}
              <div className="lg:col-span-7 bg-white border border-gray-100/40 rounded-2xl p-6 shadow-xs">
                <form onSubmit={handleDepositConfirm} className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 block">1. Enter Deposit Amount ($)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 font-bold text-sm">$</span>
                      <input 
                        type="number" 
                        required
                        min="10"
                        className="w-full border border-gray-150 rounded-xl pl-8 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono text-black"
                        placeholder="250"
                        value={depositAmt}
                        onChange={e => setDepositAmt(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-semibold text-gray-500 block">2. Select Payment Gateway Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      
                      {paymentGateways.filter(g => g.enabled).map((g: any) => (
                        <button 
                          key={g.id}
                          type="button"
                          onClick={() => setDepositMethod(g.id)}
                          className={`p-3.5 border rounded-xl flex items-center justify-between text-left cursor-pointer transition ${
                            depositMethod === g.id ? 'border-[#3CB371] bg-[#3CB371]/5 ring-1 ring-[#3CB371]' : 'border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-extrabold font-mono tracking-tight">
                              {g.type === 'crypto' ? 'COIN' : g.type === 'gateway' ? 'TERM' : 'BANK'}
                            </span>
                            <div>
                              <span className="text-xs font-bold block text-black">{g.name}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{g.desc}</span>
                            </div>
                          </div>
                        </button>
                      ))}

                    </div>
                  </div>

                  {/* Dynamic inputs based on method selected */}
                  {depositMethod === 'credit' && (
                    <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl flex flex-col gap-3 mt-2 animate-[fadeIn_0.2s_ease-out]">
                      <span className="text-[10px] font-bold text-[#3CB371] uppercase font-mono block">Visa/Mastercard Gateway Details</span>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-mono text-gray-400">Cardholder Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Liam Harris" 
                          className="bg-white border border-gray-150 px-3 py-2 rounded text-xs text-black"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-mono text-gray-400">Debit card digits number</label>
                        <input 
                          type="text" 
                          placeholder="4111 2222 3333 4444" 
                          className="bg-white border border-gray-150 px-3 py-2 rounded text-xs text-black font-mono"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-mono text-gray-400">Expiration date</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            className="bg-white border border-gray-150 px-3 py-2 rounded text-xs text-black font-mono text-center"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-mono text-gray-400">CVV Security code</label>
                          <input 
                            type="password" 
                            placeholder="•••" 
                            className="bg-white border border-gray-150 px-3 py-2 rounded text-xs text-black font-mono text-center"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={depositSimulating || (depositMethod === 'credit' && (!cardName || !cardNumber))}
                    className="w-full bg-[#3CB371] hover:bg-[#2E8B57] disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition duration-150 text-xs sm:text-base cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-2"
                  >
                    {depositSimulating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Verifying Deposit Request on Gateway Blockchain...</span>
                      </>
                    ) : (
                      'Confirm & Complete Deposit File'
                    )}
                  </button>

                </form>
              </div>

              {/* Sidebar with wallet addresses / bank routing instructions */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                {/* Method instructions block */}
                <div className="bg-white border border-gray-100/40 rounded-2xl p-5 shadow-xs text-left">
                  <h3 className="font-bold text-sm text-black flex items-center gap-1.5 mb-2.5">
                    <ShieldCheck size={16} className="text-[#3CB371]" />
                    <span>Transaction Guidelines</span>
                  </h3>
                  
                  {(() => {
                    const activeGateway = paymentGateways.find(g => g.id === depositMethod);
                    if (!activeGateway) return (
                      <p className="text-xs text-gray-400">Please select an available gateway parameter to load instructions.</p>
                    );
                    return (
                      <div className="flex flex-col gap-3.5 text-xs animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-gray-500 leading-relaxed font-sans">
                          To fund your account, transfer the desired amount to the secure routing credentials listed below.
                        </p>
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col gap-2">
                          <div>
                            <span className="text-[9.5px] uppercase font-mono text-gray-400 block font-bold leading-none mb-1">
                              Instructions Guideline ({activeGateway.name})
                            </span>
                            <span className="text-[11.5px] text-gray-600 font-sans block leading-normal mt-0.5">
                              {activeGateway.desc}
                            </span>
                          </div>

                          <div className="border-t border-gray-100 pt-2.5 mt-1">
                            <span className="text-[9.5px] uppercase font-mono text-gray-400 block font-bold mb-1">
                              Dynamic Destination Coordinate Label
                            </span>
                            <div className="flex items-center justify-between gap-1 mt-1 bg-white border border-gray-100 p-2.5 rounded-lg">
                              <code className="text-xs text-indigo-600 font-mono w-44 truncate select-all">
                                {activeGateway.address}
                              </code>
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(activeGateway.address);
                                  triggerToast("Copied gateway destination coordinates to clipboard!");
                                }}
                                className="p-1 px-1.5 hover:bg-gray-50 border border-gray-100 rounded text-gray-600 flex items-center gap-1 text-[10px] font-sans font-bold cursor-pointer"
                              >
                                <Copy size={11} /> Copy
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-400 font-mono leading-relaxed bg-[#FAFAF8] p-2.5 rounded-lg border border-gray-100">
                          ℹ Dynamic Channel: {activeGateway.name} ({activeGateway.type}). Transactions are monitored by the compliance queue and settle automatically inside sandbox.
                        </p>
                      </div>
                    );
                  })()}

                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <div className="flex flex-col text-left gap-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-gray-100/40 p-6 rounded-2xl shadow-xs text-left">
              <span className="text-rose-500 text-xs font-bold uppercase tracking-widest font-mono">Withdrawal request center</span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-black mt-1">Initiate Affiliate Withdrawal</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Submit payout requests directly from your dynamic balance of {balance.toLocaleString()} USD.</p>
            </div>

            <div className="bg-white border border-gray-100/40 rounded-2xl p-6 shadow-xs max-w-2xl">
              <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Withdrawal Amount ($)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 font-bold text-sm">$</span>
                      <input 
                        type="number" 
                        required
                        className="w-full border border-gray-150 rounded-xl pl-8 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono text-black"
                        placeholder="e.g. 150"
                        value={withdrawAmt}
                        onChange={e => setWithdrawAmt(e.target.value)}
                      />
                    </div>
                    <span 
                      onClick={() => setWithdrawAmt(Math.floor(balance).toString())}
                      className="text-[10px] text-gray-400 mt-1 cursor-pointer hover:text-[#3CB371] underline font-mono"
                    >
                      Available Out: ${balance.toLocaleString()} (Withdraw All)
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Payout Transfer Route Channel</label>
                    <select 
                      className="border border-gray-150 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black w-full"
                      value={withdrawMethod}
                      onChange={e => setWithdrawMethod(e.target.value)}
                    >
                      <option value="usdt-trc">USDT (TRC20 Network)</option>
                      <option value="usdt-erc">USDT (ERC20 Network)</option>
                      <option value="btc">Bitcoin Network</option>
                      <option value="paypal">PayPal Direct Account Email</option>
                      <option value="bank">Withdraw to Bank Account</option>
                    </select>
                  </div>
                </div>

                {withdrawMethod === 'bank' ? (
                  <div className="bg-gray-50/50 p-4 border border-gray-150 rounded-xl flex flex-col gap-3 mt-2">
                    <span className="text-xs font-bold text-gray-700 block border-b border-gray-100 pb-1.5 mb-1 text-left">Bank Account Transfer Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-500">Bank Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Bank of America"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black font-sans"
                          value={bankName}
                          onChange={e => setBankName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-500">Account Holder Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black font-sans"
                          value={bankAccountHolder}
                          onChange={e => setBankAccountHolder(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-500">Account Number / IBAN</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. US20391294821849"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black font-mono"
                          value={bankAccountNumber}
                          onChange={e => setBankAccountNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-500">SWIFT / BIC / Routing Code</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. BOFAUS3NXXX"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black font-mono"
                          value={bankRouting}
                          onChange={e => setBankRouting(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-semibold text-gray-500">Recipient Account credentials or Wallet address</label>
                    <textarea 
                      rows={2}
                      required
                      placeholder={
                        withdrawMethod === 'paypal' ? 'e.g. payout-merchant@creatoremail.com' :
                        'e.g. TLeS3Z9rXv89U6p7YQ18n5DmVyF9oWk2bX (USDT TRC20 Address)'
                      }
                      className="w-full border border-gray-150 rounded-xl px-4 py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3CB371] font-mono text-black"
                      value={withdrawDetail}
                      onChange={e => setWithdrawDetail(e.target.value)}
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 size={18} /></div>
                  <p className="text-[11px] text-gray-500 leading-normal text-left">
                    We charge a absolute **0% take fee** on withdrawals. All settlement payouts clear automatically on Monday mornings or process within 15 seconds in this interactive sandbox!
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={withdrawSimulating}
                  className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors duration-150 text-xs sm:text-sm cursor-pointer shadow-sm text-center"
                >
                  {withdrawSimulating ? 'Processing cryptographic validation...' : 'Initiate Withdrawal request'}
                </button>

              </form>
            </div>
          </div>
        )}

        {/* TAB 5: TRANSACTION RECORDS */}
        {activeTab === 'transactions' && (
          <div className="flex flex-col text-left gap-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-gray-100/40 p-6 rounded-2xl shadow-xs text-left">
              <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest font-mono">Affiliate ledger logs</span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-black mt-1">Transaction History Records</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Filter, audit, and inspect pending payouts, dynamic accrued yields, and capital allocation logs.</p>
            </div>

            {/* Filter controls bar */}
            <div className="bg-white border border-gray-100/40 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
              
              {/* Filter tabs */}
              <div className="flex bg-[#E6F7F0]/40 p-1 rounded-xl border border-gray-100 w-full md:w-auto">
                {(['all', 'deposit', 'withdrawal', 'investment'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg text-xs font-bold cursor-pointer transition capitalize ${
                      logFilter === f ? 'bg-[#3CB371] text-white shadow-sm' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-80">
                <input 
                  type="text"
                  placeholder="Search tx hash or plan name..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-150 bg-gray-55 text-xs text-black rounded-lg focus:outline-none"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                />
                <Search size={14} className="text-gray-400 absolute left-2.5 top-2.5" />
              </div>

            </div>

            {/* Transactions log container */}
            <div className="bg-white border border-gray-100/40 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-left text-gray-500">
                      <th className="py-4 px-4 sm:px-6">Activity type</th>
                      <th className="py-4 px-4">Gateway Route</th>
                      <th className="py-4 px-4 text-right">Settled Amount</th>
                      <th className="py-4 px-4">Timestamp Reference</th>
                      <th className="py-4 px-4">Transaction Code</th>
                      <th className="py-4 px-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-left">
                    {filteredTxs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 font-mono text-xs">
                          No transaction records matched the search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTxs.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-4.5 px-4 sm:px-6">
                            {getTxTypeElement(t.type)}
                          </td>
                          <td className="py-4.5 px-4 text-left">
                            <span className="font-bold text-gray-800 block text-xs">{t.methodOrPlan}</span>
                            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[12rem] block">{t.destinationOrDetail}</span>
                          </td>
                          <td className="py-4.5 px-4 text-right font-bold">
                            <span className={`font-mono text-xs sm:text-sm ${
                              t.type === 'deposit' || t.type === 'yield' ? 'text-emerald-500' : 'text-slate-800'
                            }`}>
                              {t.type === 'deposit' || t.type === 'yield' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4.5 px-4 text-gray-400 font-mono text-xs">
                            {t.date}
                          </td>
                          <td className="py-4.5 px-4 text-gray-500 font-mono text-xs">
                            {t.reference}
                          </td>
                          <td className="py-4.5 px-4">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(t.status)}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="flex flex-col text-left gap-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-gray-100/40 p-6 rounded-2xl shadow-xs text-left">
              <span className="text-[#3CB371] text-xs font-bold uppercase tracking-widest font-mono">Personal account dashboard</span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-black mt-1">Profile & Password Security</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage personal metadata, dial codes, language options, and cryptographic security credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Personal details frame */}
              <div className="lg:col-span-7 bg-white border border-gray-100/40 rounded-2xl p-6 shadow-xs">
                <h3 className="font-bold text-sm text-black border-b border-gray-50 pb-2 mb-4">Personal account configurations</h3>
                <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase font-mono">Full registered name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><User size={16} /></span>
                      <input 
                        type="text" 
                        required
                        className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black bg-white"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase font-mono">Current email endpoint</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Mail size={16} /></span>
                      <input 
                        type="email" 
                        required
                        className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#3CB371] text-black bg-white"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase font-mono">Mobile Contact Line</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Phone size={16} /></span>
                        <input 
                          type="text" 
                          required
                          className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-black bg-white"
                          value={profilePhone}
                          onChange={e => setProfilePhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase font-mono">Country Location</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Globe size={16} /></span>
                        <input 
                          type="text" 
                          required
                          className="w-full border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-black bg-white"
                          value={profileCountry}
                          onChange={e => setProfileCountry(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase font-mono">System Language</label>
                    <select 
                      className="border border-gray-150 rounded-xl px-4 py-3 text-sm text-black bg-white focus:outline-none w-full"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      <option>English (US)</option>
                      <option>Spanish (ES)</option>
                      <option>French (FR)</option>
                      <option>Deutsch (DE)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#3CB371] hover:bg-[#2E8B57] text-white font-semibold py-3 rounded-xl transition mt-2 text-xs sm:text-sm cursor-pointer shadow-sm text-center"
                  >
                    Save profile configuration
                  </button>

                </form>
              </div>

              {/* Password & Security widgets */}
              <div className="lg:col-span-5 flex flex-col gap-4">

                {/* Password reset code */}
                <div className="bg-white border border-gray-100/40 rounded-2xl p-5 shadow-xs text-left">
                  <h3 className="font-bold text-sm text-black flex items-center gap-1.5 border-b border-gray-50 pb-2 mb-3">
                    <Lock size={16} className="text-[#3CB371]" />
                    <span>Change Portal Password</span>
                  </h3>
                  <form onSubmit={handlePasswordResetSim} className="flex flex-col gap-2.5 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Current Secure Password</label>
                      <input 
                        type="password" 
                        required
                        className="bg-gray-50 border border-gray-100 px-3 py-2 rounded text-black font-mono focus:outline-none"
                        value={simPassword}
                        onChange={e => setSimPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">New Passphrase Code</label>
                      <input 
                        type="password" 
                        required
                        className="bg-gray-50 border border-gray-100 px-3 py-2 rounded text-black font-mono focus:outline-none"
                        value={simNewPassword}
                        onChange={e => setSimNewPassword(e.target.value)}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded text-center text-xs mt-2 cursor-pointer transition shadow-sm"
                    >
                      Refresh Password credentials
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* MOBILE FLOATING BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/95 backdrop-blur-md border border-gray-150/40 rounded-2xl shadow-xl py-2 px-3 flex items-center justify-around z-[48] lg:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 flex-1 rounded-xl transition-all duration-150 ${
            activeTab === 'home' ? 'text-[#3CB371] scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Activity size={18} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
          <span className="text-[9.5px] font-bold mt-0.5 font-sans tracking-tight">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex flex-col items-center justify-center py-1 flex-1 rounded-xl transition-all duration-150 ${
            activeTab === 'plans' ? 'text-[#3CB371] scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Layers size={18} className={activeTab === 'plans' ? 'stroke-[2.5]' : ''} />
          <span className="text-[9.5px] font-bold mt-0.5 font-sans tracking-tight">Plans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deposit')}
          className={`flex flex-col items-center justify-center py-1 flex-1 rounded-xl transition-all duration-150 ${
            activeTab === 'deposit' ? 'text-[#3CB371] scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ArrowDownLeft size={18} className={activeTab === 'deposit' ? 'stroke-[2.5]' : ''} />
          <span className="text-[9.5px] font-bold mt-0.5 font-sans tracking-tight">Deposit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('withdraw')}
          className={`flex flex-col items-center justify-center py-1 flex-1 rounded-xl transition-all duration-150 ${
            activeTab === 'withdraw' ? 'text-[#3CB371] scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ArrowUpRight size={18} className={activeTab === 'withdraw' ? 'stroke-[2.5]' : ''} />
          <span className="text-[9.5px] font-bold mt-0.5 font-sans tracking-tight">Payout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 flex-1 rounded-xl transition-all duration-150 ${
            activeTab === 'transactions' ? 'text-[#3CB371] scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={18} className={activeTab === 'transactions' ? 'stroke-[2.5]' : ''} />
          <span className="text-[9.5px] font-bold mt-0.5 font-sans tracking-tight">History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 flex-1 rounded-xl transition-all duration-150 ${
            activeTab === 'profile' ? 'text-[#3CB371] scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Settings size={18} className={activeTab === 'profile' ? 'stroke-[2.5]' : ''} />
          <span className="text-[9.5px] font-bold mt-0.5 font-sans tracking-tight">Profile</span>
        </button>
      </div>

    </div>
  );
}
