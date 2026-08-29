import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  Video,
  Newspaper,
  CreditCard,
  Download,
  KeyRound,
  Zap,
  Building2,
  BarChart3,
  RefreshCw,
  UserX,
  ShieldAlert,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { vendorService } from '../services/api';

// Chart Data
const chartDataCount = [
  { year: '20-21', count: 50.4, fill: '#0D9488' },
  { year: '21-22', count: 69.8, fill: '#2563EB' },
  { year: '22-23', count: 76.5, fill: '#7C3AED' },
  { year: '23-24', count: 87.8, fill: '#15803D' },
  { year: '24-25', count: 44.9, fill: '#EA580C' },
  { year: '25-26', count: 65.7, fill: '#059669' },
  { year: '26-27', count: 28.2, fill: '#0284C7' },
];

const chartDataValue = [
  { year: '20-21', count: 420.5, fill: '#0D9488' },
  { year: '21-22', count: 610.2, fill: '#2563EB' },
  { year: '22-23', count: 780.8, fill: '#7C3AED' },
  { year: '23-24', count: 950.4, fill: '#15803D' },
  { year: '24-25', count: 520.1, fill: '#EA580C' },
  { year: '25-26', count: 830.6, fill: '#059669' },
  { year: '26-27', count: 340.2, fill: '#0284C7' },
];

// AP eProcurement Tenders Dataset
const initialTenders = [
  {
    id: '983597',
    closingDate: '07/09/2026 03:15 PM',
    ifbNo: 'ET No.40/2026-27,Item No.02',
    dept: 'GUNTUR MUNICIPAL CORPORATION',
    title: 'General maintenance & infrastructure works in Division No: GUNTUR MUNICIPAL CORPORATION.',
    numericId: '983597',
    estimatedValue: '₹ 38,50,000',
    category: 'Current Tenders'
  },
  {
    id: '983595',
    closingDate: '05/09/2026 05:15 PM',
    ifbNo: '444/2026-27, Dt.28.8.2026',
    dept: 'ONGOLE MUNICIPALITY',
    title: 'Development of Greenery, Beautification and External electrification & illumination works to 150 Years Commemoration Heritage Wall at Gandhi Park in Division No.36 in Division No: ONGOLE MUNICIPALITY.',
    numericId: '983595',
    estimatedValue: '₹ 54,20,000',
    category: 'Current Tenders'
  },
  {
    id: '983593',
    closingDate: '05/09/2026 05:15 PM',
    ifbNo: '442/2026-27, Dt.28.8.2026',
    dept: 'ONGOLE MUNICIPALITY',
    title: 'Providing Granite Cladding for 150 Years Commemoration Heritage Wall at Gandhi Park in Division No.36 in Division No: ONGOLE MUNICIPALITY.',
    numericId: '983593',
    estimatedValue: '₹ 42,10,000',
    category: 'Current Tenders'
  },
  {
    id: '983582',
    closingDate: '05/09/2026 05:15 PM',
    ifbNo: '450/2026-27, Dt.28.8.2026',
    dept: 'ONGOLE MUNICIPALITY',
    title: 'Providing C.C Drain starting from Gonu Isaiah house towards east side in S.C Colony 2nd Line in Division No.1 in Division No: ONGOLE MUNICIPALITY.',
    numericId: '983582',
    estimatedValue: '₹ 28,90,000',
    category: 'Current Tenders'
  },
  {
    id: '983373',
    closingDate: '03/09/2026 03:00 PM',
    ifbNo: 'NIT No. 292/DB/NMC/GEN/CSR/2026-27, Dated: 28.08.2026',
    dept: 'Nellore Municipal Corporation',
    title: 'Construction of CC Drain from E.P.No NVG26-A3/DF to E.P.No NVG26-B7/DF in Sadavarai Palem in Division No. 03 Nellore Municipal Corporation.',
    numericId: '983373',
    estimatedValue: '₹ 1,20,00,000',
    category: 'Current Tenders'
  }
];

