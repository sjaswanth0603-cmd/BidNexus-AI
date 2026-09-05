import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bidder' | 'evaluator'>('bidder');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, fastLogin } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (role: 'bidder' | 'evaluator') => {
    setActiveTab(role);
    if (role === 'bidder') {
      setEmail('user@example.com');
      setPassword('Password@123');
    } else {
      setEmail('admin@example.com');
      setPassword('Password@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await login({ email: email.trim(), password });
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || (typeof err.message === 'string' && !err.message.includes('500') ? err.message : 'Invalid email or password. Please verify your credentials.');
      setError(typeof msg === 'string' ? msg : 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (targetEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await fastLogin(targetEmail);
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.warn('Demo login handled with direct fallback navigation:', err);
      if (targetEmail.includes('admin') || targetEmail.includes('evaluator')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1228] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#009F6B] selection:text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand & Feature Highlights */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-slate-900">BidNexusAI</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  SIH26100
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">GeM & eGP Bid Compliance Platform</p>
            </div>
          </Link>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-outfit">
              AI-Powered Integrated Procurement Scrutiny System
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Verify tender requirements against bidder evidence documents with zero black-box AI outputs and full evaluator audit trails.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Hybrid AI Requirement Extraction</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Parses unstructured GeM PDFs into structured Technical, Financial, and Legal rules.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Cross-Document Contradiction Engine</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Flags mismatches between Technical Datasheets and Commercial Price Bids.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Government Portal Integrations</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Architecture adapters for GSTN, PAN, Udyam, EPFO, and Debarment registries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Reconstructed Login Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Sign In to Portal</h2>
                <p className="text-xs text-slate-500 font-semibold">Select your role to access verification tools</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200">
                Authorized Access
              </span>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleTabChange('bidder')}
                className={`py-2.5 px-4 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'bidder'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Bidder Account</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('evaluator')}
                className={`py-2.5 px-4 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'evaluator'
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Evaluator (Admin)</span>
              </button>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider">
                  ⚡ SIH Hackathon Fast Demo Access
                </span>
                <span className="text-slate-400 font-mono text-[10px]">1-Click Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('user@example.com')}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demo Bidder Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@example.com')}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Demo Evaluator Login</span>
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-emerald-600 font-bold hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-slate-300 bg-slate-50 text-emerald-600 focus:ring-0"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Link */}
            <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
              Need a new bidder account?{' '}
              <Link to="/register" className="text-emerald-700 font-extrabold hover:underline">
                Create Account Here
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
