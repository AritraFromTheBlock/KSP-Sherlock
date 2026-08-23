import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Lock,
  Clock,
  Eye,
  RefreshCw,
  Building2,
  Share2,
  AlertOctagon,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TransactionAlert {
  id: string;
  txHash: string;
  sourceAccount: string;
  sourceBank: string;
  destinationAccount: string;
  destinationBank: string;
  amount: string;
  rawAmount: number;
  time: string;
  riskScore: number;
  category: 'UPI Mule Ring' | 'Digital Arrest Scam' | 'Circular Invoicing' | 'Illegal Forex/Crypto' | 'Ponzi App';
  status: 'Flagged' | 'Frozen' | 'Under Investigation';
  layeringStage: 'Placement' | 'Layering' | 'Integration';
  associatedFIR?: string;
  ipLocation: string;
}

const mockTransactions: TransactionAlert[] = [
  {
    id: 'TXN-9021',
    txHash: '0x8f2a...91bc',
    sourceAccount: 'SBI-****-4492 (S. Kumar)',
    sourceBank: 'State Bank of India',
    destinationAccount: 'HDFC-****-1029 (Mule Node #4)',
    destinationBank: 'HDFC Bank',
    amount: '₹ 24,50,000',
    rawAmount: 2450000,
    time: '3 mins ago',
    riskScore: 94,
    category: 'Digital Arrest Scam',
    status: 'Flagged',
    layeringStage: 'Layering',
    associatedFIR: 'FIR-2026-BLR-0891',
    ipLocation: 'Koramangala, Bengaluru'
  },
  {
    id: 'TXN-9020',
    txHash: '0x1b4c...77da',
    sourceAccount: 'ICICI-****-8812 (Rapid Enterprises)',
    sourceBank: 'ICICI Bank',
    destinationAccount: 'AXIS-****-3319 (Apex Global Shell)',
    destinationBank: 'Axis Bank',
    amount: '₹ 1,12,00,000',
    rawAmount: 11200000,
    time: '18 mins ago',
    riskScore: 88,
    category: 'Circular Invoicing',
    status: 'Under Investigation',
    layeringStage: 'Integration',
    associatedFIR: 'FIR-2026-CC-0214',
    ipLocation: 'Peenya Industrial Area'
  },
  {
    id: 'TXN-9019',
    txHash: '0x3e9f...1200',
    sourceAccount: 'PAYTM-****-9011 (Student Acct)',
    sourceBank: 'Paytm Payments Bank',
    destinationAccount: 'CANARA-****-5541 (FastCash Pool)',
    destinationBank: 'Canara Bank',
    amount: '₹ 4,85,000',
    rawAmount: 485000,
    time: '42 mins ago',
    riskScore: 91,
    category: 'UPI Mule Ring',
    status: 'Frozen',
    layeringStage: 'Placement',
    associatedFIR: 'FIR-2026-IND-0442',
    ipLocation: 'Shivajinagar, Bengaluru'
  },
  {
    id: 'TXN-9018',
    txHash: '0x7a8d...4311',
    sourceAccount: 'KOTAK-****-6721 (R. Mehra)',
    sourceBank: 'Kotak Mahindra',
    destinationAccount: 'USDT TRC20 Wallet (TKn7...9xPQ)',
    destinationBank: 'Crypto Off-ramp Exchange',
    amount: '₹ 48,00,000',
    rawAmount: 4800000,
    time: '1 hour ago',
    riskScore: 96,
    category: 'Illegal Forex/Crypto',
    status: 'Flagged',
    layeringStage: 'Integration',
    associatedFIR: 'FIR-2026-CY-1102',
    ipLocation: 'Whitefield, Bengaluru'
  },
  {
    id: 'TXN-9017',
    txHash: '0x22de...55fa',
    sourceAccount: 'PNB-****-2319 (Micro Loan App Pool)',
    sourceBank: 'Punjab National Bank',
    destinationAccount: 'FEDERAL-****-8822 (Overseas Transit)',
    destinationBank: 'Federal Bank',
    amount: '₹ 15,20,000',
    rawAmount: 1520000,
    time: '2 hours ago',
    riskScore: 78,
    category: 'Ponzi App',
    status: 'Under Investigation',
    layeringStage: 'Layering',
    associatedFIR: 'FIR-2026-MAL-0331',
    ipLocation: 'Electronic City, Bengaluru'
  }
];

