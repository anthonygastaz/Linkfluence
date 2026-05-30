import React, { useState, useEffect } from 'react';
import LogoIcon from './LogoIcon';
import { syncFromGlobalStorage } from '../lib/sync';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Settings, 
  CheckCircle, 
  XOctagon, 
  DollarSign, 
  UserCheck, 
  Coins,
  Activity,
  Award,
  ArrowRight,
  ArrowDownLeft,
  User,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wallet,
  Globe,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  FileText
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: { name: string; email: string; country: string; phone: string; } | null;
  onUpdateCurrentUser: (updated: any) => void;
  triggerToast: (msg: string) => void;
  onClose: () => void;
}

// Interfaces to mirror UserDashboard state shapes
interface KYCData {
  status: 'Unregistered' | 'Pending' | 'Approved' | 'Rejected';
  fullName: string;
  documentType: string;
  documentNumber: string;
  country: string;
  submittedAt?: string;
  uploadedFileName?: string;
  uploadedFileBase64?: string;
}

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

interface UserState {
  balance: number;
  totalProfit: number;
  totalWithdrawals: number;
  totalInvestments: number;
  activePlans: ActivePlan[];
  kyc: KYCData;
  transactions: Transaction[];
}

export default function AdminPanel({ currentUser, onUpdateCurrentUser, triggerToast, onClose }: AdminPanelProps) {
  // Authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('linkfluence_admin_authenticated') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active admin tab selection
  const [activeTab, setActiveTab] = useState<'users' | 'kyc' | 'deposits' | 'withdrawals' | 'plans' | 'payment-methods' | 'email-portal' | 'system-logs'>('users');

  // Unified State Stores (seeded with standard users if empty)
  const [roster, setRoster] = useState<string[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  
  // Create / Edit User state
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserOriginalEmail, setEditingUserOriginalEmail] = useState('');
  
  // Form fields for User Profile
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCountry, setFormCountry] = useState('United States');
  const [formPhone, setFormPhone] = useState('');
  const [formBalance, setFormBalance] = useState('0');
  const [formProfit, setFormProfit] = useState('0');
  const [formKycStatus, setFormKycStatus] = useState<'Unregistered' | 'Pending' | 'Approved'>('Unregistered');

  // Ledger debit/credit state
  const [isAdjustingFunds, setIsAdjustingFunds] = useState(false);
  const [fundAdjustmentUserEmail, setFundAdjustmentUserEmail] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [adjustmentTarget, setAdjustmentTarget] = useState<'balance' | 'profit' | 'deposits'>('balance');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  // Investment Plans State
  const [plans, setPlans] = useState<any[]>([]);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    yield: '1.5',
    days: '30',
    min: '100',
    desc: ''
  });

  // Dynamic Payment Gateways
  const [paymentGateways, setPaymentGateways] = useState<any[]>([]);
  const [isEditingGateway, setIsEditingGateway] = useState(false);
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [gatewayForm, setGatewayForm] = useState({
    name: '',
    type: 'crypto',
    address: '',
    enabled: true,
    desc: ''
  });

  // Client Email dispatch simulation
  const [emailTarget, setEmailTarget] = useState('');
  const [emailSubject, setEmailSubject] = useState('Welcome back to Affiliate Associate Program!');
  const [emailTemplate, setEmailTemplate] = useState('welcome');
  const [emailCustomMessage, setEmailCustomMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sentMailsLog, setSentMailsLog] = useState<Array<{id: string, date: string, to: string, subject: string, snippet: string}>>([
    {
      id: 'SM-1',
      date: '2026-05-28 01:22',
      to: 'harris.liam@linkfluence.io',
      subject: 'Account Withdrawal Settlement Finalized',
      snippet: 'We have approved your request to withdraw 120.00 USDC. Cryptographic ledger settlement completed.'
    }
  ]);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    danger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    danger: false
  });

  const promptConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Confirm', danger = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      danger
    });
  };

  // Administration action log
  const [adminSystemLogs, setAdminSystemLogs] = useState<Array<{id: string, date: string, action: string, priority: 'info' | 'warn' | 'success'}>>([
    { id: 'LOG-1', date: '2026-05-28 05:42', action: 'System Administrator logged in securely from port 3000 node telemetry.', priority: 'success' },
    { id: 'LOG-2', date: '2026-05-28 05:43', action: 'Seeded default account registers (Liam Harris, Chloe Stanford, Sarah Jenkins).', priority: 'info' }
  ]);

  // Real-time secure global user list fetch from server DB
  const fetchGlobalUsers = async () => {
    try {
      const res = await fetch('/api/users/list', {
        headers: {
          'Authorization': 'Bearer Lamba1###'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          // Store each user's record back to localized state silently in raw storage to avoid overwrite loops
          data.users.forEach((item: any) => {
            const profile = { name: item.name, email: item.email, country: item.country, phone: item.phone };
            const details = {
              balance: item.balance,
              totalProfit: item.totalProfit,
              totalWithdrawals: item.totalWithdrawals,
              totalInvestments: item.totalInvestments,
              activePlans: item.activePlans,
              kyc: item.kyc,
              transactions: item.transactions
            };
            window.localStorage.setItem(`linkfluence_user_profile_${item.email}`, JSON.stringify(profile));
            window.localStorage.setItem(`linkfluence_user_data_${item.email}`, JSON.stringify(details));
          });
          const emails = data.users.map((u: any) => u.email);
          window.localStorage.setItem('linkfluence_users_roster', JSON.stringify(emails));
          setRoster(emails);
          if (emails.length > 0 && !selectedUserEmail) {
            setSelectedUserEmail(emails[0]);
          }
        }
      }
    } catch (err) {
      console.warn("Could not retrieve global user listing", err);
    }
  };

  // Seed default data structure inside localStorage
  useEffect(() => {
    const runStartup = async () => {
      await syncFromGlobalStorage();
      await fetchGlobalUsers();
      initDefaultDatabase();
      loadRosterAndConfig();
    };
    runStartup();

    const handleSyncEvent = () => {
      fetchGlobalUsers();
      loadRosterAndConfig();
    };

    window.addEventListener('linkfluence_data_updated', handleSyncEvent);
    window.addEventListener('storage', handleSyncEvent);

    return () => {
      window.removeEventListener('linkfluence_data_updated', handleSyncEvent);
      window.removeEventListener('storage', handleSyncEvent);
    };
  }, []);

  const addLog = (action: string, priority: 'info' | 'warn' | 'success' = 'info') => {
    const newLog = {
      id: 'LOG-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action,
      priority
    };
    setAdminSystemLogs(prev => [newLog, ...prev]);
  };

  const initDefaultDatabase = () => {
    // 1. Core Users Roster - clean and free of obsolete mock email addresses
    const obsoleteMockEmails = ['harris.liam@linkfluence.io', 'chloe.s@linkfluence.com', 's.jenkins@affiliates.net', 'anthonygastaz@gmail.com'];
    obsoleteMockEmails.forEach(email => {
      localStorage.removeItem(`linkfluence_user_profile_${email}`);
      localStorage.removeItem(`linkfluence_user_data_${email}`);
    });

    // Seed/Load roster index dynamically or initialize for the first time
    const isFirstTime = !localStorage.getItem('linkfluence_system_initialized');
    
    // Discover any dynamically added user profiles in localStorage and merge them
    const localProfileEmails: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('linkfluence_user_profile_')) {
        const email = key.substring('linkfluence_user_profile_'.length);
        if (email) {
          localProfileEmails.push(email);
        }
      }
    }

    const defaultSeed = isFirstTime ? ['graphicbullng@gmail.com'] : [];
    let emails: string[] = [];

    const savedRoster = localStorage.getItem('linkfluence_users_roster');
    if (savedRoster) {
      try {
        const parsed = JSON.parse(savedRoster);
        if (Array.isArray(parsed)) {
          // Merge unique emails, discarding obsolete mock ones but preserving any others
          const uniqueEmails = new Set([...defaultSeed, ...parsed, ...localProfileEmails]);
          obsoleteMockEmails.forEach(obs => uniqueEmails.delete(obs));
          emails = Array.from(uniqueEmails);
        }
      } catch (e) {
        console.error("Error patching existing roster on startup", e);
      }
    } else {
      const uniqueEmails = new Set([...defaultSeed, ...localProfileEmails]);
      obsoleteMockEmails.forEach(obs => uniqueEmails.delete(obs));
      emails = Array.from(uniqueEmails);
    }
    localStorage.setItem('linkfluence_users_roster', JSON.stringify(emails));

    // 2. Seeding zeroed out clean records for graphicbullng@gmail.com if first time ever
    if (isFirstTime) {
      const defaultData: { [key: string]: { profile: any, data: UserState } } = {
        'graphicbullng@gmail.com': {
          profile: { name: 'Graphic Bull', email: 'graphicbullng@gmail.com', country: 'United States', phone: '+1 (555) 019-2831' },
          data: {
            balance: 0.00,
            totalProfit: 0.00,
            totalWithdrawals: 0.00,
            totalInvestments: 0.00,
            activePlans: [],
            kyc: { status: 'Unregistered', fullName: '', documentType: 'National ID Card', documentNumber: '', country: 'United States' },
            transactions: []
          }
        }
      };

      // Store profiles and datas if not already present
      Object.keys(defaultData).forEach(email => {
        if (!localStorage.getItem(`linkfluence_user_profile_${email}`)) {
          localStorage.setItem(`linkfluence_user_profile_${email}`, JSON.stringify(defaultData[email].profile));
        }
        if (!localStorage.getItem(`linkfluence_user_data_${email}`)) {
          localStorage.setItem(`linkfluence_user_data_${email}`, JSON.stringify(defaultData[email].data));
        }
      });
      localStorage.setItem('linkfluence_system_initialized', 'true');
    }

    // 3. System Investment Pools configuration
    const defaultPlans = [
      { id: 'p1', name: 'Starter Plan', yield: 1.5, days: 30, min: 30, desc: 'Ideal for aspiring creators starting to monetize their link shares. Standard click & geo tracking with weekly Monday payouts.' },
      { id: 'p2', name: 'Growth Plan', yield: 2.2, days: 60, min: 50, desc: 'Perfect for growing content makers with an active click flow. Includes full device and link analytics.' },
      { id: 'p3', name: 'Pro Premier Plan', yield: 3.0, days: 90, min: 100, desc: 'Optimized for professional creators seeking maximum daily yield. Includes real-time dashboard API hook and custom UTM Sub-IDs.' },
      { id: 'p4', name: 'Executive Plan', yield: 4.5, days: 180, min: 200, desc: 'Engineered for high-volume networks, agencies, and large publishers. Comes with on-demand payouts and custom DNS cloaked domains.' }
    ];
    if (!localStorage.getItem('linkfluence_investment_plans')) {
      localStorage.setItem('linkfluence_investment_plans', JSON.stringify(defaultPlans));
    }

    // 4. Gateway Payment methods configuration
    const defaultGateways = [
      { id: 'usdt-trc', name: 'USDT (TRC20)', type: 'crypto', address: 'TLeS3Z9rXv89U6p7YQ18n5DmVyF9oWk2bX', enabled: true, desc: 'TRON low-fee stablecoin network settlement.' },
      { id: 'usdt-erc', name: 'USDT (ERC20)', type: 'crypto', address: '0x78a9c3b88d01ef0023a8901cb001f3df91a8291f', enabled: true, desc: 'Ethereum standard network stablecoin transaction routing.' },
      { id: 'btc', name: 'Bitcoin (BTC)', type: 'crypto', address: 'bc1q9p3a5d8f6k7m2x1y8g9n3w4r0t5y8j0u2a', enabled: true, desc: 'Direct Satoshi on-chain allocation address.' },
      { id: 'credit', name: 'Credit Card', type: 'gateway', address: 'Visa / Mastercard Automated Terminal', enabled: true, desc: 'Instant fiat billing using secure merchant APIs.' },
      { id: 'paypal', name: 'PayPal Gateway', type: 'gateway', address: 'paypal-sandbox@linkfluence.com', enabled: true, desc: 'Simulated fast authentication payment flow.' },
      { id: 'bank', name: 'Bank Wire', type: 'bank', address: 'BENEFICIARY: LINKFLUENCE GLOBAL LTD, Bank Ref: LF-PORTAL', enabled: true, desc: 'Settle institutional wires through bank routing.' }
    ];
    if (!localStorage.getItem('linkfluence_payment_methods')) {
      localStorage.setItem('linkfluence_payment_methods', JSON.stringify(defaultGateways));
    }

    // Notify any active listeners of system data load / updates dynamically
    emails.forEach(email => {
      window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email } }));
    });
  };

  const loadRosterAndConfig = () => {
    // Roster load
    const savedRoster = localStorage.getItem('linkfluence_users_roster');
    if (savedRoster) {
      try {
        const parsed = JSON.parse(savedRoster);
        setRoster(parsed);
        if (parsed.length > 0) {
          setSelectedUserEmail(parsed[0]);
        } else {
          setSelectedUserEmail('');
        }
      } catch (e){}
    }

    // Dynamic Plans load
    const savedPlans = localStorage.getItem('linkfluence_investment_plans');
    if (savedPlans) {
      try { setPlans(JSON.parse(savedPlans)); } catch (e) {}
    }

    // Dynamic Gateways load
    const savedGateways = localStorage.getItem('linkfluence_payment_methods');
    if (savedGateways) {
      try { setPaymentGateways(JSON.parse(savedGateways)); } catch (e) {}
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAuthError('Please fill in both admin credential blocks.');
      return;
    }

    if (adminUsername.toLowerCase() === 'affiliateassociateprogram' && adminPassword === 'Lamba1###') {
      sessionStorage.setItem('linkfluence_admin_authenticated', 'true');
      setIsAdminAuthenticated(true);
      triggerToast('Security clearance approved. Administrative token successfully minted.');
      addLog('Administrator authenticated successfully.', 'success');
    } else {
      setAuthError('Invalid credentials. Clear text telemetry mismatch detected.');
      addLog('Failed administrator login attempt.', 'warn');
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('linkfluence_admin_authenticated');
    setIsAdminAuthenticated(false);
    triggerToast('Administrative token invalidated. Logged out.');
    addLog('Administrator signed out.', 'info');
  };

  // Helper: Retrieve full user record compiled with dynamic automatic backup seeding
  const getUserRecord = (email: string) => {
    let profileSaved = localStorage.getItem(`linkfluence_user_profile_${email}`);
    let dataSaved = localStorage.getItem(`linkfluence_user_data_${email}`);
    
    // Auto-seed missing user profile with a graceful human name derived from their email address
    if (!profileSaved) {
      const emailPrefix = email.split('@')[0];
      const name = emailPrefix
        .replace('.', ' ')
        .replace('-', ' ')
        .replace('_', ' ')
        .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        
      const seedProfile = {
        name,
        email,
        country: 'United States',
        phone: '+1 (555) 012-' + Math.floor(1000 + Math.random() * 9000)
      };
      profileSaved = JSON.stringify(seedProfile);
      localStorage.setItem(`linkfluence_user_profile_${email}`, profileSaved);
    }
    
    // Auto-seed missing user data with a realistic balance structure matching a newly registered partner
    if (!dataSaved) {
      const seedData: UserState = {
        balance: 350.00, // Seed a small default start reward
        totalProfit: 12.50,
        totalWithdrawals: 0.00,
        totalInvestments: 300.00,
        activePlans: [
          {
            id: 'p1',
            name: 'Starter Plan',
            amount: 300.00,
            dailyYieldPercent: 1.5,
            accruedInterest: 12.50,
            daysActive: 3,
            totalDays: 30,
            dateStarted: new Date().toISOString().substring(0, 10)
          }
        ],
        kyc: { 
          status: 'Approved', 
          fullName: email.split('@')[0].toUpperCase(), 
          documentType: 'National ID Card', 
          documentNumber: 'ID-' + Math.floor(100000 + Math.random() * 900000), 
          country: 'United States' 
        },
        transactions: [
          {
            id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            type: 'deposit',
            amount: 300.00,
            status: 'Approved',
            methodOrPlan: 'USDT (TRC20)',
            destinationOrDetail: 'TLeS3Z9rXv89...oWk2bX',
            reference: 'TX-' + Math.floor(100000 + Math.random() * 900000)
          }
        ]
      };
      dataSaved = JSON.stringify(seedData);
      localStorage.setItem(`linkfluence_user_data_${email}`, dataSaved);
    }

    let profile = { name: 'Unknown', email: email, country: 'United States', phone: '' };
    try { profile = JSON.parse(profileSaved); } catch (e) {}

    let data: UserState = {
      balance: 0,
      totalProfit: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      activePlans: [],
      kyc: { status: 'Unregistered', fullName: '', documentType: '', documentNumber: '', country: '' },
      transactions: []
    };
    try { data = JSON.parse(dataSaved); } catch (e) {}

    return { ...profile, ...data };
  };

  // Helper: Save full user record compiled back
  const saveUserRecord = (email: string, updatedRecord: any) => {
    const profile = {
      name: updatedRecord.name,
      email: updatedRecord.email,
      country: updatedRecord.country,
      phone: updatedRecord.phone
    };

    const data: UserState = {
      balance: parseFloat(updatedRecord.balance) || 0,
      totalProfit: parseFloat(updatedRecord.totalProfit) || 0,
      totalWithdrawals: parseFloat(updatedRecord.totalWithdrawals) || 0,
      totalInvestments: parseFloat(updatedRecord.totalInvestments) || 0,
      activePlans: updatedRecord.activePlans || [],
      kyc: updatedRecord.kyc || { status: 'Unregistered', fullName: '', documentType: '', documentNumber: '', country: '' },
      transactions: updatedRecord.transactions || []
    };

    localStorage.setItem(`linkfluence_user_profile_${email}`, JSON.stringify(profile));
    localStorage.setItem(`linkfluence_user_data_${email}`, JSON.stringify(data));

    // Update roster if not in it
    let savedRoster = localStorage.getItem('linkfluence_users_roster');
    if (savedRoster) {
      try {
        const parsed = JSON.parse(savedRoster);
        if (!parsed.includes(email)) {
          parsed.push(email);
          localStorage.setItem('linkfluence_users_roster', JSON.stringify(parsed));
          setRoster(parsed);
        }
      } catch (e) {}
    } else {
      const parsed = [email];
      localStorage.setItem('linkfluence_users_roster', JSON.stringify(parsed));
      setRoster(parsed);
    }

    // Connect directly to centralized update API
    fetch('/api/users/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer Lamba1###'
      },
      body: JSON.stringify({
        email,
        updatedProfile: profile,
        updatedData: data
      })
    })
    .then(res => {
      if (res.ok) {
        addLog(`Synchronized backend update for state block of: ${email}`, 'success');
      }
    })
    .catch(err => {
      console.warn('Central update hook failed:', err);
    });

    // Seeding/Updating notification event to immediately synchronize user dashboards
    window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email } }));

    // In case we're editing the currently logged-in user in client, sync their state!
    if (currentUser && currentUser.email === email) {
      onUpdateCurrentUser(profile);
    }
  };

  // Action 1: Create Account
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) {
      triggerToast('Full Name and Email blocks are mandatory.');
      return;
    }

    const normalizedEmail = formEmail.trim().toLowerCase();
    const testUserExist = localStorage.getItem(`linkfluence_user_profile_${normalizedEmail}`);
    if (testUserExist) {
      triggerToast('A user account with this email already exists.');
      return;
    }

    const newRecord = {
      name: formName,
      email: normalizedEmail,
      country: formCountry,
      phone: formPhone || '+1 (555) 012-3456',
      balance: parseFloat(formBalance) || 0,
      totalProfit: parseFloat(formProfit) || 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      activePlans: [],
      kyc: {
        status: formKycStatus,
        fullName: formName,
        documentType: 'Passport Verification Bypassed',
        documentNumber: 'ADMIN-SEEDED',
        country: formCountry,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      },
      transactions: [
        {
          id: 'tx-' + Date.now(),
          type: 'deposit' as const,
          amount: parseFloat(formBalance) || 0,
          methodOrPlan: 'Administrative Creation',
          destinationOrDetail: 'Balance Seeded by Administrator',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'Completed' as const,
          reference: 'TXN-' + Math.floor(100000 + Math.random() * 900000) + '-ADJ'
        }
      ]
    };

    saveUserRecord(normalizedEmail, newRecord);
    triggerToast(`Succeeded! Account created for ${formName}.`);
    addLog(`Created new partner account: ${formName} (${formEmail})`, 'success');
    
    // Refresh roster
    loadRosterAndConfig();
    setIsCreatingUser(false);
    
    // Clear forms
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormBalance('0');
    setFormProfit('0');
  };

  // Action 2: Edit Account Profile
  const handleTriggerEditUser = (email: string) => {
    const raw = getUserRecord(email);
    setEditingUserOriginalEmail(email);
    setFormName(raw.name);
    setFormEmail(raw.email);
    setFormCountry(raw.country);
    setFormPhone(raw.phone);
    setFormBalance(raw.balance.toString());
    setFormProfit(raw.totalProfit.toString());
    setFormKycStatus(raw.kyc.status);
    setIsEditingUser(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) {
      triggerToast('Name & Email cannot be empty.');
      return;
    }

    const originalRecord = getUserRecord(editingUserOriginalEmail);
    const updatedRecord = {
      ...originalRecord,
      name: formName,
      email: formEmail,
      country: formCountry,
      phone: formPhone,
      balance: parseFloat(formBalance) || 0,
      totalProfit: parseFloat(formProfit) || 0,
      kyc: {
        ...originalRecord.kyc,
        status: formKycStatus,
        fullName: formName,
        country: formCountry
      }
    };

    // If email is changed, perform migration
    if (editingUserOriginalEmail !== formEmail.trim()) {
      localStorage.removeItem(`linkfluence_user_profile_${editingUserOriginalEmail}`);
      localStorage.removeItem(`linkfluence_user_data_${editingUserOriginalEmail}`);
      
      // Update roster
      let savedRoster = localStorage.getItem('linkfluence_users_roster');
      if (savedRoster) {
        try {
          const parsed = JSON.parse(savedRoster);
          const i = parsed.indexOf(editingUserOriginalEmail);
          if (i !== -1) parsed.splice(i, 1);
          localStorage.setItem('linkfluence_users_roster', JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    saveUserRecord(formEmail.trim(), updatedRecord);
    triggerToast(`Roster updated for ${formName}.`);
    addLog(`Modified account settings for: ${formName} (${formEmail})`, 'info');
    
    setIsEditingUser(false);
    loadRosterAndConfig();
  };

  const handleDeleteUser = (email: string) => {
    promptConfirm(
      "Delete Partner Account",
      `Are you sure you want to permanently delete user account: ${email}? This collapses all records and database logs immediately.`,
      () => {
        localStorage.removeItem(`linkfluence_user_profile_${email}`);
        localStorage.removeItem(`linkfluence_user_data_${email}`);
        
        let savedRoster = localStorage.getItem('linkfluence_users_roster');
        if (savedRoster) {
          try {
            const parsed = JSON.parse(savedRoster);
            const i = parsed.indexOf(email);
            if (i !== -1) parsed.splice(i, 1);
            localStorage.setItem('linkfluence_users_roster', JSON.stringify(parsed));
          } catch (e) {}
        }
        
        triggerToast(`Account ${email} deleted successfully.`);
        addLog(`Deleted customer account and ledger logs for ${email}`, 'warn');
        loadRosterAndConfig();
      },
      "Delete Account",
      true
    );
  };

  const handleDeleteAllUsers = () => {
    promptConfirm(
      "Delete All Accounts",
      "Are you absolutely sure you want to permanently delete all registered user accounts? This will wipe user profiles, balances, transaction logs, and log out any active sessions. Custom investment plans and available payment options will remain completely untouched. This action is irreversible!",
      () => {
        // Collect all keys to delete safely using Object.keys to prevent loop indexing side-effects
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('linkfluence_user_profile_') || 
          key.startsWith('linkfluence_user_data_')
        );
        
        // Remove all user-specific profiles and details
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Clear the roster list
        localStorage.setItem('linkfluence_users_roster', JSON.stringify([]));
        
        // Sign out any active user session
        localStorage.removeItem('linkfluence_active_user_email');
        onUpdateCurrentUser(null);
        
        // Keep system initialized flag as true so default seed doesn't re-execute on page load
        localStorage.setItem('linkfluence_system_initialized', 'true');
        
        triggerToast("Succeeded! All user accounts have been permanently deleted.");
        addLog("Deleted all registered partner accounts", "warn");
        
        // Dispatch update events to other tabs/windows if any
        window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email: '*' } }));
        
        loadRosterAndConfig();
      },
      "Delete All Accounts",
      true
    );
  };

  // Action 3: Debit/Credit Balance or Profits
  const handleTriggerAdjustment = (email: string) => {
    setFundAdjustmentUserEmail(email);
    setAdjustmentAmount('');
    setAdjustmentNote('');
    setIsAdjustingFunds(true);
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(adjustmentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast("Please input a valid positive decimal value.");
      return;
    }

    const raw = getUserRecord(fundAdjustmentUserEmail);
    const txRef = 'TXN-' + Math.floor(100000 + Math.random() * 900000) + '-ADJ';
    
    let nextBalance = raw.balance;
    let nextProfit = raw.totalProfit;
    let nextInvestments = raw.totalInvestments || 0;
    const isCredit = adjustmentType === 'credit';

    let tag = 'Main Account Balance';
    if (adjustmentTarget === 'profit') {
      tag = 'Accumulated Dividends';
    } else if (adjustmentTarget === 'deposits') {
      tag = 'Total deposits';
    }

    if (adjustmentTarget === 'balance') {
      nextBalance = isCredit ? (raw.balance + amountNum) : (raw.balance - amountNum);
    } else if (adjustmentTarget === 'profit') {
      nextProfit = isCredit ? (raw.totalProfit + amountNum) : (raw.totalProfit - amountNum);
      if (isCredit) {
        // "6. all credit to profits should also add to account balance"
        nextBalance = raw.balance + amountNum;
      }
    } else if (adjustmentTarget === 'deposits') {
      nextInvestments = isCredit ? (nextInvestments + amountNum) : (nextInvestments - amountNum);
      if (isCredit) {
        // "5. all credit to total deposits should also add to account balance"
        nextBalance = raw.balance + amountNum;
      }
    }

    if (nextBalance < 0 || nextProfit < 0 || nextInvestments < 0) {
      triggerToast("Negative allocation overflow blocked. Account levels cannot fall below zero.");
      return;
    }

    const adjustmentTx: Transaction = {
      id: 'tx-adj-' + Date.now(),
      type: isCredit ? 'deposit' : 'withdrawal',
      amount: amountNum,
      methodOrPlan: isCredit ? 'System Adjustment Credit' : 'System Adjustment Debit',
      destinationOrDetail: adjustmentNote || `Administrative adjustment to ${tag}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
      reference: txRef
    };

    const updatedRecord = {
      ...raw,
      balance: parseFloat(nextBalance.toFixed(2)),
      totalProfit: parseFloat(nextProfit.toFixed(6)),
      totalInvestments: parseFloat(nextInvestments.toFixed(2)),
      transactions: [adjustmentTx, ...raw.transactions]
    };

    saveUserRecord(fundAdjustmentUserEmail, updatedRecord);
    triggerToast(`Financial adjustment executed! Account updated.`);
    addLog(`Manually ${isCredit ? 'credited' : 'debited'} ${fundAdjustmentUserEmail} $${amountNum} in ${tag}. Note: ${adjustmentNote}`, 'success');
    
    setIsAdjustingFunds(false);
  };

  // Action 4: KYC Applications review
  const handleApproveKYC = (email: string) => {
    const raw = getUserRecord(email);
    const updated = {
      ...raw,
      kyc: {
        ...raw.kyc,
        status: 'Approved' as const
      },
      verificationPassed: true // Sync verified badge
    };

    saveUserRecord(email, updated);
    triggerToast(`KYC Verification request approved for ${raw.name}.`);
    addLog(`Accepted and verified client KYC profile for: ${email}`, 'success');
  };

  const handleRejectKYC = (email: string) => {
    const raw = getUserRecord(email);
    const updated = {
      ...raw,
      kyc: {
        ...raw.kyc,
        status: 'Rejected' as const
      },
      verificationPassed: false
    };

    saveUserRecord(email, updated);
    triggerToast(`KYC application rejected. User notified.`);
    addLog(`Rejected customer verification documents for ${email}`, 'warn');
  };

  // Action 5: Dynamic Investment Plans Config
  const handleSavePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      triggerToast('Pool plan name is mandatory.');
      return;
    }

    let updatedPlans = [...plans];
    const planObj = {
      id: editingPlanId || 'plan-' + Date.now(),
      name: planForm.name,
      yield: parseFloat(planForm.yield) || 1.0,
      days: parseInt(planForm.days) || 30,
      min: parseFloat(planForm.min) || 50,
      desc: planForm.desc || 'Operational allocation pool.'
    };

    if (isEditingPlan && editingPlanId) {
      updatedPlans = updatedPlans.map(p => p.id === editingPlanId ? planObj : p);
    } else {
      updatedPlans.push(planObj);
    }

    localStorage.setItem('linkfluence_investment_plans', JSON.stringify(updatedPlans));
    setPlans(updatedPlans);
    triggerToast(`Investment plan details saved successfully.`);
    addLog(`Configured dynamic allocation pool parameters for schema ${planForm.name}`, 'success');
    
    // Clear plans form
    setIsEditingPlan(false);
    setEditingPlanId(null);
    setPlanForm({ name: '', yield: '2.5', days: '60', min: '100', desc: '' });
  };

  const handleEditPlanClick = (p: any) => {
    setEditingPlanId(p.id);
    setPlanForm({
      name: p.name,
      yield: p.yield.toString(),
      days: p.days.toString(),
      min: p.min.toString(),
      desc: p.desc
    });
    setIsEditingPlan(true);
  };

  const handleDeletePlanClick = (id: string, name: string) => {
    promptConfirm(
      "Delete Investment Plan",
      `Are you sure you want to permanently delete the investment plan '${name}'? This removes it from pool registration lists for clients.`,
      () => {
        const remaining = plans.filter(p => p.id !== id);
        localStorage.setItem('linkfluence_investment_plans', JSON.stringify(remaining));
        setPlans(remaining);
        addLog(`Deleted investment pool schema config: ${name}`, 'warn');
        triggerToast(`Plan deleted.`);
      },
      "Delete Plan",
      true
    );
  };

  // Action 6: Manage Gateways Methods
  const handleSaveGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayForm.name.trim()) {
      triggerToast('Gateway label must not be empty.');
      return;
    }

    let updatedGateways = [...paymentGateways];
    const gatewayObj = {
      id: editingGatewayId || 'gateway-' + Date.now(),
      name: gatewayForm.name,
      type: gatewayForm.type,
      address: gatewayForm.address,
      enabled: gatewayForm.enabled,
      desc: gatewayForm.desc || 'Fast deposit routing.'
    };

    if (isEditingGateway && editingGatewayId) {
      updatedGateways = updatedGateways.map(g => g.id === editingGatewayId ? gatewayObj : g);
    } else {
      updatedGateways.push(gatewayObj);
    }

    localStorage.setItem('linkfluence_payment_methods', JSON.stringify(updatedGateways));
    setPaymentGateways(updatedGateways);
    triggerToast(`Payment method rules updated.`);
    addLog(`Tuned dynamic transaction routing rules for gateway ${gatewayForm.name}`, 'info');
    roster.forEach(email => {
      window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email } }));
    });

    setIsEditingGateway(false);
    setEditingGatewayId(null);
    setGatewayForm({ name: '', type: 'crypto', address: '', enabled: true, desc: '' });
  };

  const handleToggleGatewayClick = (id: string) => {
    const updated = paymentGateways.map(g => {
      if (g.id === id) {
        const nextState = !g.enabled;
        addLog(`Toggled gateway channel ${g.name} status to: ${nextState ? 'Operational' : 'Maintenance'}`, 'info');
        return { ...g, enabled: nextState };
      }
      return g;
    });
    localStorage.setItem('linkfluence_payment_methods', JSON.stringify(updated));
    setPaymentGateways(updated);
    triggerToast(`Payment gateway status updated.`);
    roster.forEach(email => {
      window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email } }));
    });
  };

  const handleDeleteGatewayClick = (id: string, name: string) => {
    promptConfirm(
      "Delete Payment Method",
      `Are you sure you want to permanently delete the payment option "${name}"? Active invoices mapped here will fall back or route to next priority gateway.`,
      () => {
        const remaining = paymentGateways.filter(g => g.id !== id);
        localStorage.setItem('linkfluence_payment_methods', JSON.stringify(remaining));
        setPaymentGateways(remaining);
        addLog(`Deleted payment option configuration: ${name}`, 'warn');
        triggerToast(`Payment option deleted.`);
        roster.forEach(email => {
          window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email } }));
        });
      },
      "Delete Method",
      true
    );
  };

  // Action 7: Approve / Deny Withdrawal Requests
  const getPendingWithdrawals = () => {
    const list: Array<{userEmail: string, userName: string, tx: Transaction}> = [];
    roster.forEach(email => {
      const records = getUserRecord(email);
      records.transactions.forEach((tx: Transaction) => {
        if (tx.type === 'withdrawal' && tx.status === 'Pending') {
          list.push({
            userEmail: email,
            userName: records.name,
            tx: tx
          });
        }
      });
    });
    return list;
  };

  const handleApproveWithdrawal = (userEmail: string, txId: string, amount: number) => {
    const raw = getUserRecord(userEmail);
    const updatedTxList = raw.transactions.map((tx: Transaction) => {
      if (tx.id === txId) {
        return { ...tx, status: 'Completed' as const };
      }
      return tx;
    });

    const updated = {
      ...raw,
      transactions: updatedTxList
    };

    saveUserRecord(userEmail, updated);
    triggerToast(`Ledger cleared. Withdrawal transaction marked as Completed.`);
    addLog(`Settled payout invoice order of $${amount} to ${userEmail}. Clearance finalized.`, 'success');
    
    // Refresh roster view
    loadRosterAndConfig();
  };

  const handleDenyWithdrawal = (userEmail: string, txId: string, amount: number) => {
    const raw = getUserRecord(userEmail);
    const updatedTxList = raw.transactions.map((tx: Transaction) => {
      if (tx.id === txId) {
        return { ...tx, status: 'Failed' as const };
      }
      return tx;
    });

    // Revert the debited balance back to the available user totals!
    const nextBalance = parseFloat((raw.balance + amount).toFixed(2));
    const nextWithdrawalStats = parseFloat((raw.totalWithdrawals - amount).toFixed(2));

    const updated = {
      ...raw,
      balance: nextBalance,
      totalWithdrawals: nextWithdrawalStats >= 0 ? nextWithdrawalStats : 0,
      transactions: updatedTxList
    };

    saveUserRecord(userEmail, updated);
    triggerToast(`Withdrawal denied and reversed back to user's wallet!`);
    addLog(`Declined payout invoice order of $${amount} to ${userEmail}. Available funds refunded to balances.`, 'warn');
    
    loadRosterAndConfig();
  };

  // Action 7.5: Approve / Deny Deposit Requests
  const getPendingDeposits = () => {
    const list: Array<{userEmail: string, userName: string, tx: Transaction}> = [];
    roster.forEach(email => {
      const records = getUserRecord(email);
      records.transactions.forEach((tx: Transaction) => {
        if (tx.type === 'deposit' && tx.status === 'Pending') {
          list.push({
            userEmail: email,
            userName: records.name,
            tx: tx
          });
        }
      });
    });
    return list;
  };

  const handleApproveDeposit = (userEmail: string, txId: string, amount: number) => {
    const raw = getUserRecord(userEmail);
    const updatedTxList = raw.transactions.map((tx: Transaction) => {
      if (tx.id === txId) {
        return { ...tx, status: 'Approved' as const };
      }
      return tx;
    });

    const nextBalance = parseFloat((raw.balance + amount).toFixed(2));
    const nextInvestments = parseFloat(((raw.totalInvestments || 0) + amount).toFixed(2));

    const updated = {
      ...raw,
      balance: nextBalance,
      totalInvestments: nextInvestments,
      transactions: updatedTxList
    };

    saveUserRecord(userEmail, updated);
    triggerToast(`Deposit of $${amount} approved & account credited.`);
    addLog(`Operator approved deposit request of $${amount} for ${userEmail}. Balance & deposits credited.`, 'success');
    
    loadRosterAndConfig();
  };

  const handleDenyDeposit = (userEmail: string, txId: string, amount: number) => {
    const raw = getUserRecord(userEmail);
    const updatedTxList = raw.transactions.map((tx: Transaction) => {
      if (tx.id === txId) {
        return { ...tx, status: 'failed' as const };
      }
      return tx;
    });

    const updated = {
      ...raw,
      transactions: updatedTxList
    };

    saveUserRecord(userEmail, updated);
    triggerToast(`Deposit request of $${amount} declined.`);
    addLog(`Operator rejected deposit request of $${amount} for ${userEmail}.`, 'warn');
    
    loadRosterAndConfig();
  };

  // Action 8: SMTP Email Dispatch Simulation
  const handleTransmitSimulationEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget.trim()) {
      triggerToast('Please select a recipient user from the catalog.');
      return;
    }

    setIsSendingEmail(true);

    const finalBodySnippet = emailCustomMessage || 'Secure system parameters updated. No further action is required.';

    setTimeout(() => {
      setIsSendingEmail(false);
      const newMail = {
        id: 'SM-' + Date.now(),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        to: emailTarget,
        subject: emailSubject,
        snippet: finalBodySnippet
      };

      setSentMailsLog(prev => [newMail, ...prev]);
      triggerToast(`Factual dispatch sent! Status updated on partner's notification logs.`);
      addLog(`Simulated dispatch SMTP packet route to: ${emailTarget} | Sub: ${emailSubject}`, 'success');

      setEmailCustomMessage('');
    }, 1200);
  };

  // Template pre-fill
  useEffect(() => {
    if (emailTemplate === 'welcome') {
      setEmailSubject('Welcome to Affiliate Associate Program Partners - Account Activation');
      setEmailCustomMessage('Welcome to Affiliate Associate Program Partner Networks! Your tracker profiles have been generated and you are officially cleared to publish campaigns and acquire clicks.');
    } else if (emailTemplate === 'compliance') {
      setEmailSubject('Urgent Compliance Verification Notification required');
      setEmailCustomMessage('Urgent traffic notification! Our click parity auditor has registered questionable geolocation sub-IDs from your published links. Please verify your traffic sources to avoid capital freezes.');
    } else if (emailTemplate === 'credit') {
      setEmailSubject('Your Account Balance has been credited');
      setEmailCustomMessage(`Ledger Notification: Administrative ledger changes have credited new available promotion funds of $${adjustmentAmount || '500.00'}. Thanks for choosing our network.`);
    } else if (emailTemplate === 'custom') {
      setEmailSubject('Direct Administrative Campaign Dispatch');
      setEmailCustomMessage('Secure system parameters updated. No further action is required.');
    }
  }, [emailTemplate]);

  // Auth Gate check
  if (!isAdminAuthenticated) {
    return (
      <div className="flex flex-col gap-6 text-left font-sans bg-gray-50/50 -m-6 p-6 md:p-12 rounded-3xl min-h-[580px] justify-center items-center">
        <div className="max-w-md w-full bg-white border border-gray-150 rounded-2xl shadow-xl flex flex-col gap-6 relative overflow-hidden p-8">
          {/* Subtle geometric overlay for a futuristic secure portal look */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
            <Lock size={150} className="text-rose-500" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600" />

          {/* Header & Logo Section */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div 
              className="p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100/60 shadow-xs inline-flex items-center justify-center cursor-pointer transition-all duration-200"
              onClick={onClose}
              title="Return to homepage"
            >
              <LogoIcon className="text-rose-500 transform hover:rotate-6 transition-transform duration-300" size="38" />
            </div>
            
            <div 
              className="flex flex-col gap-1 mt-1 cursor-pointer hover:opacity-85 transition-opacity"
              onClick={onClose}
              title="Return to homepage"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-black font-sans">Affiliate Associate Program</span>
                <span className="bg-rose-50 text-rose-600 border border-rose-100/80 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold">
                  Console
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-400 mt-1">Administrative Port Shield</h3>
              <p className="text-gray-400 text-[11px] leading-relaxed max-w-[285px] mx-auto mt-0.5">
                Enter secure gateway parameters to interact with the ledger system, transaction queues, and dynamic configurations.
              </p>
            </div>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-600 font-medium animate-[fadeIn_0.15s_ease-out] flex gap-2 items-start text-left">
              <span className="text-rose-500 mt-0.5 font-bold">⚠</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminVerify} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">Security Operator Key</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400">
                  <Users size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  className="w-full border border-gray-150 rounded-xl pl-11 pr-4 py-3 text-xs bg-gray-50/30 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-black transition-all font-sans"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">Authentication Password</label>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full border border-gray-150 rounded-xl pl-11 pr-4 py-3 text-xs bg-gray-50/30 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-black transition-all font-sans"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer transition shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={16} />
              <span>Acquire Security Token</span>
            </button>
          </form>

          {/* Quick exit option */}
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition font-bold uppercase tracking-wider text-center mt-1 cursor-pointer"
          >
            ← Exit Port & Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Count queues
  const pendingKYCCount = roster.map(e => getUserRecord(e)).filter(r => r.kyc.status === 'Pending').length;
  const pendingWithdrawalsList = getPendingWithdrawals();
  const pendingDepositsList = getPendingDeposits();

  return (
    <div className="flex flex-col gap-6 text-left font-sans min-h-[650px] animate-[fadeIn_0.2s_ease-out]">
      
      {/* Top Banner Header with back to dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-900 border border-stone-850 text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(244,63,94,0.15)_0%,_transparent_55%)] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl hidden sm:block">
            <Settings className="text-rose-400 w-5 h-5 animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest font-mono">System Infrastructure Terminal</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">Control Tower Console v3.5</h3>
            <p className="text-stone-400 text-xs mt-0.5">Global account adjustments, payouts clearing, KYC verification routing, and API core gateways.</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-[#f43f5e]/15 px-3 py-1.5 rounded-full text-rose-400 text-xs font-mono font-bold uppercase shadow-inner">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span>Operational Mode</span>
          </div>
          <button
            type="button"
            onClick={handleLogoutAdmin}
            className="hover:bg-rose-500/10 hover:text-rose-400 border border-stone-700 hover:border-rose-500/20 text-stone-300 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-150 select-none cursor-pointer"
          >
            Terminal Lock
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-neutral-100 text-stone-900 font-bold text-xs py-1.5 px-3.5 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer select-none"
          >
            <ArrowRight size={13} className="rotate-180" />
            <span>Exit Console</span>
          </button>
        </div>
      </div>

      {/* Main Structural Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Navigation & Metrics Column */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          
          {/* Navigation vertical block */}
          <div className="bg-white border border-gray-150 rounded-2xl p-2.5 shadow-xs flex flex-col gap-1 md:gap-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 px-3 py-1 mt-1 tracking-wider">Control Registers</span>
            
            <button
              type="button"
              onClick={() => { setActiveTab('users'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'users' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><Users size={14} /> Users Directory</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'users' ? 'bg-white/15' : 'bg-gray-100'}`}>{roster.length}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('kyc'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'kyc' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><UserCheck size={14} /> KYC Direct Queue</span>
              {pendingKYCCount > 0 ? (
                <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold animate-bounce">
                  {pendingKYCCount}
                </span>
              ) : (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'kyc' ? 'bg-white/15' : 'bg-gray-100'}`}>0</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('withdrawals'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'withdrawals' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><Wallet size={14} /> Payouts Desk</span>
              {pendingWithdrawalsList.length > 0 ? (
                <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold animate-pulse">
                  {pendingWithdrawalsList.length}
                </span>
              ) : (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'withdrawals' ? 'bg-white/15' : 'bg-gray-100'}`}>0</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('deposits'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'deposits' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><ArrowDownLeft size={14} /> Deposits Queue</span>
              {pendingDepositsList.length > 0 ? (
                <span className="bg-[#E6F7F0] text-[#3CB371] px-1.5 py-0.5 rounded-full text-[9px] font-extrabold animate-pulse">
                  {pendingDepositsList.length}
                </span>
              ) : (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'deposits' ? 'bg-white/15' : 'bg-gray-100'}`}>0</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('plans'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'plans' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><TrendingUp size={14} /> Investment Plans</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'plans' ? 'bg-white/15' : 'bg-gray-100'}`}>{plans.length}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('payment-methods'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'payment-methods' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center gap-2"><Sliders size={14} /> Payment Settings</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'payment-methods' ? 'bg-white/15' : 'bg-gray-100'}`}>
                {paymentGateways.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('email-portal'); loadRosterAndConfig(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'email-portal' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><Mail size={14} /> Client SMTP Direct</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${activeTab === 'email-portal' ? 'bg-white/15' : 'bg-gray-100'}`}>{sentMailsLog.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system-logs')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-155 text-left cursor-pointer select-none ${
                activeTab === 'system-logs' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2"><Activity size={14} /> System Security Logs</span>
              <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-extrabold tracking-wider ${activeTab === 'system-logs' ? 'bg-neutral-800 text-rose-400' : 'bg-emerald-50 text-emerald-600 animate-pulse'}`}>ONLINE</span>
            </button>
          </div>

          {/* Quick Metrics Stats and micro-dashboard */}
          <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-xs flex flex-col gap-3">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest font-extrabold">Infrastructure Stats</span>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Security Cleared Users</span>
                <span className="font-mono font-bold text-black">{roster.length}</span>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (roster.length / 10) * 100)}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-gray-500 font-sans">Pending Actions Queue</span>
                <span className="font-mono font-bold text-rose-500">{pendingKYCCount + pendingWithdrawalsList.length + pendingDepositsList.length} Tasks</span>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, ((pendingKYCCount + pendingWithdrawalsList.length + pendingDepositsList.length) / 5) * 100)}%` }}></div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2.5 mt-1 flex flex-col gap-1 text-left">
              <span className="text-[9.5px] text-gray-400 uppercase font-mono leading-none tracking-tight font-bold">Active Port Telemetry</span>
              <span className="text-[10px] font-mono text-gray-500 leading-normal">Node: Docker-SSL-3000</span>
            </div>
          </div>

        </div>

        {/* Right Tab Content Column - Container wrapper for selected dynamic panel */}
        <div className="lg:col-span-9 bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-xs min-h-[500px]">

      {/* SEC 1: USER ACCOUNTS CATALOG MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Member Accounts Directory</h4>
              <p className="text-gray-400 text-xs">Review total users registered in dynamic database, deploy adjustments, edit, or delete credentials.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFormName('');
                  setFormEmail('');
                  setFormPhone('');
                  setFormBalance('0');
                  setFormProfit('0');
                  setFormKycStatus('Unregistered');
                  setIsCreatingUser(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all duration-150 cursor-pointer select-none shadow-xs active:scale-95"
              >
                <PlusCircle size={15} />
                <span>Create Partner Account</span>
              </button>
              
              <button
                onClick={handleDeleteAllUsers}
                className="border border-rose-200 bg-rose-50/25 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all duration-150 cursor-pointer select-none active:scale-95 shadow-2xs"
                title="Delete all registered partner accounts from database"
              >
                <Trash2 size={13.5} className="text-rose-500" />
                <span>Delete All Accounts</span>
              </button>
            </div>
          </div>

          {/* Create User Form Popup Modal Overlay */}
          {isCreatingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
              <div className="absolute inset-0" onClick={() => setIsCreatingUser(false)}></div>
              <form onSubmit={handleCreateUserSubmit} className="relative z-10 w-full max-w-2xl bg-white border border-gray-150 p-6 rounded-3xl flex flex-col gap-5 shadow-2xl animate-[scaleIn_0.2s_ease-out] text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-500 uppercase flex flex-wrap items-center gap-1.5">
                    <PlusCircle size={15} /> Seed New Alliance Account
                  </span>
                  <button type="button" onClick={() => setIsCreatingUser(false)} className="self-end sm:self-auto p-1 px-2 border border-gray-150 rounded-lg text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-bold transition">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Full Name</label>
                    <input type="text" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" required placeholder="Liam Harris" value={formName} onChange={e=>setFormName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Email Address</label>
                    <input type="email" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" required placeholder="name@domain.com" value={formEmail} onChange={e=>setFormEmail(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Country Location</label>
                    <input type="text" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" value={formCountry} onChange={e=>setFormCountry(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Initial Balance ($ USD)</label>
                    <input type="number" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" value={formBalance} onChange={e=>setFormBalance(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Phone</label>
                    <input type="text" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" placeholder="+1 (555) 012-3456" value={formPhone} onChange={e=>setFormPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Initial Profits ($ USD)</label>
                    <input type="number" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" value={formProfit} onChange={e=>setFormProfit(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Initial KYC Status</label>
                    <select className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs" value={formKycStatus} onChange={e=>setFormKycStatus(e.target.value as any)}>
                      <option value="Approved">Verified Member (Badge Active)</option>
                      <option value="Pending">Pending Review Vetting</option>
                      <option value="Unregistered">No Documents Uploaded</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsCreatingUser(false)} className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-xs transition text-center">Dismiss</button>
                  <button type="submit" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition shadow-xs text-center">Save Seeds & Broadcast</button>
                </div>
              </form>
            </div>
          )}

          {/* Edit User Form Popup Modal Overlay */}
          {isEditingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
              <div className="absolute inset-0" onClick={() => setIsEditingUser(false)}></div>
              <form onSubmit={handleEditUserSubmit} className="relative z-10 w-full max-w-2xl bg-white border border-gray-150 p-6 rounded-3xl flex flex-col gap-5 shadow-2xl animate-[scaleIn_0.2s_ease-out] text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <span className="text-xs font-mono font-bold text-rose-500 uppercase flex flex-wrap items-center gap-1.5">
                    <Edit2 size={15} /> Update and Lock Profile: <strong className="text-stone-900 break-all">{formName}</strong>
                  </span>
                  <button type="button" onClick={() => setIsEditingUser(false)} className="self-end sm:self-auto p-1 px-2 border border-gray-150 rounded-lg text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-bold transition">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">FullName</label>
                    <input type="text" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-medium focus:ring-1 focus:ring-rose-500" required value={formName} onChange={e=>setFormName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Email Address (Key)</label>
                    <input type="email" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-semibold focus:ring-1 focus:ring-rose-500" required value={formEmail} onChange={e=>setFormEmail(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Country Location</label>
                    <input type="text" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-medium focus:ring-1 focus:ring-rose-500" value={formCountry} onChange={e=>setFormCountry(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Account Balance ($)</label>
                    <input type="number" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-mono font-bold focus:ring-1 focus:ring-rose-500" value={formBalance} onChange={e=>setFormBalance(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Phone</label>
                    <input type="text" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-mono focus:ring-1 focus:ring-rose-500" value={formPhone} onChange={e=>setFormPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Yield Profits ($)</label>
                    <input type="number" className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs font-mono font-bold focus:ring-1 focus:ring-rose-500" value={formProfit} onChange={e=>setFormProfit(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700">Verification Status</label>
                    <select className="border border-gray-200 rounded-lg p-2.5 bg-white text-black text-xs" value={formKycStatus} onChange={e=>setFormKycStatus(e.target.value as any)}>
                      <option value="Approved">Verified Member Badge (Green Check)</option>
                      <option value="Pending">Pending Document Review Queue</option>
                      <option value="Unregistered">No upload registry</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsEditingUser(false)} className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-xs transition text-center">Dismiss</button>
                  <button type="submit" className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition shadow-xs text-center">Save Profile Overwrites</button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Ledger Debit / Credit Form Popup Modal Overlay */}
          {isAdjustingFunds && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
              <div className="absolute inset-0" onClick={() => setIsAdjustingFunds(false)}></div>
              <form onSubmit={handleAdjustmentSubmit} className="relative z-10 w-full max-w-2xl bg-stone-950 border border-stone-850 p-6 rounded-3xl flex flex-col gap-5 text-white shadow-2xl animate-[scaleIn_0.2s_ease-out] text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850 pb-3">
                  <span className="text-xs font-mono font-bold text-amber-500 uppercase flex flex-wrap items-center gap-1.5">
                    <DollarSign size={15} /> Adjust Funds Ledger: <strong className="text-white font-sans break-all">{fundAdjustmentUserEmail}</strong>
                  </span>
                  <button type="button" onClick={() => setIsAdjustingFunds(false)} className="self-end sm:self-auto p-1 px-2 border border-stone-850 rounded-lg text-xs text-stone-400 hover:text-white font-bold transition">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left font-sans">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-400 font-medium">Ledger Operation</label>
                    <select className="border border-stone-800 rounded-lg p-2.5 bg-stone-900 text-white text-xs" value={adjustmentType} onChange={e=>setAdjustmentType(e.target.value as any)}>
                      <option value="credit">Credit (+) Funds</option>
                      <option value="debit">Debit (-) Funds</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-400 font-medium">Target Segment</label>
                    <select className="border border-stone-800 rounded-lg p-2.5 bg-stone-900 text-white text-xs" value={adjustmentTarget} onChange={e=>setAdjustmentTarget(e.target.value as any)}>
                      <option value="balance">Main Wallet balance</option>
                      <option value="profit">Yield Profits wallet</option>
                      <option value="deposits">Total deposits</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-400 font-medium">Adjustment Amount ($ USD)</label>
                    <input type="number" required placeholder="50.00" className="border border-stone-800 rounded-lg p-2.5 bg-stone-900 text-white text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500" value={adjustmentAmount} onChange={e=>setAdjustmentAmount(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-400 font-medium">Transaction reference note</label>
                    <input type="text" placeholder="Promo credits / Ledger adjustment" className="border border-stone-800 rounded-lg p-2.5 bg-stone-900 text-white text-xs" value={adjustmentNote} onChange={e=>setAdjustmentNote(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2 pt-3 border-t border-stone-850">
                  <button type="button" onClick={() => setIsAdjustingFunds(false)} className="w-full sm:w-auto bg-stone-900 hover:bg-stone-850 text-stone-300 font-bold px-4 py-2.5 rounded-lg text-xs transition text-center">Dismiss</button>
                  <button type="submit" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-650 text-stone-950 px-5 py-2.5 rounded-lg font-extrabold text-xs transition shadow-xs text-center">Execute Ledger Adjustment</button>
                </div>
              </form>
            </div>
          )}

          {/* Users Grid Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100/50 text-[#111111] uppercase font-mono font-bold tracking-wider text-[9.5px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-4.5">Partner Profile</th>
                  <th className="py-4 px-4.5">Geo Location</th>
                  <th className="py-4 px-4">Account Available Balance</th>
                  <th className="py-4 px-4">Total deposits</th>
                  <th className="py-4 px-4">Yield Profits Balance</th>
                  <th className="py-4 px-4">Verification ID Status</th>
                  <th className="py-4 px-4.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roster.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center text-gray-400 font-sans">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users size={32} className="text-gray-300" />
                        <p className="font-bold text-gray-500">No partner accounts registered yet.</p>
                        <p className="text-[11px] text-gray-400 max-w-xs mt-0.5">The customer database is empty. You can register new partner accounts using the "Create Partner Account" button above.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  roster.map(e => {
                    const u = getUserRecord(e);
                    return (
                      <tr key={e} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="py-4.5 px-4.5">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-black font-sans text-sm">{u.name}</span>
                            <span className="text-[10.5px] text-gray-400 font-mono mt-0.5">{u.email}</span>
                            <span className="text-[10px] text-indigo-400 font-mono leading-none mt-1">{u.phone}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-4.5 font-semibold text-gray-700">
                          <span className="flex items-center gap-1">
                            <Globe size={12} className="text-gray-400" />
                            <span>{u.country}</span>
                          </span>
                        </td>
                        <td className="py-4.5 px-4 font-mono">
                          <span className="text-sm font-extrabold text-[#111111]">${u.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                        <td className="py-4.5 px-4 font-mono">
                          <span className="text-sm font-semibold text-[#111111]">${(u.totalInvestments || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                        <td className="py-4.5 px-4 font-mono">
                          <span className="text-sm font-extrabold text-emerald-500">${u.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                            u.kyc.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            u.kyc.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-150 text-gray-500'
                          }`}>
                            {u.kyc.status}
                          </span>
                        </td>
                        <td className="py-4.5 px-4.5 text-right flex items-center justify-end gap-1.5 mt-2">
                          <button
                            title="Debit/Credit Funds Ledger"
                            onClick={() => handleTriggerAdjustment(e)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-1.5 px-2 rounded-lg font-bold border border-amber-100 cursor-pointer flex items-center gap-1 text-[10.5px]"
                          >
                            <Coins size={12} /> Adjust
                          </button>
                          <button
                            title="Modify Account parameters"
                            onClick={() => handleTriggerEditUser(e)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg border border-blue-100 cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            title="Irreversibly delete user profile"
                            onClick={() => handleDeleteUser(e)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-500 p-1.5 rounded-lg border border-rose-100 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SEC 2: KYC INTEGRATION DOCUMENT VERIFICATION */}
      {activeTab === 'kyc' && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs animate-[fadeIn_0.15s_ease-out]">
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">KYC Document Vetting hub</h4>
            <p className="text-gray-400 text-xs mt-0.5">Audit uploaded passports, state ID cards, and geographical address verifications submitted by active partners.</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {roster.map(e => getUserRecord(e)).filter(r => r.kyc.status === 'Pending').length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-gray-150 rounded-xl bg-gray-50/20">
                ⭐ No pending KYC applications currently awaiting operator clearance.
              </div>
            ) : (
              roster.map(email => {
                const r = getUserRecord(email);
                if (r.kyc.status !== 'Pending') return null;
                return (
                  <div key={email} className="p-4 bg-gray-50 border border-gray-150 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans text-left">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-black text-sm">{r.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">({email})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] mt-2">
                        <span className="text-gray-400">Document Type:</span> <strong className="text-gray-700">{r.kyc.documentType}</strong>
                        <span className="text-gray-400">Document Serial:</span> <strong className="text-gray-700 font-mono text-xs">{r.kyc.documentNumber}</strong>
                        <span className="text-gray-400">Claimed Country:</span> <strong className="text-gray-700">{r.kyc.country}</strong>
                        <span className="text-gray-400">Dispatch Date:</span> <strong className="text-gray-400 font-mono">{r.kyc.submittedAt || '2026-05-28 02:10'}</strong>
                      </div>
                      {r.kyc.uploadedFileBase64 ? (
                        <div className="mt-3 text-indigo-750 font-mono text-[10px] flex flex-col gap-1 text-left">
                          <span className="font-bold flex items-center gap-1">📁 Attached ID Document: <span className="underline select-all text-indigo-900">{r.kyc.uploadedFileName || 'id_proof.jpg'}</span></span>
                          <div className="mt-1 border border-indigo-150 rounded-xl overflow-hidden max-w-sm bg-white p-1 shadow-sm">
                            <img 
                              src={r.kyc.uploadedFileBase64} 
                              alt="KYC Passport document upload" 
                              className="max-h-56 w-auto rounded object-contain cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition duration-150"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-2.5 bg-indigo-50/50 border border-indigo-100/30 text-indigo-750 text-[10px] rounded-lg leading-tight font-mono text-left">
                          <span className="block font-bold">📁 Simulated Passport / ID Scan:</span>
                          <div className="mt-1.5 border border-indigo-100 rounded-lg p-2.5 bg-white flex flex-col gap-1 w-full max-w-xs text-stone-850">
                            <div className="flex justify-between border-b pb-1 font-sans text-[8.5px] uppercase font-bold tracking-wider text-indigo-600">
                              <span>International Passport</span>
                              <span>Cleared Vetting</span>
                            </div>
                            <div className="flex gap-2.5 mt-1.5 font-sans">
                              <div className="w-12 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center shrink-0">
                                <User size={22} className="text-gray-400" />
                              </div>
                              <div className="flex flex-col text-[10px] text-left">
                                <span className="truncate max-w-[130px]">Name: <strong className="text-black font-extrabold">{r.name}</strong></span>
                                <span>No: <strong className="text-black font-mono font-bold">{r.kyc.documentNumber || 'US-90821A'}</strong></span>
                                <span>Country: <strong className="text-black">{r.kyc.country || 'United States'}</strong></span>
                              </div>
                            </div>
                          </div>
                          <span className="mt-1 pb-0.5 bg-yellow-50 text-yellow-700 text-[9px] px-1 rounded border border-yellow-105 inline-block">Generating secure sandbox attachment</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:self-center shrink-0 border-t sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleRejectKYC(email)}
                        className="flex-1 sm:flex-none uppercase text-[10.5px] font-mono font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100/30 py-2 px-3 rounded-lg transition shrink-0"
                      >
                        Decline Proof
                      </button>
                      <button
                        onClick={() => handleApproveKYC(email)}
                        className="flex-1 sm:flex-none uppercase text-[10.5px] font-mono font-extrabold bg-[#3CB371] hover:bg-[#2E8B57] text-white py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 shadow-sm shrink-0"
                      >
                        <CheckCircle size={13} /> Clear & Approve
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SEC 2.5: DEPOSITS REQUESTS VETTING INTERFACE */}
      {activeTab === 'deposits' && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs animate-[fadeIn_0.15s_ease-out]">
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Deposits Verification desk</h4>
            <p className="text-gray-400 text-xs mt-0.5">Approve or deny incoming deposit slips submitted by users. Approved deposits will credit both the account available balance & total deposits metric.</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {pendingDepositsList.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-gray-150 rounded-xl bg-gray-50/20">
                ⭐ No pending deposit requests awaiting approval.
              </div>
            ) : (
              pendingDepositsList.map(({userEmail, userName, tx}) => (
                <div key={tx.id} className="p-4 bg-gray-50 border border-gray-150 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans text-left">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-black text-sm">{userName}</span>
                      <span className="text-[10px] font-mono text-gray-450">({userEmail})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] mt-2">
                      <span className="text-gray-400">Transaction Reference:</span> <strong className="text-gray-700 font-mono text-xs">{tx.reference}</strong>
                      <span className="text-gray-400">Payment Channel:</span> <strong className="text-gray-700">{tx.methodOrPlan || 'Direct Cryptocurrency'}</strong>
                      <span className="text-gray-400">Deposit Amount:</span> <strong className="text-emerald-600 font-bold font-mono">${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                      <span className="text-gray-400">Recipient Target Address:</span> <span className="text-[#3CB371] font-semibold break-all leading-tight max-w-[170px] font-mono text-[10px]">{tx.destinationOrDetail}</span>
                      <span className="text-gray-400">Request Date:</span> <strong className="text-gray-405 font-mono">{tx.date}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:self-center shrink-0 border-t sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleDenyDeposit(userEmail, tx.id, tx.amount)}
                      className="flex-1 sm:flex-none uppercase text-[10.5px] font-mono font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 py-2.5 px-3.5 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Reject Deposit
                    </button>
                    <button
                      onClick={() => handleApproveDeposit(userEmail, tx.id, tx.amount)}
                      className="flex-1 sm:flex-none uppercase text-[10.5px] font-mono font-extrabold bg-[#3CB371] hover:bg-[#2E8B57] text-white py-2.5 px-3.5 rounded-lg transition flex items-center justify-center gap-1 shadow-sm shrink-0 cursor-pointer"
                    >
                      <CheckCircle size={13} /> Approve Credit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEC 3: WITHDRAWAL REQUESTS VETTING INTERFACE */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs animate-[fadeIn_0.15s_ease-out]">
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Payout Approval Queue Ledger</h4>
            <p className="text-gray-400 text-xs mt-0.5">Analyze live processing requests, review client destination wallets or emails, and settle or reject orders manually.</p>
          </div>

          <div className="flex flex-col gap-3">
            {pendingWithdrawalsList.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-gray-150 rounded-xl bg-gray-50/20">
                ☘ No withdrawal invoices currently listed as Pending.
              </div>
            ) : (
              pendingWithdrawalsList.map(({userEmail, userName, tx}) => (
                <div key={tx.id} className="p-4 bg-gray-50 border border-gray-150 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-left">
                  <div className="flex flex-col gap-1 items-start text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[#111111] text-xs uppercase bg-amber-50 text-amber-700 px-1.5 rounded">{tx.reference}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{tx.date}</span>
                    </div>
                    <span className="font-extrabold text-black text-sm mt-1">{userName} <span className="font-normal text-xs text-gray-400 font-mono">({userEmail})</span></span>
                    <span className="font-bold text-gray-600 mt-1">Settle via: <span className="text-indigo-500 font-mono">{tx.methodOrPlan}</span></span>
                    <span className="text-[10.5px] text-gray-400 font-mono mt-0.5 block break-all">Routing recipient: {tx.destinationOrDetail}</span>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-y-0 pt-2 sm:pt-0">
                    <span className="text-base font-extrabold text-black block">${tx.amount.toFixed(2)}</span>
                    <div className="flex items-center gap-1 mt-1 font-mono w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleDenyWithdrawal(userEmail, tx.id, tx.amount)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold py-1.5 px-3 rounded-lg cursor-pointer text-[10.5px] uppercase flex items-center gap-0.5 border border-rose-100/30"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveWithdrawal(userEmail, tx.id, tx.amount)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-1.5 px-3.5 rounded-lg cursor-pointer text-[10.5px] uppercase flex items-center justify-center gap-1 shadow-xs"
                      >
                        <CheckCircle size={13} /> Settle Payout
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEC 4: CREATE, EDIT & MANAGE INVESTMENT PLANS */}
      {activeTab === 'plans' && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Strategic Investment Plans Config</h4>
              <p className="text-gray-400 text-xs mt-0.5 font-sans">Establish yield options, locked terms in days, and minimum transaction caps for strategic affiliate structures.</p>
            </div>

            <button
              onClick={() => {
                setEditingPlanId(null);
                setPlanForm({ name: '', yield: '2.0', days: '45', min: '50', desc: '' });
                setIsEditingPlan(true);
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Configure New Plan</span>
            </button>
          </div>

          {/* Edit/Create Plan Form Drawer */}
          {isEditingPlan && (
            <form onSubmit={handleSavePlanSubmit} className="bg-stone-50 border border-stone-200 p-5 rounded-xl flex flex-col gap-4 text-xs animate-[expand_0.2s_ease-out] text-left">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2.5">
                <span className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg"><Sliders size={14} /></span>
                <span className="font-bold text-stone-900 uppercase font-mono tracking-wider text-[11px]">
                  {editingPlanId ? 'Modify Plan parameters Schema' : 'Sow New Strategic Investment Plan'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-500 font-bold">Plan Name Label</label>
                  <input type="text" required placeholder="Starter Plan" className="border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-hidden" value={planForm.name} onChange={e=>setPlanForm({...planForm, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-500 font-bold">Estimated Daily ROI (%)</label>
                  <input type="number" step="0.1" required placeholder="1.5" className="border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 font-mono font-bold focus:ring-1 focus:ring-rose-500 focus:outline-hidden" value={planForm.yield} onChange={e=>setPlanForm({...planForm, yield: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-500 font-bold">Term Maturity Lock-in (Days)</label>
                  <input type="number" required placeholder="30" className="border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 font-mono font-bold focus:ring-1 focus:ring-rose-500 focus:outline-hidden" value={planForm.days} onChange={e=>setPlanForm({...planForm, days: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-500 font-bold">Minimum Allocation ($ USD)</label>
                  <input type="number" required placeholder="100" className="border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 font-mono font-bold focus:ring-1 focus:ring-rose-500 focus:outline-hidden" value={planForm.min} onChange={e=>setPlanForm({...planForm, min: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-stone-500 font-bold">Detailed Description</label>
                <input type="text" required placeholder="Detailed structural benefits metadata..." className="border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden" value={planForm.desc} onChange={e=>setPlanForm({...planForm, desc: e.target.value})} />
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t border-stone-200/60 mt-1">
                <button type="button" onClick={() => setIsEditingPlan(false)} className="bg-stone-250 text-stone-700 py-2 px-4 rounded-lg font-bold transition hover:bg-stone-300">Cancel</button>
                <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg font-bold transition">Deploy Scheme parameters</button>
              </div>
            </form>
          )}

          {/* Redesigned Investment Pools Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 text-xs font-sans text-left mt-2">
            {plans.map(p => {
              const parsedYield = parseFloat(p.yield) || 0.0;
              let tierLabel = "Steady Yield";
              let tierBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
              let focusColor = "border-l-emerald-500";
              let bulletIcon = <ShieldCheck className="text-emerald-500 w-3.5 h-3.5 shrink-0" />;

              if (parsedYield >= 3.5) {
                tierLabel = "Sovereign Elite";
                tierBg = "bg-rose-50 text-rose-700 border-rose-100";
                focusColor = "border-l-rose-500";
                bulletIcon = <Award className="text-rose-500 w-3.5 h-3.5 shrink-0" />;
              } else if (parsedYield >= 2.0) {
                tierLabel = "Premium Growth";
                tierBg = "bg-indigo-50 text-indigo-700 border-indigo-100";
                focusColor = "border-l-indigo-500";
                bulletIcon = <TrendingUp className="text-indigo-500 w-3.5 h-3.5 shrink-0" />;
              }

              return (
                <div key={p.id} className={`bg-stone-50/40 hover:bg-white border border-stone-150 border-l-[4px] ${focusColor} p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
                  <div>
                    {/* Upper Category and Days Badge */}
                    <div className="flex justify-between items-center gap-2 mb-3.5">
                      <span className={`text-[9.5px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-md border ${tierBg}`}>
                        {tierLabel}
                      </span>
                      <span className="font-mono text-[10.5px] font-bold text-stone-500 flex items-center gap-1">
                        <Lock size={12} className="text-stone-400" />
                        <span>{p.days} Days Term</span>
                      </span>
                    </div>

                    {/* Large ROI metrics block */}
                    <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-100/60 flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-stone-400 font-bold block leading-none tracking-tight">Est. Daily ROI</span>
                        <h4 className="text-xl font-extrabold text-stone-900 tracking-tight mt-1">+{p.yield}% Daily</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-mono text-stone-400 font-bold block leading-none tracking-tight">Monthly CAGR</span>
                        <strong className="text-[10.5px] text-stone-600 font-mono block mt-1">~{(parsedYield * 30).toFixed(0)}% yield</strong>
                      </div>
                    </div>

                    {/* Card Title & Desc */}
                    <div className="px-1">
                      <h5 className="font-extrabold text-stone-950 text-sm tracking-tight mb-1.5 flex items-center gap-1.5">
                        {bulletIcon}
                        <span>{p.name}</span>
                      </h5>
                      <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {p.desc || "Strategic capital yield structure deployed directly in clearing pools."}
                      </p>
                    </div>

                    {/* Mini Information Matrix segment */}
                    <div className="grid grid-cols-2 gap-2 mt-4 bg-white p-2.5 border border-stone-150/60 rounded-xl font-mono text-[10.5px]">
                      <div className="border-r border-stone-100 pr-1 text-left">
                        <span className="text-[9px] uppercase text-stone-400 block font-bold leading-none mb-1">Min Threshold</span>
                        <strong className="text-stone-900 font-extrabold">${p.min} USD</strong>
                      </div>
                      <div className="pl-1 text-left">
                        <span className="text-[9px] uppercase text-stone-400 block font-bold leading-none mb-1">Capital Class</span>
                        <strong className="text-stone-900 font-extrabold">{parsedYield >= 3.5 ? 'VIP Core' : 'Retail'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Operator Action Buttons */}
                  <div className="flex gap-1.5 justify-end border-t border-stone-100/80 mt-4.5 pt-3.5">
                    <button
                      onClick={() => handleEditPlanClick(p)}
                      className="py-1.5 px-3 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-600 hover:text-rose-500 rounded-lg text-[10.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Edit2 size={11} />
                      <span>Edit Parameters</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlanClick(p.id, p.name)}
                      className="p-1.5 shrink-0 bg-stone-50 hover:bg-rose-500 border border-stone-200 hover:border-rose-650 text-stone-500 hover:text-white rounded-lg transition cursor-pointer"
                      title="Decommission Plan"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEC 5: DYNAMIC PAYMENT GATEWAYS OPTIONS */}
      {activeTab === 'payment-methods' && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Payment Settings & Gates</h4>
              <p className="text-gray-400 text-xs mt-0.5">Activate, modify, or decommission addresses, details, or operational conditions for USDT, Bitcoin, Bank Wires, or Credit Terminals.</p>
            </div>

            <button
              onClick={() => {
                setEditingGatewayId(null);
                setGatewayForm({ name: '', type: 'crypto', address: '', enabled: true, desc: '' });
                setIsEditingGateway(true);
              }}
              className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Custom Gateway</span>
            </button>
          </div>

          {/* Edit/Create Gateway Drawer */}
          {isEditingGateway && (
            <form onSubmit={handleSaveGatewaySubmit} className="bg-gray-50 border border-gray-200 p-4.5 rounded-xl flex flex-col gap-3 text-xs animate-[expand_0.2s_ease-out] text-left">
              <span className="font-bold text-black border-b border-gray-150 pb-1 uppercase font-mono tracking-wide text-stone-700">
                {editingGatewayId ? 'Tune existing Routing parameters' : 'Establish custom Payment Recipient Tunnel'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-semibold">Gateway Name Label</label>
                  <input type="text" required placeholder="USDT (TRC20)" className="border border-gray-200 rounded-lg p-2 bg-white text-black" value={gatewayForm.name} onChange={e=>setGatewayForm({...gatewayForm, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-semibold">Classification Type</label>
                  <select className="border border-gray-200 rounded-lg p-2 bg-white text-black" value={gatewayForm.type} onChange={e=>setGatewayForm({...gatewayForm, type: e.target.value})}>
                    <option value="crypto">Cryptographic Blockchain (USDT, BTC)</option>
                    <option value="gateway">Automated Merchant API Terminal</option>
                    <option value="bank">Beneficiary Wire coordinates</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-semibold">Channel Operational Availability</label>
                  <select className="border border-gray-200 rounded-lg p-2 bg-white text-black" value={gatewayForm.enabled ? 'true' : 'false'} onChange={e=>setGatewayForm({...gatewayForm, enabled: e.target.value === 'true'})}>
                    <option value="true">Interactive Mode (Active Deposit Option)</option>
                    <option value="false">System Maintenance Mode (Locked)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-semibold">Recipients Account Credentials or Wallet Address</label>
                  <input type="text" required placeholder="0xabc... or Wire detail notes" className="border border-gray-200 rounded-lg p-2 bg-white text-black font-mono font-bold" value={gatewayForm.address} onChange={e=>setGatewayForm({...gatewayForm, address: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-semibold">Detailed Description</label>
                  <input type="text" placeholder="Low TRON chain network fees..." className="border border-gray-200 rounded-lg p-2 bg-white text-black" value={gatewayForm.desc} onChange={e=>setGatewayForm({...gatewayForm, desc: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 mt-1">
                <button type="button" onClick={() => setIsEditingGateway(false)} className="bg-gray-200 text-gray-700 py-1.5 px-3 rounded font-bold">Cancel</button>
                <button type="submit" className="bg-black hover:bg-gray-850 text-white py-1.5 px-3.5 rounded font-bold">Deploy Gateway Configuration</button>
              </div>
            </form>
          )}

          {/* Gateways Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-sans text-left">
            {paymentGateways.map(g => (
              <div key={g.id} className="bg-gray-50/50 border border-gray-150 p-4.5 rounded-xl flex flex-col justify-between relative shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[9.5px] uppercase font-bold text-gray-400">Class: {g.type}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGatewayClick(g.id)}
                      className="cursor-pointer"
                      title="Toggle Operational Visibility Status"
                    >
                      {g.enabled ? (
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 font-bold text-[9.5px]">Active</span>
                      ) : (
                        <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full border border-rose-100 font-bold text-[9.5px]">Disabled</span>
                      )}
                    </button>
                  </div>
                  
                  <h5 className="font-extrabold text-black text-sm tracking-tight">{g.name}</h5>
                  <p className="text-xs text-gray-400 mt-1 leading-normal break-words min-h-[1.5rem]">{g.desc}</p>
                  
                  <div className="bg-white border border-gray-100/50 p-2 rounded-lg mt-3 text-[10.5px] font-mono leading-tight flex flex-col gap-1 select-all break-all overflow-hidden text-stone-700 font-semibold bg-stone-50">
                    <span className="text-gray-400 text-[8px] uppercase block font-sans">Payment Coordinates Endpoint</span>
                    {g.address}
                  </div>
                </div>

                <div className="flex gap-1.5 justify-end border-t border-gray-100 mt-3 pt-3">
                  <button
                    onClick={() => {
                      setEditingGatewayId(g.id);
                      setGatewayForm({
                        name: g.name,
                        type: g.type,
                        address: g.address,
                        enabled: g.enabled,
                        desc: g.desc
                      });
                      setIsEditingGateway(true);
                    }}
                    className="p-1 px-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                  >
                    Configure
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGatewayClick(g.id, g.name)}
                    className="p-1 px-2.5 bg-rose-50 border border-rose-200 text-rose-650 hover:bg-rose-500 hover:text-white rounded text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer font-sans"
                    title="Delete Payment Option"
                  >
                    <Trash2 size={10} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEC 6: CLIENT SMTP OUTBOUND simulation */}
      {activeTab === 'email-portal' && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs animate-[fadeIn_0.15s_ease-out]">
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Client Outbound SMTP Transmitter</h4>
            <p className="text-gray-400 text-xs mt-0.5">Mock broadcast compliance alerts, account credential credits, or custom marketing messages to selected partner emails.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-left font-sans">
            
            {/* Left: Email Composer Form */}
            <form onSubmit={handleTransmitSimulationEmail} className="lg:col-span-7 flex flex-col gap-3.5 bg-gray-50 border border-gray-150 p-4 rounded-xl">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-500">SMTP Core Transmitter</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-bold">Recipient Account</label>
                  <select required className="border border-gray-300 rounded-lg p-2.5 bg-white text-black" value={emailTarget} onChange={e=>setEmailTarget(e.target.value)}>
                    <option value="">-- Choose recipient account --</option>
                    {roster.map(rm => (
                      <option key={rm} value={rm}>{getUserRecord(rm).name} ({rm})</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 font-bold">Email Template Subject Presets</label>
                  <select className="border border-gray-300 rounded-lg p-2.5 bg-white text-black" value={emailTemplate} onChange={e=>setEmailTemplate(e.target.value)}>
                    <option value="welcome">Affiliate Welcome Onboarding Mail</option>
                    <option value="compliance">Geo Redirect Compliance Audit alert</option>
                    <option value="credit">Administrative Credit Statement notification</option>
                    <option value="custom">Custom System Dispatch Memo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-stone-750 font-bold">Mail Subject Line</label>
                <input required type="text" className="border border-gray-300 rounded-lg p-2.5 bg-white text-black font-semibold" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-stone-750 font-bold flex justify-between items-center">
                  <span>Mail Body Message</span>
                  <span className="text-[10px] text-rose-500 font-mono lowercase">editable template text</span>
                </label>
                <textarea rows={6} required placeholder="Enter message text to transmit over partner channel..." className="border border-gray-300 rounded-lg p-2.5 bg-white text-black font-sans leading-normal text-xs" value={emailCustomMessage} onChange={e=>setEmailCustomMessage(e.target.value)} />
              </div>

              <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-[10px] text-rose-700 leading-normal font-mono flex gap-1.5 items-start">
                <AlertTriangle size={15} className="shrink-0 text-rose-500 mt-0.5" />
                <span>Simulated dispatch triggers actual database status notifications visible inside the customer's dashboard notifications tab securely.</span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-extrabold py-2.5 px-5 rounded-lg tracking-wide flex items-center gap-1.5 cursor-pointer shadow-sm uppercase font-mono"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Transmitting Packet...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Transmit Program dispatch</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right: Sent Outbound logs */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-400">SMTP Sent Log ledger</span>
              
              <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {sentMailsLog.map(log => (
                  <div key={log.id} className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col text-left text-[11px] leading-tight">
                    <div className="flex justify-between items-center text-[9.5px] font-mono text-gray-400">
                      <span>Recipient ID: {log.to}</span>
                      <span>{log.date}</span>
                    </div>
                    <strong className="text-black text-xs block mt-1 leading-snug">{log.subject}</strong>
                    <p className="text-gray-400 mt-1 text-[10px] lowercase leading-normal select-all bg-gray-50/50 p-2 rounded-md border border-gray-50">{log.snippet}</p>
                    <span className="font-bold text-emerald-500 mt-1 font-mono text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Dispatched IPN Delivery Approved
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SEC 7: ROOT CYBER STATUS AUDIT LOGS */}
      {activeTab === 'system-logs' && (
        <div className="bg-stone-900 text-stone-200 border border-stone-800 p-5 rounded-2xl flex flex-col gap-4 shadow-xl animate-[fadeIn_0.15s_ease-out]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2">
            <div>
              <h4 className="text-sm font-extrabold text-amber-500 uppercase tracking-widest font-mono">Operator Telemetry Cyber Logs</h4>
              <p className="text-stone-400 text-xs font-sans mt-0.5">Real-time terminal ledger record keeping for operator compliance auditing.</p>
            </div>
            <span className="font-mono text-xs text-stone-400 uppercase bg-stone-800 p-1.5 rounded border border-stone-700/50">Node: Sandbox-Docker-3000</span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[11px] select-all max-h-[380px] overflow-y-auto text-left">
            {adminSystemLogs.map(log => (
              <div key={log.id} className="flex gap-2 items-start py-1 px-2 border-b border-stone-850 hover:bg-stone-800 rounded">
                <span className="text-stone-500 text-[10px] font-bold tracking-tight select-none mt-0.5">[{log.date}]</span>
                <span className={`text-[10px] font-extrabold uppercase shrink-0 px-1 py-0.2 rounded mt-0.5 select-none ${
                  log.priority === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  log.priority === 'warn' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {log.priority}
                </span>
                <span className="text-stone-300 flex-1 leading-normal">{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

        </div> {/* closes Right Tab Content Column */}

      </div> {/* closes Main Structural Grid split */}

      {/* Elegant minimalist bottom footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 pt-5 border-t border-gray-150/40 text-[10.5px] font-mono text-gray-400 select-none">
        <span className="text-center sm:text-left leading-relaxed">
          SECURE OPERATOR ACCESS LEVEL: <strong className="text-gray-600 uppercase font-bold">SYSTEM ADMINISTRATOR</strong> (affiliateassociateprogram)
        </span>
        <button
          type="button"
          onClick={onClose}
          className="bg-black hover:bg-neutral-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all duration-150 cursor-pointer select-none shadow-xs flex items-center gap-1.5 font-sans"
        >
          <ArrowRight size={13} className="rotate-180" />
          <span>Exit Administrative Console</span>
        </button>
      {/* Custom Confirmation Modal System */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-[2px] select-none animate-[fadeIn_0.15s_ease-out]">
          <div className="absolute inset-0" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="relative z-60 w-full max-w-md bg-white border border-gray-150 p-6 rounded-3xl flex flex-col gap-4 shadow-2xl animate-[scaleIn_0.15s_ease-out] text-left">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-2xl shrink-0 ${confirmModal.danger ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">{confirmModal.title}</h3>
                <p className="text-gray-500 font-sans text-xs leading-relaxed mt-1.5">{confirmModal.message}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3.5 mt-1.5">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-gray-200 hover:border-gray-350 bg-white text-gray-500 hover:text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition cursor-pointer font-sans shadow-md ${
                  confirmModal.danger ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