export const GovernmentPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Current Tenders' | 'Corrigendums' | 'Upcoming Tenders'>('Current Tenders');
  const [chartMode, setChartMode] = useState<'Count' | 'Value'>('Count');
  const [showBlacklistModal, setShowBlacklistModal] = useState<boolean>(false);
  const [blacklistRecords, setBlacklistRecords] = useState<any[]>([]);

  const [loginEmail, setLoginEmail] = useState('user@example.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');

  const { login, fastLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlacklist = async () => {
      try {
        const data = await vendorService.getBlacklist();
        if (data && data.blacklisted_suppliers) {
          setBlacklistRecords(data.blacklisted_suppliers);
        }
      } catch (err) {
        console.error('Failed to load blacklist:', err);
      }
    };
    fetchBlacklist();
  }, []);

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginEmail.includes('@') ? loginEmail : 'user@example.com', password: 'password123' });
      navigate('/dashboard');
    } catch {
      fastLogin('user@example.com');
      navigate('/dashboard');
    }
  };

  const handleVerifyTender = (e: React.MouseEvent, numericId: string) => {
    e.preventDefault();
    navigate(`/test-page?tenderId=${numericId}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      
      {/* Navbar */}
      <Navbar />

      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              AP
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Hon'ble Chief Minister Nara Chandrababu Naidu
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                eGP Portal — Tenders Directory
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/test-page')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Verification Console</span>
          </button>

        </div>

        {/* Sub-Header Horizontal Navigation Bar */}
        <nav className="bg-slate-50 text-slate-700 border-t border-slate-200 text-xs font-medium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <ul className="flex items-center justify-center gap-6 py-2.5 whitespace-nowrap">
              <li><Link to="/dashboard" className="text-slate-900 font-semibold hover:underline">Home</Link></li>
              <li className="text-slate-300">|</li>
              <li><a href="#guidelines" className="hover:text-slate-900">Guidelines</a></li>
              <li className="text-slate-300">|</li>
              <li><a href="#reports" className="bg-slate-900 text-white px-3 py-1 rounded-lg font-semibold">MIS Reports</a></li>
              <li className="text-slate-300">|</li>
              <li><a href="#gos" className="hover:text-slate-900">GO's</a></li>
              <li className="text-slate-300">|</li>
              <li><a href="#faqs" className="hover:text-slate-900">FAQs</a></li>
              <li className="text-slate-300">|</li>
              <li><button onClick={() => setShowBlacklistModal(true)} className="text-rose-600 font-bold hover:underline">Blocked Suppliers</button></li>
              <li className="text-slate-300">|</li>
              <li><a href="#support" className="hover:text-slate-900">Support Desk</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Important Alerts Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center text-xs text-slate-700">
          <span className="bg-slate-900 text-white font-semibold px-3 py-1 rounded-lg text-xs shrink-0 mr-3">
            Notice
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full font-normal">
            Welcome to Andhra Pradesh e-Procurement Portal. Bidders are advised to run AI compliance verification well before bid closing date.
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1 (Left 3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                Tenders Analytics
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[10px] font-medium">
                <button
                  onClick={() => setChartMode('Count')}
                  className={`px-2 py-0.5 rounded ${chartMode === 'Count' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                >
                  Count
                </button>
                <button
                  onClick={() => setChartMode('Value')}
                  className={`px-2 py-0.5 rounded ${chartMode === 'Value' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                >
                  Value
                </button>
              </div>
            </div>

            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartMode === 'Count' ? chartDataCount : chartDataValue} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip formatter={(val: any) => [`${val} ${chartMode === 'Count' ? 'K Bids' : 'Cr'}`, 'Total']} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {(chartMode === 'Count' ? chartDataCount : chartDataValue).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-normal">Tenders Published by Financial Year</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-medium block text-slate-300">Active Tenders</span>
              <span className="text-xl font-bold block">2,293</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-medium block text-slate-600">Closing Today</span>
              <span className="text-xl font-bold block text-slate-900">0</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-medium text-slate-700">
            <div
              onClick={() => setShowBlacklistModal(true)}
              className="flex items-center justify-between py-2 border-b border-slate-100 text-rose-600 font-bold hover:bg-rose-50 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-600" />
                <span>Blocked Suppliers</span>
              </div>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {blacklistRecords.length || 3} Active
              </span>
            </div>
            <div className="flex items-center gap-2 py-2 hover:text-slate-900 cursor-pointer">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Banking Partners (ICICI, Axis Bank)</span>
            </div>
          </div>

        </aside>

        {/* Column 2 (Center 6 cols) */}
        <section className="lg:col-span-6 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {(['Current Tenders', 'Corrigendums', 'Upcoming Tenders'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-slate-600 font-medium hover:underline cursor-pointer pr-2 text-xs">More...</span>
          </div>

          <div className="space-y-3">
            {initialTenders.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Tender ID: <span className="font-mono text-slate-800">{t.id}</span>
                  </span>
                  <span className="font-medium text-slate-600 text-xs">
                    Closing Date: <span className="text-slate-900 font-semibold">{t.closingDate}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="font-mono font-semibold text-slate-700 text-[11px]">
                    IFB No: {t.ifbNo}
                  </p>
                  <p className="font-medium text-slate-900 text-xs leading-relaxed">
                    {t.title}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium text-[11px]">
                    Dept: <span className="text-slate-800 font-semibold">{t.dept}</span>
                  </span>

                  <button
                    onClick={(e) => handleVerifyTender(e, t.numericId)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Verify with BidNexus AI</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </section>

        {/* Column 3 (Right 3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
                <LogIn className="w-4 h-4 text-slate-600" />
                Login
              </span>
              <a href="#forgot" className="text-slate-600 text-[11px] font-medium hover:underline">Forgot Password ?</a>
            </div>

            <form onSubmit={handlePortalLogin} className="space-y-2.5 text-xs">
              <div>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="User Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900 font-medium"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="w-full py-2 border border-slate-300 text-slate-800 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Register ?
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 hover:text-slate-900 cursor-pointer">
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span>Forgot User ID?</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 hover:text-slate-900 cursor-pointer">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Check EMD Status</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 hover:text-slate-900 cursor-pointer">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Reset Certificate</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 hover:text-slate-900 cursor-pointer">
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download emSigner for Windows</span>
            </div>
            <div className="flex items-center gap-2 py-2 px-3 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer">
              <Video className="w-4 h-4 text-slate-600" />
              <span className="font-semibold">Video Tutorials</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5 text-xs">
              <Newspaper className="w-4 h-4 text-slate-600" />
              News
            </span>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
              AP eProcurement portal compliance guidelines updated as per Government order.
            </p>
          </div>

        </aside>

      </main>

      {/* BLOCKED / BLACKLISTED SUPPLIERS MODAL */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Government Debarred & Blacklisted Suppliers</h3>
                  <p className="text-xs text-slate-500 font-normal">Active CVC, GeM & AP Government debarment registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {blacklistRecords.length > 0 ? (
                blacklistRecords.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-rose-950">
                      <span>{item.company_name}</span>
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-mono px-2 py-0.5 rounded border border-rose-200">
                        {item.reg_number}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-normal">
                      <strong className="font-semibold text-slate-900">Reason for Debarment: </strong>
                      {item.reason}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-rose-200/60 font-medium">
                      <span>Agency: <strong className="text-slate-900 font-semibold">{item.debarment_agency}</strong></span>
                      <span>Debarred Until: <strong className="text-rose-700 font-bold">{item.debarred_until}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Loading blacklisted suppliers...</div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
              >
                Close Register
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GovernmentPortalPage;