const hourlySpikeData = [
  { time: '00:00', volume: 12.4, flagged: 2.1 },
  { time: '03:00', volume: 8.1, flagged: 4.8 },
  { time: '06:00', volume: 14.5, flagged: 1.2 },
  { time: '09:00', volume: 45.2, flagged: 6.4 },
  { time: '12:00', volume: 78.6, flagged: 9.8 },
  { time: '15:00', volume: 89.2, flagged: 14.2 },
  { time: '18:00', volume: 112.5, flagged: 28.6 },
  { time: '21:00', volume: 64.1, flagged: 18.3 }
];

const typologyData = [
  { name: 'UPI Mule Rings', value: 38, color: '#00E5FF' },
  { name: 'Digital Arrest / Extortion', value: 27, color: '#EF4444' },
  { name: 'Forex / Crypto Laundering', value: 18, color: '#F59E0B' },
  { name: 'Circular Shell Invoicing', value: 11, color: '#8B5CF6' },
  { name: 'Illegal Lending Apps', value: 6, color: '#10B981' }
];

export default function FinancialCrime() {
  const [transactions, setTransactions] = useState<TransactionAlert[]>(mockTransactions);
  const [selectedTxn, setSelectedTxn] = useState<TransactionAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [freezeNoticeSent, setFreezeNoticeSent] = useState<string | null>(null);
  const [isSearchingAccount, setIsSearchingAccount] = useState(false);
  const [accountLookupResult, setAccountLookupResult] = useState<any | null>(null);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesCategory = selectedCategory === 'All' || txn.category === selectedCategory;
    const matchesSearch =
      txn.sourceAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.destinationAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.associatedFIR && txn.associatedFIR.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFreezeAccount = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'Frozen' } : t))
    );
    setFreezeNoticeSent(txnId);
    setTimeout(() => setFreezeNoticeSent(null), 3500);
  };

  const handleAccountLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingAccount(true);
    setTimeout(() => {
      setAccountLookupResult({
        identifier: searchQuery,
        riskScore: 89,
        status: 'HIGH RISK MULE NODE',
        totalInflow: '₹ 1.84 Cr (Last 30 Days)',
        outflowVelocity: '94% funds diverted within 180 seconds',
        linkedFirs: ['FIR-2026-BLR-0891', 'FIR-2026-CY-1102'],
        fiuAlert: 'CTR/STR Match on FinNET 2.0',
        kycStatus: 'Forged Aadhaar Verified at Branch ID #BLR-402'
      });
      setIsSearchingAccount(false);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* 1. Header & Financial Intelligence KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-panel border border-edge p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon/10 border border-neon/30 text-neon-bright">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-200">Financial Crime & Laundering Radar</h1>
              <p className="text-sm text-slate-400 mt-0.5">Real-time mule network tracking, layering telemetry, and Sec 91 CrPC bank notices</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Flagged Volume (24h)</span>
            <div className="flex items-center gap-2 mt-1">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-mono font-bold text-slate-200">₹ 3.14 Cr</span>
            </div>
          </div>
          <div className="w-px h-10 bg-edge hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mule Nodes Tracked</span>
            <div className="flex items-center gap-2 mt-1">
              <Share2 className="w-5 h-5 text-neon" />
              <span className="text-2xl font-mono font-bold text-slate-200">142</span>
            </div>
          </div>
          <div className="w-px h-10 bg-edge hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Frozen Accounts</span>
            <div className="flex items-center gap-2 mt-1">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-mono font-bold text-slate-200">28</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Fund-Trail / Layering Visualizer Banner */}
      <div className="bg-panel border border-edge rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-edge pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neon" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Anatomy of Active Money Flow (3-Tier Layering Pipeline)
            </h3>
          </div>
          <span className="text-xs font-mono text-neon-bright bg-neon/10 px-2 py-0.5 rounded border border-neon/20">
            CID Financial Intelligence Unit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Stage 1: Placement */}
          <div className="p-4 rounded-xl bg-abyss border border-edge relative group hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider">Stage 01 • Placement</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">High Inflow</span>
            </div>
            <h4 className="text-sm font-bold text-slate-200">Victim Injections & Cash Drops</h4>
            <p className="text-xs text-slate-400 mt-1">
              Victims tricked into UPI/IMPS deposits via fake digital arrest summons, telegram task scams, or phishing links.
            </p>
            <div className="mt-3 pt-3 border-t border-edge flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Avg Velocity: &lt; 5 mins</span>
              <span className="text-blue-400 font-bold">186 Inflows</span>
            </div>
          </div>

          {/* Stage 2: Layering */}
          <div className="p-4 rounded-xl bg-abyss border border-neon/30 relative group hover:border-neon transition-colors shadow-neon-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-neon-bright uppercase tracking-wider">Stage 02 • Layering</span>
              <span className="text-[10px] bg-neon/10 text-neon-bright px-2 py-0.5 rounded border border-neon/20 animate-pulse">Critical Phase</span>
            </div>
            <h4 className="text-sm font-bold text-slate-200">Mule Chain Dispersion</h4>
            <p className="text-xs text-slate-400 mt-1">
              Automated splitting across 4-6 tiers of rented student accounts, shell firms, and dormant cooperative bank VPAs.
            </p>
            <div className="mt-3 pt-3 border-t border-edge flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Max Hops: 6 Chains</span>
              <span className="text-neon-bright font-bold">₹ 1.8 Cr Active</span>
            </div>
          </div>

          {/* Stage 3: Integration */}
          <div className="p-4 rounded-xl bg-abyss border border-red-500/30 relative group hover:border-red-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-red-400 uppercase tracking-wider">Stage 03 • Integration</span>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">Off-Ramping</span>
            </div>
            <h4 className="text-sm font-bold text-slate-200">Hawala & Crypto Extraction</h4>
            <p className="text-xs text-slate-400 mt-1">
              Funds converted to USDT on P2P trading desks, POS cash-out agents, or overseas travel agency invoicing.
            </p>
            <div className="mt-3 pt-3 border-t border-edge flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Cross-Border Risk: High</span>
              <span className="text-red-400 font-bold">9 Syndicate Wallets</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Search & Account Lookup Scanner */}
      <div className="bg-panel border border-edge rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-neon" />
              Target Account / VPA / PAN Forensic Scanner
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Query banking networks, UPI identifiers, and suspect IFSC codes across state intelligence databases
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-abyss border border-edge rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-neon outline-none"
            >
              <option value="All">All Typologies</option>
              <option value="UPI Mule Ring">UPI Mule Ring</option>
              <option value="Digital Arrest Scam">Digital Arrest Scam</option>
              <option value="Circular Invoicing">Circular Invoicing</option>
              <option value="Illegal Forex/Crypto">Illegal Forex/Crypto</option>
              <option value="Ponzi App">Ponzi App</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleAccountLookup} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bank Account, UPI VPA (e.g. fastcash@upi), Transaction Hash, or FIR No..."
              className="w-full bg-abyss border border-edge rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-neon transition-colors font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingAccount}
            className="px-5 py-2.5 bg-neon text-void font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neon-bright transition-colors shadow-neon-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSearchingAccount ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            Scan Identifier
          </button>
        </form>

        {/* Account Lookup Result Card */}
        <AnimatePresence>
          {accountLookupResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-abyss border border-red-500/50 rounded-xl p-4 space-y-3 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge pb-2">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <span className="font-mono font-bold text-red-400 text-sm">{accountLookupResult.status}</span>
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30 font-mono">
                    Risk Score: {accountLookupResult.riskScore}/100
                  </span>
                </div>
                <button
                  onClick={() => setAccountLookupResult(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-mono">Velocity Pattern</span>
                  <p className="text-slate-200 font-semibold mt-0.5">{accountLookupResult.outflowVelocity}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono">Total Volume</span>
                  <p className="text-slate-200 font-semibold mt-0.5">{accountLookupResult.totalInflow}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono">FIU Flag</span>
                  <p className="text-amber-400 font-semibold mt-0.5">{accountLookupResult.fiuAlert}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-edge flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Linked Cases: {accountLookupResult.linkedFirs.join(', ')}
                </span>
                <button
                  onClick={() => handleFreezeAccount('ACCOUNT-DIRECT')}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 rounded text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Dispatch Emergency Sec 91 Notice
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Live Suspicious Activity Stream & Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Telemetry & Flagged Transactions */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-edge pb-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neon" />
              Live Flagged Transactions Feed
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredTransactions.length} of {transactions.length} Alerts
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredTransactions.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className={`bg-panel border rounded-xl overflow-hidden transition-all duration-200 ${
                    txn.status === 'Frozen'
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : txn.riskScore >= 90
                      ? 'border-red-500/40 hover:border-red-500'
                      : 'border-edge hover:border-slate-600'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${
                            txn.status === 'Frozen'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : txn.riskScore >= 90
                              ? 'bg-red-500/10 border-red-500/30 text-red-500'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {txn.status === 'Frozen' ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-200 text-base">{txn.amount}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                                txn.category === 'Digital Arrest Scam'
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                  : txn.category === 'UPI Mule Ring'
                                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}
                            >
                              {txn.category}
                            </span>
                            <span className="text-[10px] font-mono bg-abyss px-2 py-0.5 rounded border border-edge text-slate-400">
                              Risk {txn.riskScore}/100
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-1">
                            TxID: <span className="text-slate-300">{txn.id}</span> &middot; {txn.ipLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {txn.time}
                        </span>
                      </div>
                    </div>

                    {/* Routing Details */}
                    <div className="p-3 bg-abyss rounded-lg border border-edge grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Originator</span>
                        <span className="text-slate-300">{txn.sourceAccount}</span>
                        <span className="text-slate-500 block text-[10px]">{txn.sourceBank}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Destination</span>
                        <span className="text-neon-bright">{txn.destinationAccount}</span>
                        <span className="text-slate-500 block text-[10px]">{txn.destinationBank}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 pt-3 border-t border-edge flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {txn.associatedFIR && (
                          <span className="text-[11px] font-mono text-slate-400 bg-panel px-2 py-1 rounded border border-edge">
                            Linked: <span className="text-neon-bright">{txn.associatedFIR}</span>
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          Phase: <span className="text-slate-200">{txn.layeringStage}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-panel hover:bg-edge border border-edge rounded transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        {txn.status !== 'Frozen' ? (
                          <button
                            onClick={() => handleFreezeAccount(txn.id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded transition-colors flex items-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" /> Freeze Account
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Frozen (Sec 91 Sent)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right 1 Col: Analytics, Typology & Anomaly Visuals */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Typology Distribution */}
          <div className="bg-panel border border-edge rounded-2xl p-5 relative overflow-hidden flex flex-col h-[340px]">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-neon" />
              Scam & Laundering Typologies
            </h3>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typologyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typologyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#020617" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-edge text-[10px] font-mono">
              {typologyData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 truncate">{item.name}</span>
                  <span className="text-slate-200 font-bold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Volume & Flagged Spikes */}
          <div className="bg-panel border border-edge rounded-2xl p-5 relative overflow-hidden flex flex-col h-[340px]">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-neon" />
              Hourly Volume vs Flagged Spikes (₹ Lakhs)
            </h3>
            <div className="flex-1 w-full -ml-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlySpikeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#00E5FF" strokeWidth={2} fill="url(#colorVolume)" name="Total Vol" />
                  <Area type="monotone" dataKey="flagged" stroke="#EF4444" strokeWidth={2} fill="url(#colorFlagged)" name="Flagged Fraud" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Detail Modal for Selected Transaction */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel border border-neon/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-edge pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neon/10 border border-neon/30 text-neon-bright">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Forensic Dossier: {selectedTxn.id}</h3>
                    <p className="text-xs text-slate-400 font-mono">Hash: {selectedTxn.txHash}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded bg-abyss border border-edge"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-abyss p-3 rounded-xl border border-edge">
                  <div>
                    <span className="text-slate-500 uppercase font-mono block">Amount Transferred</span>
                    <span className="text-lg font-mono font-bold text-red-400">{selectedTxn.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-mono block">Risk Assessment</span>
                    <span className="text-lg font-mono font-bold text-neon-bright">{selectedTxn.riskScore}/100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Fund Origin & Routing Node</h4>
                  <div className="p-3 bg-abyss rounded-lg border border-edge space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source Entity:</span>
                      <span className="text-slate-200 font-mono">{selectedTxn.sourceAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source Bank:</span>
                      <span className="text-slate-300">{selectedTxn.sourceBank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination Mule Account:</span>
                      <span className="text-neon font-mono font-bold">{selectedTxn.destinationAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary Institution:</span>
                      <span className="text-slate-300">{selectedTxn.destinationBank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Terminal Geolocation:</span>
                      <span className="text-slate-300">{selectedTxn.ipLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neon/5 rounded-lg border border-neon/20 text-slate-300 leading-relaxed">
                  <span className="font-bold text-neon-bright uppercase mr-1.5 font-mono">Neural M.O. Analysis:</span>
                  Transaction matches known signature for {selectedTxn.category}. Rapid automated splitting detected across 4 recipient nodes within 90 seconds of deposit.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-edge">
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
                {selectedTxn.status !== 'Frozen' && (
                  <button
                    onClick={() => {
                      handleFreezeAccount(selectedTxn.id);
                      setSelectedTxn(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                  >
                    <Lock className="w-3.5 h-3.5" /> Freeze Account & Dispatch Notice
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Notice Toast */}
      <AnimatePresence>
        {freezeNoticeSent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-300"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <div>
              <p className="text-xs uppercase tracking-wider">Sec 91 CrPC Bank Notice Dispatched</p>
              <p className="text-[11px] font-normal opacity-90">Account successfully placed under immediate debit freeze.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
